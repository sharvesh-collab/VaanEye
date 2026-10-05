import re

with open('sentinel.js', 'r', encoding='utf-8') as f:
    code = f.read()

new_func = """async function evaluateSentinel2Usability(token, aoiGeoJson, dateFrom, dateTo) {
    const formattedFrom = dateFrom.includes('T') ? dateFrom : `${dateFrom}T00:00:00Z`;
    const formattedTo = dateTo.includes('T') ? dateTo : `${dateTo}T23:59:59Z`;

    const requestPayload = {
        intersects: aoiGeoJson,
        datetime: `${formattedFrom}/${formattedTo}`,
        collections: ["sentinel-2-l2a"],
        limit: 1,
        query: {
            "eo:cloud_cover": { "lte": 20 }
        },
        sortby: [
            { field: "properties.datetime", direction: "desc" }
        ]
    };

    try {
        const response = await axios.post('https://sh.dataspace.copernicus.eu/api/v1/catalog/1.0.0/search', requestPayload, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        
        if (response.data && response.data.features && response.data.features.length > 0) {
            const feature = response.data.features[0];
            return {
                usable: true,
                cloudPercent: feature.properties['eo:cloud_cover'],
                date: feature.properties.datetime
            };
        }
        
        return { usable: false, cloudPercent: 100, date: null };
    } catch (e) {
        console.error("S2 Catalog Error:", e.response ? e.response.data : e.message);
        return { usable: false, cloudPercent: 100, date: null };
    }
}"""

code = re.sub(r'async function evaluateSentinel2Usability.*?\}\n\n/\*\*', new_func + '\n\n/**', code, flags=re.DOTALL)

evalscript_old = """//VERSION=3
        function setup() {
            return {
                input: ["B02", "B03", "B04"],
                output: { id: "default", bands: 3, sampleType: "AUTO" }
            };
        }
        function evaluatePixel(sample) {
            return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02];
        }"""

evalscript_new = """//VERSION=3
        function setup() {
            return {
                input: ["B02", "B03", "B04", "dataMask"],
                output: { id: "default", bands: 4, sampleType: "AUTO" }
            };
        }
        function evaluatePixel(sample) {
            return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02, sample.dataMask];
        }"""

code = code.replace(evalscript_old, evalscript_new)

with open('sentinel.js', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done!')
