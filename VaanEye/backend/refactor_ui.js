const fs = require('fs');
const path = require('path');

const fileToPatch = path.join(__dirname, '../frontend/public/app.html');
let content = fs.readFileSync(fileToPatch, 'utf8');

let changed = false;

// Task 1: Hide widgets from login/setup and show only on dashboard
if (content.includes('id="vaaneye-weather-panel"')) {
    // Hide panels by default
    content = content.replace(/<div id="vaaneye-weather-panel"\s*style="position:fixed;/, '<div id="vaaneye-weather-panel" style="display:none; position:fixed;');
    content = content.replace(/<div id="vaaneye-sat-panel"\s*style="position:fixed;/, '<div id="vaaneye-sat-panel" style="display:none; position:fixed;');
    
    // Show panels in drawDash()
    const drawDashRegex = /function drawDash\(\)\s*\{/;
    if (drawDashRegex.test(content) && !content.includes('vaaneye-weather-panel\').style.display')) {
        content = content.replace(drawDashRegex, `function drawDash() {
      const wp = document.getElementById('vaaneye-weather-panel');
      if(wp) wp.style.display = 'block';
      const sp = document.getElementById('vaaneye-sat-panel');
      if(sp) sp.style.display = 'block';`);
        changed = true;
    }
}

// Task 2: Contextual Sidebar Routing
// Wrap .dbody in view-overview
if (!content.includes('id="view-overview"')) {
    content = content.replace(/<div class="dbody">/, '<div class="dbody" id="view-overview">');
    
    // Append view-farm-crop after view-overview (we'll just append it before </main>)
    const farmViewHtml = `
<div class="dbody" id="view-farm-crop" style="display:none;">
    <div>
        <h1 class="dh1">Farm & Crop Insights</h1>
        <p class="dsub">Agriculture-specific metrics for your location</p>
    </div>
    <div class="kpis" style="margin-top:20px;">
        <div class="kpi" style="pointer-events:none;">
            <span class="kt"><span class="kic" style="background:rgba(46,230,168,.14)">🌾</span><span class="kl">NDVI (Vegetation)</span></span>
            <div class="kv" id="farm-ndvi">Loading...</div>
        </div>
        <div class="kpi" style="pointer-events:none;">
            <span class="kt"><span class="kic" style="background:rgba(255,197,61,.14)">🌡️</span><span class="kl">Soil Temp</span></span>
            <div class="kv" id="farm-soil-temp">Loading...</div>
        </div>
        <div class="kpi" style="pointer-events:none;">
            <span class="kt"><span class="kic" style="background:rgba(31,213,232,.14)">💧</span><span class="kl">Soil Moisture</span></span>
            <div class="kv" id="farm-soil-moist">Loading...</div>
        </div>
    </div>
</div>
`;
    content = content.replace(/<\/main>/, farmViewHtml + '\n</main>');
    
    // Update navigation JS
    const oldNav = `b.setAttribute('aria-current', 'page'); toast('📂', 'Opening ' + b.textContent.replace(/\\d+/g, '').trim())`;
    const newNav = `b.setAttribute('aria-current', 'page'); 
        var label = b.textContent.replace(/\\d+/g, '').trim();
        toast('📂', 'Opening ' + label);
        
        var target = 'view-overview';
        if (label.includes('Farm & Crop')) {
            target = 'view-farm-crop';
        }
        var ov = document.getElementById('view-overview');
        var fm = document.getElementById('view-farm-crop');
        if(ov) ov.style.display = (target === 'view-overview') ? 'block' : 'none';
        if(fm) fm.style.display = (target === 'view-farm-crop') ? 'block' : 'none';`;
        
    content = content.replace(oldNav, newNav);
    changed = true;
}

// Task 3: Strip Hardcoded Weather Values
// 3.1 Strip from Multi-Pillar Intelligence widget if the user hardcoded them
content = content.replace(/>31\.6°C</g, '>Loading...<');
content = content.replace(/>Humidity: 39%</g, '>Humidity: Loading...<');
content = content.replace(/>0\.176 m³\/m³</g, '>Loading...<');

// 3.2 Strip from main dashboard 'Heat today' and add ID
content = content.replace(/<div class="kv">41°C<\/div>/, '<div class="kv" id="main-kpi-heat">Loading...</div>');

// Update fetchVaanEyeWeather to map to these new IDs
if (!content.includes("document.getElementById('farm-soil-temp')")) {
    const apiCallRegex = /if\(data && data\.hourly && data\.hourly\.soil_moisture_0_to_1cm\) \{([\s\S]*?)\}/;
    const newMapping = `if(data && data.hourly && data.hourly.soil_moisture_0_to_1cm) {
        const currentHour = new Date().getHours();
        const soilM = data.hourly.soil_moisture_0_to_1cm[currentHour];
        const soilT = data.hourly.soil_temperature_0cm[currentHour];
        if(document.getElementById('w-soil')) document.getElementById('w-soil').innerText = soilM + ' m³/m³';
        if(document.getElementById('farm-soil-moist')) document.getElementById('farm-soil-moist').innerText = soilM + ' m³/m³';
        if(document.getElementById('farm-soil-temp')) document.getElementById('farm-soil-temp').innerText = soilT + '°C';
      }
      
      if(data && data.current) {
        if(document.getElementById('main-kpi-heat')) document.getElementById('main-kpi-heat').innerText = data.current.temperature_2m + '°C';
      }`;
    content = content.replace(apiCallRegex, newMapping);
    changed = true;
}

// Task 4: Global Logo Update
// Replace the SVG with the image logo.png
const logoRegex = /<div class="bmark">\s*<svg[\s\S]*?<\/svg>\s*<\/div>/g;
const newLogo = `<div class="bmark"><img src="img/logo.png" style="width:34px; height:34px; object-fit:contain; border-radius:11px;" alt="VaanEye Logo"></div>`;
if (logoRegex.test(content)) {
    content = content.replace(logoRegex, newLogo);
    changed = true;
}

if (changed) {
    fs.writeFileSync(fileToPatch, content, 'utf8');
    console.log("Successfully refactored VaanEye UI.");
} else {
    console.log("No changes made. Script might have already run.");
}
