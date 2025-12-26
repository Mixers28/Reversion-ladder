import { Router, Request, Response } from 'express';

const router = Router();

interface SketchRequest {
  prompt: string;
  panel_id?: number;
  scene?: string;
  style_id?: string;
}

// WORTHY Style presets (from Top-level-system-prompt.md)
const STYLE_PRESETS: Record<string, { prefix: string; negative: string }> = {
  grave_black_ink: {
    prefix: 'Vertical webtoon panel, gritty noir manhwa ink style, high-contrast shadows, realistic anatomy, cinematic lighting, muddy battlefield atmosphere, subtle film grain texture, textured blacks, dramatic negative space, no text, no watermark.',
    negative: 'Avoid: bright pastel palette, chibi proportions, glossy anime highlights, comedic caricature, over-clean line art, heavy gore closeups, text overlays, watermarks, logos.'
  },
  storyboard_sketch: {
    prefix: 'Vertical webtoon storyboard sketch, loose pencil + rough ink, simple shading, clear silhouettes, readable staging, minimal detail, no text, no watermark.',
    negative: 'Avoid: polished rendering, color grading, detailed textures, text overlays, watermarks.'
  },
  clean_manhwa_shade: {
    prefix: 'Vertical webtoon panel, clean manhwa line art, soft cel shading, crisp silhouettes, clear action readability, controlled contrast, no text, no watermark.',
    negative: 'Avoid: muddy lighting, extreme grain, chibi, heavy gore, text overlays.'
  },
  fog_horror: {
    prefix: 'Vertical webtoon panel, horror atmosphere, fog/haze, silhouettes, implied violence, strong negative space, high contrast, realistic anatomy, no text, no watermark.',
    negative: 'Avoid: explicit gore closeups, comedic faces, bright colors, text overlays.'
  },
  grit_realism: {
    prefix: 'Vertical webtoon panel, gritty semi-realistic manhwa style, harsh directional lighting, mud/blood texture, tired faces, grounded war realism, no text, no watermark.',
    negative: 'Avoid: glamorized hero lighting, clean costumes, cute expressions, text overlays.'
  },
  mythic_minimal: {
    prefix: 'Vertical webtoon panel, minimal ink illustration, symbolic composition, abstract geometry, subtle border distortion, restrained detail, no text, no watermark.',
    negative: 'Avoid: realism detail overload, bright colors, comedic style, text overlays.'
  }
};

// Consistency anchors for WORTHY (from Top-level-system-prompt.md)
const CONSISTENCY_ANCHORS = `
MC: early-20s, lean, mud-streaked, tired eyes, torn cloth wrap, faint rash-like mark on forearm.
Environment: mud, flies, smoke line on horizon, triage tents, hostile stares, distant horn.
Tone: grim tension with subtle nervous humor in side character expressions only.
Mark detail: faint rash-like branching ring on forearm; subtle redness; only faint pulse/heat cue.
`;

// POST /api/sketches/generate
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, panel_id, scene, style_id = 'grave_black_ink' } = req.body as SketchRequest;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const style = STYLE_PRESETS[style_id] || STYLE_PRESETS.grave_black_ink;

    // Build full prompt using WORTHY system prompt structure
    const fullPrompt = `
${style.prefix}
Scene: ${scene || 'Chapter 1 - Mass Grave Opening'}.
Visual description: ${prompt}.
${CONSISTENCY_ANCHORS}
${style.negative}
`.trim();

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}`;

    res.json({
      panel_id,
      image_url: imageUrl,
      status: 'generating',
      style_id,
      prompt: fullPrompt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate sketch' });
  }
});


// GET /api/sketches/:sketchId
router.get('/:sketchId', async (req: Request, res: Response) => {
  try {
    const { sketchId } = req.params;
    res.json({
      sketchId,
      status: 'pending',
      generatedAt: null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sketch' });
  }
});

export default router;
