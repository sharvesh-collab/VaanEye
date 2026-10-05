const Jimp = require('jimp');

async function checkImage() {
  try {
    const image = await Jimp.read('test_image.png');
    let nonBlack = 0;
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      var red = this.bitmap.data[idx + 0];
      var green = this.bitmap.data[idx + 1];
      var blue = this.bitmap.data[idx + 2];
      var alpha = this.bitmap.data[idx + 3];
      // Check if it's not completely black and not completely transparent
      if (alpha > 0 && (red > 5 || green > 5 || blue > 5)) {
        nonBlack++;
      }
    });
    console.log("Total pixels:", image.bitmap.width * image.bitmap.height);
    console.log("Non-empty pixels:", nonBlack);
  } catch(e) {
    console.error("Error:", e);
  }
}
checkImage();
