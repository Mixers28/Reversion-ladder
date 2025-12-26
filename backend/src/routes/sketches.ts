import { Router, Request, Response } from 'express';

const router = Router();

interface SketchRequest {
  prompt: string;
  panel_id?: number;
  scene?: string;
  style?: string;
  mood?: string;
}

// POST /api/sketches/generate
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, panel_id, scene, style = 'cinematic illustration', mood = 'dramatic' } = req.body as SketchRequest;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const fullPrompt = `${prompt}. Style: ${style}. Mood: ${mood}`;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}`;

    res.json({
      panel_id,
      image_url: imageUrl,
      status: 'generating',
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
