const fs = require('fs');

const file = '../legacy_site/index.html';
let content = fs.readFileSync(file, 'utf8');

const newButtons = `
    <div style="display:flex; gap:12px; margin-bottom: 12px; justify-content: center;">
      <a href="app.html" class="cine-btn" style="background:var(--grad); color:#000; border:none; padding:12px 24px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;margin-right:8px;"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Registration
      </a>
      <a href="app.html" class="cine-btn" style="background:rgba(255,255,255,0.05); color:#fff; border:1px solid rgba(255,255,255,0.2); padding:12px 24px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;margin-right:8px;"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/></svg>
        Login
      </a>
    </div>
    <div style="font-size:12px; color:rgba(255,255,255,0.4); cursor:pointer;" onclick="enterSite()">or explore the site first ↓</div>
`;

content = content.replace(/<button class="cine-btn" onclick="enterSite\(\)">[\s\S]*?<\/button>/, newButtons);
fs.writeFileSync(file, content, 'utf8');

const appFile = '../frontend/public/index.html';
if(fs.existsSync(appFile)) {
    let appContent = fs.readFileSync(appFile, 'utf8');
    appContent = appContent.replace(/<button class="cine-btn" onclick="enterSite\(\)">[\s\S]*?<\/button>/, newButtons);
    fs.writeFileSync(appFile, appContent, 'utf8');
}
