const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Database connection
const dbPath = path.join(__dirname, 'database', 'OSS_KAR.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('db connection failed:', err.message);
    } else {
        console.log('connected to sqlite3 db');
    }
});

// Test Route
app.get('/api/test', (req, resp) => {
    resp.json({
        message: 'OSS_KAR backend is alive!',
        timestamp: new Date().toISOString()
    });
});

// Get all car options
app.get('/api/options', (req, resp) => {
    const sql = 'SELECT * FROM car_options ORDER BY category, price';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            resp.status(500).json({ error: err.message });
            return;
        }
        
        // Group by category 
        const options = {
            engine: rows.filter(row => row.category === 'engine'),
            paint: rows.filter(row => row.category === 'paint'),
            wheels: rows.filter(row => row.category === 'wheels'),
            extras: rows.filter(row => row.category === 'extras')
        };
        
        resp.json(options);
    });
});

// Calculate price 
app.post('/api/calculate', (req, resp) => {
    const { engineId, paintId, wheelsId, extrasIds = [] } = req.body;
    
    const allIds = [engineId, paintId, wheelsId, ...extrasIds].filter(id => id);
    const placeholders = allIds.map(() => '?').join(',');
    const sql = `SELECT * FROM car_options WHERE id IN (${placeholders})`;
    
    db.all(sql, allIds, (err, rows) => {
        if (err) {
            resp.status(500).json({ error: err.message });
            return;
        }
        
        const basePrice = 25000;
        let totalPrice = basePrice;
        const breakdown = { basePrice };
        
        rows.forEach(option => {
            totalPrice = totalPrice + parseFloat(option.price);
            breakdown[option.category] = parseFloat(option.price);
        });
        
        resp.json({
            totalPrice: totalPrice.toFixed(2),
            breakdown
        });
    });
});

app.post('/api/generate', (req, resp) => {
    const {engineId, paintId, wheelsId, extrasIds = [] } = req.body;

    const params = new URLSearchParams();
    if (engineId) params.set('engine', engineId);
    if (paintId) params.set('color', paintId);
    if (wheelsId) params.set('wheels', wheelsId);
    if (extrasIds.length > 0) params.set('extras', extrasIds.join('-'));

    const configUrl = `/config?${params.toString()}`;
    
    resp.json({
        success: true,
        configUrl: configUrl,
        fullUrl: `http://localhost:3001${configUrl}`
    });
})

// Start server
app.listen(PORT, () => {
    console.log(`OSS-KAR server running on port ${PORT}`);
    console.log(`Database: ${dbPath}`);
    console.log(`Test: http://localhost:${PORT}/api/test`);
});

// Shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.log(err.message);
        }
        console.log('database connection closed');
        process.exit(0);
    });
});
