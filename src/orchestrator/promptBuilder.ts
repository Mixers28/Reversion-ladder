import { readFileSync } from 'fs';
import { resolve } from 'path';

const stylesPath = resolve(__dirname, '../../canon/styles.json');
const styles: Record<string, any> = Object.fromEntries(
  JSON.parse(readFileSync(stylesPath, 'utf-8')).map((s: any) => [s.id, s])
);

// Load the Worthy Story Bible as key reference
const storyBiblePath = resolve(__dirname, '../../Worthy Story Bible.md');
const STORY_BIBLE = readFileSync(storyBiblePath, 'utf-8');

const CONSISTENCY_ANCHORS = `
MC: early-20s, lean, mud-streaked, tired eyes, torn cloth wrap, faint rash-like mark on forearm.
Environment: mud, flies, smoke line on horizon, triage tents, hostile stares, distant horn.
Tone: grim tension with subtle nervous humor in side character expressions only.
Mark detail: faint rash-like branching ring on forearm; subtle redness; only faint pulse/heat cue.
`;

const CHARACTER_ROSTER = `
CORE CHARACTERS:
- MC: Main protagonist, early 20s, marked by the Body Pillar, discovers hidden powers
- ELDER: Village elder, mentors MC, knows more than she reveals about the Pillars
- RIVAL: Ambitious young warrior, challenges MC, has dark secrets and goals
- SCAVENGER_1: Pragmatic survivor from the mass grave, trusts MC
- SCAVENGER_2: Cynical salvager, questions everything, comic relief

SETTING-SPECIFIC:
- GUARD_CAPTAIN: Village guard leader, suspicious of outsiders
- MERCHANT: Trader passing through, brings news from beyond
- MARK_BEARER_ELDER: Ancient figure who shows MC the truth about the Mark

USE ONLY THESE NAMES. Do not create new character names.
Maintain consistent appearances, motivations, and relationships.
`;


export interface PromptPack {
  plot_prompt: string;
  script_prompt: string;
  dialogue_prompt: string;
  storyboard_prompt: string;
  continuity_prompt: string;
}

/**
 * Build system prompts for chapter orchestration
 */
export function buildPromptPack(
  chapterId: string,
  title: string,
  userNarrative: string,
  styleId: string = 'grave_black_ink',
  panelCount: number = 20
): PromptPack {
  const style = styles[styleId];

  return {
    plot_prompt: buildPlotPrompt(chapterId, title, userNarrative, panelCount),
    script_prompt: buildScriptPrompt(chapterId, title, styleId, panelCount),
    dialogue_prompt: buildDialoguePrompt(chapterId),
    storyboard_prompt: buildStoryboardPrompt(styleId),
    continuity_prompt: buildContinuityPrompt(chapterId)
  };
}

function buildPlotPrompt(chapterId: string, title: string, userNarrative: string, panelCount: number): string {
  return `You are a webtoon narrative architect for WORTHY.

MASTER REFERENCE - WORTHY STORY BIBLE (key source of truth):
${STORY_BIBLE}

Chapter: ${chapterId} - ${title}
Panels needed: ${panelCount}
User narrative goal: ${userNarrative}

${CHARACTER_ROSTER}

${CONSISTENCY_ANCHORS}

INSTRUCTIONS:
1. Use the Story Bible as your primary source of truth for worldbuilding, power system, and canon
2. Align the user's narrative with the overall WORTHY arc (Season 1-3)
3. Respect the core Five Pillars system (Core, Body, Mind, Flow, Domain/Intent)
4. The Mark is subtle and tied to the Filter - seed hints but don't explain
5. Tone is grim tension with nervous humor (never grimdark, never comedy)
6. NO exposition dumps - weave lore as dialogue/gossip fragments only
7. Character names MUST come from the roster above
8. Maintain visual consistency: mud, flies, triage, hostile stares, survival context

REQUIRED OUTPUT FORMAT: Valid JSON object (no markdown, no code blocks, just raw JSON)
{
  "chapter_id": "${chapterId}",
  "title": "${title}",
  "style_id": "clean_manhwa_shade",
  "panels": [
    {
      "panel_id": 1,
      "shot": "wide",
      "location": "training_ground",
      "visual_notes": ["Description of visual", "Another detail"],
      "characters": ["MC", "Elder"],
      "dialogue": [
        {"speaker": "MC", "text": "Short dialogue line."},
        {"speaker": "Elder", "text": "Response here."}
      ],
      "sfx": ["Sound effect"]
    }
  ],
  "choice_points": []
}

Generate exactly ${panelCount} panels with consistent narrative flow that honors WORTHY canon.
Each panel must have all required fields.
Dialogue must be punchy (< 18 words per bubble).`;
}



function buildScriptPrompt(chapterId: string, title: string, styleId: string, panelCount: number): string {
  const style = styles[styleId];

  return `You are a webtoon script validator and refiner for WORTHY.

MASTER REFERENCE - WORTHY STORY BIBLE (key source of truth):
${STORY_BIBLE}

Chapter: ${chapterId}
Style: ${styleId} - ${style.name}
Expected panels: ${panelCount}

${CHARACTER_ROSTER}

${CONSISTENCY_ANCHORS}

INSTRUCTIONS:
1. Validate against WORTHY canon (Five Pillars, Mark mechanics, Filter lore)
2. Ensure consistent character voices from the roster
3. Maintain grim + nervous humor tone (never grimdark)
4. Seed power system references but don't lecture
5. The Mark should appear as subtle rash/heat cues, not explanations
6. Weave worldbuilding as environment details + gossip, not exposition

REQUIRED OUTPUT FORMAT: Valid JSON object (no markdown, no code blocks, just raw JSON)
{
  "chapter_id": "${chapterId}",
  "title": "${title}",
  "style_id": "${styleId}",
  "panels": [
    {
      "panel_id": 1,
      "shot": "wide",
      "location": "location_name",
      "visual_notes": ["Visual detail 1", "Visual detail 2"],
      "characters": ["MC", "Elder"],
      "dialogue": [
        {"speaker": "MC", "text": "Punchy dialogue under 18 words."},
        {"speaker": "Elder", "text": "Response."}
      ],
      "sfx": ["sound_effect"]
    }
  ],
  "choice_points": []
}

Rules:
1. Exactly ${panelCount} panels total
2. Each panel MUST have: panel_id, shot, location, visual_notes[], characters[], dialogue[], sfx[]
3. Dialogue MUST be: array of {speaker, text} objects, each text < 18 words
4. shot values: wide, medium, close, action_close, insert, full_black
5. Location: descriptive location name
6. visual_notes: array of 1-3 visual descriptions
7. characters: array of character names (ONLY from roster above)
8. sfx: array of sound effects (can be empty)

Generate the complete chapter honoring WORTHY canon from the Story Bible.`;
}


function buildDialoguePrompt(chapterId: string): string {
  return `You are a webtoon dialogue specialist for WORTHY.

MASTER REFERENCE - WORTHY STORY BIBLE (key source of truth):
${STORY_BIBLE}

Chapter: ${chapterId}

${CHARACTER_ROSTER}

Your task:
1. Review existing panel dialogues and ensure they match character voices from WORTHY canon
2. Generate 3 variants for each dialogue bubble (short/natural/punchy)
3. Flag any bubbles > 18 words as "unreadable in webtoon format"
4. Recommend final variant based on character voice, pacing, readability
5. Ensure character voices are distinct, consistent, and honor the Story Bible arc

Use ONLY the characters from the roster above.
Maintain each character's speech patterns and personality as defined in canon.
Grim tone with nervous humor in small moments (never forced comedy).

Output as markdown with structure:
## Panel [ID]
### Dialogue 1: [speaker]
- Variant A: [text]
- Variant B: [text]  
- Variant C: [text]
- **Final:** [recommended]
- **Notes:** [pacing cue or character voice justification]`;
}

function buildStoryboardPrompt(styleId: string): string {
  const style = styles[styleId];

  return `You are a storyboard prompt engineer for Pollinations.ai image generation.

MASTER REFERENCE - WORTHY STORY BIBLE (key source of truth for visual language):
${STORY_BIBLE}

Style preset: ${styleId} - ${style.name}

For EACH panel, generate an image prompt following this structure:

${style.prompt_prefix}

Visual Language Guidelines from WORTHY Canon:
- Mass grave scenes: heavy blacks, tight claustrophobic crops, sudden wide reveals
- The Mark: subtle red/vein branching pattern on forearm; one panel of heat haze or pulse SFX
- Flow mastery: clean breath SFX, smooth motion lines, "too efficient" contrast
- Mind mastery: small eye close-ups, micro-pauses, pattern callouts
- Domain/Intent: panel borders subtly tilt or "rule" overlays appear (later chapters)
- Filter foreshadow: whispered myths, refracted speech bubbles in old texts

Include in each prompt:
- Shot type (full_black, close, medium, wide, insert, action_close)
- Location details
- Character positioning and expression (honoring roster descriptions)
- Mood and lighting cues aligned with tone (grim + nervous humor)
- CONSISTENCY ANCHORS:
${CONSISTENCY_ANCHORS}

AVOID:
${style.negative_prompt}

Output as JSON array:
[
  {
    "panel_id": 1,
    "shot": "wide",
    "location": "mass_grave",
    "prompt": "[full generated prompt for Pollinations.ai honoring WORTHY visual language]"
  },
  ...
]`;
}

function buildContinuityPrompt(chapterId: string): string {
  return `You are a continuity quality-assurance reviewer for WORTHY chapter scripts.

MASTER REFERENCE - WORTHY STORY BIBLE (key source of truth):
${STORY_BIBLE}

Chapter: ${chapterId}

${CHARACTER_ROSTER}

Review the complete chapter for:
1. CANON ALIGNMENT: Does this honor the WORTHY Story Bible (Pillars, Mark mechanics, Filter lore)?
2. Character consistency: Do names, appearances, and motivations match the roster + canon?
3. Location consistency: Do geography and visual details fit the world?
4. Timeline logic: Do character actions make sense in sequence?
5. Tone consistency: Is it grim + nervous humor (not grimdark, not comedy)?
6. Mark references: Does the rash/heat cue appear subtly (not explained)?
7. Dialogue naturalness: No exposition dumps? Conversational and punchy?
8. Visual variety: Shots not repetitive? Good shot flow?
9. Pacing: Does momentum drive toward the user's narrative goal?
10. Arc alignment: Does this advance the Season 1-3 overall arc?

Output as markdown report:
## Continuity Report: ${chapterId}

### Canon Alignment (WORTHY Story Bible)
- [findings against Five Pillars, Mark, Filter, power system, tone]

### Character Consistency
- [findings on roster adherence, voices, motivations]

### Location & World
- [findings on geography, environment details, consistency]

### Timeline & Logic
- [findings on action sequence, causality]

### Tone & Voice
- [findings on grim + humor balance, character voices]

### Mark & Power System
- [findings on how power/Mark is referenced (seeded not lectured?)]

### Dialogue & Exposition
- [findings on naturalness, info-dump check]

### Critical Issues Found
- [list of violations that must be fixed]

### Recommendations
- [suggestions to strengthen alignment with canon]`;
}
