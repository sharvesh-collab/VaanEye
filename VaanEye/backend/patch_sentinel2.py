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
        limit: 10,
        sortby: [
            { field: "properties.datetime", direction: "desc" }
        ]
    };

    try {
        const response = await axios.post('https://sh.dataspace.copernicus.eu/api/v1/catalog/1.0.0/search', requestPayload, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        
        if (response.data && response.data.features && response.data.features.length > 0) {
            for (let feature of response.data.features) {
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
                cloudPercent: response.data.features[0].properties['eo:cloud_cover'],
                date: response.data.features[0].properties.datetime
            };
        }
        
        return { usable: false, cloudPercent: 100, date: null };
    } catch (e) {
        console.error("S2 Catalog Error:", e.response ? e.response.data : e.message);
        return { usable: false, cloudPercent: 100, date: null };
    }
}"""

code = re.sub(r'async function evaluateSentinel2Usability.*?\}\n\n/\*\*', new_func + '\n\n/**', code, flags=re.DOTALL)

with open('sentinel.js', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done!')
