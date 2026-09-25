const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');
const { analyzeAOI } = require('./sentinel');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Sentinel API details
const SENTINEL_CLIENT_ID = process.env.SENTINEL_CLIENT_ID;
const SENTINEL_CLIENT_SECRET = process.env.SENTINEL_CLIENT_SECRET;

// Basic health check route
app.get('/', (req, res) => {
    res.json({ message: 'VaanEye Backend API is running' });
});

// Example route to get user preferences (mocked, later linked to Supabase)
app.get('/api/users/:id', async (req, res) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id);
    
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

// Alert endpoint for pushing notifications (stub)
app.post('/api/alerts', (req, res) => {
    const { title, message, zone } = req.body;
    // Logic to push alert to Firebase / Supabase here
    console.log(`Alert received for zone ${zone}: ${title} - ${message}`);
    res.json({ success: true, message: 'Alert queued' });
});

// Automatic Sentinel-2 -> Sentinel-1 Cloud Fallback Analysis
app.post('/api/analyze', async (req, res) => {
    try {
        const { aoi, dateFrom, dateTo } = req.body;
        if (!aoi || !dateFrom || !dateTo) {
            return res.status(400).json({ error: "Missing aoi, dateFrom, or dateTo" });
        }
        
        const result = await analyzeAOI(aoi, dateFrom, dateTo);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

async function testConnections() {
    try {
        // Test Supabase
        const { error } = await supabase.from('users').select('id').limit(1);
        if (error && error.message.includes('schema cache')) {
            // "Could not find the table" means connection works!
            console.log('✅ Supabase DB Connection Successful');
        } else if (error) {
            console.error('Supabase DB connection error:', error.message);
        } else {
            console.log('✅ Supabase DB Connection Successful');
        }

        // Test Firebase Admin
        try {
            admin.initializeApp({
                projectId: process.env.FIREBASE_PROJECT_ID || 'vaaneye'
            });
            console.log('✅ Firebase Initialization Successful');
        } catch (fbErr) {
            if (fbErr.code === 'app/duplicate-app') {
                console.log('✅ Firebase Initialization Successful');
            } else {
                throw fbErr;
            }
        }

    } catch (e) {
        console.error('Connection test failed:', e.message);
    }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await testConnections();
});

