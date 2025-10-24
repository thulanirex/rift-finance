# Deployment Guide - Rift Finance Hub

## Architecture Overview

```
Frontend (Vercel)  →  Backend (Render)  →  MySQL Database
     ↓                      ↓
  React/Vite          Node.js/Express
```

---

## Prerequisites

- GitHub account
- Vercel account (free tier)
- Render account (free tier) OR Railway account
- MySQL database (PlanetScale or Railway)

---

## Part 1: Deploy Backend to Render

### Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
```bash
cd c:\Users\rkthulani\Pictures\rift-finance-hub-00-main
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rift-finance-hub.git
git push -u origin main
```

### Step 2: Set Up MySQL Database

**Option A: PlanetScale (Recommended - Free Tier)**
1. Go to https://planetscale.com
2. Create a new database
3. Get connection string (format: `mysql://user:password@host/database`)

**Option B: Railway**
1. Go to https://railway.app
2. Create new project → Add MySQL
3. Copy connection details


### Step 3: Deploy Backend on Render

1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `rift-finance-hub-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_HOST=your_mysql_host
   DATABASE_USER=your_mysql_user
   DATABASE_PASSWORD=your_mysql_password
   DATABASE_NAME=rift_finance_hub
   JWT_SECRET=your_super_secret_jwt_key_here
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   SOLANA_NETWORK=devnet
   SOLANA_RPC_URL=https://api.devnet.solana.com
   ANCHOR_PROGRAM_ID=5CjDfyjxz3ydsWUworZbBTwkkuDX8PTefbfn7Bu3Uu3b
   ```

6. Click **"Create Web Service"**

7. **Note your backend URL**: `https://rift-finance-hub-api.onrender.com`

### Step 4: Initialize Database Schema

Once deployed, run your database migrations:

```bash
# Connect to your MySQL database and run:
mysql -h your_host -u your_user -p your_database < server/database/schema.sql
```

Or use a database client like MySQL Workbench, DBeaver, or TablePlus.

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Update Environment Variables

Create/update `.env.production` in your root directory:

```bash
VITE_API_URL=https://rift-finance-hub-api.onrender.com
```

### Step 2: Deploy to Vercel

**Option A: Vercel CLI (Fastest)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd c:\Users\rkthulani\Pictures\rift-finance-hub-00-main
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? rift-finance-hub
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

**Option B: Vercel Dashboard (Easiest)**

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Add Environment Variables**:
   ```
   VITE_API_URL=https://rift-finance-hub-api.onrender.com
   ```

6. Click **"Deploy"**

7. **Your app will be live at**: `https://rift-finance-hub.vercel.app`

### Step 3: Update Backend CORS

Go back to Render and update the `CORS_ORIGIN` environment variable:
```
CORS_ORIGIN=https://rift-finance-hub.vercel.app
```

---

## Part 3: Configure Custom Domain (Optional)

### On Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### On Render:
1. Go to Service Settings → Custom Domain
2. Add your API subdomain (e.g., `api.yourdomain.com`)
3. Update DNS records

---

## Alternative: Deploy Backend to Railway

If you prefer Railway over Render:

### Step 1: Deploy to Railway

1. Go to https://railway.app
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Add **MySQL** service to your project
5. Configure environment variables (same as Render)
6. Set **Root Directory**: `server`
7. Set **Start Command**: `npm start`

### Step 2: Get Your Backend URL

Railway will provide a URL like: `https://rift-finance-hub-api.up.railway.app`

---

## Troubleshooting

### Backend Issues

**Problem**: Database connection fails
- **Solution**: Check your MySQL credentials and whitelist Render/Railway IPs

**Problem**: CORS errors
- **Solution**: Ensure `CORS_ORIGIN` matches your Vercel URL exactly

**Problem**: Environment variables not loading
- **Solution**: Restart the service after adding env vars

### Frontend Issues

**Problem**: API calls fail
- **Solution**: Check `VITE_API_URL` is correct and includes `https://`

**Problem**: Build fails
- **Solution**: Run `npm run build` locally to check for errors

**Problem**: Blank page after deployment
- **Solution**: Check browser console for errors, verify environment variables

---

## Environment Variables Checklist

### Backend (Render/Railway)
- ✅ `NODE_ENV=production`
- ✅ `PORT=3001`
- ✅ `DATABASE_HOST`
- ✅ `DATABASE_USER`
- ✅ `DATABASE_PASSWORD`
- ✅ `DATABASE_NAME`
- ✅ `JWT_SECRET`
- ✅ `CORS_ORIGIN`
- ✅ `SOLANA_NETWORK`
- ✅ `SOLANA_RPC_URL`
- ✅ `ANCHOR_PROGRAM_ID`

### Frontend (Vercel)
- ✅ `VITE_API_URL`

---

## Post-Deployment

1. **Test all features**:
   - User registration/login
   - Wallet connection
   - Pool allocation
   - Position redemption

2. **Monitor logs**:
   - Render: Dashboard → Logs
   - Vercel: Dashboard → Deployments → View Function Logs

3. **Set up monitoring** (optional):
   - Sentry for error tracking
   - LogRocket for session replay
   - Uptime monitoring (UptimeRobot, Pingdom)

---

## Costs

- **Vercel**: Free tier (100GB bandwidth, unlimited deployments)
- **Render**: Free tier (750 hours/month, sleeps after 15 min inactivity)
- **Railway**: $5/month credit (free trial available)
- **PlanetScale**: Free tier (1 database, 5GB storage, 1 billion row reads/month)

**Total Cost**: $0-5/month for small-scale production

---

## Quick Deploy Commands

```bash
# Backend (if using Render CLI)
cd server
render deploy

# Frontend (Vercel CLI)
cd ..
vercel --prod
```

---

## Support

For issues, check:
- Render Logs: https://dashboard.render.com
- Vercel Logs: https://vercel.com/dashboard
- GitHub Issues: Your repository issues page
