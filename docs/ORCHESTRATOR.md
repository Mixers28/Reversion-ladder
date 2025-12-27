# WORTHY Webtoon Orchestrator

A structured workflow for creating consistent, high-quality webtoon chapters using AI assistance. Designed to work with the existing WORTHY reader (frontend + backend).

## Overview

The Orchestrator takes a human narrative brief and produces a complete chapter bundle:

```
User Input (plain English)
    ↓
[Orchestrator: Parse → Plan → Generate Prompts]
    ↓
Prompt Pack (5 role-based prompts)
    ↓
[Human/Agent: Run through LLM]
    ↓
Results (plot, script, dialogue, storyboard, continuity)
    ↓
[Orchestrator: Validate → Compile]
    ↓
Chapter Bundle (/chapters/ch01_opening/)
  ├── script.json (reader-compatible)
  ├── capture.md (source of truth)
  ├── dialogue.md (variants + notes)
  ├── storyboard_prompts.json (image generation)
  ├── continuity_report.md
  └── build/manifest.json
```

## Architecture

### Directory Structure

```
/mnt/e/GD/Mahau/
├── canon/
│   └── styles.json                    # WORTHY style presets
├── schemas/
│   └── chapter_script.schema.json     # JSON validation schema
├── src/orchestrator/
│   ├── index.ts                       # CLI entry (make:chapter)
│   ├── plan.ts                        # Parse narrative → plan
│   ├── promptBuilder.ts               # Build role-based prompts
│   ├── validators.ts                  # JSON schema + canon checks
│   └── compiler.ts                    # Write chapter bundle
├── chapters/                          # Generated chapter bundles
│   ├── ch01_opening/
│   │   ├── script.json
│   │   ├── capture.md
│   │   ├── dialogue.md
│   │   ├── storyboard_prompts.json
│   │   ├── continuity_report.md
│   │   └── build/manifest.json
│   └── ...
├── prompts_out/                       # Intermediate prompt pack files
│   ├── ch01_opening/
│   │   ├── plot_prompt.txt
│   │   ├── script_prompt.txt
│   │   ├── dialogue_prompt.txt
│   │   ├── storyboard_prompt.txt
│   │   ├── continuity_prompt.txt
│   │   └── results/
│   │       ├── plot_result.json
│   │       ├── script_result.json
│   │       ├── dialogue_result.md
│   │       ├── storyboard_result.json
│   │       └── continuity_result.md
│   └── ...
├── frontend/                          # Next.js reader (unchanged)
├── backend/                           # Express API (unchanged)
└── docs/
    └── ORCHESTRATOR.md               # This file
```

## Usage

### Step 1: Generate Prompt Pack (Mode A)

```bash
pnpm run make:chapter \
  --id ch01_opening \
  --title "Chapter 1: Opening" \
  --panels 35 \
  --style grave_black_ink \
  --narrative "MC wakes in battlefield mass grave with a Mark. Scavengers, guards, and triage scenes. Discovers power. Cliffhanger with horn + scouts."
```

**Output:**
- Generates `/prompts_out/ch01_opening/` with 5 system prompts
- Creates `/prompts_out/ch01_opening/results/` directory for LLM outputs
- Prints instructions for next steps

### Step 2: Execute Prompts (Manual)

Copy each prompt to your favorite LLM (Claude, GPT-4, etc.):

1. **plot_prompt.txt** → Generates panel breakdown + narrative structure
   - Save output as: `results/plot_result.json`

2. **script_prompt.txt** → Validates + refines panel script
   - Save output as: `results/script_result.json`

3. **dialogue_prompt.txt** → Generates dialogue variants
   - Save output as: `results/dialogue_result.md`

4. **storyboard_prompt.txt** → Creates per-panel image prompts
   - Save output as: `results/storyboard_result.json`

5. **continuity_prompt.txt** → QA review
   - Save output as: `results/continuity_result.md`

### Step 3: Compile Chapter Bundle

```bash
pnpm run compile:chapter --id ch01_opening
```

**Output:**
- Validates all results against schema + canon rules
- Merges outputs into `/chapters/ch01_opening/`
  - `script.json` — reader-compatible data
  - `capture.md` — human-readable source of truth
  - `dialogue.md` — all variants + notes
  - `storyboard_prompts.json` — image generation
  - `continuity_report.md` — QA findings
- Creates root-level mirror: `Chapter 1 Capture v03.md` (backward compatible)
- Prints validation report

### Step 4: Sync Reader (Automatic)

The backend automatically loads from `/chapters/ch01_opening/script.json`:

```bash
# Already set up in backend/src/routes/chapters.ts
# Just redeploy or reload
```

Frontend reads from `/api/chapters/ch01_opening` as usual.

## Configuration

### Styles (`canon/styles.json`)

Each style includes:
- `prompt_prefix`: WORTHY-specific art direction
- `negative_prompt`: What to avoid
- `best_for`: Recommended chapters/scenes

Available:
- `grave_black_ink` — Noir manhwa (default, Ch. 1)
- `storyboard_sketch` — Fast iteration
- `clean_manhwa_shade` — Readable action
- `fog_horror` — Implied dread
- `grit_realism` — War trauma
- `mythic_minimal` — Symbolic moments

### Schema (`schemas/chapter_script.schema.json`)

Strict JSON schema for validation:
- Required fields: `chapter_id`, `title`, `panels[]`, `choice_points[]`
- Panel fields: `panel_id`, `shot`, `location`, `visual_notes[]`, `characters[]`, `dialogue[]`, `sfx[]`
- Dialogue: `{speaker, text}` (text <= 150 chars recommended)
- Shot types: `full_black`, `close`, `medium`, `wide`, `insert`, `action_close`

### Canon Rules (`src/orchestrator/validators.ts`)

For `ch01_opening` (Chapter 1), checks:
- ✓ Contains required beats: mass grave, Mark, scavengers, mom line
- ✓ No long exposition blocks (> 60 words)
- ✓ Dialogue punchy (< 18 words per bubble recommended)
- ✓ No Filter lecture
- ✓ No Five Pillars system lecture
- ✓ Power system kept implicit

## Validation

### JSON Schema Validation

```bash
pnpm run validate:chapter --id ch01_opening
```

Checks:
- Valid JSON structure
- Required fields present
- Field types correct
- Enum values valid

### Canon Checks

Automatically run after schema validation:
- Beat detection (keywords: grave, mark, scavenger, mom, horn, scouts)
- Dialogue length (warns if > 18 words)
- On-panel text length
- Unwanted concepts (Filter lecture, Pillars lecture)

### Output

```
✓ Schema: PASS
✓ Canon checks: 2 warnings
  - Panel 5: Dialogue too long (22 words)
  - Missing canon beat: "mom" misdirect line
```

## Prompt Pack Anatomy

### Plot Prompt
- **Input:** User narrative + chapter ID + panel count
- **Output:** Panel-by-panel breakdown with scene descriptions
- **JSON format:** Includes visual_notes, characters, location per panel

### Script Prompt
- **Input:** Plot outline + style preset + panel count
- **Output:** Refined, validated script.json
- **Ensures:** Punchy dialogue, varied shots, consistent characters

### Dialogue Prompt
- **Input:** Current panel dialogues
- **Output:** 3 variants per bubble + final recommendation
- **Purpose:** Optimize for webtoon pacing and readability

### Storyboard Prompt
- **Input:** Style preset + visual descriptions
- **Output:** Per-panel image prompts (for Pollinations.ai)
- **Features:** Consistency anchors, negative prompts, shot type

### Continuity Prompt
- **Input:** Complete chapter script
- **Output:** QA report (character consistency, timeline, tone, etc.)
- **Purpose:** Catch errors before publication

## Integration with Reader

### Backend Update

Backend `/api/chapters/:chapterId` already supports both:

1. **Current (hardcoded data.json):**
   ```typescript
   const chapterData = require('../../data.json');
   if (chapterId === 'ch01_opening') {
     return res.json(chapterData);
   }
   ```

2. **Future (from chapter bundle):**
   ```typescript
   const scriptPath = resolve(__dirname, `../../chapters/${chapterId}/script.json`);
   const chapterData = JSON.parse(readFileSync(scriptPath, 'utf-8'));
   res.json(chapterData);
   ```

### Frontend No Changes Needed

Reader already handles:
- Panel array rendering
- Dialogue parsing
- Image generation (via `visual_notes`)
- Choice prompts (via `choice_points`)

Just load from same `/api/chapters/ch01_opening` endpoint.

## Workflow Example

### Full flow (30-45 min):

```bash
# 1. Generate prompts (2 min)
pnpm run make:chapter \
  --id ch02_survival \
  --title "Chapter 2: Survival" \
  --panels 40 \
  --style clean_manhwa_shade \
  --narrative "MC evades scouts, discovers first Pillar hint (Body), meets a rival."

# 2. Copy prompts_out/ch02_survival/ to Claude
#    Run through 5 prompts (15-20 min manual work)
#    Save results to prompts_out/ch02_survival/results/

# 3. Compile + validate (1 min)
pnpm run compile:chapter --id ch02_survival

# 4. Review output
#    - Read /chapters/ch02_survival/capture.md
#    - Check continuity_report.md for QA issues
#    - Adjust if needed

# 5. Deploy
#    Update backend to load /chapters/ch02_survival/script.json
#    Redeploy
```

## Future Enhancements

### Mode B: Fully Automated

Replace manual LLM step with:
```typescript
orchestrator.runFullPipeline(
  chapterId,
  userNarrative,
  { llmProvider: 'openai', model: 'gpt-4' }
);
```

Would auto-call OpenAI, retry on validation failure, merge results.

### Database Integration

Instead of `/chapters/` folder, write directly to Supabase:
```typescript
await supabase
  .from('chapters')
  .upsert({ id: chapterId, script: bundleData });
```

### Admin Panel

Web UI for:
- Creating chapter briefs
- Monitoring orchestration progress
- Reviewing QA reports
- Approving for publication

## Troubleshooting

### Schema Validation Fails

Check:
- Required fields present: `panel_id`, `shot`, `location`, `visual_notes`, `characters`, `dialogue`, `sfx`
- Field types: `panel_id` is integer, `dialogue` is array of `{speaker, text}`
- Enums: `shot` must be one of: `full_black`, `close`, `medium`, `wide`, `insert`, `action_close`

### Canon Checks Fail

For `ch01_opening`:
- Include keywords: "grave", "mark", "scavenger", "mom"
- Keep dialogue short (< 18 words per bubble)
- Don't lecture about Filter or Five Pillars
- Show power as implicit (MC doesn't understand it yet)

### Chapter Not Loading in Reader

1. Verify script.json syntax: `pnpm run validate:chapter --id ch01_opening`
2. Check backend is reading from correct path
3. Confirm frontend API URL points to correct endpoint

## See Also

- [Top-level-system-prompt.md](../Top-level-system-prompt.md) — Image generation system prompt
- [Worthy Story Bible.md](../Worthy%20Story%20Bible.md) — Narrative canon
- [PROJECT_CONTEXT.md](../docs/PROJECT_CONTEXT.md) — Project overview
- [DEPLOYMENT_SETUP.md](../docs/DEPLOYMENT_SETUP.md) — Reader deployment

