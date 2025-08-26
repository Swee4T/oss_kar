# 🚗 OSS-KAR: Premium Car Configurator

> **Modern 3D Car Configurator** with Real-time Pricing, Interactive 3D Viewer and  Order Management System

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-oskarpokorski.de/osskar-blue?style=for-the-badge)](https://oskarpokorski.de/osskar/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)

## ✨ Features

🎨 **Interactive 3D Car Viewer**
- Three.js integration with orbit controls
- Real-time color changes and material updates

💰 **Real-time Price Calculation**
- Live price updates without page refresh
- Comprehensive breakdown by component
- SQLite database-driven pricing

🔗 **Shareable Configurations**
- Generate persistent URLs for any configuration
- Load configurations via URL parameters
- Perfect for sharing custom builds

🛒 **Complete Order Management**
- Unique customer creation
- Full order processing pipeline
- Database relationships with foreign keys


## 🚀 Live Demo

**[👉 Try it now: oskarpokorski.de/osskar](https://oskarpokorski.de/osskar/)**

Configure your Audi TT - Cyperpunk edtion, see real-time 3D preview, and place an order!

## 🛠️ Tech Stack

### Frontend
- **HTML5/CSS3** - Responsive layout with CSS Flexbox
- **JavaScript (ES6+)** - Modern async/await patterns
- **jQuery** - DOM manipulation and AJAX
- **Three.js** - 3D graphics and WebGL rendering

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework with RESTful API
- **SQLite3** - Lightweight database

### Infrastructure
- **Ubuntu Server** - Production hosting
- **Nginx** - Reverse proxy and static file serving
- **PM2** - Process management
- **Git** - Version control

## 📊 Database Schema

```sql
-- Car options (engines, paints, wheels, extras)
car_options (id, category, name, price, description)

-- Customer management
customers (id, first_name, last_name, email, created_at)

-- Configuration storage
configurations (id, engine_id, paint_id, wheels_id, extras_ids)

-- Order processing
orders (id, config_id, customer_id, total_price, order_date, status)
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/options` | Fetch all car configuration options |
| `POST` | `/api/calculate` | Calculate price for configuration |
| `POST` | `/api/generate` | Generate shareable URL |
| `POST` | `/api/order` | Create new order |
| `GET` | `/api/orders/:id` | Retrieve order details |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- SQLite3

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/oss-kar.git
cd oss-kar

# Install dependencies
cd backend
npm install

# Start development server
node server.js
```

### Development

```bash
# Frontend available at http://localhost:3001/

# API testing
curl http://localhost:3001/api/test
```

## 🎯 Project Goals

This project demonstrates **full-stack development capabilities** including:

- **Modern JavaScript** (ES6+, async/await, Promises)
- **Database Design** (Normalization, Foreign Keys, Relations)
- **RESTful API Development** (Express.js, Error Handling)
- **Responsive Web Design** (CSS Grid, Flexbox)
- **DevOps Skills** (Linux, Nginx, PM2, Git)

## 🏗️ Architecture
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   Frontend    │◄──►│     Backend    │ │    Database     │
│                 │ │                 │ │                 │
│ • Three.js      │ │ • Express API   │ │  • SQLite3      │
│ • jQuery        │ │ • Business      │ │  • Relational   │
│ • Responsive    │ │   Logic         │ │    Schema       │
│   CSS           │ │ • Validation    │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘



## 🤝 Contributing

This is a portfolio project showcasing development skills. 

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 👨‍💻 Developer

**Oskar Pokorski**
- Portfolio: [oskarpokorski.de](https://oskarpokorski.de)
- GitHub: [@Swee4T](https://github.com/yourusername)

---

*Built with ❤️ to demonstrate modern full-stack development capabilities*