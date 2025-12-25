# NOW - Working Memory (WM)

> This file captures the current focus / sprint.
> It should always describe what we're doing right now.

<!-- SUMMARY_START -->
**Current Focus (auto-maintained by Agent):**
- Reversion Ladder: AI-driven interactive webtoon platform ready for live deployment.
- All code scaffolds complete (Express backend, Next.js frontend, Supabase schema).
- Chapter 1 narrative finalized (35 panels, 2 choice points, 9 narrative paths).
- Deployment documentation ready; awaiting manual setup on Supabase, Railway, Vercel.
<!-- SUMMARY_END -->

---

## Current Objective

Deploy Reversion Ladder to production (Supabase + Railway + Vercel), seed Chapter 1, and validate reader flow end-to-end.

---

## Active Branch

- `main`

---

## What We Are Working On Right Now

- [x] Complete backend scaffold (Express, CORS, Supabase client, Pollinations.ai integration).
- [x] Complete frontend scaffold (Next.js 14, ReaderPanel, ChoicePrompt, Tailwind CSS).
- [x] Database schema design (5 tables: chapters, user_progress, user_choices, sketches, ai_continuations).
- [x] Chapter 1 narrative JSON with sketch prompts and branching paths.
- [x] Deployment guides (DEPLOYMENT_SETUP.md, SUPABASE_SCHEMA.md).
- [x] Git repo setup and code push (https://github.com/Mixers28/Reversion-ladder).
- [ ] Supabase project creation and schema initialization.
- [ ] Chapter 1 seeding via seed-supabase.js.
- [ ] Railway backend deployment with env vars.
- [ ] Vercel frontend deployment with API URL config.
- [ ] CORS update and integration testing.

---

## Next Small Deliverables

- Deploy backend to Railway (env vars: SUPABASE_URL, SUPABASE_KEY, PORT=3001).
- Deploy frontend to Vercel (env var: NEXT_PUBLIC_API_URL pointing to Railway).
- Verify Chapter 1 loads in browser and choices transition panels.
- Test sketch generation at choice points (Pollinations.ai integration).

---

## Notes / Scratchpad

- Free tier stack: Vercel (frontend), Railway (backend $5/mo after free), Supabase (database).
- Pollinations.ai image generation is free (no API key required).
- MVP scope: Chapter 1 only (35 panels), 2 interactive choice points, sketch generation at key scenes.
- Optional Phase 2: OpenAI integration for AI-generated story continuations (marked in backend/src/routes/choices.ts).
- GitHub repo: https://github.com/Mixers28/Reversion-ladder (all code committed and pushed).
