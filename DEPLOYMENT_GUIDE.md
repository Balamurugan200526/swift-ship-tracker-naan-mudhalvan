# 🚀 SwiftShip Tracker — Complete Deployment Guide

This guide walks you step-by-step through deploying **SwiftShip Tracker** for free to the cloud, complete with a live URL for presentations, portfolios, or college evaluations.

---

## 📌 Deployment Overview

| Component | Recommended Free Platform | Alternative |
| :--- | :--- | :--- |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free M0 Cluster) | — |
| **All-in-One (Frontend + API)** | [Render](https://render.com) (Free Web Service) | [Railway](https://railway.app) / [Fly.io](https://fly.io) |
| **Split Deployment** | Frontend on [Vercel](https://vercel.com) + Backend on [Render](https://render.com) | [Netlify](https://netlify.com) |

---

## 🟢 Step 1: Set Up Cloud Database on MongoDB Atlas (Free)

Since local MongoDB (`127.0.0.1:27017`) cannot be reached by cloud servers, you need a free cloud database:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up / log in.
2. Click **Create a Deployment** and choose the **M0 Free Tier** (AWS, nearest region like Mumbai or Singapore).
3. Under **Security Quickstart**:
   - Create a database user (e.g., username: `swiftship_admin`, password: save a secure password).
   - Under **Where would you like to connect from?**, choose **Allow Access from Anywhere** (`0.0.0.0/0`).
4. Click **Finish and Close**.
5. On your cluster dashboard, click **Connect** ➔ **Drivers** (Node.js).
6. Copy the connection string. It looks like:
   ```
   mongodb+srv://swiftship_admin:<password>@cluster0.xxxxx.mongodb.net/swiftship?retryWrites=true&w=majority
   ```
   *(Replace `<password>` with your actual password and add `/swiftship` before the `?`)*.

---

## 🟢 Step 2: Push Code to GitHub

Open a terminal in the project root:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "SwiftShip Tracker complete production build"

# 4. Link to your GitHub repo and push
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/swiftship-tracker.git
git push -u origin main
```

*(Note: `.gitignore` is already configured to exclude `node_modules` and `.env` files).*

---

## 🟢 Step 3: Deploy (Choose Method A or Method B)

### 🌟 Method A: All-in-One on Render (Recommended — Simplest & 1 Service)

With this method, Express serves both the React frontend and the API on a single URL. There are zero CORS issues.

1. Go to [Render.com](https://render.com) and log in with your GitHub account.
2. Click **New +** ➔ **Web Service**.
3. Select your **swiftship-tracker** repository.
4. Fill in the service settings:
   - **Name**: `swiftship-tracker`
   - **Region**: Choose Singapore or closest to you
   - **Branch**: `main`
   - **Root Directory**: *(leave blank)*
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm run install:all && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Instance Type**: `Free`
5. Click **Environment Variables** (or Advanced) and add:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | *Your MongoDB Atlas connection string from Step 1* |
   | `JWT_SECRET` | *Any long random secret string (e.g., `swiftship_super_secret_jwt_2026`)* |
   | `CLIENT_URL` | `*` |
6. Click **Deploy Web Service**.
7. Wait 2–3 minutes for the build to finish. Render will give you your live URL:
   `https://swiftship-tracker.onrender.com`

---

### 🌐 Method B: Split Deployment (Vercel Frontend + Render Backend)

#### 1. Deploy Backend on Render:
- **Build Command**: `cd server && npm install && npm run build`
- **Start Command**: `cd server && npm start`
- **Root Directory**: *(leave blank or `server`)*
- **Environment Variables**:
  - `MONGODB_URI`: *Your MongoDB Atlas URI*
  - `JWT_SECRET`: *Your JWT secret*
  - `CLIENT_URL`: *Your Vercel URL (or `*`)*
- Note your live API URL: e.g. `https://swiftship-api.onrender.com`

#### 2. Deploy Frontend on Vercel:
1. Go to [Vercel.com](https://vercel.com) and click **Add New...** ➔ **Project**.
2. Import your GitHub repository.
3. In project settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://swiftship-api.onrender.com` *(your backend URL)* |
5. Click **Deploy**.
6. The `client/vercel.json` already included in the repo ensures React Router works properly on page refreshes.

---

## 🟢 Step 4: Seed Cloud Database with Demo Data

Once your MongoDB Atlas database is connected, populate it with all 20 demo parcels and accounts:

From your local machine, update `server/.env`:
```env
MONGODB_URI=your_mongodb_atlas_connection_string_here
```

Then run:
```bash
cd server
npm run seed
```

This will seed all accounts, senders, receivers, and parcels (`P-001` to `P-020`) into your cloud database!

---

## 🔑 Production Demo Accounts

After deployment, log in with any of these pre-seeded accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@swiftship.com` | `Admin@123` |
| **Agent** | `agent1@swiftship.com` | `Agent@123` |
| **Customer** | `customer1@swiftship.com` | `Customer@123` |
| **Support** | `support@swiftship.com` | `Support@123` |
