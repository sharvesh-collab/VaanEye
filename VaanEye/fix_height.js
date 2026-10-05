const fs = require('fs');

function fixHeight(path) {
  let content = fs.readFileSync(path, 'utf8');
  // Add min-height: 450px to the container
  content = content.replace(
    /<div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: #061020; box-sizing: border-box; padding: 20px;">/g,
    '<div style="width: 100%; height: 100%; min-height: 450px; display: flex; flex-direction: column; background: #061020; box-sizing: border-box; padding: 20px;">'
  );
  
  // Also add min-height to the loading states
  content = content.replace(
    /<div style="display: flex; justify-content: center; align-items: center; height: 100%; flex-direction: column; color: #8b98b4;">/g,
    '<div style="display: flex; justify-content: center; align-items: center; height: 100%; min-height: 450px; flex-direction: column; color: #8b98b4;">'
  );
  
  fs.writeFileSync(path, content, 'utf8');
  console.log('Fixed height in ' + path);
}

fixHeight('frontend/public/app.html');
fixHeight('legacy_site/app.html');
