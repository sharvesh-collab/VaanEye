const fs = require('fs');
const path = require('path');

const fileToPatch = path.join(__dirname, '../frontend/public/app.html');
let content = fs.readFileSync(fileToPatch, 'utf8');

if (!content.includes('id="view-sea-fishing"')) {
    const additionalViews = `
<div class="dbody" id="view-sea-fishing" style="display:none;">
    <h1 class="dh1">Sea & Fishing</h1><p class="dsub">Marine and fishing metrics</p>
</div>
<div class="dbody" id="view-fire-flood" style="display:none;">
    <h1 class="dh1">Fire & Flood</h1><p class="dsub">Disaster risk monitoring</p>
</div>
<div class="dbody" id="view-heat-air" style="display:none;">
    <h1 class="dh1">Heat & Air</h1><p class="dsub">Temperature and air quality</p>
</div>
<div class="dbody" id="view-land-city" style="display:none;">
    <h1 class="dh1">Land & City</h1><p class="dsub">Urban and terrain tracking</p>
</div>
`;
    content = content.replace(/<\/main>/, additionalViews + '\n</main>');
    
    // Update navigation JS again to route to these
    const oldTarget = `var target = 'view-overview';
        if (label.includes('Farm & Crop')) {
            target = 'view-farm-crop';
        }`;
    const newTarget = `var target = 'view-overview';
        if (label.includes('Farm & Crop')) target = 'view-farm-crop';
        else if (label.includes('Sea & Fishing')) target = 'view-sea-fishing';
        else if (label.includes('Fire & Flood')) target = 'view-fire-flood';
        else if (label.includes('Heat & Air')) target = 'view-heat-air';
        else if (label.includes('Land & City')) target = 'view-land-city';
        `;
    content = content.replace(oldTarget, newTarget);
    
    const oldDisplay = `if(ov) ov.style.display = (target === 'view-overview') ? 'block' : 'none';
        if(fm) fm.style.display = (target === 'view-farm-crop') ? 'block' : 'none';`;
    const newDisplay = `
        var views = ['view-overview', 'view-farm-crop', 'view-sea-fishing', 'view-fire-flood', 'view-heat-air', 'view-land-city'];
        views.forEach(v => {
            var el = document.getElementById(v);
            if(el) el.style.display = (v === target) ? 'block' : 'none';
        });
    `;
    content = content.replace(oldDisplay, newDisplay);
    
    fs.writeFileSync(fileToPatch, content, 'utf8');
}
