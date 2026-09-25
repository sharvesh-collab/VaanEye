const axios = require('axios');

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
        const res = await axios.post('https://services.sentinel-hub.com/oauth/token', params.toString(), {
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
    const maxCloudPercent = parseFloat(process.env.MAX_AOI_CLOUD_PERCENT || '20');
    
    // Evalscript to count Cloud High, Cloud Medium, Cloud Low, Cloud Shadow (SCL classes 3, 7, 8, 9, 10)
    const evalscript = `
        //VERSION=3
        function setup() {
            return {
                input: ["SCL", "dataMask"],
                output: [
                    { id: "clouds", bands: 1 },
                    { id: "data", bands: 1 }
                ]
            };
        }
        function evaluatePixel(sample) {
            // SCL classes: 3=Cloud shadows, 7=Cloud low, 8=Cloud medium, 9=Cloud high, 10=Cirrus
            let isCloud = (sample.SCL === 3 || sample.SCL === 7 || sample.SCL === 8 || sample.SCL === 9 || sample.SCL === 10) ? 1 : 0;
            return {
                clouds: [isCloud],
                data: [sample.dataMask]
            };
        }
    `;
    
    const requestPayload = {
        input: {
            bounds: { geometry: aoiGeoJson },
            data: [{
                type: "sentinel-2-l2a",
                dataFilter: {
                    timeRange: { from: dateFrom, to: dateTo }
                }
            }]
        },
        aggregation: {
            timeRange: { from: dateFrom, to: dateTo },
            aggregationInterval: { of: "P1D" }, // daily
            evalscript: evalscript,
            resx: 10,
            resy: 10
        }
    };
    
    try {
        const res = await axios.post('https://services.sentinel-hub.com/api/v1/statistics', requestPayload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = res.data.data;
        if (!data || data.length === 0) return { usable: false, cloudPercent: 100, reason: 'No data' };
        
        // Find the best clear day in the range
        let bestDay = null;
        let lowestCloudPercent = 100;
        
        for (const day of data) {
            const stats = day.outputs;
            if (!stats || !stats.data || !stats.clouds) continue;
            
            const totalValidPixels = stats.data.bands.B0.stats.sum;
            const cloudPixels = stats.clouds.bands.B0.stats.sum;
            
            if (totalValidPixels === 0) continue;
            
            const cloudPercent = (cloudPixels / totalValidPixels) * 100;
            if (cloudPercent < lowestCloudPercent) {
                lowestCloudPercent = cloudPercent;
                bestDay = day;
            }
        }
        
        if (!bestDay) {
            return { usable: false, cloudPercent: 100, reason: 'No valid pixels' };
        }
        
        return {
            usable: lowestCloudPercent <= maxCloudPercent,
            cloudPercent: lowestCloudPercent,
            date: bestDay.interval.from
        };
        
    } catch (err) {
        console.error("Stats API Error:", err.response?.data || err.message);
        // Fallback to searching catalog if stats fail
        return { usable: false, cloudPercent: 100, reason: 'API Error' };
    }
}

/**
 * Searches Sentinel-1 GRD Catalog
 */
async function searchSentinel1(token, aoiGeoJson, dateFrom, dateTo) {
    const payload = {
        bbox: null,
        intersects: aoiGeoJson,
        datetime: `${dateFrom}/${dateTo}`,
        collections: ["sentinel-1-grd"],
        limit: 1
    };
    
    try {
        const res = await axios.post('https://services.sentinel-hub.com/api/v1/catalog/search', payload, {
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
 * Main Orchestrator
 */
async function analyzeAOI(aoiGeoJson, dateFrom, dateTo) {
    try {
        const token = await module.exports.getAuthToken();
        
        // 1. Evaluate Sentinel-2 Usability via Statistical API for the exact polygon
        const s2Eval = await module.exports.evaluateSentinel2Usability(token, aoiGeoJson, dateFrom, dateTo);
        
        if (s2Eval.usable) {
            // Process Sentinel-2
            return {
                status: "success",
                satellite: "Sentinel-2",
                sensor_type: "Optical",
                analysis_mode: "daylight_optical",
                fallback_used: false,
                cloud_cover_aoi_percent: s2Eval.cloudPercent,
                date: s2Eval.date,
                message: "Clear imagery over AOI"
            };
        }
        
        // 2. Unusable (Clouds/Shadows) -> Fallback to Sentinel-1
        const s1Features = await module.exports.searchSentinel1(token, aoiGeoJson, dateFrom, dateTo);
        
        if (s1Features && s1Features.length > 0) {
            // Process Sentinel-1
            const s1Feature = s1Features[0];
            return {
                status: "success",
                satellite: "Sentinel-1",
                sensor_type: "SAR",
                analysis_mode: "radar_fallback",
                fallback_used: true,
                fallback_reason: `Sentinel-2 AOI was substantially obscured by cloud/cloud shadow (${s2Eval.cloudPercent?.toFixed(2)}%)`,
                date: s1Feature.properties.datetime,
                message: "Sentinel-2 optical imagery is obscured by cloud. Sentinel-1 SAR is being used for complementary radar analysis."
            };
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
    analyzeAOI
};
