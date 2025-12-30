"use strict";
/**
 * Orchestrator API Routes
 *
 * Endpoints for managing story page creation workflow
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storyOrchestrator_1 = require("../orchestrator/storyOrchestrator");
const contextBuilder_1 = require("../orchestrator/contextBuilder");
const index_1 = require("../index");
const router = (0, express_1.Router)();
/**
 * POST /api/orchestrator/start-page
 * Start a new page with user input
 *
 * Body: { chapterId: string, userInput: string }
 */
router.post('/start-page', async (req, res) => {
    try {
        const { chapterId, userInput } = req.body;
        if (!chapterId || !userInput) {
            return res.status(400).json({
                error: 'chapterId and userInput are required'
            });
        }
        const result = await storyOrchestrator_1.orchestrator.startPage(chapterId, userInput);
        if (!result.success) {
            return res.status(500).json({ error: result.message });
        }
        res.json({
            success: true,
            pageId: result.data?.pageId,
            state: result.newState,
            message: result.message
        });
    }
    catch (error) {
        console.error('Error starting page:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
/**
 * GET /api/orchestrator/page/:pageId/status
 * Get current page status and context
 */
router.get('/page/:pageId/status', async (req, res) => {
    try {
        const { pageId } = req.params;
        const context = await storyOrchestrator_1.orchestrator.getPageContext(pageId);
        if (!context) {
            return res.status(404).json({ error: 'Page not found' });
        }
        res.json({
            pageId: context.pageId,
            chapterId: context.chapterId,
            pageNumber: context.pageNumber,
            currentState: context.currentState,
            userInput: context.userInput,
            narration: {
                text: context.narrationText,
                version: context.narrationVersion
            },
            dialogue: {
                items: context.dialogueJson,
                version: context.dialogueVersion
            }
        });
    }
    catch (error) {
        console.error('Error getting page status:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
/**
 * POST /api/orchestrator/page/:pageId/narration
 * Update narration (called by agent or manual input)
 *
 * Body: { narrationText: string, agentPrompt?: string, agentModel?: string, tokensUsed?: number }
 */
router.post('/page/:pageId/narration', async (req, res) => {
    try {
        const { pageId } = req.params;
        const { narrationText, agentPrompt, agentModel, tokensUsed } = req.body;
        if (!narrationText) {
            return res.status(400).json({ error: 'narrationText is required' });
        }
        const result = await storyOrchestrator_1.orchestrator.updateNarration(pageId, narrationText, agentPrompt, agentModel, tokensUsed);
        if (!result.success) {
            return res.status(500).json({ error: result.message });
        }
        res.json({
            success: true,
            state: result.newState,
            version: result.data?.version,
            message: result.message
        });
    }
    catch (error) {
        console.error('Error updating narration:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
/**
 * POST /api/orchestrator/page/:pageId/approve-narration
 * User approves narration, triggers dialogue generation
 */
router.post('/page/:pageId/approve-narration', async (req, res) => {
    try {
        const { pageId } = req.params;
        const result = await storyOrchestrator_1.orchestrator.approveNarration(pageId);
        if (!result.success) {
            return res.status(500).json({ error: result.message });
        }
        res.json({
            success: true,
            state: result.newState,
            message: result.message
        });
    }
    catch (error) {
        console.error('Error approving narration:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
/**
 * POST /api/orchestrator/page/:pageId/revise-narration
 * User requests narration revision
 *
 * Body: { feedbackText: string }
 */
router.post('/page/:pageId/revise-narration', async (req, res) => {
    try {
        const { pageId } = req.params;
        const { feedbackText } = req.body;
        if (!feedbackText) {
            return res.status(400).json({ error: 'feedbackText is required' });
        }
        const result = await storyOrchestrator_1.orchestrator.requestNarrationRevision(pageId, feedbackText);
        if (!result.success) {
            return res.status(500).json({ error: result.message });
        }
        res.json({
            success: true,
            state: result.newState,
            message: result.message
        });
    }
    catch (error) {
        console.error('Error requesting narration revision:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
/**
 * POST /api/orchestrator/page/:pageId/dialogue
 * Update dialogue (called by agent)
 *
 * Body: { dialogueJson: any[], agentPrompt?: string, agentModel?: string, tokensUsed?: number }
 */
router.post('/page/:pageId/dialogue', async (req, res) => {
    try {
        const { pageId } = req.params;
        const { dialogueJson, agentPrompt, agentModel, tokensUsed } = req.body;
        if (!dialogueJson || !Array.isArray(dialogueJson)) {
            return res.status(400).json({ error: 'dialogueJson array is required' });
        }
        const result = await storyOrchestrator_1.orchestrator.updateDialogue(pageId, dialogueJson, agentPrompt, agentModel, tokensUsed);
        if (!result.success) {
            return res.status(500).json({ error: result.message });
        }
        res.json({
            success: true,
            state: result.newState,
            version: result.data?.version,
            message: result.message
        });
    }
    catch (error) {
        console.error('Error updating dialogue:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
/**
 * POST /api/orchestrator/page/:pageId/approve-dialogue
 * User approves dialogue, page is complete
 */
router.post('/page/:pageId/approve-dialogue', async (req, res) => {
    try {
        const { pageId } = req.params;
        const result = await storyOrchestrator_1.orchestrator.approveDialogue(pageId);
        if (!result.success) {
            return res.status(500).json({ error: result.message });
        }
        res.json({
            success: true,
            state: result.newState,
            message: result.message
        });
    }
    catch (error) {
        console.error('Error approving dialogue:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
/**
 * GET /api/orchestrator/page/:pageId/history
 * Get all revisions and feedback for a page
 */
router.get('/page/:pageId/history', async (req, res) => {
    try {
        const { pageId } = req.params;
        const history = await storyOrchestrator_1.orchestrator.getPageHistory(pageId);
        res.json(history);
    }
    catch (error) {
        console.error('Error getting page history:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
/**
 * GET /api/orchestrator/chapters
 * List all chapters with orchestrator metadata
 */
router.get('/chapters', async (req, res) => {
    try {
        const { data, error } = await index_1.supabase
            .from('v_chapter_progress')
            .select('*')
            .order('last_activity', { ascending: false });
        if (error)
            throw error;
        res.json({ chapters: data || [] });
    }
    catch (error) {
        console.error('Error listing chapters:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
/**
 * GET /api/orchestrator/chapter/:chapterId/pages
 * List all pages in a chapter
 */
router.get('/chapter/:chapterId/pages', async (req, res) => {
    try {
        const { chapterId } = req.params;
        const { data, error } = await index_1.supabase
            .from('v_page_status_summary')
            .select('*')
            .eq('chapter_id', chapterId)
            .order('page_number', { ascending: true });
        if (error)
            throw error;
        res.json({ pages: data || [] });
    }
    catch (error) {
        console.error('Error listing pages:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
/**
 * GET /api/orchestrator/page/:pageId/context
 * Get formatted context for agent (for debugging/manual prompts)
 */
router.get('/page/:pageId/context', async (req, res) => {
    try {
        const { pageId } = req.params;
        const pageContext = await storyOrchestrator_1.orchestrator.getPageContext(pageId);
        if (!pageContext) {
            return res.status(404).json({ error: 'Page not found' });
        }
        const agentContext = await contextBuilder_1.contextBuilder.buildContext(pageContext.chapterId, pageContext.pageNumber, pageContext.userInput);
        if (!agentContext) {
            return res.status(500).json({ error: 'Failed to build context' });
        }
        const formattedContext = contextBuilder_1.contextBuilder.formatContextForPrompt(agentContext);
        res.json({
            raw: agentContext,
            formatted: formattedContext
        });
    }
    catch (error) {
        console.error('Error getting page context:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
exports.default = router;
