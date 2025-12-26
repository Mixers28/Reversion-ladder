You are “WORTHY: Webtoon Director & Scriptwriter”.

Canon constraints (must follow):
- Chapter 1 opens in a battlefield mass grave (grim tone with nervous humor).
- The MC has a subtle rash-like Mark (looks like infection). It is not explained in Chapter 1.
- Power system exists (Five Pillars → Unification → Judgment → Authority) but must NOT be lectured in early chapters.
- “The Filter” exists as a later reveal; in Chapter 1 it can only appear as vague rumor/whisper or not at all.

Tone & pacing:
- Grim with nervous humor: humor is fear-leakage from side characters, not comedy beats.
- Keep exposition minimal; reveal worldbuilding via fragments, gossip, sensory detail, and character action.
- Prioritize momentum: each scene should create a question that pulls the reader downward.
- Dialogue bubbles should be short and punchy. Avoid long monologues.
- Always “show, don’t tell.” Use panel visuals to convey information.

Character rule:
- MC presents as a ruthless survivor / clever hustler, but has a buried principled protector core.
- In Chapter 1, show ONE ruthless action and ONE protective action (small), creating internal conflict.

Formatting rule:
- Output must match the requested schema exactly (see OUTPUT SCHEMA in the user prompt).
- Do not include commentary, analysis, or alternative drafts unless requested.

2) Style picker presets (art direction) — JSON you can wire into your UI

Use this as your dropdown list. Each style has: prompt_prefix + negative_prompt.
(You can store this in styles.json.)

[
  {
    "id": "grave_black_ink",
    "name": "Grave-Black Ink (Noir Manhwa)",
    "best_for": "Chapter 1–3 mass grave, triage, dread",
    "prompt_prefix": "Vertical webtoon panel, gritty noir manhwa ink style, high-contrast shadows, realistic anatomy, cinematic lighting, muddy battlefield atmosphere, subtle film grain texture, textured blacks, dramatic negative space, no text, no watermark.",
    "negative_prompt": "Avoid: bright pastel palette, chibi proportions, glossy anime highlights, comedic caricature, over-clean line art, heavy gore closeups, text overlays, watermarks, logos."
  },
  {
    "id": "storyboard_sketch",
    "name": "Storyboard Sketch (Fast Iteration)",
    "best_for": "Blocking shots, pacing, fast panel iteration",
    "prompt_prefix": "Vertical webtoon storyboard sketch, loose pencil + rough ink, simple shading, clear silhouettes, readable staging, minimal detail, no text, no watermark.",
    "negative_prompt": "Avoid: polished rendering, color grading, detailed textures, text overlays, watermarks."
  },
  {
    "id": "clean_manhwa_shade",
    "name": "Clean Manhwa Shading (Readable Action)",
    "best_for": "Combat clarity, training scenes, movement",
    "prompt_prefix": "Vertical webtoon panel, clean manhwa line art, soft cel shading, crisp silhouettes, clear action readability, controlled contrast, no text, no watermark.",
    "negative_prompt": "Avoid: muddy lighting, extreme grain, chibi, heavy gore, text overlays."
  },
  {
    "id": "fog_horror",
    "name": "Fog Horror (Implied Dread)",
    "best_for": "Mass grave horror without explicit gore",
    "prompt_prefix": "Vertical webtoon panel, horror atmosphere, fog/haze, silhouettes, implied violence, strong negative space, high contrast, realistic anatomy, no text, no watermark.",
    "negative_prompt": "Avoid: explicit gore closeups, comedic faces, bright colors, text overlays."
  },
  {
    "id": "grit_realism",
    "name": "Grit Realism (War Trauma)",
    "best_for": "Warlords, scouts, aftermath, oppression",
    "prompt_prefix": "Vertical webtoon panel, gritty semi-realistic manhwa style, harsh directional lighting, mud/blood texture, tired faces, grounded war realism, no text, no watermark.",
    "negative_prompt": "Avoid: glamorized hero lighting, clean costumes, cute expressions, text overlays."
  },
  {
    "id": "mythic_minimal",
    "name": "Mythic Minimal (Filter Foreshadow)",
    "best_for": "Symbolic hints, dreams, omen moments",
    "prompt_prefix": "Vertical webtoon panel, minimal ink illustration, symbolic composition, abstract geometry, subtle border distortion, restrained detail, no text, no watermark.",
    "negative_prompt": "Avoid: realism detail overload, bright colors, comedic style, text overlays."
  }
]

Recommended default: grave_black_ink for Chapter 1.
3) Output schema for “chapter script” generation (LLM)

This keeps the AI consistent and your renderer predictable.

{
  "chapter_id": "ch01_opening",
  "style_id": "grave_black_ink",
  "panels": [
    {
      "panel": 1,
      "shot": "full_black | close | medium | wide | insert | action_close",
      "location": "mass_grave | triage | ridge | village_gate",
      "visual": "what we see (no dialogue)",
      "characters": ["MC", "SCAVENGER_1", "SCAVENGER_2", "MEDIC", "GUARDS", "VILLAGERS", "SCOUTS"],
      "dialogue": [
        { "speaker": "MC | SCAVENGER_1 | MEDIC | WHISPER | MC_THOUGHT", "text": "..." }
      ],
      "sfx": ["..."],
      "notes": "optional: pacing cue (e.g., 'linger', 'snap cut')"
    }
  ],
  "cliffhanger": "one sentence describing the final beat"
}

4) “Prompt box” templates for your app
A) Script generation prompt (user prompt template)

This is what your app sends as the USER message.

Generate a webtoon chapter script using the output schema below.

Chapter: ch01_opening
Tone: grim with nervous humor
Canon: MC wakes in a battlefield mass grave; rash-like Mark (looks like infection) is shown subtly; no lore lecture.

Style preset id: {style_id}

Must include:
- The “mom” misdirect line
- Mass grave wide reveal
- Mark shown as subtle rash/heat (not explained)
- One ruthless survival action + one protector leak
- Triage gossip fragments (no exposition dump)
- Cliffhanger: horn + scouts OR “survivors get erased”

OUTPUT SCHEMA:
{paste_the_json_schema_here}

User request:
{what_user_typed_in_prompt_box}

B) Sketch prompt builder (image model prompt template)

For each panel, build prompts like:

{STYLE.prompt_prefix}
Shot: {shot}. Location: {location}.
Scene content: {visual}.
Characters: {character_descriptions_short}.
Mood: grim tension with nervous humor in expressions.
Special detail: MC has a subtle rash-like mark on forearm (looks like infection), faint heat/pulse suggested.
No text, no speech bubbles, no watermark.
{STYLE.negative_prompt}

Character_descriptions_short is important. Even 1–2 locked traits reduces drift:

    MC: “early-20s, lean, mud-streaked, tired eyes, torn cloth wrap”

    Scavenger: “gaunt, nervous grin, cheap knife, stick”

    Medic: “practical, exhausted, stained apron”

5) Optional but high-value: “Consistency anchors” you should hardcode

To stop AI drift across generations, store these once and always prepend them:

CONSISTENCY ANCHORS:
- MC face: tired eyes, restrained emotion, not cute.
- MC clothing: torn battlefield cloth + scavenged wrap.
- Mark: faint rash-like branching ring on forearm; subtle redness; only slight pulse/heat cue.
- Environment: mud, flies, smoke line on horizon, triage tents, hostile stares, distant horn.
- Humor rule: only nervous humor from side characters; MC stays practical.

6) If you want this wired into your site quickly

Even without seeing your code, the usual pattern is:

    styles.json (the preset list)

    buildPrompt.ts (combines SYSTEM + anchors + chosen style + user request)

    schema.ts (the JSON schema you validate against)
