const fs = require('fs');
const path = require('path');

const fileToPatch = path.join(__dirname, '../frontend/public/app.html');
let content = fs.readFileSync(fileToPatch, 'utf8');

const weatherHTML = `
<div id="vaaneye-weather-panel"
    style="position:fixed; top:80px; right:20px; width:350px; background:rgba(8,12,24,0.85); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.15); border-radius:15px; padding:20px; z-index:9998; box-shadow:0 10px 40px rgba(0,0,0,0.8); color:#f3f6fc; font-family:sans-serif;">
    <h3 style="margin:0 0 15px 0; font-size:16px; color:#c9a227; display:flex; align-items:center; gap:8px;">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
      </svg>
      Multi-Pillar Intelligence
    </h3>
    
    <!-- Normal Weather -->
    <div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:8px; margin-bottom:10px;">
      <div style="font-size:12px; color:#8b98b4; margin-bottom:4px; font-weight:bold;">NORMAL WEATHER</div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:18px;" id="w-temp">--°C</span>
        <span style="font-size:14px; color:#1fd5e8;" id="w-hum">Humidity: --%</span>
      </div>
    </div>
    
    <!-- Disaster Risk -->
    <div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:8px; margin-bottom:10px;">
      <div style="font-size:12px; color:#ff6b81; margin-bottom:4px; font-weight:bold;">DISASTER RISK</div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:14px;" id="w-rain">Rainfall: -- mm</span>
        <span style="font-size:14px; color:#ffc53d;" id="w-wind">Gusts: -- km/h</span>
      </div>
    </div>
    
    <!-- Agri Insights -->
    <div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:8px;">
      <div style="font-size:12px; color:#3dd68c; margin-bottom:4px; font-weight:bold;">AGRI INSIGHTS</div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:14px;">Soil Moisture:</span>
        <span style="font-size:16px; font-weight:bold; color:#a06bff;" id="w-soil">-- m³/m³</span>
      </div>
    </div>
</div>
`;

const weatherJS = `
<script>
  async function fetchVaanEyeWeather(lat, lon) {
    try {
      const apiUrl = \`https://api.open-meteo.com/v1/forecast?latitude=\${lat}&longitude=\${lon}&daily=sunrise,sunset,temperature_2m_min,temperature_2m_max,weather_code,precipitation_sum,precipitation_probability_max,uv_index_max&hourly=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,surface_pressure,visibility,wind_speed_10m,wind_gusts_10m,soil_temperature_0cm,soil_moisture_0_to_1cm&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_gusts_10m&timezone=auto\`;
      const res = await fetch(apiUrl);
      if(!res.ok) throw new Error("Failed to fetch weather data");
      const data = await res.json();
      
      if(data && data.current) {
        document.getElementById('w-temp').innerText = data.current.temperature_2m + '°C';
        document.getElementById('w-hum').innerText = 'Humidity: ' + data.current.relative_humidity_2m + '%';
        document.getElementById('w-rain').innerText = 'Rainfall: ' + data.current.precipitation + ' mm';
        document.getElementById('w-wind').innerText = 'Gusts: ' + data.current.wind_gusts_10m + ' km/h';
      }
      
      if(data && data.hourly && data.hourly.soil_moisture_0_to_1cm) {
        const currentHour = new Date().getHours();
        document.getElementById('w-soil').innerText = data.hourly.soil_moisture_0_to_1cm[currentHour] + ' m³/m³';
      }
    } catch(err) {
      console.error("VaanEye Weather Error:", err);
    }
  }

  window.addEventListener('load', () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchVaanEyeWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation denied/failed. Falling back to Kinatukadavu.", error);
          fetchVaanEyeWeather(10.80, 76.99);
        },
        { timeout: 10000 }
      );
    } else {
      fetchVaanEyeWeather(10.80, 76.99);
    }
  });
</script>
`;

let changed = false;

// 1. Insert HTML
if (!content.includes('id="vaaneye-weather-panel"')) {
    // Insert after sat-result div closing inside vaaneye-sat-panel
    const satPanelRegex = /<div id="sat-result"[^>]*><\/div>\s*<\/div>/;
    if (satPanelRegex.test(content)) {
        content = content.replace(satPanelRegex, match => match + '\n' + weatherHTML);
        changed = true;
    } else {
        // Fallback: put it before the first <script> tag if the layout changed
        content = content.replace(/<script>/, weatherHTML + '\n<script>');
        changed = true;
    }
}

// 2. Insert JS
if (!content.includes('fetchVaanEyeWeather')) {
    content = content.replace('</body>', weatherJS + '\n</body>');
    changed = true;
}

if (changed) {
    fs.writeFileSync(fileToPatch, content, 'utf8');
    console.log("Successfully added Multi-Pillar Intelligence weather widget.");
} else {
    console.log("Widget already exists or no changes made.");
}
