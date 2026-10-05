const fs = require('fs');
const buffer = fs.readFileSync('test_image.png');
console.log("Size:", buffer.length);
// Check if the image is mostly the same color or completely empty
// A blank PNG is usually very small (e.g. < 1KB), but a 107KB PNG might be noisy or an actual image.
// Let's print out the first 50 bytes of the IDAT chunk.
const idatIndex = buffer.indexOf('IDAT');
if (idatIndex !== -1) {
  console.log("IDAT found at:", idatIndex);
  console.log(buffer.slice(idatIndex, idatIndex + 50).toString('hex'));
}
