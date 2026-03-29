# W.A.S.T - Web Application Security Testing Platform

Welcome to the W.A.S.T Platform! This is a complete full-stack web application designed for automated security vulnerability scanning.

## 📁 Project Structure
- `client/` - React/Vite Frontend (Cyberpunk UI)
- `server/` - Node.js/Express Backend + MongoDB
- `scanner/` - Python Scanning Engine

## 🚀 Step-by-Step Setup Guide

### 1. Database Setup
Make sure you have MongoDB running locally on port `27017` or update the `MONGO_URI` in `server/.env` to point to your MongoDB Atlas cluster.

### 2. Backend Setup
```bash
cd server
npm install
npm run start
```
*Note: Make sure your `server/.env` file is properly configured. The basic setup requires `PORT`, `MONGO_URI`, and `JWT_SECRET`.*

### 3. Python Scanner Setup
The Python engine requires `requests` and `beautifulsoup4`. It is highly recommended to use a virtual environment.
```bash
cd scanner
pip install -r requirements.txt
```
*Ensure `python` is available in your system PATH, as the Node.js backend spawns it via `child_process.spawn('python', ...)`.*

### 4. Frontend Setup
```bash
cd client
npm install
npm run dev
```

The application will start on `http://localhost:5173`. Open it in your browser, register an operator ID, and launch your first scan!

## 🧪 Testing the platform
To safely test the platform, you can point scans to applications built explicitly for vulnerability testing, such as:
- http://testphp.vulnweb.com/
- OWASP Juice Shop (run locally on an open port)

## 🌐 Deployment Instructions

### Frontend (Vercel)
1. Push your code to GitHub.
2. In Vercel, import the new project.
3. Set the Root Directory to `client/`.
4. Vercel will auto-detect Vite and set the build command to `npm run build`.

### Backend (Render/Railway)
1. In Render, create a new Web Service pointing to your repo.
2. Set Root Directory to `server/`.
3. Set Build Command to `npm install`.
4. Set Start Command to `node server.js`.
5. Add your `.env` variables (`MONGO_URI`, `JWT_SECRET`).
*Important:* Since the node backend spawns Python scripts, ensure your Render environment supports both Node and Python running side-by-side (Render's Docker environment is best for this).

### Database (MongoDB Atlas)
1. Create a free cluster on MongoDB Atlas.
2. Add your server's IP to the Network Access whitelist (`0.0.0.0/0` for universal access).
3. Copy the Connection String and set it as `MONGO_URI` in your backend variables.
