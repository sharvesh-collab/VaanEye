require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const { getAuthToken, processSentinel2, processSentinel1 } = require('./sentinel');

async function testRealProcessing() {
    try {
        console.log("Fetching CDSE Token...");
        const token = await getAuthToken();
        console.log("Token obtained!");

        // Use a test farm AOI
        const aoi = {
            type: "Polygon",
            coordinates: [
                [
                    [10.1, 45.1],
                    [10.12, 45.1],
                    [10.12, 45.12],
                    [10.1, 45.12],
                    [10.1, 45.1]
                ]
            ]
        };

        // Try S2 Process
        console.log("\n--- TESTING SENTINEL-2 PROCESS API ---");
        try {
            const s2res = await processSentinel2(token, aoi, "2024-01-15");
            console.log("S2 Processing SUCCESS!");
            console.log("NDVI TIFF Base64 Length:", s2res.ndvi_tiff_base64.length);
            console.log("Visual PNG Base64 Length:", s2res.rgb_png_base64.length);
            // Verify it's actually getting data
            if (s2res.ndvi_tiff_base64.length > 100) {
                console.log("S2 Raster Data Verified.");
            } else {
                console.log("WARNING: S2 Data suspiciously small.");
            }
        } catch (e) {
            console.error("S2 Processing Failed:", e.message);
        }

        // Try S1 Process
        console.log("\n--- TESTING SENTINEL-1 PROCESS API ---");
        try {
            const s1res = await processSentinel1(token, aoi, "2024-01-15T17:00:00Z");
            console.log("S1 Processing SUCCESS!");
            console.log("VV/VH TIFF Base64 Length:", s1res.sar_vv_vh_tiff_base64.length);
            console.log("Visual PNG Base64 Length:", s1res.sar_visual_png_base64.length);
             if (s1res.sar_vv_vh_tiff_base64.length > 100) {
                console.log("S1 Raster Data Verified.");
            } else {
                console.log("WARNING: S1 Data suspiciously small.");
            }
        } catch (e) {
            console.error("S1 Processing Failed:", e.message);
        }

    } catch (e) {
        console.error("Test Failed:", e.message);
    }
}

testRealProcessing();
