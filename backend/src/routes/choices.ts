import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

interface ChoiceRequest {
  choiceId: string;
  selectedBranch: string;
  context: {
    currentPanel: number;
    mcVoice: string;
    sceneDescription: string;
  };
}

// POST /api/choices/generate-continuation
router.post('/generate-continuation', async (req: Request, res: Response) => {
  try {
    const { choiceId, selectedBranch, context } = req.body as ChoiceRequest;

    const prompt = `
You are writing the next scene of "Reversion Ladder," an interactive manhua/webtoon.
MC (the protagonist) just made this choice: "${selectedBranch}"
Current scene: ${context.sceneDescription}
MC's voice: ${context.mcVoice}

Write 2-3 paragraphs of narrative description for the next panel(s). 
Keep tone consistent with the MC's voice. Use rich visual language for a manhua format.
Include at least one detail about essence/energy, spirit pressure, or Will manifestation.
`;

    const continuation = {
      choiceId,
      nextPanels: [
        {
          panelId: context.currentPanel + 1,
          narration: prompt,
          visualCues: ['essence_thin', 'pressure_drop']
        }
      ]
    };

    res.json(continuation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate continuation' });
  }
});

// POST /api/choices/validate
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { choiceId, selectedBranch } = req.body;
    const isValid = selectedBranch && choiceId;
    res.json({ valid: isValid });
  } catch (error) {
    res.status(500).json({ error: 'Validation failed' });
  }
});

export default router;
