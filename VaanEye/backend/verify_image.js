require('dotenv').config();
const sentinel = require('./sentinel');
const fs = require('fs');

const aoi = {
  type: "Polygon",
  coordinates: [
    [[10.1, 45.1], [10.12, 45.1], [10.12, 45.12], [10.1, 45.12], [10.1, 45.1]]
  ]
};
const dateFrom = "2024-01-01";
const dateTo = "2024-01-31";

async function verifyImage() {
  const token = await sentinel.getAuthToken();
  const s2Eval = await sentinel.evaluateSentinel2Usability(token, aoi, dateFrom, dateTo);
  const s2Date = s2Eval.date.split('T')[0];
  const s2Analysis = await sentinel.processSentinel2(token, aoi, s2Date);
  
  const buffer = Buffer.from(s2Analysis.rgb_png_base64, 'base64');
  fs.writeFileSync('test_image.png', buffer);
  console.log("Saved test_image.png. Bytes:", buffer.length);
  
  // Read first few bytes to check PNG signature
  const header = buffer.toString('hex', 0, 8);
  console.log("Header (PNG should be 89504e470d0a1a0a):", header);
  if (header === '89504e470d0a1a0a') {
    console.log("Image is a valid PNG.");
  } else {
    console.log("Image is NOT a valid PNG! Content:", buffer.toString('utf8').substring(0, 100));
  }
}
verifyImage();
