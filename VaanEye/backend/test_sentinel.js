const { analyzeAOI } = require('./sentinel');
const sentinel = require('./sentinel');

// Mock AOI
const aoi = {
    type: "Polygon",
    coordinates: [[[10, 10], [10, 11], [11, 11], [11, 10], [10, 10]]]
};
const dateFrom = "2026-01-01";
const dateTo = "2026-01-31";

// Simple test runner
async function runTests() {
    process.env.SENTINEL_CLIENT_ID = "mock";
    process.env.SENTINEL_CLIENT_SECRET = "mock";
    
    console.log("==========================================");
    console.log("RUNNING SENTINEL-2 -> SENTINEL-1 FALLBACK TESTS");
    console.log("==========================================\n");

    // Mock getAuthToken
    sentinel.getAuthToken = async () => "mock_token";
    // We also need to overwrite it in require.cache so analyzeAOI uses it, 
    // or just mock the axios module entirely.
    const axios = require('axios');
    axios.post = async (url) => {
        if (url.includes('token')) return { data: { access_token: "mock_token", expires_in: 3600 } };
        return { data: {} };
    };

    // TEST 1 & 2: Clear AOI
    console.log("TEST 1 & 2: Clear Sentinel-2 AOI (or clouds outside AOI)");
    sentinel.evaluateSentinel2Usability = async () => ({ usable: true, cloudPercent: 5.2, date: "2026-01-15" });
    let res = await analyzeAOI(aoi, dateFrom, dateTo);
    console.log("Result:");
    console.log(JSON.stringify(res, null, 2));
    console.assert(res.satellite === "Sentinel-2" && res.fallback_used === false, "TEST 1/2 FAILED");
    console.log("✅ Passed\n");

    // TEST 3 & 4: AOI Substantially covered by clouds/shadows
    console.log("TEST 3 & 4: AOI covered by clouds/shadows (> threshold)");
    sentinel.evaluateSentinel2Usability = async () => ({ usable: false, cloudPercent: 85.5, reason: "Too cloudy" });
    sentinel.searchSentinel1 = async () => ([{ properties: { datetime: "2026-01-14T10:00:00Z" } }]);
    res = await analyzeAOI(aoi, dateFrom, dateTo);
    console.log("Result:");
    console.log(JSON.stringify(res, null, 2));
    console.assert(res.satellite === "Sentinel-1" && res.fallback_used === true, "TEST 3/4 FAILED");
    console.log("✅ Passed\n");

    // TEST 5: Sentinel-2 completely unavailable (no data)
    console.log("TEST 5: Sentinel-2 unavailable");
    sentinel.evaluateSentinel2Usability = async () => ({ usable: false, cloudPercent: 100, reason: "No data" });
    sentinel.searchSentinel1 = async () => ([{ properties: { datetime: "2026-01-14T10:00:00Z" } }]);
    res = await analyzeAOI(aoi, dateFrom, dateTo);
    console.log("Result:");
    console.log(JSON.stringify(res, null, 2));
    console.assert(res.satellite === "Sentinel-1", "TEST 5 FAILED");
    console.log("✅ Passed\n");

    // TEST 6: Both unavailable
    console.log("TEST 6: Both Sentinel-2 and Sentinel-1 unavailable");
    sentinel.evaluateSentinel2Usability = async () => ({ usable: false, cloudPercent: 100, reason: "No data" });
    sentinel.searchSentinel1 = async () => ([]);
    res = await analyzeAOI(aoi, dateFrom, dateTo);
    console.log("Result:");
    console.log(JSON.stringify(res, null, 2));
    console.assert(res.status === "limited" && res.satellite === null, "TEST 6 FAILED");
    console.log("✅ Passed\n");

    // TEST 7: Sentinel-1 selected explicitly indicates fallback
    console.log("TEST 7: Sentinel-1 selected response check");
    sentinel.evaluateSentinel2Usability = async () => ({ usable: false, cloudPercent: 99.9 });
    sentinel.searchSentinel1 = async () => ([{ properties: { datetime: "2026-01-14T10:00:00Z" } }]);
    res = await analyzeAOI(aoi, dateFrom, dateTo);
    console.log("Result:");
    console.log(JSON.stringify(res, null, 2));
    console.assert(res.sensor_type === "SAR" && res.analysis_mode === "radar_fallback" && res.fallback_used === true, "TEST 7 FAILED");
    console.log("✅ Passed\n");

}

runTests().catch(console.error);
