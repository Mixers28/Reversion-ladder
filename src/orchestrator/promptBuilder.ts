import { readFileSync } from 'fs';
import { resolve } from 'path';

const stylesPath = resolve(__dirname, '../../canon/styles.json');
const styles: Record<string, any> = Object.fromEntries(
  JSON.parse(readFileSync(stylesPath, 'utf-8')).map((s: any) => [s.id, s])
);

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

Chapter: ${chapterId} - ${title}
Panels needed: ${panelCount}
User narrative: ${userNarrative}

${CHARACTER_ROSTER}

Canon constraints for ch01_opening:
- Opens in battlefield mass grave (grim with nervous humor)
- MC wakes here, has subtle rash-like Mark (not explained)
- Must include: "Five more minutes... mom" line, mass grave reveal, Mark shown as rash/heat, one ruthless + one protector action
- Triage gossip fragments (NO exposition dump)
- Cliffhanger: horn + scouts OR "survivors erased"
- Power system exists but NOT lectured
- The Filter is NOT mentioned

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

Generate exactly ${panelCount} panels with consistent narrative flow.
Each panel must have all required fields.
Dialogue must be punchy (< 18 words per bubble).`;
}



function buildScriptPrompt(chapterId: string, title: string, styleId: string, panelCount: number): string {
  const style = styles[styleId];

  return `You are a webtoon script validator and refiner for WORTHY.

Chapter: ${chapterId}
Style: ${styleId} - ${style.name}
Expected panels: ${panelCount}

${CHARACTER_ROSTER}

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

Generate the complete chapter with consistent narrative flow.`;
}


function buildDialoguePrompt(chapterId: string): string {
  return `You are a webtoon dialogue specialist for WORTHY.

Chapter: ${chapterId}

${CHARACTER_ROSTER}

Your task:
1. Review existing panel dialogues
2. Generate 3 variants for each dialogue bubble (short/natural/punchy)
3. Flag any bubbles > 18 words as "unreadable in webtoon format"
4. Recommend final variant based on character voice, pacing, readability
5. Ensure character voices are distinct and consistent

Use only the characters from the roster above.
Maintain each character's speech patterns and personality.

Output as markdown with structure:
## Panel [ID]
### Dialogue 1: [speaker]
- Variant A: [text]
- Variant B: [text]  
- Variant C: [text]
- **Final:** [recommended]
- **Notes:** [pacing cue or issue]`;
}

function buildStoryboardPrompt(styleId: string): string {
  const style = styles[styleId];

  return `You are a storyboard prompt engineer for Pollinations.ai image generation.

Style preset: ${styleId} - ${style.name}

For EACH panel, generate an image prompt following this structure:

${style.prompt_prefix}

Include in each prompt:
- Shot type (full_black, close, medium, wide, insert, action_close)
- Location details
- Character positioning and expression
- Mood and lighting cues
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
    "prompt": "[full generated prompt for Pollinations.ai]"
  },
  ...
]`;
}

function buildContinuityPrompt(chapterId: string): string {
  return `You are a continuity quality-assurance reviewer for WORTHY chapter scripts.

Chapter: ${chapterId}

Review the complete chapter for:
1. Character consistency (names, appearances, motivations)
2. Location consistency (geography, details)
3. Timeline consistency (actions make sense in sequence)
4. Tone consistency (grim + nervous humor maintained)
5. Mark references (should appear as rash/heat cue)
6. Dialogue naturalness (no info-dump, conversational)
7. Visual variety (shots not repetitive)
8. Pacing (is momentum maintained?)

Output as markdown report:
## Continuity Report: ${chapterId}

### Character Consistency
- [findings]

### Location Consistency
- [findings]

### Timeline & Logic
- [findings]

### Tone & Voice
- [findings]

### Issues Found
- [list of problems, if any]

### Recommendations
- [suggestions for improvement]`;
}
