require('dotenv').config();
const axios = require('axios');

async function testReal() {
    const clientId = process.env.SENTINEL_CLIENT_ID || 'sh-c95dff6a-c4b1-40e0-b7c2-533f08fc2391';
    const clientSecret = process.env.SENTINEL_CLIENT_SECRET || '6LpXDLhaAzqWRY6Qx9PfBW2mGPz48nkC';
    
    console.log("Client ID present:", !!clientId);
    console.log("Client Secret present:", !!clientSecret);

    // Try CDSE Auth
    try {
        console.log("Trying CDSE Auth...");
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);
        
        let res = await axios.post('https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token', params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        console.log("CDSE Auth SUCCESS. Token length:", res.data.access_token.length);
        const token = res.data.access_token;
        
        // Try S2 Catalog
        const payload = {
            bbox: [10, 10, 11, 11],
            datetime: "2024-01-01T00:00:00Z/2024-01-31T23:59:59Z",
            collections: ["sentinel-2-l2a"],
            limit: 1
        };
        const catRes = await axios.post('https://sh.dataspace.copernicus.eu/api/v1/catalog/1.0.0/search', payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log("S2 Catalog Search SUCCESS. Found:", catRes.data.features.length);
        
        // Try S1 Catalog
        const payloadS1 = {
            bbox: [10, 10, 11, 11],
            datetime: "2024-01-01T00:00:00Z/2024-01-31T23:59:59Z",
            collections: ["sentinel-1-grd"],
            limit: 1
        };
        const catS1Res = await axios.post('https://sh.dataspace.copernicus.eu/api/v1/catalog/1.0.0/search', payloadS1, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log("S1 Catalog Search SUCCESS. Found:", catS1Res.data.features.length);
        
    } catch (e) {
        console.error("CDSE failed:", e.response ? e.response.data : e.message);
    }
}

testReal().catch(console.error);
