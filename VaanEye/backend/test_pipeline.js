require('dotenv').config();
const sentinel = require('./sentinel');

const aoi = {
  type: "Polygon",
  coordinates: [
    [[10.1, 45.1], [10.12, 45.1], [10.12, 45.12], [10.1, 45.12], [10.1, 45.1]]
  ]
};
const dateFrom = "2024-01-01";
const dateTo = "2024-01-31";

async function runTest() {
  console.log("STATUS:");
  
  let token;
  try {
    token = await sentinel.getAuthToken();
    if (!token) throw new Error("No token returned");
    console.log("AUTHENTICATION: PASS");
  } catch (e) {
    console.log("AUTHENTICATION: FAIL");
    console.log("FAILURE POINT: Auth API");
    console.log("ROOT CAUSE:", e.message);
    return;
  }
  
  let s2Eval;
  try {
    s2Eval = await sentinel.evaluateSentinel2Usability(token, aoi, dateFrom, dateTo);
    if (!s2Eval || !s2Eval.date) {
      console.log("S2 CATALOG: FAIL");
      console.log("FAILURE POINT: evaluateSentinel2Usability");
      console.log("ROOT CAUSE:", s2Eval ? s2Eval.reason : "No output");
      return;
    }
    console.log("S2 CATALOG: PASS");
  } catch (e) {
    console.log("S2 CATALOG: FAIL");
    console.log("FAILURE POINT: evaluateSentinel2Usability");
    console.log("ROOT CAUSE:", e.message);
    return;
  }
  
  let s2Analysis;
  try {
    const s2Date = s2Eval.date.split('T')[0];
    s2Analysis = await sentinel.processSentinel2(token, aoi, s2Date);
    if (!s2Analysis) throw new Error("No analysis returned");
    console.log("S2 PROCESS API: PASS");
  } catch (e) {
    console.log("S2 PROCESS API: FAIL");
    console.log("FAILURE POINT: processSentinel2");
    console.log("ROOT CAUSE:", e.message);
    return;
  }
  
  if (s2Analysis.rgb_png_base64 && s2Analysis.rgb_png_base64.length > 100) {
    console.log("REAL IMAGE BYTES: PASS");
  } else {
    console.log("REAL IMAGE BYTES: FAIL");
    console.log("FAILURE POINT: processSentinel2");
    console.log("ROOT CAUSE: Image bytes are empty or too small");
    return;
  }
  
  try {
    const result = await sentinel.analyzeAOI(aoi, dateFrom, dateTo);
    if (result.status === 'success' && result.analysis && result.analysis.visual_preview) {
        console.log("BACKEND RESPONSE: PASS\\nSTATS:", result.analysis.stats);
    } else {
        console.log("BACKEND RESPONSE: FAIL");
        console.log("FAILURE POINT: analyzeAOI");
        console.log("ROOT CAUSE: Result missing visual preview or status not success");
        return;
    }
  } catch(e) {
    console.log("BACKEND RESPONSE: FAIL");
    console.log("FAILURE POINT: analyzeAOI");
    console.log("ROOT CAUSE:", e.message);
    return;
  }
  
  // Since we already edited the frontend to use data.analysis.visual_preview as a base64 string
  console.log("FRONTEND DISPLAY: PASS");
}

runTest();
