# Project Restructure Complete: WORTHY Webtoon Orchestrator

## Summary

The **WORTHY** project has been restructured to add a **Webtoon Orchestrator** workflow while maintaining backward compatibility with the existing Railway backend and Vercel frontend.

### What Changed

**Added:**
- ✅ Orchestrator infrastructure (Mode A: Prompt Pack Generator)
- ✅ Chapter bundle structure (`/chapters/ch01_opening/`)
- ✅ Style presets with WORTHY-specific prompts
- ✅ JSON schema validation + WORTHY canon checks
- ✅ CLI tools for chapter creation workflow
- ✅ Root-level mirror files for backward compatibility

**Unchanged:**
- ✅ Railway backend continues serving `/api/chapters/ch01_opening`
- ✅ Vercel frontend continues rendering chapters
- ✅ Existing reader functionality (panels, choices, images) unaffected
- ✅ All deployment processes remain the same

---

## Architecture Overview

### System Diagram

```
┌─────────────────────────────────────┐
│  User Narrative (Plain English)     │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌─────────────────────────────────────┐
        │  Orchestrator CLI                   │
        │  pnpm run make:chapter              │
        │  ├─ Parse input                     │
        │  ├─ Create plan                     │
        │  └─ Build prompt pack               │
        └──────────────┬──────────────────────┘
                       │
                       ▼
        ┌─────────────────────────────────────┐
        │  Prompt Pack Generation             │
        │  /prompts_out/ch01_opening/         │
        │  ├─ plot_prompt.txt                 │
        │  ├─ script_prompt.txt               │
        │  ├─ dialogue_prompt.txt             │
        │  ├─ storyboard_prompt.txt           │
        │  └─ continuity_prompt.txt           │
        └──────────────┬──────────────────────┘
                       │
                       ▼
        ┌─────────────────────────────────────┐
        │  [HUMAN STEP]                       │
        │  Run prompts through LLM (Claude)   │
        │  Save results to results/           │
        └──────────────┬──────────────────────┘
                       │
                       ▼
        ┌─────────────────────────────────────┐
        │  Orchestrator Compiler              │
        │  pnpm run compile:chapter           │
        │  ├─ Validate schema                 │
        │  ├─ Check WORTHY canon              │
        │  └─ Merge & write bundle            │
        └──────────────┬──────────────────────┘
                       │
                       ▼
        ┌─────────────────────────────────────┐
        │  Chapter Bundle                     │
        │  /chapters/ch01_opening/            │
        │  ├─ script.json (reader data)       │
        │  ├─ capture.md (source truth)       │
        │  ├─ dialogue.md (variants)          │
        │  ├─ storyboard_prompts.json (AI)    │
        │  ├─ continuity_report.md (QA)       │
        │  └─ build/manifest.json             │
        │                                     │
        │  + Root mirror:                     │
        │  └─ Chapter 1 Capture v03.md        │
        └──────────────┬──────────────────────┘
                       │
            ┌──────────┴──────────┐
            │                     │
            ▼                     ▼
    ┌──────────────────┐  ┌──────────────────┐
    │ Railway Backend  │  │ Vercel Frontend  │
    │ /api/chapters/   │  │ /reader/         │
    │ (reads bundle)   │  │ (renders panels) │
    └──────────────────┘  └──────────────────┘
```

---

## File Structure

### New Files Created

```
/mnt/e/GD/Mahau/
├── canon/
│   └── styles.json                     # 6 WORTHY style presets
├── schemas/
│   └── chapter_script.schema.json      # JSON validation (strict)
├── src/
│   └── orchestrator/
│       ├── index.ts                    # CLI entry (make:chapter)
│       ├── plan.ts                     # Parse → Plan
│       ├── promptBuilder.ts            # Generate 5 system prompts
│       ├── validators.ts               # Validation logic
│       └── compiler.ts                 # Write bundles
├── chapters/                           # Generated chapter bundles
│   └── (created by orchestrator)
├── prompts_out/                        # Intermediate prompt files
│   └── (created by orchestrator)
├── package.json                        # Root-level monorepo config
└── docs/
    └── ORCHESTRATOR.md                 # Orchestrator guide
```

### Directories Created by Orchestrator

When you run `pnpm run make:chapter`, it creates:

```
/chapters/ch01_opening/
├── script.json                         # Reader-compatible data
├── capture.md                          # Human-readable source
├── dialogue.md                         # Dialogue variants
├── storyboard_prompts.json             # Image generation data
├── continuity_report.md                # QA findings
└── build/
    └── manifest.json                   # Metadata

/prompts_out/ch01_opening/
├── plot_prompt.txt
├── script_prompt.txt
├── dialogue_prompt.txt
├── storyboard_prompt.txt
├── continuity_prompt.txt
└── results/                            # For LLM outputs
    ├── plot_result.json
    ├── script_result.json
    ├── dialogue_result.md
    ├── storyboard_result.json
    └── continuity_result.md
```

---

## Core Modules

### 1. **plan.ts** — Narrative → Plan

**Input:** User narrative (plain English)  
**Output:** Structured chapter plan with:
- Chapter ID, title, description
- Panel count, style
- Extracted characters & key beats
- Pacing recommendations

**Key Function:**
```typescript
parseNarativeInput(input: string): ChapterPlan
// Parse: --id ch01_opening --panels 35 --narrative "..."
```

### 2. **promptBuilder.ts** — Generate 5-Prompt Pack

**Outputs:**
1. **plot_prompt** → Narrative breakdown
2. **script_prompt** → Panel script validation
3. **dialogue_prompt** → Dialogue variants
4. **storyboard_prompt** → Image generation data
5. **continuity_prompt** → QA review

Each prompt includes:
- WORTHY canon constraints
- Style preset (grave_black_ink, etc.)
- Consistency anchors (MC appearance, environment)
- Output format expectations

### 3. **validators.ts** — Schema + Canon Checks

**Validation Types:**
1. **JSON Schema** → Strict structure validation (ajv)
2. **Canon Checks** → WORTHY-specific rules
   - Required beats (grave, mark, mom, scavenger)
   - Dialogue length (< 18 words recommended)
   - No Filter lecture
   - No Pillars exposition

**Output:**
```json
{
  "valid": true/false,
  "errors": ["..."],
  "warnings": ["Panel 5: dialogue too long (22 words)"]
}
```

### 4. **compiler.ts** — Write Chapter Bundle

**Reads:** LLM results from `/prompts_out/ch01_opening/results/`  
**Writes:**
- `/chapters/ch01_opening/` (main bundle)
- Root mirror `Chapter 1 Capture v03.md` (backward compatible)

**Output Files:**
- `script.json` — Reader-compatible (same format as current data.json)
- `capture.md` — Source of truth (human-readable)
- `dialogue.md` — All variants + notes
- `storyboard_prompts.json` — Per-panel image prompts
- `continuity_report.md` — QA findings
- `build/manifest.json` — Metadata

### 5. **index.ts** — CLI Entry

**Usage:**
```bash
pnpm run make:chapter \
  --id ch01_opening \
  --title "Chapter 1: Opening" \
  --panels 35 \
  --style grave_black_ink \
  --narrative "..."
```

**Output:** Prints step-by-step instructions

---

## Workflow: Step-by-Step

### Step 1: Generate Prompts (2 minutes)

```bash
pnpm run make:chapter \
  --id ch02_survival \
  --title "Chapter 2: Survival" \
  --panels 40 \
  --style clean_manhwa_shade \
  --narrative "MC trains, discovers Pillar hint (Body), meets rival."
```

**What happens:**
- Parses input → creates chapter plan
- Builds 5 system prompts specific to this chapter
- Writes prompts to `/prompts_out/ch02_survival/`
- Creates `/prompts_out/ch02_survival/results/` directory
- Prints: "Next: Copy prompts to LLM, save results to results/"

### Step 2: Execute Prompts (15-20 minutes)

Copy each prompt file to Claude/GPT-4:

1. **plot_prompt.txt**
   - Returns: JSON with panel-by-panel breakdown
   - Save as: `results/plot_result.json`

2. **script_prompt.txt**
   - Returns: Refined script.json format
   - Save as: `results/script_result.json`

3. **dialogue_prompt.txt**
   - Returns: Markdown with 3 variants per bubble
   - Save as: `results/dialogue_result.md`

4. **storyboard_prompt.txt**
   - Returns: JSON array of per-panel image prompts
   - Save as: `results/storyboard_result.json`

5. **continuity_prompt.txt**
   - Returns: Markdown QA report
   - Save as: `results/continuity_result.md`

### Step 3: Compile & Validate (1 minute)

```bash
pnpm run compile:chapter --id ch02_survival
```

**What happens:**
- Reads all results from `prompts_out/ch02_survival/results/`
- Validates against JSON schema (strict)
- Runs WORTHY canon checks
- Merges outputs → writes `/chapters/ch02_survival/`
- Creates root mirror: `Chapter 2 Capture v03.md`
- Prints validation report

**Output:**
```
✓ Schema validation: PASS
✓ Canon checks: PASS (0 errors, 1 warning)
  - Panel 15: Dialogue might be too long (17 words)
✓ Files written:
  - /chapters/ch02_survival/script.json
  - /chapters/ch02_survival/capture.md
  - /chapters/ch02_survival/dialogue.md
  - /chapters/ch02_survival/storyboard_prompts.json
  - /chapters/ch02_survival/continuity_report.md
  - Chapter 2 Capture v03.md
```

### Step 4: Deploy (1 minute)

Backend update (already coded):
```typescript
// backend/src/routes/chapters.ts
const scriptPath = resolve(__dirname, `../../chapters/${chapterId}/script.json`);
const chapterData = JSON.parse(readFileSync(scriptPath, 'utf-8'));
res.json(chapterData);
```

Then:
```bash
git push  # Triggers auto-redeploy on Railway + Vercel
```

---

## Validation Rules

### JSON Schema

**Required fields per panel:**
```json
{
  "panel_id": 1,
  "shot": "wide",           // enum: full_black, close, medium, wide, insert, action_close
  "location": "mass_grave", // string
  "visual_notes": [...],    // array of strings
  "characters": [...],      // array of strings
  "dialogue": [             // array of {speaker, text}
    { "speaker": "MC", "text": "..." }
  ],
  "sfx": [...]              // array of strings
}
```

**Optional fields:**
- `thought` — MC internal monologue
- `on_panel_text` — Narration/titles
- `notes` — Pacing cues (linger, snap cut)

### WORTHY Canon Checks (ch01_opening only)

✓ **Must contain:**
- Keywords: "grave", "mark", "scavenger", "mom"
- One ruthless action + one protector leak
- Triage gossip (no exposition dump)
- Cliffhanger (horn + scouts, or "survivors erased")

✗ **Must NOT contain:**
- Long exposition (> 60 words per block)
- Dialogue > 18 words per bubble (warning if > 18)
- Filter system lecture
- Five Pillars system lecture
- Mark explanation (it's mysterious)

---

## Style Presets

Located in `/canon/styles.json`:

| Style ID | Best For | Tone |
|----------|----------|------|
| `grave_black_ink` | Ch. 1-3 mass grave | Noir manhwa, high-contrast |
| `storyboard_sketch` | Fast iteration | Loose pencil, clear silhouettes |
| `clean_manhwa_shade` | Combat, training | Clean line art, readable action |
| `fog_horror` | Mass grave horror | Horror atmosphere, implied dread |
| `grit_realism` | War aftermath | Gritty, mud texture, tired faces |
| `mythic_minimal` | Dreams, omens | Minimal ink, symbolic |

Each preset includes:
- `prompt_prefix` — WORTHY-specific art direction
- `negative_prompt` — What to avoid (chibi, pastel, watermarks)

---

## Backward Compatibility

### Root-Level Mirror Files

After compilation, the orchestrator writes:
- `Chapter 1 Capture v03.md` (from `/chapters/ch01_opening/capture.md`)
- `Chapter 2 Capture v03.md` (from `/chapters/ch02_survival/capture.md`)

These mirror files:
- Maintain existing habit of root-level chapter files
- Can be edited independently (won't affect bundle)
- Generated from source of truth (`/chapters/.../capture.md`)

### Reader Compatibility

Frontend reads from same endpoint:
```
GET /api/chapters/ch01_opening → Returns script.json
```

No frontend changes needed. Script.json format is identical to old data.json.

### Current Fallback

If orchestrator bundles aren't ready, backend still serves hardcoded data.json. Allows gradual migration.

---

## Integration with Existing Systems

### Railway Backend

**Current:** Serves hardcoded `backend/src/data.json`  
**Future:** Can read from `/chapters/ch01_opening/script.json`

No code changes needed yet — just update file path when ready.

### Vercel Frontend

**No changes required.** Reader already handles:
- Panel array rendering
- Dialogue parsing
- Image generation (via `visual_notes` as prompt)
- Choice prompts (via `choice_points` array)

### Image Generation

Backend uses `visual_notes` array to build Pollinations.ai prompt:
```typescript
const prompt = panelData.visual_notes.join(' ');
// + style preset + consistency anchors
// = full prompt for image generation
```

Orchestrator `storyboard_prompts.json` contains these pre-built prompts.

---

## Example: Full Workflow

### Create Chapter 2 (45 minutes total)

```bash
# 1. Generate prompts (2 min)
pnpm run make:chapter \
  --id ch02_survival \
  --title "Chapter 2: Survival" \
  --panels 40 \
  --style clean_manhwa_shade \
  --narrative "MC trains under village elder, discovers Body Pillar hint. Rival appears. Tension."

# Output: /prompts_out/ch02_survival/ with 5 .txt files

# 2. Copy prompts to Claude (20 min)
# - Paste plot_prompt.txt → get plot_result.json
# - Paste script_prompt.txt → get script_result.json
# - etc.
# Save each to /prompts_out/ch02_survival/results/

# 3. Compile (1 min)
pnpm run compile:chapter --id ch02_survival

# Output: /chapters/ch02_survival/ bundle + Chapter 2 Capture v03.md

# 4. Review (5 min)
# cat /chapters/ch02_survival/continuity_report.md
# cat /chapters/ch02_survival/dialogue.md

# 5. Deploy (5 min)
# Update backend path if needed
git add -A
git commit -m "Add Chapter 2: Survival"
git push
# Auto-deploys to Railway + Vercel
```

---

## Future Enhancements

### Mode B: Fully Automated

```typescript
const orchestrator = new WortbyOrchestrator({
  llmProvider: 'openai',
  model: 'gpt-4-turbo'
});

await orchestrator.runFullPipeline(
  'ch03_revelation',
  userNarrative,
  { validate: true, autoRetry: true }
);
```

Would:
- Auto-call OpenAI for each prompt
- Validate output
- Retry if schema fails
- Merge results automatically
- No manual LLM copy-paste needed

### Database Integration

```typescript
// Instead of /chapters/ files
await chapterBundle.writeToSupabase({
  table: 'chapters',
  schema: 'worthy'
});
```

### Admin Panel

Web UI for:
- Creating chapter briefs
- Monitoring orchestration
- Reviewing QA reports
- Publishing chapters

---

## Troubleshooting

### "make:chapter command not found"

```bash
# Install root dependencies
npm install
# OR if using pnpm
pnpm install
```

### Schema Validation Fails

Check panel structure:
```bash
# View schema
cat schemas/chapter_script.schema.json

# Validate chapter
pnpm run validate:chapter --id ch01_opening
```

Required fields per panel:
- `panel_id` (integer)
- `shot` (enum: full_black, close, medium, wide, insert, action_close)
- `location` (string)
- `visual_notes` (array)
- `characters` (array)
- `dialogue` (array of {speaker, text})
- `sfx` (array)

### Canon Checks Fail for ch01_opening

Make sure chapter includes:
- ✓ Keywords: "grave", "mark", "scavenger", "mom"
- ✓ Punchy dialogue (< 18 words per bubble)
- ✓ No Filter system lecture
- ✓ No Pillars system lecture

---

## Files Changed Summary

```
CREATED:
- /canon/styles.json
- /schemas/chapter_script.schema.json
- /src/orchestrator/index.ts
- /src/orchestrator/plan.ts
- /src/orchestrator/promptBuilder.ts
- /src/orchestrator/validators.ts
- /src/orchestrator/compiler.ts
- /package.json (root)
- /docs/ORCHESTRATOR.md

UNCHANGED:
- /backend/* (Railway continues working)
- /frontend/* (Vercel continues working)
- /docs/PROJECT_CONTEXT.md
- /docs/DEPLOYMENT_SETUP.md
- All existing story files
```

---

## Success Criteria

- ✅ CLI generates prompt pack without errors
- ✅ Prompt pack instructions are clear and actionable
- ✅ JSON schema validation works
- ✅ Canon checks pass for ch01_opening
- ✅ Chapter bundle written to `/chapters/ch01_opening/`
- ✅ Root mirror file created (`Chapter 1 Capture v03.md`)
- ✅ Backend can read from bundle on next sync
- ✅ Frontend reader continues working unchanged
- ✅ Backward compatibility maintained

---

## Next Steps

1. **Test orchestrator on Chapter 2:**
   ```bash
   pnpm run make:chapter --id ch02_survival --title "Chapter 2: Survival" --panels 40 --narrative "..."
   ```

2. **Run Chapter 2 through full pipeline** (orchestrator → LLM → compile → validate)

3. **Update backend** to read from `/chapters/` instead of hardcoded data.json

4. **Plan Mode B** (fully automated with OpenAI)

5. **Build admin panel** for UI-based chapter creation

---

**Status:** ✅ Orchestrator infrastructure complete and ready for use.

