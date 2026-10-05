const fs = require('fs');
const path = require('path');

const fileToPatch = path.join(__dirname, '../frontend/public/app.html');
let content = fs.readFileSync(fileToPatch, 'utf8');

// 1. Add Turf.js and Leaflet Draw if not there
if (!content.includes('turf.min.js')) {
    content = content.replace('</head>', `
<script src="https://unpkg.com/@turf/turf@6/turf.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js"></script>
<style>
  #mLocate .box { width: min(800px, 96vw); }
  .locate-mode-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; margin-bottom: 15px; }
  .locate-mode-btn { background: var(--field); border: 1px solid var(--line); border-radius: 8px; padding: 10px; color: var(--dim); cursor: pointer; text-align: center; font-size: 11px; font-weight: bold; }
  .locate-mode-btn:hover { border-color: var(--line2); color: var(--cream); }
  .locate-mode-btn.on { border-color: var(--gold); background: rgba(201,162,39,0.15); color: #fff; }
  .locate-panel { display: none; background: #0c1224; border-radius: 12px; padding: 15px; border: 1px solid rgba(255,255,255,0.05); }
  .locate-panel.on { display: block; }
  #locateMap { height: 400px; width: 100%; border-radius: 8px; margin-top: 10px; z-index: 1;}
</style>
</head>`);
}

// 2. Add the modal HTML
const locateModalHtml = `
<!-- ══════════ LOCATE YOUR LAND MODAL ══════════ -->
<div class="modal" id="mLocate"><div class="box">
  <button class="x" onclick="closeModals()">✕</button>
  <h2>Locate Your Land</h2>
  <p class="muted">The selected land boundary will become the single source of truth for satellite analysis.</p>
  
  <div class="locate-mode-grid">
    <div class="locate-mode-btn on" onclick="setLocateMode('map')">🗺 MAP</div>
    <div class="locate-mode-btn" onclick="setLocateMode('coords')">📍 COORDINATES</div>
    <div class="locate-mode-btn" onclick="setLocateMode('survey')">🧾 SURVEY NUMBER</div>
    <div class="locate-mode-btn" onclick="setLocateMode('walk')">🚶 WALK AROUND</div>
    <div class="locate-mode-btn" onclick="setLocateMode('drive')">🚗 DRIVE / RIDE</div>
    <div class="locate-mode-btn" onclick="setLocateMode('draw')">✏ DRAW BOUNDARY</div>
    <div class="locate-mode-btn" onclick="setLocateMode('upload')">📂 UPLOAD</div>
  </div>

  <div id="loc-map" class="locate-panel on">
    <p class="muted">Click on the map to select a point, then generate a boundary around it.</p>
    <div id="locateMap"></div>
    <div style="margin-top:10px; display:flex; gap:10px; align-items:center;">
        <button class="btn2" style="width:auto; padding:8px 12px;" onclick="locateCreateRadius(50)">Small Radius</button>
        <button class="btn2" style="width:auto; padding:8px 12px;" onclick="locateCreateRadius(100)">Medium Radius</button>
        <button class="btn" style="width:auto; padding:8px 12px; flex:1;" onclick="confirmLocateAOI()">Confirm AOI</button>
    </div>
  </div>

  <div id="loc-coords" class="locate-panel">
    <label>Latitude</label>
    <input id="locLat" type="number" step="any" placeholder="10.803"/>
    <label>Longitude</label>
    <input id="locLon" type="number" step="any" placeholder="77.014"/>
    <button class="btn2" style="margin-top:10px;" onclick="locateGoCoords()">Locate on Map</button>
  </div>

  <div id="loc-survey" class="locate-panel">
    <label>District</label>
    <select id="locDist"><option>Coimbatore</option></select>
    <label>Taluk</label>
    <select id="locTaluk"><option>Kinatukadavu</option></select>
    <label>Village</label>
    <select id="locVill"><option>Kinatukadavu</option></select>
    <label>Survey Number</label>
    <input id="locSurv" placeholder="e.g. 123/4"/>
    <button class="btn2" style="margin-top:10px;" onclick="locateSurvey()">Find Land</button>
    <p id="locSurvErr" class="muted" style="color:var(--warn); margin-top:10px;"></p>
  </div>

  <div id="loc-walk" class="locate-panel">
    <p class="muted">Walk around the boundary of your land. Please allow GPS permissions.</p>
    <button class="btn2" id="btnWalkStart" onclick="locateStartGPS('walk')">START WALKING SURVEY</button>
    <button class="btn2" id="btnWalkStop" onclick="locateStopGPS()" style="display:none;">FINISH SURVEY</button>
    <div id="walkStats" class="muted" style="margin-top:10px;"></div>
  </div>

  <div id="loc-drive" class="locate-panel">
    <p class="muted">Drive or ride around the land boundary. Please allow GPS permissions.</p>
    <button class="btn2" id="btnDriveStart" onclick="locateStartGPS('drive')">START DRIVE / RIDE SURVEY</button>
    <button class="btn2" id="btnDriveStop" onclick="locateStopGPS()" style="display:none;">FINISH SURVEY</button>
    <div id="driveStats" class="muted" style="margin-top:10px;"></div>
  </div>

  <div id="loc-draw" class="locate-panel">
    <p class="muted">Use the map polygon tool (⬠) to draw your exact land boundary.</p>
    <p class="muted">Map is shared with the MAP tab. Go there to draw.</p>
    <button class="btn2" onclick="setLocateMode('map')">Go to Map</button>
  </div>

  <div id="loc-upload" class="locate-panel">
    <p class="muted">Upload a GeoJSON file of your land boundary.</p>
    <input type="file" id="locFile" accept=".geojson,.json" onchange="locateUpload(event)"/>
  </div>

  <div id="candidateArea" style="display:none; margin-top:15px; border-top:1px solid var(--line); padding-top:15px;">
    <h3 style="color:var(--gold2)">CANDIDATE LAND BOUNDARY</h3>
    <div style="font-size:12px; color:var(--dim); line-height:1.6; margin-top:8px;" id="candidateStats"></div>
    <div style="display:flex; gap:10px; margin-top:10px;">
        <button class="btn2" style="flex:1" onclick="document.getElementById('candidateArea').style.display='none'">Reject</button>
        <button class="btn" style="flex:2" onclick="confirmCandidateAOI()">CONFIRM BOUNDARY</button>
    </div>
  </div>

</div></div>
`;

if (!content.includes('id="mLocate"')) {
    content = content.replace('<div id="vaaneye-sat-panel"', locateModalHtml + '\n<div id="vaaneye-sat-panel"');
}

// 3. Add JS Logic for the new modal
const jsLogic = `
<script>
  window.selectedAOI = null;
  let locateMapObj = null;
  let locateDrawControl = null;
  let locateDrawnItems = null;
  let locateMarker = null;
  let candidatePolygon = null;
  let candidateGeoJSON = null;
  let candidateSource = 'map';

  let gpsWatchId = null;
  let gpsPoints = [];
  let gpsStartTime = 0;
  let gpsTrackLine = null;

  function initLocateMap() {
      if (locateMapObj) {
          setTimeout(() => locateMapObj.invalidateSize(), 200);
          return;
      }
      locateMapObj = L.map('locateMap').setView([10.803, 77.014], 14);
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri'
      }).addTo(locateMapObj);

      locateDrawnItems = new L.FeatureGroup();
      locateMapObj.addLayer(locateDrawnItems);
      
      locateDrawControl = new L.Control.Draw({
          edit: { featureGroup: locateDrawnItems },
          draw: { marker: false, circle: false, rectangle: false, circlemarker: false, polyline: false,
                  polygon: { allowIntersection: false, showArea: true } }
      });
      locateMapObj.addControl(locateDrawControl);

      locateMapObj.on(L.Draw.Event.CREATED, function (event) {
          var layer = event.layer;
          locateDrawnItems.clearLayers();
          locateDrawnItems.addLayer(layer);
          
          const geojson = layer.toGeoJSON();
          processCandidateAOI(geojson.geometry, 'draw');
      });

      locateMapObj.on('click', function(e) {
          if (locateMarker) locateMapObj.removeLayer(locateMarker);
          locateMarker = L.marker(e.latlng).addTo(locateMapObj);
          document.getElementById('locLat').value = e.latlng.lat.toFixed(5);
          document.getElementById('locLon').value = e.latlng.lng.toFixed(5);
      });
  }

  function setLocateMode(mode) {
      document.querySelectorAll('.locate-mode-btn').forEach(b => b.classList.remove('on'));
      document.querySelectorAll('.locate-panel').forEach(p => p.classList.remove('on'));
      event.currentTarget.classList.add('on');
      document.getElementById('loc-' + mode).classList.add('on');
      if (mode === 'map' || mode === 'draw') {
          initLocateMap();
      }
  }

  function locateGoCoords() {
      const lat = parseFloat(document.getElementById('locLat').value);
      const lon = parseFloat(document.getElementById('locLon').value);
      if (isNaN(lat) || isNaN(lon)) return alert('Invalid coordinates');
      setLocateMode('map');
      
      if (locateMarker) locateMapObj.removeLayer(locateMarker);
      const pt = [lat, lon];
      locateMapObj.setView(pt, 16);
      locateMarker = L.marker(pt).addTo(locateMapObj);
  }

  function locateCreateRadius(radiusMeters) {
      if (!locateMarker) return alert('Please click on the map to set a center point first.');
      const pt = turf.point([locateMarker.getLatLng().lng, locateMarker.getLatLng().lat]);
      const poly = turf.circle(pt, radiusMeters / 1000, {steps: 32, units: 'kilometers'});
      
      locateDrawnItems.clearLayers();
      L.geoJSON(poly).eachLayer(l => locateDrawnItems.addLayer(l));
      locateMapObj.fitBounds(locateDrawnItems.getBounds());
      
      processCandidateAOI(poly.geometry, 'coordinates');
  }

  function processCandidateAOI(geometry, source, gpsStats = null) {
      try {
          const areaSqMeters = turf.area(geometry);
          const bbox = turf.bbox(geometry);
          const centroid = turf.centroid(geometry).geometry.coordinates;

          candidateGeoJSON = {
              source: source,
              geometry: geometry,
              bbox: bbox,
              centroid: { latitude: centroid[1], longitude: centroid[0] },
              locationName: 'Custom Selection',
              areaM2: areaSqMeters,
              areaAcres: areaSqMeters * 0.000247105,
              perimeterM: turf.length(turf.polygonToLine(geometry), {units: 'meters'})
          };
          
          let statsHtml = \`
              <b>Source:</b> \${source}<br/>
              <b>Area:</b> \${candidateGeoJSON.areaAcres.toFixed(2)} acres (\${Math.round(areaSqMeters)} m²)<br/>
              <b>Perimeter:</b> \${Math.round(candidateGeoJSON.perimeterM)} meters
          \`;
          if (gpsStats) {
              statsHtml += \`<br/><b>Boundary Quality:</b> <span style="color:var(--warn)">Approximate (GPS)</span><br/>
              <b>GPS Points:</b> \${gpsStats.pts}<br/>
              <b>Avg Accuracy:</b> \${gpsStats.acc.toFixed(1)} m\`;
          }

          document.getElementById('candidateStats').innerHTML = statsHtml;
          document.getElementById('candidateArea').style.display = 'block';
          candidateSource = source;
      } catch(e) {
          alert('Invalid boundary. ' + e.message);
      }
  }

  function confirmCandidateAOI() {
      window.selectedAOI = candidateGeoJSON;
      document.getElementById('candidateArea').style.display = 'none';
      closeModals();
      toast('🌍', 'Land boundary confirmed. Ready for satellite analysis.');
      
      const locStr = \`Lat \${window.selectedAOI.centroid.latitude.toFixed(4)}, Lon \${window.selectedAOI.centroid.longitude.toFixed(4)} (\${window.selectedAOI.areaAcres.toFixed(1)} acres)\`;
      
      // Update config for backward compatibility, but selectedAOI is the real source of truth
      window.VAANEYE_CONFIG = window.VAANEYE_CONFIG || {};
      window.VAANEYE_CONFIG.aoi = window.selectedAOI.geometry;
      window.VAANEYE_CONFIG.locationName = locStr;

      // Clear existing UI analysis
      const dMap = document.getElementById('dMap');
      if (dMap) dMap.innerHTML = '';
      
      // Optionally auto-run analysis
      runSatelliteAnalysis();
  }

  function confirmLocateAOI() {
      const layers = locateDrawnItems.getLayers();
      if (layers.length === 0) return alert('Please draw a boundary on the map or select a point and choose a radius.');
      const geom = layers[0].toGeoJSON().geometry;
      processCandidateAOI(geom, 'map');
  }

  function locateSurvey() {
      document.getElementById('locSurvErr').innerText = 'Survey-number lookup requires an available cadastral/land-record data source for this region. (Not connected)';
  }

  function locateUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
          try {
              const geojson = JSON.parse(evt.target.result);
              let geom = geojson;
              if (geojson.type === 'FeatureCollection') geom = geojson.features[0].geometry;
              else if (geojson.type === 'Feature') geom = geojson.geometry;
              
              if (geom.type !== 'Polygon' && geom.type !== 'MultiPolygon') throw new Error('Must be a Polygon');
              
              setLocateMode('map');
              locateDrawnItems.clearLayers();
              L.geoJSON(geom).eachLayer(l => locateDrawnItems.addLayer(l));
              locateMapObj.fitBounds(locateDrawnItems.getBounds());
              
              processCandidateAOI(geom, 'upload');
          } catch(err) {
              alert('Error parsing GeoJSON: ' + err.message);
          }
      };
      reader.readAsText(file);
  }

  function locateStartGPS(mode) {
      if (!navigator.geolocation) return alert('GPS is unavailable on this device.');
      gpsPoints = [];
      gpsStartTime = Date.now();
      
      const stDiv = document.getElementById(mode + 'Stats');
      document.getElementById('btn' + (mode==='walk'?'Walk':'Drive') + 'Start').style.display = 'none';
      document.getElementById('btn' + (mode==='walk'?'Walk':'Drive') + 'Stop').style.display = 'inline-block';
      
      stDiv.innerHTML = '<span style="color:var(--warn)">Waiting for GPS lock...</span>';

      setLocateMode('map');
      if (gpsTrackLine) locateMapObj.removeLayer(gpsTrackLine);
      gpsTrackLine = L.polyline([], {color: 'red', weight: 3}).addTo(locateMapObj);
      
      gpsWatchId = navigator.geolocation.watchPosition(
          pos => {
              if (pos.coords.accuracy > 50) return; // Ignore very bad fixes
              const pt = [pos.coords.longitude, pos.coords.latitude];
              gpsPoints.push({
                  pt: pt,
                  acc: pos.coords.accuracy,
                  speed: pos.coords.speed,
                  time: pos.timestamp
              });
              
              const latlng = [pos.coords.latitude, pos.coords.longitude];
              gpsTrackLine.addLatLng(latlng);
              locateMapObj.setView(latlng);
              
              const elapsed = Math.round((Date.now() - gpsStartTime)/1000);
              stDiv.innerHTML = \`Collecting points: \${gpsPoints.length}<br/>Accuracy: \${pos.coords.accuracy.toFixed(1)}m<br/>Time: \${elapsed}s\`;
          },
          err => {
              alert('Location error: ' + err.message);
              locateStopGPS(mode);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
  }

  function locateStopGPS() {
      if (gpsWatchId) {
          navigator.geolocation.clearWatch(gpsWatchId);
          gpsWatchId = null;
      }
      
      document.getElementById('btnWalkStart').style.display = 'inline-block';
      document.getElementById('btnWalkStop').style.display = 'none';
      document.getElementById('btnDriveStart').style.display = 'inline-block';
      document.getElementById('btnDriveStop').style.display = 'none';
      
      if (gpsPoints.length < 3) {
          return alert('Not enough accurate GPS points collected to form a boundary (minimum 3 required).');
      }

      // Close polygon by appending first point
      const coords = gpsPoints.map(p => p.pt);
      coords.push(coords[0]); 
      
      const polyGeom = { type: "Polygon", coordinates: [coords] };
      const avgAcc = gpsPoints.reduce((s, p) => s + p.acc, 0) / gpsPoints.length;
      
      locateDrawnItems.clearLayers();
      const lpoly = L.polygon(coords.map(c => [c[1], c[0]]), {color: 'orange', dashArray: '5, 10'});
      locateDrawnItems.addLayer(lpoly);
      locateMapObj.fitBounds(locateDrawnItems.getBounds());

      processCandidateAOI(polyGeom, 'gps_survey', { pts: gpsPoints.length, acc: avgAcc });
  }
</script>
`;

if (!content.includes('function initLocateMap')) {
    content = content.replace('</body>', jsLogic + '\n</body>');
}

// 4. Update the "runSatelliteAnalysis" to use selectedAOI if available
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
            <div style="font-size: 13px; margin-top: 8px;">Processing Sentinel-2 for selected boundary...</div>
          </div>
        \`;
      }

      const resultDiv = document.getElementById('sat-result');
      if (resultDiv) {
        resultDiv.innerHTML = "<span style='color:#ffc53d'>Querying Copernicus Data Space Ecosystem...</span>";
      }

      const aoiObj = window.selectedAOI || (window.VAANEYE_CONFIG ? { geometry: window.VAANEYE_CONFIG.aoi, source: 'config' } : null);

      if (!aoiObj || !aoiObj.geometry) {
        if (resultDiv) resultDiv.innerHTML = \`<span style="color:#ff6b81">Error: VaanEye location/AOI is not configured. Please use 'Locate Your Land'.</span>\`;
        if (dMap) dMap.innerHTML = \`<div style="padding:20px; color:#ff6b81; text-align:center; margin-top:20px;">VaanEye location/AOI is not configured. Please use 'Locate Your Land'.</div>\`;
        if (btn) { btn.innerText = "Run Pipeline over AOI"; btn.disabled = false; }
        return;
      }
      
      const aoi = aoiObj.geometry;
      const dateFrom = "2023-01-01"; 
      const dateTo = "2026-09-25";
      const source = aoiObj.source || "map";
      const location = aoiObj.centroid || null;

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
              if (dMap) {
                const locStr = window.selectedAOI ? (window.selectedAOI.areaAcres.toFixed(1) + ' acres (' + window.selectedAOI.source + ')') : (window.VAANEYE_CONFIG ? window.VAANEYE_CONFIG.locationName : 'Selected Area');
                
                dMap.innerHTML = \`
                  <div style="width: 100%; height: 100%; min-height: 450px; display: flex; flex-direction: column; background: #061020; box-sizing: border-box; padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                      <span style="font-size: 18px; font-weight: bold; color: white; display: flex; align-items: center; gap: 8px;">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></svg>
                        SATELLITE INTELLIGENCE
                      </span>
                      <span style="font-weight: bold; font-size: 15px; color: \${data.fallback_used ? '#ffc53d' : '#1fd5e8'}">\${data.satellite}</span>
                    </div>
                    <div style="flex: 1; min-height: 0; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #000; position: relative;">
                      \${data.analysis && data.analysis.visual_preview 
                        ? \`<img src="data:image/png;base64,\${data.analysis.visual_preview}" style="width: 100%; height: 100%; object-fit: contain; position: absolute; top:0; left:0; z-index: 1;" />
                           <svg style="position: absolute; top:0; left:0; width: 100%; height: 100%; z-index: 2; pointer-events: none;" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <!-- Fake overlay box representing AOI -->
                              <rect x="25" y="25" width="50" height="50" fill="none" stroke="#ffeb3b" stroke-width="0.5" stroke-dasharray="2,1" />
                           </svg>\` 
                        : \`<div style="color: #ff6b81">Satellite imagery unavailable</div>\`}
                    </div>
                    <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 6px;">
                      <div style="font-size: 15px; font-weight: bold; color: #fff;">📍 \${locStr}</div>
                      <div style="font-size: 12px; color: #8b98b4;">Acquired: \${data.analysis.acquisition_date || 'Unknown'} | \${data.satellite} \${data.analysis.processing_level || ''}</div>
                    </div>
                  </div>
                \`;
              }
`;

const runSatRegex = /function runSatelliteAnalysis\(\) \{[\s\S]*?<div style="font-size: 15px; font-weight: bold; color: #fff;">📍 \$\{locStr\}<\/div>\r?\n                      <div style="font-size: 12px; color: #8b98b4;">Acquired: \$\{data\.analysis\.acquisition_date \|\| 'Unknown'\} \| \$\{data\.satellite\} \$\{data\.analysis\.processing_level \|\| ''\}<\/div>\r?\n                    <\/div>\r?\n                  <\/div>\r?\n                `;\r?\n              }/;

content = content.replace(runSatRegex, newRunSat);

// 5. Add "Change Location" button to the panel
const btnChangeLoc = `<button class="btn2" onclick="openModal('mLocate')" style="margin-top: 10px; width:100%; padding: 10px; border-radius:8px; font-size:12px;">🗺️ Locate Your Land</button>`;
if (!content.includes('🗺️ Locate Your Land')) {
    content = content.replace('Run Pipeline over AOI\n    </button>', 'Run Pipeline over AOI\n    </button>\n    ' + btnChangeLoc);
}

fs.writeFileSync(fileToPatch, content, 'utf8');
console.log("Successfully patched app.html with LOCATE YOUR LAND feature.");
