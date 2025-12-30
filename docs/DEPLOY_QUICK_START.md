# 🚀 Quick Deploy - Railway + Vercel

## TL;DR (5 minutes per service)

### 1. Supabase (Database) ✅ Already Done
You have Supabase configured with the orchestrator schema applied.

### 2. Railway (Backend)
```bash
# Step 1: Push code to GitHub (if not already)
git add .
git commit -m "Ready for Railway deployment"
git push origin main

# Step 2: Go to railway.app
# - Sign up with GitHub
# - New Project → Deploy from GitHub
# - Select your repo
# - Set Root Directory: /backend
# - Add environment variables:
#   SUPABASE_URL=https://your-project.supabase.co
#   SUPABASE_KEY=your-anon-key
#   PORT=3001
# - Railway will auto-deploy

# Step 3: Get your Railway URL
# Settings → Generate Domain
# Copy URL (e.g., https://mahau-backend.up.railway.app)
```

### 3. Vercel (Frontend)
```bash
# Step 1: Go to vercel.com
# - Sign up with GitHub
# - New Project → Import GitHub repo
# - Set Root Directory: /frontend
# - Add environment variables:
#   NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app/api
#   NEXT_PUBLIC_BACKEND_URL=https://your-railway-url.up.railway.app
# - Deploy

# Step 2: Update Railway CORS
# In Railway, add env variable:
#   CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### 4. Test
```bash
# Backend health check
curl https://your-railway-url.up.railway.app/api/health

# Create a test page
curl -X POST https://your-railway-url.up.railway.app/api/orchestrator/start-page \
  -H "Content-Type: application/json" \
  -d '{"chapterId": "ch01_opening", "userInput": "MC wakes in mass grave"}'

# Visit frontend
open https://your-vercel-app.vercel.app
```

---

## Detailed Guide

See [DEPLOYMENT_RAILWAY_VERCEL.md](./DEPLOYMENT_RAILWAY_VERCEL.md) for:
- Step-by-step instructions with screenshots
- Environment variable examples
- Troubleshooting common issues
- Cost estimates
- Monitoring setup

---

## Files Created for Deployment

- ✅ `backend/railway.json` - Railway configuration
- ✅ `backend/.env.production` - Production env template
- ✅ `frontend/vercel.json` - Vercel configuration
- ✅ `frontend/.env.example` - Frontend env template
- ✅ `scripts/deploy-check.sh` - Pre-deployment validation
- ✅ `docs/DEPLOYMENT_RAILWAY_VERCEL.md` - Full guide

---

## Quick Checks Before Deploying

```bash
# Run deployment check
./scripts/deploy-check.sh

# Should output:
# ✅ All Pre-Deployment Checks Passed!
```

---

## What Gets Deployed

### Backend (Railway)
- Express.js API server
- 10 orchestrator endpoints
- Supabase database connection
- CORS configured for your frontend
- Auto-scales, sleeps when idle

### Frontend (Vercel)
- Next.js app with SSR
- Orchestrator dashboard (coming soon)
- Reader interface
- Admin panel
- Global CDN, instant deploys

---

## Cost Summary

| Service | Free Tier | After Free |
|---------|-----------|------------|
| Supabase | 500MB DB | $25/month |
| Railway | $5 credit/month | $5-10/month |
| Vercel | Unlimited | $20/month (Pro) |
| **Total** | **$0** (3 months) | **$5-10/month** |

---

## Support

Need help? Check:
1. [DEPLOYMENT_RAILWAY_VERCEL.md](./DEPLOYMENT_RAILWAY_VERCEL.md) - Full guide
2. [ORCHESTRATOR_PHASE1_COMPLETE.md](./ORCHESTRATOR_PHASE1_COMPLETE.md) - API docs
3. Railway logs: `railway logs` or dashboard
4. Vercel logs: Dashboard → Deployments → Function Logs
