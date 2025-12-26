# Canonical References for WORTHY

## Story & Narrative (Current)

✅ **CANONICAL** (Active development):
- [Worthy Story Bible.md](Worthy%20Story%20Bible.md) — Master story bible with Five Pillars power system, Filter concept, Authority framework
- [Reverson Ladder (UPDATED).json](Reverson%20Ladder%20%28UPDATED%29.json) — Chapter 1 panel data (35 panels, 2 choice points, 9 branches) with visual notes keyed to WORTHY canon

⚠️ **DEPRECATED** (Old concept, archive only):
- [Reversion Ladder.md](Reversion%20Ladder.md) — Old Tribunal/Council concept (no longer canonical)
- [Reverson Ladder.json](Reverson%20Ladder.json) — Old Chapter 1 using Tribunal concept (replaced by UPDATED version)

---

## What Changed?

**Old Concept (Reversion Ladder):**
- Chapter 1 starts with a Tribunal judging an ex-apex cultivator
- Power system: Essence → Spirit → Will → Law → Authority
- Setting: Cosmic void court, metaphysical

**New Concept (WORTHY):**
- Chapter 1 starts in a **battlefield mass grave** (grim, dark humor)
- MC carries a subtle **rash-like Mark** (looks like infection)
- Power system: **Five Pillars** (Core, Body, Mind, Flow, Domain/Intent) → Unification → Authority
- Setting: Ground-level survival with mass grave opening, village, scavengers
- **The Filter** gates ascension; those who pass become myths below and "scammers/hustlers" above

---

## How Codebase Uses These

**Backend (src/routes/chapters.ts):**
- Loads `Reverson Ladder (UPDATED).json` for MVP Chapter 1
- Comment: "WORTHY Story Bible (UPDATED version - canonical)"
- Future: Will replace with Supabase queries once database is seeded with WORTHY data

**Frontend:**
- Fetches from `/api/chapters/ch01_opening`
- Backend serves UPDATED JSON
- All visual prompt generation uses UPDATED panel data

**Docs:**
- [DEPLOYMENT_SETUP.md](docs/DEPLOYMENT_SETUP.md) references UPDATED JSON
- [PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) lists Worthy Story Bible as canonical

---

## If You're Continuing Development

1. **Add new chapters?** Base them on [Worthy Story Bible.md](Worthy%20Story%20Bible.md)
2. **Edit Chapter 1 panels?** Edit [Reverson Ladder (UPDATED).json](Reverson%20Ladder%20%28UPDATED%29.json)
3. **Change power system?** Update [Worthy Story Bible.md](Worthy%20Story%20Bible.md) first, then sync JSON
4. **Never** reference the old Reversion Ladder.md/json files — they're deprecated

---

## When to Archive

Once Supabase database is fully seeded with all WORTHY chapters, you can delete:
- `Reversion Ladder.md`
- `Reverson Ladder.json`
- These two UPDATED versions (data will live in DB)

Keep `Worthy Story Bible.md` forever as the master narrative reference.
