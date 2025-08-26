const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3001',           // Development
        'https://oskarpokorski.de',        // Production  
    ],
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// DISABLE CACHE FOR DEVELOPMENT
app.use((req, res, next) => {
    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
    });
    next();
});

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


function calculatePrice(configData) {
    return new Promise((resolve, reject) => {
        const { engineId, paintId, wheelsId, extrasIds = [] } = configData;
        
        const allIds = [engineId, paintId, wheelsId, ...extrasIds].filter(id => id);
        const placeholders = allIds.map(() => '?').join(',');
        const sql = `SELECT * FROM car_options WHERE id IN (${placeholders})`;
        
        db.all(sql, allIds, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            
            const basePrice = 25000;
            let totalPrice = basePrice;
            const breakdown = { basePrice };
            
            rows.forEach(option => {
                totalPrice += parseFloat(option.price);
                breakdown[option.category] = parseFloat(option.price);
            });
            
            resolve({ totalPrice, breakdown });
        });
    });
}

app.post('/api/calculate', async (req, resp) => {
    try {
        const result = await calculatePrice(req.body);
        resp.json(result);
    } catch (err) {
        resp.status(500).json({ error: err.message });
    }
});

// generate shareable url
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
        fullUrl: `https://oskarpokorski.de/osskar${configUrl}`
    });
})

//check if customer exists and make order
app.post('/api/order', async (req, resp) => {
    try {
        const { email, firstName, lastName, configData } = req.body;
        
        if (!email || !firstName || !lastName || !configData) {
            resp.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const priceResult = await calculatePrice(configData);
        const totalPrice = priceResult.totalPrice;
        
        // Customer check/create
        const customer = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM customers WHERE email = ?', [email], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        
        let customerId;
        if (customer) {
            // Customer exists
            customerId = customer.id;
        } else {
            // Create new customer
            customerId = await new Promise((resolve, reject) => {
                const insertCustomer = `INSERT INTO customers (first_name, last_name, email) VALUES (?,?,?)`;
                db.run(insertCustomer, [firstName, lastName, email], function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            });
        }
        
        // Create configuration
        const configId = uuidv4();
        const { engineId, paintId, wheelsId, extrasIds } = configData;

        await new Promise((resolve, reject) => {
            const insertConfigSql = `
                INSERT INTO configurations (id, engine_id, paint_id, wheels_id, extras_ids)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            db.run(insertConfigSql, [configId, engineId, paintId, wheelsId, JSON.stringify(extrasIds)], function(err) {
                if (err) reject(err);
                else resolve(configId);
            });
        });

        // Create order
        const orderId = await new Promise((resolve, reject) => {
            const insertOrderSql = `
                INSERT INTO orders (config_id, customer_id, total_price)
                VALUES (?, ?, ?)
            `;
            
            db.run(insertOrderSql, [configId, customerId, totalPrice], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });

        // Success response
        resp.json({
            success: true,
            orderId: orderId,
            configId: configId,
            customerId: customerId,
            totalPrice: totalPrice,
            breakdown: priceResult.breakdown,
            message: 'Order created successfully!'
        });
        
    } catch (err) {
        console.error('Order creation failed:', err);
        resp.status(500).json({ 
            error: 'Order creation failed', 
            details: err.message 
        });
    }
});

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
