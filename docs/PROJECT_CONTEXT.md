# Project Context - Long-Term Memory (LTM)

> High-level design, tech decisions, constraints for this project.
> This is the source of truth for agents and humans.

<!-- SUMMARY_START -->
**Summary (auto-maintained by Agent):**
- Reversion Ladder: Interactive AI-driven webtoon platform where readers make story choices and AI assists with narrative and sketches.
- Free-tier deployment: Next.js 14 frontend (Vercel), Express.js backend (Railway), Supabase PostgreSQL (database), Pollinations.ai (image generation).
- MVP scope: Chapter 1 with 35 panels, 2 choice points, branching narrative paths (9 total), sketch generation at key scenes.
- Production-ready: All code scaffolds complete, database schema designed, deployment guides written.
<!-- SUMMARY_END -->

---

## 1. Project Overview

- **Name:** Reversion Ladder
- **Owner:** User (solo developer)
- **Purpose:** Create an interactive webtoon platform where readers drive story via AI-assisted branching choices and witness AI-generated sketches of key scenes.
- **Core Thesis:** Readers + AI create the narrative together. Low budget. Free tier stack.
- **Primary Stack:** Next.js 14 (frontend), Express.js (backend), Supabase PostgreSQL (database), Pollinations.ai (sketch generation).
- **Deployment:** Vercel (frontend), Railway (backend), Supabase (database) — all free or low-cost tiers.
- **Status:** MVP code-complete; awaiting manual cloud deployment and Chapter 1 seeding.

---

## 2. Core Design Pillars

- **Reader-Centric:** Vertical webtoon scroll with interactive choice prompts at key narrative moments.
- **AI-Assisted Narrative:** Backend ready for OpenAI integration to generate story continuations (optional Phase 2).
- **Visual Storytelling:** Pollinations.ai sketch generation for key scenes; free, no API key required.
- **Minimalist UI:** Tailwind CSS with cosmic void aesthetic (#0a0e27, #1a1f3a, sigil gold #d4af37).
- **Transparent Architecture:** Simple REST API (chapters, choices, sketches endpoints); Supabase schema open for review.

---

## 3. Technical Decisions & Constraints

- **Languages:** TypeScript (backend + frontend), React/Next.js (UI), SQL (Supabase), JSON (narrative data).
- **Frontend:** Next.js 14 SSR, React 18, Tailwind CSS 3.3, Axios for API calls.
- **Backend:** Express.js with TypeScript, CORS enabled, Supabase client, ready for OpenAI SDK.
- **Database:** Supabase PostgreSQL (free tier: 500 MB + 1 GB storage; sufficient for MVP).
- **Images:** Pollinations.ai free API (no API key, unlimited free tier); URLs stored, not BLOBs.
- **Budget:** Free or $5-20/mo after free tier expiration; no expensive services.
- **Scope:** MVP is Chapter 1 only (35 panels, 2 choice points); optional Phase 2 expands narrative and OpenAI integration.

---

## 4. Architecture Snapshot

### Frontend (Next.js, Vercel)
- Pages: `/pages/index.tsx` (landing), `/pages/reader/[chapterId].tsx` (chapter reader with state management)
- Components: `ReaderPanel.tsx` (panel display, click-to-advance), `ChoicePrompt.tsx` (choice UI with branch preview)
- State: useRouter, useState for panels, choices, sketches
- Styling: Tailwind CSS with cosmic void theme

### Backend (Express, Railway)
- Routes:
  - `GET /api/chapters/:chapterId` — returns full chapter panels and choice points
  - `POST /api/choices/generate-continuation` — (optional) calls OpenAI for narrative continuation
  - `POST /api/sketches/generate` — calls Pollinations.ai to generate scene sketch
- Supabase client for chapter/progress/choice queries

### Database (Supabase PostgreSQL)
- Tables: `chapters` (narrative data), `user_progress` (where readers are), `user_choices` (which branches chosen), `sketches` (image URLs), `ai_continuations` (optional)
- Seed script: `scripts/seed-supabase.js` (reads JSON, outputs SQL)

### Narrative (JSON + Markdown)
- `Reverson Ladder.json` — 35 panels (visual notes, dialogue), 2 choice points, 4 sketch prompts, 9 narrative paths
- `Reversion Ladder.md` — Design doc: power system, tribunal structure, veil mechanic, panel script

---

## 5. Links & Related Docs

- **Narrative:** `Reverson Ladder.json` (Chapter 1 data), `Reversion Ladder.md` (design doc)
- **Deployment:** `docs/DEPLOYMENT_SETUP.md` (step-by-step for Supabase, Railway, Vercel), `docs/SUPABASE_SCHEMA.md` (CREATE TABLE statements, seeding)
- **Repo:** `https://github.com/Mixers28/Reversion-ladder` (main branch, all code pushed)
- **Local structure:** `backend/` (Express), `frontend/` (Next.js), `scripts/seed-supabase.js`, `docs/`

---

## 6. Change Log (High-Level Decisions)

- 2025-12-25 - Completed backend/frontend scaffolds, finalized Chapter 1 JSON with 35 panels and 2 choice points, wrote deployment guides.
- 2025-12-25 - Chose Supabase (free PostgreSQL), Railway (cheap backend), Vercel (free frontend), Pollinations.ai (free images).
- 2025-12-25 - Decided MVP scope: Chapter 1 only with vertical webtoon scroll and interactive choices. Phase 2: more chapters + OpenAI integration.
- 2025-12-25 - GitHub repo created and code pushed; deployment blocked pending manual Supabase/Railway/Vercel setup.
