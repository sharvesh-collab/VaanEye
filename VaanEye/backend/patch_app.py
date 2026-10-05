import re

with open('../frontend/public/app.html', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Define VAANEYE_CONFIG near the top of the script
config_definition = """
    // VAANEYE UNIFIED CONFIGURATION
    window.VAANEYE_CONFIG = {
      aoi: {
        type: "Polygon",
        coordinates: [
          [
            [76.99, 10.80],
            [77.05, 10.80],
            [77.05, 10.84],
            [76.99, 10.84],
            [76.99, 10.80]
          ]
        ]
      },
      locationName: 'Kinatukadavu, Pollachi, Coimbatore'
    };
"""

# Insert it right after `<script>`
code = re.sub(r'<script>', '<script>\n' + config_definition, code, count=1)

# 2. Modify runSatelliteAnalysis
# Replace the hardcoded AOI and dates
old_aoi_block = """      const aoi = {
        type: "Polygon",
        coordinates: [
          [[10.1, 45.1], [10.12, 45.1], [10.12, 45.12], [10.1, 45.12], [10.1, 45.1]]
        ]
      };
      const dateFrom = "2024-01-01";
      const dateTo = "2024-01-31";"""

new_aoi_block = """      if (!window.VAANEYE_CONFIG || !window.VAANEYE_CONFIG.aoi) {
        if (resultDiv) resultDiv.innerHTML = `<span style="color:#ff6b81">Error: VaanEye location/AOI is not configured</span>`;
        if (dMap) dMap.innerHTML = `<div style="padding:20px; color:#ff6b81; text-align:center; margin-top:20px;">VaanEye location/AOI is not configured</div>`;
        if (btn) { btn.innerText = "Run Pipeline over AOI"; btn.disabled = false; }
        return;
      }
      
      const aoi = window.VAANEYE_CONFIG.aoi;
      const dateFrom = "2023-01-01"; // Go back to 2023 to ensure we find a valid image in the catalog
      const dateTo = "2026-09-25";"""

code = code.replace(old_aoi_block, new_aoi_block)

# 3. Update the location string display to use the config
old_locStr = "const locStr = (typeof addr === 'function') ? addr().slice(0, 3).join(', ') : 'Kinatukadavu, Pollachi, Coimbatore';"
new_locStr = "const locStr = window.VAANEYE_CONFIG ? window.VAANEYE_CONFIG.locationName : 'Kinatukadavu, Pollachi, Coimbatore';"

code = code.replace(old_locStr, new_locStr)

with open('../frontend/public/app.html', 'w', encoding='utf-8') as f:
    f.write(code)

with open('../legacy_site/app.html', 'w', encoding='utf-8') as f:
    f.write(code)

print('Done app.html!')
