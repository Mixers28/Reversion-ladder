"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// POST /api/sketches/generate
router.post('/generate', async (req, res) => {
    try {
        const { prompt, panel_id, scene, style = 'cinematic illustration', mood = 'dramatic' } = req.body;
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate sketch' });
    }
});
// GET /api/sketches/:sketchId
router.get('/:sketchId', async (req, res) => {
    try {
        const { sketchId } = req.params;
        res.json({
            sketchId,
            status: 'pending',
            generatedAt: null
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch sketch' });
    }
});
exports.default = router;
