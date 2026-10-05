const fs = require('fs');
const path = require('path');

const fileToPatch = path.join(__dirname, '../frontend/public/app.html');
let content = fs.readFileSync(fileToPatch, 'utf8');

const target1 = `      const aoi = window.VAANEYE_CONFIG.aoi;
      const dateFrom = "2023-01-01"; // Go back to 2023 to ensure we find a valid image in the catalog
      const dateTo = "2026-09-25";

      const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:')
        ? 'http://localhost:5000/api/analyze'
        : '/api/analyze';

      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aoi, dateFrom, dateTo })
      })`;

const replace1 = `      const aoiObj = window.selectedAOI || (window.VAANEYE_CONFIG ? { geometry: window.VAANEYE_CONFIG.aoi, source: 'config' } : null);
      const aoi = aoiObj ? aoiObj.geometry : (window.VAANEYE_CONFIG ? window.VAANEYE_CONFIG.aoi : null);
      const dateFrom = "2023-01-01"; // Go back to 2023 to ensure we find a valid image in the catalog
      const dateTo = "2026-09-25";
      const source = aoiObj && aoiObj.source ? aoiObj.source : 'map';
      const location = aoiObj && aoiObj.centroid ? aoiObj.centroid : null;
      
      console.log('AOI SOURCE: ' + source);
      console.log('CENTROID: ' + (location ? JSON.stringify(location) : 'unknown'));

      const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:')
        ? 'http://localhost:5000/api/analyze'
        : '/api/analyze';

      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aoi, dateFrom, dateTo, source, location })
      })`;

const target2 = `          if (data.status === 'success') {
            const processAndShowImage = () => {
              if (dMap) {
                const locStr = window.VAANEYE_CONFIG ? window.VAANEYE_CONFIG.locationName : 'Kinatukadavu, Pollachi, Coimbatore';
                
                dMap.innerHTML = \`
                  <div style="width: 100%; height: 100%; min-height: 450px; display: flex; flex-direction: column; background: #061020; box-sizing: border-box; padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                      <span style="font-size: 18px; font-weight: bold; color: white; display: flex; align-items: center; gap: 8px;">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></svg>
                        SATELLITE INTELLIGENCE
                      </span>
                      <span style="font-weight: bold; font-size: 15px; color: \${data.fallback_used ? '#ffc53d' : '#1fd5e8'}">\${data.satellite}</span>
                    </div>
                    <div style="flex: 1; min-height: 0; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #000;">
                      \${data.analysis && data.analysis.visual_preview 
                        ? \\\`<img src="data:image/png;base64,\${data.analysis.visual_preview}" style="width: 100%; height: 100%; object-fit: contain;" />\\\` 
                        : \\\`<div style="color: #ff6b81">Satellite imagery unavailable</div>\\\`}
                    </div>
                    <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 6px;">
                      <div style="font-size: 15px; font-weight: bold; color: #fff;">📍 \${locStr}</div>
                      <div style="font-size: 13px; color: #8b98b4;">
                        \${data.satellite} · \${data.sensor_type} \${data.fallback_used ? \\\`· ⚠️ \${data.fallback_reason}\\\` : \\\`· ☁️ Cloud: \${data.cloud_cover_aoi_percent.toFixed(1)}%\\\`}
                      </div>
                    </div>
                  </div>
                \`;
              }
            };

            if (data.fallback_used && dMap) {
              dMap.innerHTML = \`
                <div style="display: flex; justify-content: center; align-items: center; height: 100%; min-height: 450px; flex-direction: column; color: #8b98b4;">
                  <div class="lring" style="margin-bottom: 16px; border-top-color: #ffc53d;"></div>
                  <div style="font-size: 15px; font-weight: bold; color: #ff6b81;">Sentinel-2 obscured</div>
                  <div style="font-size: 13px; margin-top: 8px;">Switching to Sentinel-1 SAR...</div>
                </div>
              \`;
              setTimeout(processAndShowImage, 1500);
            } else {
              processAndShowImage();
            }`;

const replace2 = `          if (data.status === 'success') {
            const processAndShowImage = () => {
              if (!dMap) return;
              const locStr = window.selectedAOI ? (window.selectedAOI.areaAcres.toFixed(1) + ' acres (' + window.selectedAOI.source + ')') : (window.VAANEYE_CONFIG ? window.VAANEYE_CONFIG.locationName : 'Selected Area');
              
              if (!data.analysis || !data.analysis.visual_preview) {
                 dMap.innerHTML = \\\`<div style="padding:20px; color:#ff6b81; text-align:center; margin-top:20px;">Satellite image could not be rendered.</div>\\\`;
                 return;
              }

              const img = document.createElement("img");
              const base64Data = data.analysis.visual_preview;
              const imgSrc = base64Data.startsWith('data:image') ? base64Data : 'data:image/png;base64,' + base64Data;
              
              img.src = imgSrc;
              img.style.width = '100%';
              img.style.height = '100%';
              img.style.objectFit = 'contain';
              img.style.position = 'absolute';
              img.style.top = '0';
              img.style.left = '0';
              img.style.zIndex = '1';
              
              img.onload = () => {
                console.log('SATELLITE FRONTEND DEBUG');
                console.log('------------------------');
                console.log('API STATUS: 200');
                console.log('RESPONSE RECEIVED: YES');
                console.log('IMAGE FIELD: visual_preview');
                console.log('IMAGE FORMAT: base64 PNG');
                console.log('IMAGE DATA LENGTH: ' + base64Data.length);
                console.log('IMAGE SRC PREFIX: ' + imgSrc.substring(0, 30) + '...');
                console.log('IMAGE ELEMENT CREATED: YES');
                console.log('IMAGE ONLOAD: YES');
                console.log('IMAGE NATURAL WIDTH: ' + img.naturalWidth);
                console.log('IMAGE NATURAL HEIGHT: ' + img.naturalHeight);
                
                dMap.innerHTML = \\\`
                  <div style="width: 100%; height: 100%; min-height: 450px; display: flex; flex-direction: column; background: #061020; box-sizing: border-box; padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                      <span style="font-size: 18px; font-weight: bold; color: white; display: flex; align-items: center; gap: 8px;">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></svg>
                        SATELLITE INTELLIGENCE
                      </span>
                      <span style="font-weight: bold; font-size: 15px; color: \${data.fallback_used ? '#ffc53d' : '#1fd5e8'}">\${data.satellite}</span>
                    </div>
                    <div id="sat-img-container" style="flex: 1; min-height: 0; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #000; position: relative;">
                    </div>
                    <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 6px;">
                      <div style="font-size: 15px; font-weight: bold; color: #fff;">📍 \${locStr}</div>
                      <div style="font-size: 13px; color: #8b98b4;">
                        \${data.satellite} · \${data.sensor_type} \${data.fallback_used ? \\\`· ⚠️ \${data.fallback_reason}\\\` : \\\`· ☁️ Cloud: \${(data.cloud_cover_aoi_percent || 0).toFixed(1)}%\\\`}
                      </div>
                    </div>
                  </div>
                \\\`;
                document.getElementById('sat-img-container').appendChild(img);
                console.log('D-MAP CHILDREN: ' + document.getElementById('sat-img-container').children.length);
                console.log('------------------------');
              };
              
              img.onerror = () => {
                dMap.innerHTML = \\\`<div style="padding:20px; color:#ff6b81; text-align:center; margin-top:20px;">Satellite image failed to load.</div>\\\`;
              };
            };

            if (data.fallback_used && dMap) {
              dMap.innerHTML = \\\`
                <div style="display: flex; justify-content: center; align-items: center; height: 100%; min-height: 450px; flex-direction: column; color: #8b98b4;">
                  <div class="lring" style="margin-bottom: 16px; border-top-color: #ffc53d;"></div>
                  <div style="font-size: 15px; font-weight: bold; color: #ff6b81;">Sentinel-2 obscured</div>
                  <div style="font-size: 13px; margin-top: 8px;">Switching to Sentinel-1 SAR...</div>
                </div>
              \\\`;
              setTimeout(processAndShowImage, 1500);
            } else {
              processAndShowImage();
            }`;

if (content.includes(target1) && content.includes(target2)) {
    content = content.replace(target1, replace1).replace(target2, replace2);
    fs.writeFileSync(fileToPatch, content, 'utf8');
    console.log("Successfully patched app.html via node script.");
} else {
    console.log("Target not found. Doing regex replace.");
    
    // Instead of string replacement, we will just regex out the whole runSatelliteAnalysis function and replace it.
    const runSatRegex = /function runSatelliteAnalysis\(\) \{[\s\S]*?catch\s*\([^)]*\)\s*\{[\s\S]*?\}\s*\}/;
    const newRunSat = `function runSatelliteAnalysis() {
      const btn = document.getElementById('sat-run-btn');
      if (btn) {
        btn.innerText = "Analyzing AOI...";
        btn.disabled = true;
      }
      
      const dMap = document.getElementById('dMap');
      if (dMap) {
        dMap.innerHTML = \`
          <div style="display: flex; justify-content: center; align-items: center; height: 100%; min-height: 450px; flex-direction: column; color: #8b98b4;">
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

      const aoiObj = window.selectedAOI || (window.VAANEYE_CONFIG ? { geometry: window.VAANEYE_CONFIG.aoi, source: 'config' } : null);

      if (!aoiObj || !aoiObj.geometry) {
        if (resultDiv) resultDiv.innerHTML = \`<span style="color:#ff6b81">Error: VaanEye location/AOI is not configured</span>\`;
        if (dMap) dMap.innerHTML = \`<div style="padding:20px; color:#ff6b81; text-align:center; margin-top:20px;">VaanEye location/AOI is not configured</div>\`;
        if (btn) { btn.innerText = "Run Pipeline over AOI"; btn.disabled = false; }
        return;
      }
      
      const aoi = aoiObj.geometry;
      const dateFrom = "2023-01-01"; 
      const dateTo = "2026-09-25";
      const source = aoiObj.source || "map";
      const location = aoiObj.centroid || null;
      
      console.log('AOI SOURCE: ' + source);
      console.log('CENTROID: ' + (location ? JSON.stringify(location) : 'unknown'));

      const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:')
        ? 'http://localhost:5000/api/analyze'
        : '/api/analyze';

      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aoi, dateFrom, dateTo, source, location })
      })
        .then(r => r.json())
        .then(data => {
          if (btn) {
            btn.innerText = "Run Pipeline over AOI";
            btn.disabled = false;
          }

          if (data.status === 'success') {
            const processAndShowImage = () => {
              if (!dMap) return;
              const locStr = window.selectedAOI ? (window.selectedAOI.areaAcres.toFixed(1) + ' acres (' + window.selectedAOI.source + ')') : (window.VAANEYE_CONFIG ? window.VAANEYE_CONFIG.locationName : 'Selected Area');
              
              if (!data.analysis || !data.analysis.visual_preview) {
                 dMap.innerHTML = \`<div style="padding:20px; color:#ff6b81; text-align:center; margin-top:20px;">Satellite image could not be rendered.</div>\`;
                 return;
              }

              const img = document.createElement("img");
              const base64Data = data.analysis.visual_preview;
              const imgSrc = base64Data.startsWith('data:image') ? base64Data : 'data:image/png;base64,' + base64Data;
              
              img.src = imgSrc;
              img.style.width = '100%';
              img.style.height = '100%';
              img.style.objectFit = 'contain';
              img.style.position = 'absolute';
              img.style.top = '0';
              img.style.left = '0';
              img.style.zIndex = '1';
              
              img.onload = () => {
                console.log('SATELLITE FRONTEND DEBUG');
                console.log('------------------------');
                console.log('API STATUS: 200');
                console.log('RESPONSE RECEIVED: YES');
                console.log('IMAGE FIELD: visual_preview');
                console.log('IMAGE FORMAT: base64 PNG');
                console.log('IMAGE DATA LENGTH: ' + base64Data.length);
                console.log('IMAGE SRC PREFIX: ' + imgSrc.substring(0, 30) + '...');
                console.log('IMAGE ELEMENT CREATED: YES');
                console.log('IMAGE ONLOAD: YES');
                console.log('IMAGE NATURAL WIDTH: ' + img.naturalWidth);
                console.log('IMAGE NATURAL HEIGHT: ' + img.naturalHeight);
                
                dMap.innerHTML = \`
                  <div style="width: 100%; height: 100%; min-height: 450px; display: flex; flex-direction: column; background: #061020; box-sizing: border-box; padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                      <span style="font-size: 18px; font-weight: bold; color: white; display: flex; align-items: center; gap: 8px;">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></svg>
                        SATELLITE INTELLIGENCE
                      </span>
                      <span style="font-weight: bold; font-size: 15px; color: \${data.fallback_used ? '#ffc53d' : '#1fd5e8'}">\${data.satellite}</span>
                    </div>
                    <div id="sat-img-container" style="flex: 1; min-height: 0; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #000; position: relative;">
                    </div>
                    <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 6px;">
                      <div style="font-size: 15px; font-weight: bold; color: #fff;">📍 \${locStr}</div>
                      <div style="font-size: 13px; color: #8b98b4;">
                        \${data.satellite} · \${data.sensor_type} \${data.fallback_used ? \\\`· ⚠️ \${data.fallback_reason}\\\` : \\\`· ☁️ Cloud: \${(data.cloud_cover_aoi_percent || 0).toFixed(1)}%\\\`}
                      </div>
                    </div>
                  </div>
                \`;
                document.getElementById('sat-img-container').appendChild(img);
                console.log('D-MAP CHILDREN: ' + document.getElementById('sat-img-container').children.length);
                console.log('------------------------');
              };
              
              img.onerror = () => {
                dMap.innerHTML = \`<div style="padding:20px; color:#ff6b81; text-align:center; margin-top:20px;">Satellite image failed to load.</div>\`;
              };
            };

            if (data.fallback_used && dMap) {
              dMap.innerHTML = \`
                <div style="display: flex; justify-content: center; align-items: center; height: 100%; min-height: 450px; flex-direction: column; color: #8b98b4;">
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
            if (dMap) dMap.innerHTML = \`<div style="padding:20px; color:#ff6b81; text-align:center; margin-top:20px;">Unable to retrieve satellite analysis.<br><span style="font-size:12px; opacity:0.8">\${data.error || 'Processing Failed'}</span></div>\`;
          }
        })
        .catch(e => {
          if (btn) {
            btn.innerText = "Run Pipeline over AOI";
            btn.disabled = false;
          }
          if (resultDiv) resultDiv.innerHTML = \`<span style="color:#ff6b81">Invalid satellite response.</span>\`;
          if (dMap) dMap.innerHTML = \`<div style="padding:20px; color:#ff6b81; text-align:center; margin-top:20px;">Invalid satellite response.<br><span style="font-size:12px; opacity:0.8">\${e.message || 'Error'}</span></div>\`;
        });
    }`;
    content = content.replace(runSatRegex, newRunSat);
    fs.writeFileSync(fileToPatch, content, 'utf8');
    console.log("Successfully patched app.html via regex replacement.");
}
