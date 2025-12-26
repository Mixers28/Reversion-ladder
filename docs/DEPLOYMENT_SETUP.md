# Deployment & Setup Guide: Reversion Ladder

## Quick Start (15 minutes)

You'll deploy:
- **Frontend** → Vercel (free)
- **Backend** → Railway (free tier, ~$5/month if you exceed)
- **Database** → Supabase (free)

---

## Step 1: Supabase Setup (5 min)

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up (free GitHub/email)
3. Click **"New Project"**
4. **Name:** `reversion-ladder`
5. **Region:** closest to you
6. **Tier:** Free
7. Create project (wait ~2 min)

### 1.2 Get Credentials
1. In Supabase dashboard → **Settings → API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon Key** (starts with `eyJhbGc...`)

### 1.3 Initialize Schema
1. Dashboard → **SQL Editor**
2. Copy-paste all CREATE TABLE statements from [SUPABASE_SCHEMA.md](SUPABASE_SCHEMA.md)
3. Click **Execute**
4. Wait for success

### 1.4 Seed Chapter 1

#### Option A: Auto-generate SQL (Recommended)
```bash
# From project root:
node scripts/seed-supabase.js
```
This outputs the complete SQL with your Chapter 1 data. Copy the output.

Then in Supabase Dashboard → **SQL Editor** → Paste & Execute.

#### Option B: Manual Insert via UI (Simplest)
1. Dashboard → **Table Editor** → **chapters** table
2. Click **"+ Insert Row"**
3. Fill in fields:
   - `id`: `ch01_opening`
   - `title`: `Chapter 1: The Tribunal`
   - `description`: `The Tribunal judges an ex-apex cultivator. A fall. A crack. A mortal realm awakening.`
   - `panels`: Paste the entire `panels` array from [Reverson Ladder.json](../../Reverson%20Ladder.json)
   - `choice_points`: Paste the entire `choice_points` array from [Reverson Ladder.json](../../Reverson%20Ladder.json)
   - `status`: `published`
4. Click **"Save"**

---

## Step 2: Backend Setup on Railway (5 min)

### 2.1 Prepare Backend
1. Navigate to `/backend` folder
2. Update `.env` with Supabase credentials:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_KEY=eyJhbGc...
   OPENAI_API_KEY=sk_test_XXX (optional for MVP)
   PORT=3001
   NODE_ENV=production
   ```

### 2.2 Push to Git
```bash
git add backend/
git commit -m "Add backend scaffold"
git push
```

### 2.3 Deploy on Railway
1. Go to [railway.app](https://railway.app)
2. Sign up (free GitHub login)
3. Click **"New Project"**
4. Select **"Deploy from GitHub"**
5. Choose your repo
6. **Root directory:** `backend`
7. Railway detects `package.json` → auto-configures Node.js
8. Go to **Variables** tab
9. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `PORT=3001`
   - `NODE_ENV=production`
10. Click **Deploy**
11. Wait ~2 min
12. Copy the generated URL (e.g., `https://reversion-api.railway.app`)

### 2.4 Test Backend
```bash
curl https://reversion-ladder.up.railway.app/api/health
# Should return: {"status":"ok","timestamp":"2025-12-25T..."}
```

---

## Step 3: Frontend Setup on Vercel (5 min)

### 3.1 Prepare Frontend
1. Navigate to `/frontend` folder
2. Update `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://reversion-api.railway.app/api
   ```
3. Commit:
   ```bash
   git add frontend/
   git commit -m "Add frontend scaffold"
   git push
   ```

### 3.2 Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up (free GitHub login)
3. Click **"Import Project"**
4. Select your repo
5. **Framework:** Next.js (auto-detected)
6. **Root directory:** `frontend`
7. **Environment variables:**
   - `NEXT_PUBLIC_API_URL` = `https://reversion-api.railway.app/api`
8. Click **Deploy**
9. Wait ~3 min
10. Get your Vercel URL (e.g., `https://reversion-ladder.vercel.app`)

### 3.3 Test Frontend
Open `https://reversion-ladder.vercel.app` → Should see home page

---

## Step 4: Connect Everything (1 min)

### 4.1 Update Backend CORS
In `backend/src/index.ts`, update CORS to allow Vercel domain:
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://reversion-ladder.vercel.app' // Add your Vercel URL
  ]
}));
```
Redeploy backend (push to GitHub, Railway auto-deploys).

### 4.2 Test Integration
1. Open frontend
2. Click "Begin Reading"
3. Should load Chapter 1 panels from backend
4. Make a choice → should transition panels

---

## Free Tier Gotchas & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| **Backend cold starts (30s)** | Railway free tier sleeps | Use Railway's "Always On" ($5/mo) or accept delay |
| **DB connection timeouts** | Supabase free limits ~20 concurrent | Keep connections pooled; use `supabase-js` |
| **Vercel rebuilds slow** | Free tier limited resources | Keep repo small; split frontend/backend |
| **Image generation slow** | Pollinations.ai free tier queues | Cache generated images; pre-generate sketches |
| **Storage filling up** | Supabase 500 MB limit | Images stored as URLs, not BLOBs (no problem for MVP) |

---

## Scaling Beyond Free Tier

When you need paid upgrades:

| Service | Free Limit | Upgrade | Cost |
|---------|-----------|---------|------|
| **Supabase** | 500 MB DB + 1 GB storage | Pro plan | $25/mo |
| **Railway** | ~5 GB/month | Pay-as-you-go | ~$5–20/mo depending on use |
| **Vercel** | 100 GB bandwidth | Pro | $20/mo (optional) |
| **Pollinations.ai** | Unlimited (free) | N/A | Free! |

---

## Local Development

### Run locally before deploying:

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev
# Runs on http://localhost:3001

# Terminal 2: Frontend
cd frontend
npm install
# Update .env.local: NEXT_PUBLIC_API_URL=http://localhost:3001/api
npm run dev
# Runs on http://localhost:3000
```

Test at `http://localhost:3000`.

---

## Troubleshooting

### Backend not responding
```bash
# Check logs
railway logs # in Railway dashboard, or GitHub Actions

# Check env vars are set
echo $SUPABASE_URL
```

### Images not loading
- Verify Pollinations.ai isn't blocked
- Check CORS headers in backend response

### Database schema not found
- Verify SQL executed successfully in Supabase
- Check table names (case-sensitive in PostgreSQL)

### Choice not triggering
- Check browser console for API errors
- Verify `chapter_id` matches between frontend and backend

---

## Next Steps

1. **Add OpenAI integration:** Update `backend/src/routes/choices.ts` to call OpenAI API for story continuations
2. **Add admin panel:** Simple form to review and publish AI-generated content
3. **Add more chapters:** Repeat the Chapter 1 structure for Ch. 2, 3, etc.
4. **Polish UI:** Add animations, better fonts, mobile optimization

---

## Useful Links
- [Supabase Docs](https://supabase.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Pollinations.ai API](https://pollinations.ai/api)
