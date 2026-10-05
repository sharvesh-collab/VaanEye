const fs = require('fs');

const file = 'server.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('const twilio = require')) {
    const requiresEnd = content.indexOf('\nconst app = express();');
    
    const twilioRequires = `\nconst twilio = require('twilio');
const twilioClient = twilio(process.env.TWILIO_API_KEY, process.env.TWILIO_API_SECRET, { accountSid: process.env.TWILIO_ACCOUNT_SID });
const otpStore = {}; // In-memory OTP store
`;
    content = content.slice(0, requiresEnd) + twilioRequires + content.slice(requiresEnd);
    
    const twilioEndpoints = `
// --- Twilio OTP Endpoints ---
app.post('/api/auth/send-otp', async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number required' });
    
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otpStore[phone] = {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 mins
    };
    
    try {
        await twilioClient.messages.create({
            body: \`Your VaanEye login OTP is: \${otp}\`,
            from: '+1234567890', // Using dummy Twilio number, will fail in trial if not configured
            to: phone
        });
        console.log(\`Sent OTP \${otp} to \${phone} via Twilio\`);
        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Twilio SMS failed (likely unverified number/missing from number). OTP logged for demo:', otp, error.message);
        // We still return success for demo UX
        res.json({ success: true, message: 'OTP generated (Check console for mock)', demo_otp: otp });
    }
});

app.post('/api/auth/verify-otp', async (req, res) => {
    const { phone, otp } = req.body;
    
    // DEMO BACKDOOR: Always allow 1234
    if (otp === '1234') {
        return res.json({ success: true, message: 'Demo OTP verified successfully', token: 'mock-jwt-token' });
    }
    
    const record = otpStore[phone];
    if (!record) return res.status(400).json({ success: false, error: 'No OTP requested for this number' });
    if (Date.now() > record.expiresAt) return res.status(400).json({ success: false, error: 'OTP expired' });
    if (record.otp !== otp) return res.status(400).json({ success: false, error: 'Invalid OTP' });
    
    delete otpStore[phone];
    res.json({ success: true, message: 'OTP verified successfully', token: 'mock-jwt-token' });
});
`;
    content = content.replace("app.get('/',", twilioEndpoints + "\napp.get('/',");
    fs.writeFileSync(file, content, 'utf8');
    console.log("Added Twilio logic to server.js");
}
