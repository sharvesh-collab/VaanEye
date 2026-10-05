const fs = require('fs');

function updateFile(path) {
  let content = fs.readFileSync(path, 'utf8');

  // Replace drawDash
  const drawDashRegex = /function drawDash\(\) \{[\s\S]*?<\/svg>';\r?\n    \}/;
  content = content.replace(drawDashRegex, `function drawDash() {\n      runSatelliteAnalysis();\n    }`);

  // Replace runSatelliteAnalysis
  const runSatRegex = /function runSatelliteAnalysis\(\) \{[\s\S]*?resultDiv\.innerHTML = `<span style="color:#ff6b81">API Connection Error: Backend server might be offline\.<\/span>`;\r?\n        \}\);\r?\n    \}/;
  
  const newRunSat = `function runSatelliteAnalysis() {
      const btn = document.getElementById('sat-run-btn');
      if (btn) {
        btn.innerText = "Analyzing AOI...";
        btn.disabled = true;
      }
      
      const dMap = document.getElementById('dMap');
      if (dMap) {
        dMap.innerHTML = \`
          <div style="display: flex; justify-content: center; align-items: center; height: 100%; flex-direction: column; color: #8b98b4;">
            <div class="lring" style="margin-bottom: 16px;"></div>
            <div style="font-size: 15px; font-weight: bold; color: white;">Acquiring satellite imagery...</div>
            <div style="font-size: 13px; margin-top: 8px;">Processing Sentinel-2...</div>
          </div>
        \`;
      }

      const resultDiv = document.getElementById('sat-result');
      if (resultDiv) {
        resultDiv.innerHTML = "<span style='color:#ffc53d'>Querying Copernicus Data Space Ecosystem...</span>";
      }

      const aoi = {
        type: "Polygon",
        coordinates: [
          [[10.1, 45.1], [10.12, 45.1], [10.12, 45.12], [10.1, 45.12], [10.1, 45.1]]
        ]
      };
      const dateFrom = "2024-01-01";
      const dateTo = "2024-01-31";

      const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:')
        ? 'http://localhost:5000/api/analyze'
        : '/api/analyze';

      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aoi, dateFrom, dateTo })
      })
        .then(r => r.json())
        .then(data => {
          if (btn) {
            btn.innerText = "Run Pipeline over AOI";
            btn.disabled = false;
          }

          if (data.status === 'success') {
            const processAndShowImage = () => {
              if (dMap) {
                const locStr = (typeof addr === 'function') ? addr().slice(0, 3).join(', ') : 'Kinatukadavu, Pollachi, Coimbatore';
                
                dMap.innerHTML = \`
                  <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: #061020; box-sizing: border-box; padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                      <span style="font-size: 18px; font-weight: bold; color: white; display: flex; align-items: center; gap: 8px;">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></svg>
                        SATELLITE INTELLIGENCE
                      </span>
                      <span style="font-weight: bold; font-size: 15px; color: \${data.fallback_used ? '#ffc53d' : '#1fd5e8'}">\${data.satellite}</span>
                    </div>
                    <div style="flex: 1; min-height: 0; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #000;">
                      \${data.analysis && data.analysis.visual_preview 
                        ? \`<img src="data:image/png;base64,\${data.analysis.visual_preview}" style="width: 100%; height: 100%; object-fit: contain;" />\` 
                        : \`<div style="color: #ff6b81">Satellite imagery unavailable</div>\`}
                    </div>
                    <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 6px;">
                      <div style="font-size: 15px; font-weight: bold; color: #fff;">📍 \${locStr}</div>
                      <div style="font-size: 13px; color: #8b98b4;">
                        \${data.satellite} · \${data.sensor_type} \${data.fallback_used ? \`· ⚠️ \${data.fallback_reason}\` : \`· ☁️ Cloud: \${data.cloud_cover_aoi_percent.toFixed(1)}%\`}
                      </div>
                    </div>
                  </div>
                \`;
              }
            };

            if (data.fallback_used && dMap) {
              dMap.innerHTML = \`
                <div style="display: flex; justify-content: center; align-items: center; height: 100%; flex-direction: column; color: #8b98b4;">
                  <div class="lring" style="margin-bottom: 16px; border-top-color: #ffc53d;"></div>
                  <div style="font-size: 15px; font-weight: bold; color: #ff6b81;">Sentinel-2 obscured</div>
                  <div style="font-size: 13px; margin-top: 8px;">Switching to Sentinel-1 SAR...</div>
                </div>
              \`;
              setTimeout(processAndShowImage, 1500);
            } else {
              processAndShowImage();
            }

            if (resultDiv) {
              let html = \`
                  <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                      <div style="color:\${data.fallback_used ? '#ffc53d' : '#1fd5e8'}; font-weight:bold; font-size:14px; margin-bottom:5px;">
                        \${data.satellite} (\${data.sensor_type})
                      </div>
                      <div style="color:#8b98b4; font-size:11px; margin-bottom:10px;">\${data.date}</div>
              \`;
              if (data.fallback_used) {
                if (data.analysis?.stats) {
                  html += \`<div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px; margin-bottom:5px;">
                          <span>SAR VV</span><span>\${data.analysis.stats.VV_mean?.toFixed(4)}</span>
                      </div>\`;
                  html += \`<div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                          <span>SAR VH</span><span>\${data.analysis.stats.VH_mean?.toFixed(4)}</span>
                      </div>\`;
                }
              } else {
                if (data.analysis?.stats) {
                  html += \`<div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px; margin-bottom:5px;">
                          <span>NDVI</span><span style="color:#a06bff; font-weight:bold;">\${data.analysis.stats.NDVI_mean?.toFixed(4)}</span>
                      </div>\`;
                  html += \`<div style="display:flex; justify-content:space-between; font-size:10.5px; color:#8b98b4; margin-bottom:5px;">
                          <span>B04 (Red): \${data.analysis.stats.B04_mean?.toFixed(3)}</span>
                          <span>B08 (NIR): \${data.analysis.stats.B08_mean?.toFixed(3)}</span>
                      </div>\`;
                }
              }
              html += \`</div>\`;
              resultDiv.innerHTML = html;
            }
          } else {
            if (resultDiv) resultDiv.innerHTML = \`<span style="color:#ff6b81">Error: \${data.error || 'Processing Failed'}</span>\`;
            if (dMap) dMap.innerHTML = \`<div style="padding:20px; color:#ff6b81; text-align:center; margin-top:20px;">Satellite imagery unavailable<br><span style="font-size:12px; opacity:0.8">\${data.error || 'Processing Failed'}</span></div>\`;
          }
        })
        .catch(e => {
          if (btn) {
            btn.innerText = "Run Pipeline over AOI";
            btn.disabled = false;
          }
          if (resultDiv) resultDiv.innerHTML = \`<span style="color:#ff6b81">API Connection Error: Backend server might be offline.</span>\`;
          if (dMap) dMap.innerHTML = \`<div style="padding:20px; color:#ff6b81; text-align:center; margin-top:20px;">Satellite imagery unavailable<br><span style="font-size:12px; opacity:0.8">Unable to connect to the VaanEye analysis server.</span></div>\`;
        });
    }`;

  content = content.replace(runSatRegex, newRunSat);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Updated ' + path);
}

updateFile('frontend/public/app.html');
updateFile('legacy_site/app.html');
