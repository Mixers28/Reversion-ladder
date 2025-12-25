import { Router, Request, Response } from 'express';

const router = Router();

interface SketchRequest {
  sketchId: string;
  prompt: string;
  style: string;
  mood: string;
}

// POST /api/sketches/generate
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { sketchId, prompt, style, mood } = req.body as SketchRequest;

    const fullPrompt = `${prompt}. Style: ${style}. Mood: ${mood}`;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}`;

    res.json({
      sketchId,
      imageUrl,
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
