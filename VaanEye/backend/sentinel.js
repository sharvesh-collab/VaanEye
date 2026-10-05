const axios = require('axios');
const bbox = require('@turf/bbox').default;

let cachedToken = null;
let tokenExpiry = 0;

/**
 * Gets Sentinel Hub OAuth token
 */
async function getAuthToken() {
    if (cachedToken && Date.now() < tokenExpiry) {
        return cachedToken;
    }
    
    const clientId = process.env.SENTINEL_CLIENT_ID;
    const clientSecret = process.env.SENTINEL_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
        throw new Error("Sentinel Hub API keys not configured in environment.");
    }
    
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    
    try {
        const res = await axios.post('https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token', params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        cachedToken = res.data.access_token;
        // Subtract a minute for safety
        tokenExpiry = Date.now() + (res.data.expires_in - 60) * 1000;
        return cachedToken;
    } catch (err) {
        console.error("Failed to fetch Sentinel Hub token:", err.response?.data || err.message);
        throw new Error("Failed to authenticate with Sentinel Hub");
    }
}

/**
 * Evaluates Cloud Cover specifically over the provided AOI using Statistical API
 * @param {string} token 
 * @param {object} aoiGeoJson Polygon
 * @param {string} dateFrom 
 * @param {string} dateTo 
 * @returns {Promise<{ usable: boolean, cloudPercent: number }>}
 */
async function evaluateSentinel2Usability(token, aoiGeoJson, dateFrom, dateTo) {
    const formattedFrom = dateFrom.includes('T') ? dateFrom : `${dateFrom}T00:00:00Z`;
    const formattedTo = dateTo.includes('T') ? dateTo : `${dateTo}T23:59:59Z`;

    const requestPayload = {
        intersects: aoiGeoJson,
        datetime: `${formattedFrom}/${formattedTo}`,
        collections: ["sentinel-2-l2a"],
        limit: 20
    };

    try {
        const response = await axios.post('https://sh.dataspace.copernicus.eu/api/v1/catalog/1.0.0/search', requestPayload, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        
        if (response.data && response.data.features && response.data.features.length > 0) {
            // Ensure they are sorted by datetime descending if not already
            const features = response.data.features.sort((a, b) => new Date(b.properties.datetime) - new Date(a.properties.datetime));
            
            for (let feature of features) {
                const cloudCover = feature.properties['eo:cloud_cover'];
                if (cloudCover <= 20) {
                    return {
                        usable: true,
                        cloudPercent: cloudCover,
                        date: feature.properties.datetime
                    };
                }
            }
            // If none are <= 20, just return the first one with its cloud cover so it triggers fallback
            return {
                usable: false,
                cloudPercent: features[0].properties['eo:cloud_cover'],
                date: features[0].properties.datetime
            };
        }
        
        return { usable: false, cloudPercent: 100, date: null };
    } catch (e) {
        console.error("S2 Catalog Error:", e.response ? e.response.data : e.message);
        return { usable: false, cloudPercent: 100, date: null };
    }
}

/**
 * Searches Sentinel-1 GRD Catalog
 */
async function searchSentinel1(token, aoiGeoJson, dateFrom, dateTo) {
    const formattedFrom = dateFrom.includes('T') ? dateFrom : `${dateFrom}T00:00:00Z`;
    const formattedTo = dateTo.includes('T') ? dateTo : `${dateTo}T23:59:59Z`;

    const payload = {
        bbox: null,
        intersects: aoiGeoJson,
        datetime: `${formattedFrom}/${formattedTo}`,
        collections: ["sentinel-1-grd"],
        limit: 1
    };
    
    try {
        const res = await axios.post('https://sh.dataspace.copernicus.eu/api/v1/catalog/1.0.0/search', payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return res.data.features;
    } catch (err) {
        console.error("Catalog API Error:", err.response?.data || err.message);
        return [];
    }
}

/**
 * Calls Process API for Sentinel-2
 */
async function processSentinel2(token, aoiGeoJson, date) {
    const fromDate = `${date}T00:00:00Z`;
    // Create a Date object, add 1 day, and format to YYYY-MM-DD
    const dateObj = new Date(date);
    dateObj.setUTCDate(dateObj.getUTCDate() + 1);
    const nextDate = dateObj.toISOString().split('T')[0];
    const toDate = `${nextDate}T00:00:00Z`;
    const boundingBox = bbox(aoiGeoJson); // [minX, minY, maxX, maxY]

    // 1. NDVI Scientific Raster (TIFF)
    const evalNdvi = `
        //VERSION=3
        function setup() {
            return {
                input: ["B04", "B08", "dataMask"],
                output: { id: "default", bands: 1, sampleType: "FLOAT32" }
            };
        }
        function evaluatePixel(sample) {
            let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
            return [ sample.dataMask === 1 ? ndvi : NaN ];
        }
    `;

    // 2. True Color Visual (PNG)
    const evalRgb = `
        //VERSION=3
        function setup() {
            return {
                input: ["B02", "B03", "B04", "dataMask"],
                output: { id: "default", bands: 4, sampleType: "AUTO" }
            };
        }
        function evaluatePixel(sample) {
            return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02, sample.dataMask];
        }
    `;

    const getPayload = (evalscript) => ({
        input: {
            bounds: { geometry: aoiGeoJson },
            data: [{ type: "sentinel-2-l2a", dataFilter: { timeRange: { from: fromDate, to: toDate } } }]
        },
        output: { width: 512, height: 512 }
    });

    const evalStats = `
        //VERSION=3
        function setup() {
            return {
                input: ["B04", "B08", "dataMask"],
                output: [
                    { id: "B04", bands: 1 },
                    { id: "B08", bands: 1 },
                    { id: "NDVI", bands: 1 }, { id: "dataMask", bands: 1 }
                ]
            };
        }
        function evaluatePixel(sample) {
            let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
            return {
                B04: [sample.dataMask === 1 ? sample.B04 : NaN],
                B08: [sample.dataMask === 1 ? sample.B08 : NaN],
                NDVI: [sample.dataMask === 1 ? ndvi : NaN], dataMask: [sample.dataMask]
            };
        }
    `;

    try {
        const resNdvi = await axios.post('https://sh.dataspace.copernicus.eu/api/v1/process', 
            { ...getPayload(evalNdvi), evalscript: evalNdvi }, 
            { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'image/tiff' }, responseType: 'arraybuffer' }
        );
        const resVisual = await axios.post('https://sh.dataspace.copernicus.eu/api/v1/process', 
            { ...getPayload(evalRgb), evalscript: evalRgb }, 
            { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'image/png' }, responseType: 'arraybuffer' }
        );

        // Fetch stats
        const reqStats = {
            input: { bounds: { geometry: aoiGeoJson }, data: [{ type: "sentinel-2-l2a", dataFilter: { timeRange: { from: fromDate, to: toDate } } }] },
            aggregation: { timeRange: { from: fromDate, to: toDate }, aggregationInterval: { of: "P1D" }, evalscript: evalStats, resx: 0.0001, resy: 0.0001 }
        };
        const resStats = await axios.post('https://sh.dataspace.copernicus.eu/api/v1/statistics', reqStats, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        
        let statsData = {};
        if (resStats.data && resStats.data.data && resStats.data.data.length > 0) {
            const outputs = resStats.data.data[0].outputs;
            if (outputs) {
                statsData = {
                    B04_mean: outputs.B04?.bands?.B0?.stats?.mean || null,
                    B08_mean: outputs.B08?.bands?.B0?.stats?.mean || null,
                    NDVI_mean: outputs.NDVI?.bands?.B0?.stats?.mean || null,
                };
            }
        }

        return {
            ndvi_tiff_base64: Buffer.from(resNdvi.data, 'binary').toString('base64'),
            rgb_png_base64: Buffer.from(resVisual.data, 'binary').toString('base64'),
            bbox: boundingBox,
            stats: statsData
        };
    } catch (e) {
        console.error("S2 Process Error:", e.response ? e.response.data.toString() : e.message);
        throw new Error("Process API request failed");
    }
}

/**
 * Calls Process API for Sentinel-1
 */
async function processSentinel1(token, aoiGeoJson, date) {
    const dateOnly = date.split('T')[0];
    const fromDate = `${dateOnly}T00:00:00Z`;
    // Create a Date object, add 1 day, and format to YYYY-MM-DD
    const dateObj = new Date(dateOnly);
    dateObj.setUTCDate(dateObj.getUTCDate() + 1);
    const nextDate = dateObj.toISOString().split('T')[0];
    const toDate = `${nextDate}T00:00:00Z`;
    const boundingBox = bbox(aoiGeoJson);

    // 1. SAR Scientific Raster (TIFF)
    const evalSar = `
        //VERSION=3
        function setup() {
            return {
                input: ["VV", "VH", "dataMask"],
                output: { id: "default", bands: 2, sampleType: "FLOAT32" }
            };
        }
        function evaluatePixel(sample) {
            return [ sample.dataMask === 1 ? sample.VV : NaN, sample.dataMask === 1 ? sample.VH : NaN ];
        }
    `;

    // 2. SAR Visual (PNG)
    const evalSarRgb = `
        //VERSION=3
        function setup() {
            return {
                input: ["VV", "VH", "dataMask"],
                output: { id: "default", bands: 3, sampleType: "AUTO" }
            };
        }
        function evaluatePixel(sample) {
            let r = Math.max(0, Math.log10(sample.VV) * 2.0);
            let g = Math.max(0, Math.log10(sample.VH) * 2.5);
            return [r, g, 0];
        }
    `;

    const getPayload = (evalscript) => ({
        input: {
            bounds: { geometry: aoiGeoJson },
            data: [{ type: "sentinel-1-grd", dataFilter: { timeRange: { from: fromDate, to: toDate } } }]
        },
        output: { width: 512, height: 512 }
    });

    const evalStats = `
        //VERSION=3
        function setup() {
            return {
                input: ["VV", "VH", "dataMask"],
                output: [
                    { id: "VV", bands: 1 },
                    { id: "VH", bands: 1 }, { id: "dataMask", bands: 1 }
                ]
            };
        }
        function evaluatePixel(sample) {
            return {
                VV: [sample.dataMask === 1 ? sample.VV : NaN],
                VH: [sample.dataMask === 1 ? sample.VH : NaN], dataMask: [sample.dataMask]
            };
        }
    `;

    try {
        const resSar = await axios.post('https://sh.dataspace.copernicus.eu/api/v1/process', 
            { ...getPayload(evalSar), evalscript: evalSar }, 
            { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'image/tiff' }, responseType: 'arraybuffer' }
        );
        const resVisual = await axios.post('https://sh.dataspace.copernicus.eu/api/v1/process', 
            { ...getPayload(evalSarRgb), evalscript: evalSarRgb }, 
            { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'image/png' }, responseType: 'arraybuffer' }
        );

        // Fetch stats
        const reqStats = {
            input: { bounds: { geometry: aoiGeoJson }, data: [{ type: "sentinel-1-grd", dataFilter: { timeRange: { from: fromDate, to: toDate } } }] },
            aggregation: { timeRange: { from: fromDate, to: toDate }, aggregationInterval: { of: "P1D" }, evalscript: evalStats, resx: 0.0001, resy: 0.0001 }
        };
        const resStats = await axios.post('https://sh.dataspace.copernicus.eu/api/v1/statistics', reqStats, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        
        let statsData = {};
        if (resStats.data && resStats.data.data && resStats.data.data.length > 0) {
            const outputs = resStats.data.data[0].outputs;
            if (outputs) {
                statsData = {
                    VV_mean: outputs.VV?.bands?.B0?.stats?.mean || null,
                    VH_mean: outputs.VH?.bands?.B0?.stats?.mean || null
                };
            }
        }

        return {
            sar_vv_vh_tiff_base64: Buffer.from(resSar.data, 'binary').toString('base64'),
            sar_visual_png_base64: Buffer.from(resVisual.data, 'binary').toString('base64'),
            bbox: boundingBox,
            stats: statsData
        };
    } catch (e) {
        console.error("S1 Process Error:", e.response ? e.response.data.toString() : e.message);
        throw new Error("Process API request failed");
    }
}

/**
 * Main Orchestrator
 */
async function analyzeAOI(aoiGeoJson, dateFrom, dateTo) {
    try {
        const token = await module.exports.getAuthToken();
        
        // 1. Evaluate Sentinel-2 Usability via Statistical API for the exact polygon
        const s2Eval = await module.exports.evaluateSentinel2Usability(token, aoiGeoJson, dateFrom, dateTo);
        
        if (s2Eval.usable) {
            // Process Sentinel-2
            try {
                const s2Analysis = await module.exports.processSentinel2(token, aoiGeoJson, s2Eval.date.split("T")[0]);
                return {
                    status: "success",
                    satellite: "Sentinel-2",
                    collection: "sentinel-2-l2a",
                    sensor_type: "optical",
                    analysis_mode: "daylight_optical",
                    fallback_used: false,
                    cloud_cover_aoi_percent: s2Eval.cloudPercent,
                    date: s2Eval.date,
                    analysis: {
                        stats: s2Analysis.stats,
                        bbox: s2Analysis.bbox,
                        ndvi_raster: s2Analysis.ndvi_tiff_base64,
                        visual_preview: s2Analysis.rgb_png_base64
                    },
                    message: "Clear imagery over AOI"
                };
            } catch (err) {
                return {
                    status: "processing_failed",
                    satellite: "Sentinel-2",
                    error: err.message
                };
            }
        }
        
        // 2. Unusable (Clouds/Shadows) -> Fallback to Sentinel-1
        const s1Features = await module.exports.searchSentinel1(token, aoiGeoJson, dateFrom, dateTo);
        
        if (s1Features && s1Features.length > 0) {
            // Process Sentinel-1
            const s1Feature = s1Features[0];
            try {
                const s1Analysis = await module.exports.processSentinel1(token, aoiGeoJson, s1Feature.properties.datetime);
                return {
                    status: "success",
                    satellite: "Sentinel-1",
                    collection: "sentinel-1-grd",
                    sensor_type: "SAR",
                    analysis_mode: "radar_fallback",
                    fallback_used: true,
                    fallback_reason: `Sentinel-2 AOI was substantially obscured by cloud/cloud shadow (${s2Eval.cloudPercent?.toFixed(2)}%)`,
                    date: s1Feature.properties.datetime,
                    analysis: {
                        stats: s1Analysis.stats,
                        bbox: s1Analysis.bbox,
                        vv_vh_raster: s1Analysis.sar_vv_vh_tiff_base64,
                        visual_preview: s1Analysis.sar_visual_png_base64
                    },
                    message: "Sentinel-2 optical imagery is obscured by cloud. Sentinel-1 SAR is being used for complementary radar analysis."
                };
            } catch (err) {
                return {
                    status: "processing_failed",
                    satellite: "Sentinel-1",
                    error: err.message
                };
            }
        }
        
        // 3. Both failed / Unavailable
        return {
            status: "limited",
            satellite: null,
            warning: "No suitable cloud-free Sentinel-2 observation was available and no suitable Sentinel-1 observation was found for the requested AOI and time range."
        };
        
    } catch (err) {
        return {
            status: "error",
            error: err.message
        };
    }
}

module.exports = {
    getAuthToken,
    evaluateSentinel2Usability,
    searchSentinel1,
    processSentinel2,
    processSentinel1,
    analyzeAOI
};
