## Fish Cart – Deployment Guide (Free Tier)

This guide explains how to deploy your finished project using:

- **MongoDB Atlas** – cloud database
- **Render** – Node/Express backend
- **Vercel** – React (Vite) frontend
- **CORS** – configured via `FRONTEND_URL` env var

You will:

1. Create a MongoDB Atlas cluster and connection string  
2. Deploy the backend to Render and connect it to Atlas  
3. Deploy the frontend to Vercel and point it to the Render API  
4. Configure CORS using `FRONTEND_URL` so you don’t change code for future URLs  

---

## 1. Prepare the Backend (Express) for Deployment

Your current `server/server.js` uses:

```js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
```

### 1.1. Update CORS to use `FRONTEND_URL`

Change the CORS middleware to:

```js
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
```

This way, on Render you only change `FRONTEND_URL` in the dashboard (no code push needed when your frontend URL changes).

> After editing, commit and push to GitHub so Render can build the updated backend.

---

## 2. Set Up MongoDB Atlas (Database)

1. Go to `https://www.mongodb.com/atlas/database` and create a free account (or log in).
2. **Create a new Project** (e.g. `FishCart`).
3. **Build a Database**:
   - Choose **Shared** (FREE) tier.
   - Pick any cloud provider/region close to you.
4. **Create a database user**:
   - Username: something like `fishcart-user`.
   - Password: strong password (store it somewhere safe).
5. **Network Access**:
   - For quick testing: `Allow access from anywhere (0.0.0.0/0)`.
   - Later you can restrict by IP if you want.
6. **Get the connection string**:
   - Click **Connect → Drivers → Node.js**.
   - Copy the URI. It will look like:
     ```txt
     mongodb+srv://fishcart-user:<PASSWORD>@cluster0.abcdef.mongodb.net/fishcart?retryWrites=true&w=majority
     ```
   - Replace `<PASSWORD>` with the actual user password.
   - Replace `fishcart` (the database name at the end) if your app expects a different DB name.

You will use this string as `MONGODB_URI` on Render.

---

## 3. Deploy Backend to Render

Render will:

- Pull your **server** code from GitHub  
- Install dependencies  
- Run `node server.js` (or whatever start command you set)  

### 3.1. Prepare the repository

Make sure:

- Your backend is in `/server`  
- `server/package.json` has a `start` script like:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

Push all changes to GitHub.

### 3.2. Create a Web Service on Render

1. Go to `https://render.com` and log in (GitHub login is easiest).
2. Click **New + → Web Service**.
3. Connect your GitHub repository where this project lives.
4. Select the **branch** you want to deploy (likely `main` or `master`).
5. For **Root Directory**, set it to `server` (since backend code is in `/server`).
6. Render will auto-detect a Node app. Confirm runtime (Node 18+ is fine).
7. **Build Command**: usually just:
   ```bash
   npm install
   ```
8. **Start Command**:
   ```bash
   npm start
   ```

### 3.3. Set Environment Variables on Render

In the Render service settings:

1. Go to **Environment → Environment Variables**.
2. Add:

   - `PORT` – Render will set this automatically, but you can leave it unset since your code already uses `process.env.PORT || 5000`.
   - `MONGODB_URI` – paste the Atlas connection string from step 2.
   - `JWT_SECRET` – any strong random string.
   - `FRONTEND_URL` – this will be the final frontend URL from Vercel (for now you can leave it as `http://localhost:5173` until Vercel is set up; then update).

3. Click **Save**.

### 3.4. First Deploy

1. Click **Deploy** (Render will run install + start).
2. When it’s green, Render will give you a URL like:

```txt
https://fishcart-backend.onrender.com
```

3. Test the health route in your browser:

```txt
https://fishcart-backend.onrender.com/
```

You should see:

```json
{ "message": "API is running" }
```

> Keep this backend URL; you will use it as the `VITE_API_BASE_URL` (or equivalent) on the frontend.

---

## 4. Configure Frontend for Production API URL

Your frontend (Vite) likely uses an axios instance with a base URL. If it’s not already using an env variable, update it to something like:

```js
// client/src/utils/api.js (example)
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

export default api;
```

Then in local `.env` (client side), you can use:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

For production (Vercel), you will set `VITE_API_BASE_URL` to your Render URL + `/api`, e.g.:

```txt
https://fishcart-backend.onrender.com/api
```

> Commit the code change that uses `import.meta.env.VITE_API_BASE_URL` and push to GitHub.

---

## 5. Deploy Frontend to Vercel

### 5.1. Connect the project

1. Go to `https://vercel.com` and log in with GitHub.
2. Click **Add New… → Project**.
3. Import your GitHub repository.
4. When Vercel asks for **root directory**, select `client` (since your Vite app is in `/client`).

### 5.2. Configure build settings

Vercel auto-detects Vite:

- **Framework Preset**: Vite  
- **Build Command**: `npm run build`  
- **Output Directory**: `dist`  

Keep defaults unless you changed them in `package.json`.

### 5.3. Set environment variables on Vercel

In the **Environment Variables** section for the project:

Add:

- `VITE_API_BASE_URL` → `https://fishcart-backend.onrender.com/api`

If you have any other frontend envs, add them as needed.

Click **Deploy**.

After build completes, you’ll get a frontend URL like:

```txt
https://fishcart-frontend.vercel.app
```

---

## 6. Finalize CORS and URLs

Once Vercel has given you the final URL:

1. Go back to your **Render backend** → Environment Variables.
2. Update:

   ```txt
   FRONTEND_URL=https://fishcart-frontend.vercel.app
   ```

3. Redeploy the Render service (or click **Restart**).

Now CORS will allow only your Vercel domain and localhost (during local development).

### Local development + production summary

- **Local dev**:
  - Backend: `http://localhost:5000`
  - Frontend: `http://localhost:5173`
  - CORS: `FRONTEND_URL` not set → default to `http://localhost:5173`
  - `VITE_API_BASE_URL=http://localhost:5000/api`

- **Production**:
  - Backend (Render): `https://fishcart-backend.onrender.com`
  - Frontend (Vercel): `https://fishcart-frontend.vercel.app`
  - `FRONTEND_URL=https://fishcart-frontend.vercel.app`
  - `VITE_API_BASE_URL=https://fishcart-backend.onrender.com/api`

---

## 7. Common CORS & Deployment Issues (and Fixes)

### 7.1. CORS error in browser console

Symptoms:  
`Access to fetch at 'https://...onrender.com/api/...' from origin 'https://...vercel.app' has been blocked by CORS policy…`

Check:

1. `FRONTEND_URL` on Render **exactly** matches the Vercel origin:
   - Includes `https://`
   - No trailing slash
2. Backend CORS snippet uses `origin: process.env.FRONTEND_URL || 'http://localhost:5173'`.
3. Axios is created with:
   - `baseURL` pointing to Render.
   - `withCredentials: true` only if you are using cookies/sessions (otherwise you can omit).

After changes, restart the Render service.

### 7.2. API works locally but not on Vercel

Check:

1. `VITE_API_BASE_URL` is set in **Vercel project settings** (not just in local `.env`).
2. You **re-deployed** the frontend after setting env vars.
3. Your browser dev tools `Network` tab shows requests going to `https://...onrender.com/api/...` (not localhost).

### 7.3. Render “Cannot connect to MongoDB”

Check:

1. `MONGODB_URI` on Render is correct (no `<PASSWORD>` placeholder).
2. Your Atlas **Network Access** allows connections from anywhere or from Render’s IPs.
3. The database user was created and has the correct database access.

---

## 8. Checklist

- [ ] Backend uses CORS with `origin: process.env.FRONTEND_URL || 'http://localhost:5173'`.
- [ ] Backend deployed on Render with `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL` set.
- [ ] MongoDB Atlas cluster created, network access configured, and URI tested.
- [ ] Frontend axios uses `import.meta.env.VITE_API_BASE_URL`.
- [ ] Frontend deployed on Vercel with `VITE_API_BASE_URL` set to Render API.
- [ ] `FRONTEND_URL` updated on Render to the final Vercel URL.

Once all are checked, your Fish Cart project should be live with a free hosting stack: **Atlas + Render + Vercel**, with CORS fully controlled via environment variables.

