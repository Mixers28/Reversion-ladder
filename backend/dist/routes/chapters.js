"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = require("fs");
const path_1 = require("path");
// MVP: Serving hardcoded Chapter 1 from WORTHY Story Bible (UPDATED version - canonical)
// Load at startup to avoid require() issues with spaces in filenames
let chapterData = null;
try {
    // Load from data.json in src directory
    const chapterPath = (0, path_1.resolve)(__dirname, './data.json');
    const fileContent = (0, fs_1.readFileSync)(chapterPath, 'utf-8');
    chapterData = JSON.parse(fileContent);
}
catch (err) {
    console.error('Failed to load chapter data:', err);
}
const router = (0, express_1.Router)();
// GET /api/chapters/:chapterId
router.get('/:chapterId', async (req, res) => {
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
    }
    catch (error) {
        console.error('Chapter fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch chapter' });
    }
});
// POST /api/chapters/:chapterId/progress
router.post('/:chapterId/progress', async (req, res) => {
    try {
        const { chapterId } = req.params;
        const { userId, panelIndex, choicesPath } = req.body;
        // TODO: Save to Supabase user_progress table
        res.json({ success: true, message: 'Progress saved' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to save progress' });
    }
});
exports.default = router;
