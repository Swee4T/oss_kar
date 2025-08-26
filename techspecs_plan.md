# Car Configurator - Technical Specifications & Development Plan

## 🎯 Project Overview

**Mission:** Entwicklung eines KFZ-Konfigurators mit Real-time Preiskalkulation, persistenten URLs und Bestellsystem.

**Tech Stack:**

- **Frontend:** Pure HTML/CSS + jQuery
- **Backend:** Node.js + Express
- **Database:** SQLite
- **Server:** Ubuntu + Nginx 

-----

## 📊 Database Schema^^m

### Table: `car_options`

```sql
CREATE TABLE car_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,           -- 'engine', 'paint', 'wheels', 'extras'
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT
);
```

### Table: `configurations`

```sql
CREATE TABLE configurations (
    id TEXT PRIMARY KEY,              -- UUID (abc123def)
    engine_id INTEGER,
    paint_id INTEGER,
    wheels_id INTEGER,
    extras_ids TEXT,                  -- JSON Array: "[1,3,7]"
    FOREIGN KEY (engine_id) REFERENCES car_options(id),
    FOREIGN KEY (paint_id) REFERENCES car_options(id),
    FOREIGN KEY (wheels_id) REFERENCES car_options(id)
);
```

### Table: `orders`

```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_id TEXT NOT NULL,
    customer_id INTEGER NOT NULL,
    total_price DECIMAL(10,2),
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (config_id) REFERENCES configurations(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

```sql
CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
);
```
-----

## 🔗 API Specifications

### Base URL: `/api`

#### **GET /api/options**

- **Purpose:** Alle verfügbaren Optionen laden
- **Response:**

```json
{
  "engine": [
    {"id": 1, "name": "1.6L Turbo", "price": 0, "description": "Basis Motor"},
    {"id": 2, "name": "2.0L Sport", "price": 3500, "description": "Mehr Power!"}
  ],
  "paint": [...],
  "wheels": [...],
  "extras": [...]
}
```

#### **POST /api/calculate**

- **Purpose:** Preis für aktuelle Konfiguration berechnen
- **Request Body:**

```json
{
  "engineId": 2,
  "paintId": 1,
  "wheelsId": 3,
  "extrasIds": [1, 3, 7]
}
```

- **Response:**

```json
{
  "totalPrice": 12750,
  "breakdown": {
    "basePrice": 25000,
    "engine": 3500,
    "paint": 0,
    "wheels": 2800,
    "extras": 5200
  }
}
```

#### **GET /api/generate

- **Purpose:** URL zum sharen erstellen
- **Response:** Vollständige URL

#### **POST /api/orders**

- **Purpose:** Bestellung abschicken
- **Request Body:**

```json
{
  "config_id": "abc123def",
  "customer_id"
  "total_price": "Max Mustermann",
}
```

-----

## 🎮 Development Roadmap

### **Level 1: Foundation** 🏗️

- [x] **1.1** SQLite Database Setup (Schema + Test Data)
- [x] **1.2** Express Server Grundsetup (package.json, dependencies)
- [x] **1.3** Basic API Routes (GET /api/options, POST /api/calculate)
- [x] **1.4** Nginx Proxy Config (Frontend → Backend routing)

### **Level 2: Core Logic** ⚡

- [x] **2.1** Database Helper Functions (connect, query, insert)
- [x] **2.2** Price Calculation Logic (Motor + Paint + Wheels + Extras)
- [x] **2.3** Frontend HTML Structure (Dropdown menus, price display)

### **Level 3: Real-time Magic** 🚀

- [x] **3.1** jQuery Event Handlers (onChange → API call → price update)
- [x] **3.2** AJAX Communication (Frontend ↔ Backend ohne page reload)
- [x] **3.3** URL Generation & Sharing (config ID → shareable link)
- [x] **3.4** Configuration Loading via URL (load saved config from link)

### **Level 4: Order System** 📦

- [ ] **4.1** Order Form (Kunde Name, Email, Submit)
- [ ] **4.2** Order Submission Logic (save to database)
- [ ] **4.3** Order Summary Page (Bestätigung nach Bestellung)

### **Level 5: Polish & Deploy** ✨

- [ ] **5.1** Error Handling (DB failures, invalid configs, etc.)
- [ ] **5.2** Basic CSS Styling (responsive, modern look)
- [ ] **5.3** Testing & Debugging (alle Features durchklicken)
- [ ] **5.4** Production Deployment (auf Server live schalten)

-----

## 📁 Project Structure

```
car-configurator/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── database/
│   │   ├── db.js
│   │   └── OSS_KAR.db
│   ├── routes/
│   │   ├── options.js
│   │   ├── config.js
│   │   └── orders.js
│   └── utils/
│       └── helpers.js
├── frontend/
│   ├── index.html
│   ├── config.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
└── nginx/
    └── car-configurator.conf
```

-----

## 🔧 Technical Requirements

### Dependencies (Node.js)

```json
{
  "express": "^4.18.0",
  "sqlite3": "^5.1.0",
  "uuid": "^9.0.0",
  "cors": "^2.8.5"
}
```

### Environment

- **Node.js:** v18+
- **SQLite:** 3.x
- **Nginx:** Latest
- **jQuery:** 3.7+ (CDN)

-----

## 🎯 Success Criteria

### MVP (Minimum Viable Product)

- ✅ Real-time Preiskalkulation ohne Page Refresh
- ✅ Persistente URLs für Konfigurationen
- ✅ Basis Bestellsystem
- ✅ Alle Optionen konfigurierbar

### Stretch Goals
- ✅ **Three.js 3D Car Viewer** - ULTRA Quality
  - Professional 3D viewer with Orbit Controls
  - 4K Shadow Resolution & Environment Maps
  - Real-time reflections & advanced lighting
- [ ] Live changing color integration
- different frontends: jquery vs vue vs react
- add chatbot
  - adjusts options
  - negotiate price
  - create completely new car
- Admin Panel für Optionen/Preise
- Erweiterte Validierung
- Email Bestätigungen
- Konfiguration als PDF Export

-----

## 📝 Notes & Decisions

**Database Approach:** Live DB Queries für aktuelle Preise  
**Frontend:** jQuery für Einfachheit und schnelle Entwicklung  
**Backend:** Express für minimalen Overhead  
**Deployment:** Manual SSH für vollständige Kontrolle

