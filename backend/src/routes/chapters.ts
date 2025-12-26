import { Router, Request, Response } from 'express';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { supabase } from '../index';

// MVP: Serving hardcoded Chapter 1 from WORTHY Story Bible (UPDATED version - canonical)
// Load at startup to avoid require() issues with spaces in filenames
let chapterData: any = null;
try {
  const chapterPath = resolve(__dirname, '../../Reverson Ladder (UPDATED).json');
  const fileContent = readFileSync(chapterPath, 'utf-8');
  chapterData = JSON.parse(fileContent);
} catch (err) {
  console.error('Failed to load chapter data:', err);
}

const router = Router();

// GET /api/chapters/:chapterId
router.get('/:chapterId', async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.params;

    // MVP: Serve from hardcoded file (Worthy Story Bible UPDATED - canonical)
    if (chapterId === 'ch01_opening' && chapterData) {
      return res.json(chapterData);
    }

    // Future: Fetch from Supabase once seeded with WORTHY story data
    // const { data, error } = await supabase
    //   .from('chapters')
    //   .select('*')
    //   .eq('id', chapterId)
    //   .single();
    // if (error) throw error;

    res.status(404).json({ error: 'Chapter not found' });
  } catch (error) {
    console.error('Chapter fetch error:', error);
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
