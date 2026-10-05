# SwiftShip Tracker

A complete, production-quality parcel booking, delivery management, real-time tracking, and AI-assisted customer support platform.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB 8.0 installed at `C:\Program Files\MongoDB\Server\8.0\`

### Option 1 — One-click start (Windows)
```
Double-click start.bat
```

### Option 2 — Manual start

**Step 1: Start MongoDB**
```bash
mkdir C:\data\db_swiftship
"C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "C:\data\db_swiftship" --bind_ip 127.0.0.1 --port 27017
```

**Step 2: Seed the database** (first time only)
```bash
cd server
npm run seed
```

**Step 3: Start the backend**
```bash
cd server
npm run dev
```

**Step 4: Start the frontend** (new terminal)
```bash
cd client
npm run dev
```

**Step 5: Open the app**
- Frontend: http://localhost:5173
- API: http://localhost:5000/api

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@swiftship.com | Admin@123 |
| Delivery Agent | agent1@swiftship.com | Agent@123 |
| Customer | customer1@swiftship.com | Customer@123 |
| Support | support@swiftship.com | Support@123 |

---

## 📦 Demo Parcel IDs

Track any of: **P-001 to P-020**

Try the AI assistant: *"Track parcel P-003"* or *"Where is P-010?"*

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express.js + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Maps | Leaflet + OpenStreetMap |
| Charts | Recharts |
| Icons | Lucide React |
| AI | Mock AI (database-backed, no API key needed) |

---

## 📁 Project Structure

```
swiftship-tracker/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── contexts/      # React contexts (Auth)
│       ├── layouts/       # Role-based layouts
│       ├── pages/         # All page components
│       ├── services/      # API service layer
│       └── types/         # TypeScript types
├── server/          # Express backend
│   └── src/
│       ├── config/        # Database config
│       ├── controllers/   # Route handlers
│       ├── middleware/     # Auth middleware
│       ├── models/        # Mongoose models
│       ├── routes/        # Express routes
│       └── seed/          # Database seeder
├── start.bat        # One-click startup (Windows)
└── seed.bat         # Re-seed database
```

---

## 🎯 Features

- ✅ **Role-based Authentication** — Admin, Delivery Agent, Customer, Support
- ✅ **Parcel Management** — Full CRUD with auto-generated IDs (P-001...)
- ✅ **Real-time Tracking** — Status timeline + Leaflet map
- ✅ **AI Assistant** — "SwiftShip AI" chat widget (bottom-right)
- ✅ **Admin Dashboard** — Charts, analytics, audit logs
- ✅ **Agent Dashboard** — Delivery workflow with status updates
- ✅ **Customer Dashboard** — My parcels, quick track
- ✅ **Notifications** — Automatic alerts on status changes
- ✅ **Responsive Design** — Mobile-friendly sidebar
