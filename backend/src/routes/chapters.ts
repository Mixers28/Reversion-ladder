import { Router, Request, Response } from 'express';
import { supabase } from '../index';

const router = Router();

// GET /api/chapters/:chapterId
router.get('/:chapterId', async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.params;

    // Fetch from Supabase
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Chapter not found' });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch chapter' });
  }
});

// POST /api/chapters/:chapterId/progress
router.post('/:chapterId/progress', async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.params;
    const { userId, panelIndex, choicesPath } = req.body;

    // TODO: Save to Supabase user_progress table
    res.json({ success: true, message: 'Progress saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

export default router;
