# Deployment Guide - Railway (Backend) + Vercel (Frontend)

## Prerequisites
- GitHub account
- Supabase project with schema applied (see below)
- Railway account (free tier)
- Vercel account (free tier)

---

## Step 1: Prepare Supabase Database (5 minutes)

### 1.1 Apply Orchestrator Schema
1. Go to https://supabase.com/dashboard
2. Select your project (or create new one)
3. Click **SQL Editor** → **New query**
4. Copy contents of `schemas/orchestrator.schema.sql`
5. Paste and click **Run**
6. Verify tables created: Go to **Table Editor**, you should see:
   - `canonical_refs`
   - `story_pages`
   - `page_revisions`
   - `user_feedback`
   - `panel_prompts`
   - `orchestrator_state`
   - `agent_execution_log`

### 1.2 Seed Canonical References
1. In project root, create `.env` file:
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key-here
   ```
2. Run seed script:
   ```bash
   node scripts/seed-orchestrator-tables.js
   ```
3. Verify in Supabase: **Table Editor** → **canonical_refs** should have 3 rows

### 1.3 Get Connection Details
- **Project URL**: Settings → API → Project URL
- **Anon Key**: Settings → API → anon/public key
- Save these for Railway deployment

---

## Step 2: Deploy Backend to Railway (5 minutes)

### 2.1 Create Railway Project
1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Authorize Railway to access your GitHub
6. Select your `Mahau` repository
7. Select **Root Directory**: `/backend`

### 2.2 Configure Environment Variables
In Railway dashboard:
1. Click your service → **Variables** tab
2. Add these variables:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key
   PORT=3001
   NODE_ENV=production
   ```
3. Click **Deploy** (Railway auto-detects Node.js)

### 2.3 Get Railway URL
1. Wait for deployment (~2 minutes)
2. Go to **Settings** → **Generate Domain**
3. Copy your Railway URL (e.g., `https://mahau-backend-production.up.railway.app`)
4. Save this URL for frontend deployment

### 2.4 Test Backend
```bash
curl https://your-railway-url.up.railway.app/api/health
# Should return: {"status":"ok","timestamp":"..."}

curl https://your-railway-url.up.railway.app/api/orchestrator/chapters
# Should return: {"chapters":[...]}
```

---

## Step 3: Deploy Frontend to Vercel (5 minutes)

### 3.1 Create Vercel Project
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click **"Add New Project"**
4. Import your `Mahau` repository
5. **Root Directory**: Select `frontend`
6. **Framework Preset**: Next.js (auto-detected)

### 3.2 Configure Environment Variables
In Vercel project settings → **Environment Variables**:
1. Add these variables (for all environments: Production, Preview, Development):
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app/api
   NEXT_PUBLIC_BACKEND_URL=https://your-railway-url.up.railway.app
   ```
2. Replace `your-railway-url` with your actual Railway URL from Step 2.3

### 3.3 Deploy
1. Click **Deploy**
2. Wait for build (~2 minutes)
3. Vercel will give you a URL like `https://mahau-frontend.vercel.app`

### 3.4 Update Backend CORS
1. Go back to Railway dashboard
2. Add environment variable:
   ```
   CORS_ORIGIN=https://mahau-frontend.vercel.app
   ```
3. Railway will auto-redeploy

---

## Step 4: Test Full Stack (2 minutes)

### 4.1 Test Frontend
1. Visit your Vercel URL: `https://mahau-frontend.vercel.app`
2. Should see landing page

### 4.2 Test Orchestrator API
Open browser console and run:
```javascript
fetch('https://your-railway-url.up.railway.app/api/orchestrator/chapters')
  .then(r => r.json())
  .then(console.log)
```

### 4.3 Create Test Page
```bash
curl -X POST https://your-railway-url.up.railway.app/api/orchestrator/start-page \
  -H "Content-Type: application/json" \
  -d '{"chapterId": "ch01_opening", "userInput": "MC wakes in mass grave"}'
```

Expected response:
```json
{
  "success": true,
  "pageId": "ch01_opening_page_001",
  "state": "generating_narration",
  "message": "Page created successfully"
}
```

---

## Step 5: Update Backend to Copy data.json

The backend build needs to copy `data.json` to the correct location. This is already configured in `backend/package.json`:

```json
"scripts": {
  "build": "tsc && cp src/data.json dist/routes/data.json"
}
```

Railway will run `npm run build` automatically.

---

## Common Issues & Fixes

### Issue: Backend returns 500 error
**Fix:** Check Railway logs:
1. Railway dashboard → **Deployments** → Click latest deployment
2. Check **Build Logs** and **Deploy Logs**
3. Common issues:
   - Missing `SUPABASE_URL` or `SUPABASE_KEY`
   - Database schema not applied
   - `data.json` not copied (run `npm run build` locally to test)

### Issue: Frontend can't reach backend (CORS error)
**Fix:** 
1. Check backend `src/index.ts` CORS config includes your Vercel URL
2. Update backend and redeploy:
   ```typescript
   app.use(cors({
     origin: [
       'http://localhost:3000',
       'https://mahau-frontend.vercel.app', // Add your Vercel URL
       process.env.CORS_ORIGIN
     ]
   }));
   ```

### Issue: "chapters table doesn't exist"
**Fix:** Apply the existing chapter schema first:
1. In Supabase SQL Editor, run:
   ```sql
   CREATE TABLE IF NOT EXISTS chapters (
     id TEXT PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     panels JSONB NOT NULL,
     choice_points JSONB NOT NULL,
     status TEXT DEFAULT 'draft',
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```
2. Then apply `orchestrator.schema.sql`

### Issue: Railway build fails with TypeScript errors
**Fix:** Ensure `tsconfig.json` is properly configured and all dependencies are in `package.json`

---

## Deployment Checklist

### Before Deploying:
- [ ] Supabase project created
- [ ] Orchestrator schema applied
- [ ] Canonical references seeded
- [ ] Test chapter created (`ch01_opening`)
- [ ] Backend tested locally on port 3002
- [ ] Frontend tested locally

### Railway Deployment:
- [ ] Railway project created
- [ ] GitHub repo connected
- [ ] Environment variables set (SUPABASE_URL, SUPABASE_KEY, PORT, NODE_ENV)
- [ ] Build successful
- [ ] Health endpoint returns 200
- [ ] Orchestrator endpoints tested

### Vercel Deployment:
- [ ] Vercel project created
- [ ] GitHub repo connected
- [ ] Environment variables set (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_BACKEND_URL)
- [ ] Build successful
- [ ] Site loads without errors
- [ ] Backend API calls work from browser

### Post-Deployment:
- [ ] CORS configured with Vercel URL
- [ ] End-to-end test (create page, approve narration)
- [ ] Custom domain configured (optional)

---

## Cost Estimates

### Free Tier Limits:
- **Supabase Free**: 500MB database, 2GB bandwidth/month
- **Railway Free**: $5 credit/month (~500 hours of server time)
- **Vercel Free**: Unlimited deployments, 100GB bandwidth/month

### Expected Costs (MVP):
- **Month 1-3**: $0 (within free tiers)
- **After Free Credit**: Railway $5-10/month (if backend stays active)
- **Optimization**: Railway sleeps after inactivity, so costs stay low

---

## Quick Deploy Commands

### Backend (Railway CLI alternative):
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy
railway up
```

### Frontend (Vercel CLI alternative):
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

---

## Monitoring & Logs

### Railway Logs:
```bash
railway logs
```

### Vercel Logs:
Vercel dashboard → Project → Deployments → Click deployment → View Function Logs

### Supabase Logs:
Supabase dashboard → Logs → Select table to monitor queries

---

## Next Steps After Deployment

1. **Implement AI Agents**: Add OpenAI/Claude API calls for narration/dialogue generation
2. **Build Frontend UI**: Create orchestrator pages for user interaction
3. **Add Authentication**: Implement user accounts (Supabase Auth)
4. **Custom Domain**: Configure custom domain in Vercel/Railway settings
5. **Monitoring**: Set up error tracking (Sentry) and analytics

---

## Support

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Project Docs**: See `/docs/ORCHESTRATOR_PHASE1_COMPLETE.md` for API details
