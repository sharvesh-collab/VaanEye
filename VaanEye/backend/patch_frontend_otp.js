const fs = require('fs');

const file = '../frontend/public/app.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove hardcoded demo OTP values
content = content.replace(
    'value="1"><input maxlength="1" inputmode="numeric" value="2">',
    'value=""><input maxlength="1" inputmode="numeric" value="">'
);
content = content.replace(
    'value="3"><input maxlength="1" inputmode="numeric" value="4">',
    'value=""><input maxlength="1" inputmode="numeric" value="">'
);

// 2. Replace demo hint with Twilio Send OTP button
content = content.replace(
    /<p class="hint" style="margin-top:12px">Demo OTP <b style="color:var\(--ok\)">1234<\/b> already filled\.[\s\S]*?<\/p>/,
    '<p class="hint" id="otpStatusMsg" style="margin-top:12px"><button id="btnSendOtp" onclick="sendTwilioOtp()" style="color:var(--a1);font-weight:650">Send OTP via SMS</button></p>'
);

// 3. Inject Twilio functions
const twilioScript = `
    async function sendTwilioOtp() {
        const phone = $('f_phone').value;
        if(phone.length !== 10) return toast('⚠️', 'Enter 10-digit phone first');
        $('otpStatusMsg').innerHTML = 'Sending OTP...';
        try {
            const res = await fetch('http://localhost:5000/api/auth/send-otp', {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ phone: '+91' + phone })
            });
            const data = await res.json();
            $('otpStatusMsg').innerHTML = data.message + ' <button onclick="sendTwilioOtp()" style="color:var(--a1);font-weight:650">Resend</button>';
            toast('📩', 'OTP request completed');
        } catch(e) {
            $('otpStatusMsg').innerHTML = 'Error sending OTP';
        }
    }
`;
content = content.replace(/function valid\(\) \{/, twilioScript + "\n    function valid() {");

// 4. Hijack nav(dir) to verify OTP
const navRegex = /function nav\(dir\) \{[\s\S]*?paint\(\); \$?\('stgBody'\)\.scrollTop = 0;\s*\}/;
const newNav = `async function nav(dir) {
      if (dir > 0 && D.step === MAX) { finish(); return }
      if (dir > 0 && !valid()) { toast('⚠️', 'Please complete this step first · இந்தப் படியை முடிக்கவும்'); return }
      
      if (dir > 0 && D.step === 1) {
          const phone = $('f_phone').value;
          const otp = otpVal();
          try {
              const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
                  method: 'POST', headers: {'Content-Type':'application/json'},
                  body: JSON.stringify({ phone: '+91' + phone, otp })
              });
              const data = await res.json();
              if(!data.success) {
                  toast('❌', data.error || 'Invalid OTP');
                  return; // Block navigation on invalid OTP
              }
              toast('✅', 'Phone verified!');
          } catch(e) {
              toast('❌', 'Verification failed to reach server');
              return;
          }
      }

      D.step = Math.min(MAX, Math.max(1, D.step + dir)); paint(); $('stgBody').scrollTop = 0;
    }`;

content = content.replace(navRegex, newNav);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched app.html for Twilio OTP");
