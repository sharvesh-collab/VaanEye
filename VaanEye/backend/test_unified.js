const sentinel = require('./sentinel');
const fs = require('fs');

const aoi = {
  type: "Polygon",
  coordinates: [
    [
      [76.99, 10.80],
      [77.05, 10.80],
      [77.05, 10.84],
      [76.99, 10.84],
      [76.99, 10.80]
    ]
  ]
};

const dateFrom = "2023-01-01";
const dateTo = "2026-09-25";

(async () => {
    try {
        console.log("TESTING VAANEYE KINATUKADAVU AOI");
        const token = await sentinel.getAuthToken();
        console.log("AUTHENTICATION: PASS");

        const s2Eval = await sentinel.evaluateSentinel2Usability(token, aoi, dateFrom, dateTo);
        console.log("S2 CATALOG USABLE:", s2Eval.usable, "DATE:", s2Eval.date, "CLOUD:", s2Eval.cloudPercent);
        
        if (!s2Eval.usable) {
            console.log("FAILED TO FIND USABLE SCENE");
            return;
        }

        const s2Analysis = await sentinel.processSentinel2(token, aoi, s2Eval.date.split('T')[0]);
        console.log("S2 PROCESS API: PASS");

        // Verify the image
        const imgBuffer = Buffer.from(s2Analysis.rgb_png_base64, 'base64');
        fs.writeFileSync('test_kinatukadavu.png', imgBuffer);
        console.log("IMAGE BYTES LENGTH:", imgBuffer.length);
        
        const idatIndex = imgBuffer.indexOf('IDAT');
        if (idatIndex !== -1) {
            console.log("IDAT found at:", idatIndex);
            console.log(imgBuffer.slice(idatIndex, idatIndex + 50).toString('hex'));
            if (imgBuffer.length > 5000) {
                console.log("IMAGE APPEARS TO HAVE NON-TRIVIAL PIXEL DATA");
            } else {
                console.log("IMAGE MIGHT BE EMPTY OR HIGHLY COMPRESSED (TRANSPARENT/SOLID)");
            }
        } else {
            console.log("NO IDAT CHUNK FOUND!");
        }

        const result = await sentinel.analyzeAOI(aoi, dateFrom, dateTo);
        console.log("BACKEND RESPONSE:", result.status);
    } catch (e) {
        console.error("ERROR:", e);
    }
})();
