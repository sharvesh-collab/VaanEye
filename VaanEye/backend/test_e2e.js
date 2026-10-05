require('dotenv').config();
const { analyzeAOI } = require('./sentinel');

// A farm in Northern Italy
const aoi1 = {
    type: "Polygon",
    coordinates: [
        [[10.1, 45.1], [10.12, 45.1], [10.12, 45.12], [10.1, 45.12], [10.1, 45.1]]
    ]
};

async function runTests() {
    console.log("=== VaanEye E2E Real Validation ===\n");

    try {
        // TEST A: Try to find a CLEAR day (Summer 2024)
        console.log("--- TEST A: Clear AOI (Expected: Sentinel-2) ---");
        // July is usually clear in Italy. Let's try July 15-20, 2024
        let resA = await analyzeAOI(aoi1, "2024-07-15T00:00:00Z", "2024-07-20T23:59:59Z");
        if(resA.analysis) { delete resA.analysis.ndvi_raster; delete resA.analysis.vv_vh_raster; delete resA.analysis.visual_preview; }
        console.log(JSON.stringify(resA, null, 2));

        // TEST B: Try to find a CLOUDY day (Winter 2024)
        console.log("\n--- TEST B: Cloud-Obscured AOI (Expected: Sentinel-1 Fallback) ---");
        // November is usually cloudy. Let's try Nov 1-5, 2024
        let resB = await analyzeAOI(aoi1, "2024-11-01T00:00:00Z", "2024-11-01T23:59:59Z");
        if(resB.analysis) { delete resB.analysis.ndvi_raster; delete resB.analysis.vv_vh_raster; delete resB.analysis.visual_preview; }
        console.log(JSON.stringify(resB, null, 2));

        // TEST C: Clouds outside AOI, but AOI clear
        // This is harder to guess the exact date for a fixed polygon.
        // I will try a few dates in April/May 2024 and see if one trips a low-but-non-zero cloud cover.
        console.log("\n--- TEST C: Search for partial cloud / Clouds outside AOI ---");
        let resC = await analyzeAOI(aoi1, "2024-05-01T00:00:00Z", "2024-05-15T23:59:59Z");
        if(resC.analysis) { delete resC.analysis.ndvi_raster; delete resC.analysis.vv_vh_raster; delete resC.analysis.visual_preview; }
        console.log(JSON.stringify(resC, null, 2));

    } catch (e) {
        console.error("Test failed:", e);
    }
}

runTests();
