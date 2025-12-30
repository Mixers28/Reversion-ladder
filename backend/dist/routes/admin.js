"use strict";
/**
 * Admin API endpoint for chapter creation
 * Triggers orchestrator Mode B pipeline
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const child_process_1 = require("child_process");
const path_1 = require("path");
const router = (0, express_1.Router)();
/**
 * POST /api/admin/chapters/create
 * Create a new chapter using Mode B orchestrator
 */
router.post('/chapters/create', async (req, res) => {
    try {
        const body = req.body;
        // Validate required fields
        if (!body.id || !body.title || !body.narrative) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: id, title, narrative'
            });
        }
        // Sanitize inputs
        const chapterId = body.id.toLowerCase().replace(/[^a-z0-9_]/g, '');
        const title = body.title.substring(0, 100);
        const narrative = body.narrative.substring(0, 1000);
        const panels = Math.min(Math.max(body.panels || 30, 10), 100);
        const style = ['grave_black_ink', 'storyboard_sketch', 'clean_manhwa_shade', 'fog_horror', 'grit_realism', 'mythic_minimal'].includes(body.style || '')
            ? body.style
            : 'grave_black_ink';
        // Build command
        const projectRoot = (0, path_1.resolve)(__dirname, '../../..');
        const env = {
            ...process.env,
            OPENAI_API_KEY: body.openai_key || process.env.OPENAI_API_KEY,
            NODE_ENV: 'production'
        };
        const skipImagesFlag = body.skip_images ? '--skip-images' : '';
        const command = `cd ${projectRoot} && OPENAI_API_KEY="${env.OPENAI_API_KEY}" pnpm run make:chapter --id ${chapterId} --title "${title}" --panels ${panels} --style ${style} --narrative "${narrative}" --auto ${skipImagesFlag}`;
        console.log(`[ADMIN] Creating chapter: ${chapterId}`);
        // Execute orchestrator
        const output = (0, child_process_1.execSync)(command, {
            encoding: 'utf-8',
            stdio: 'pipe'
        });
        console.log(`[ADMIN] Chapter created: ${chapterId}\n${output}`);
        res.json({
            success: true,
            message: `Chapter ${chapterId} created successfully`,
            chapter_id: chapterId,
            chapter_path: `${projectRoot}/chapters/${chapterId}`
        });
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[ADMIN] Error creating chapter: ${errorMsg}`);
        res.status(500).json({
            success: false,
            message: 'Failed to create chapter',
            error: errorMsg
        });
    }
});
/**
 * GET /api/admin/chapters/:id/status
 * Check status of chapter generation
 */
router.get('/chapters/:id/status', (req, res) => {
    try {
        const chapterId = req.params.id.toLowerCase();
        const projectRoot = (0, path_1.resolve)(__dirname, '../../..');
        const chapterPath = (0, path_1.resolve)(projectRoot, `chapters/${chapterId}`);
        const fs = require('fs');
        if (!fs.existsSync(chapterPath)) {
            return res.status(404).json({
                success: false,
                message: `Chapter ${chapterId} not found`
            });
        }
        // Read manifest
        const manifestPath = (0, path_1.resolve)(chapterPath, 'build/manifest.json');
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        res.json({
            success: true,
            chapter_id: chapterId,
            status: 'complete',
            panels: manifest.panel_count,
            style: manifest.style_id,
            images: manifest.images || { succeeded: 0, total_panels: 0 },
            created_at: manifest.created_at
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get chapter status',
            error: String(error)
        });
    }
});
exports.default = router;
