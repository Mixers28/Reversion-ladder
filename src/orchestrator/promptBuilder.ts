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

Canon constraints for ch01_opening:
- Opens in battlefield mass grave (grim with nervous humor)
- MC wakes here, has subtle rash-like Mark (not explained)
- Must include: "Five more minutes... mom" line, mass grave reveal, Mark shown as rash/heat, one ruthless + one protector action
- Triage gossip fragments (NO exposition dump)
- Cliffhanger: horn + scouts OR "survivors erased"
- Power system exists but NOT lectured
- The Filter is NOT mentioned

Output as JSON matching /schemas/chapter_script.schema.json structure.
Include all required fields: panel_id, shot, location, visual_notes[], characters[], dialogue[], sfx[].
Dialogue should be punchy (< 18 words per bubble).

Generate the complete panels array with consistent pacing and visual flow.`;
}

function buildScriptPrompt(chapterId: string, title: string, styleId: string, panelCount: number): string {
  const style = styles[styleId];

  return `You are a webtoon script validator and refiner for WORTHY.

Chapter: ${chapterId}
Style: ${styleId} - ${style.name}
Expected panels: ${panelCount}

Review the plot outline and produce a final script JSON with:
1. Exactly ${panelCount} panels (adjust if needed for pacing)
2. Each panel with: panel_id, shot, location, visual_notes[], characters[], dialogue[], sfx[]
3. Dialogue punchy and webtoon-readable (< 18 words per bubble)
4. Visual notes descriptive but concise (for image generation)
5. Shots varied (use: full_black, close, medium, wide, insert, action_close)
6. Locations consistent with setting
7. Character names consistent across panels

Output ONLY valid JSON matching /schemas/chapter_script.schema.json.`;
}

function buildDialoguePrompt(chapterId: string): string {
  return `You are a webtoon dialogue specialist for WORTHY.

Chapter: ${chapterId}

Your task:
1. Review existing panel dialogues
2. Generate 3 variants for each dialogue bubble (short/natural/punchy)
3. Flag any bubbles > 18 words as "unreadable in webtoon format"
4. Recommend final variant based on character voice, pacing, readability

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
