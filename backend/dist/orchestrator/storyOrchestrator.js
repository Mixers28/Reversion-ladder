"use strict";
/**
 * Story Orchestrator - Main state machine controller
 *
 * Coordinates the workflow for creating story pages:
 * User Input → Narration → Review Loop → Dialogue → Approval → Panel Generation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.orchestrator = exports.StoryOrchestrator = void 0;
const index_1 = require("../index");
class StoryOrchestrator {
    /**
     * Start a new page with user input
     */
    async startPage(chapterId, userInput) {
        try {
            // Call database function to create page
            const { data: pageId, error } = await index_1.supabase
                .rpc('create_story_page', {
                p_chapter_id: chapterId,
                p_user_input: userInput
            });
            if (error)
                throw error;
            // Transition to generating_narration
            await this.transitionState(pageId, 'generating_narration');
            return {
                success: true,
                newState: 'generating_narration',
                message: 'Page created successfully',
                data: { pageId }
            };
        }
        catch (error) {
            console.error('Error starting page:', error);
            return {
                success: false,
                newState: 'error',
                message: error.message || 'Failed to start page'
            };
        }
    }
    /**
     * Get current page context
     */
    async getPageContext(pageId) {
        try {
            const { data, error } = await index_1.supabase
                .from('story_pages')
                .select(`
          id,
          chapter_id,
          page_number,
          user_input_text,
          narration_text,
          narration_version,
          dialogue_json,
          dialogue_version,
          status
        `)
                .eq('id', pageId)
                .single();
            if (error)
                throw error;
            if (!data)
                return null;
            return {
                pageId: data.id,
                chapterId: data.chapter_id,
                pageNumber: data.page_number,
                userInput: data.user_input_text || '',
                currentState: data.status,
                narrationText: data.narration_text,
                narrationVersion: data.narration_version,
                dialogueJson: data.dialogue_json,
                dialogueVersion: data.dialogue_version
            };
        }
        catch (error) {
            console.error('Error getting page context:', error);
            return null;
        }
    }
    /**
     * Transition state (internal helper)
     */
    async transitionState(pageId, newState, stateData) {
        const { error } = await index_1.supabase
            .rpc('transition_orchestrator_state', {
            p_page_id: pageId,
            p_new_state: newState,
            p_state_data: stateData || null
        });
        if (error) {
            console.error('Error transitioning state:', error);
            throw error;
        }
    }
    /**
     * Update narration (called by agent or user)
     */
    async updateNarration(pageId, narrationText, agentPrompt, agentModel, tokensUsed) {
        try {
            const context = await this.getPageContext(pageId);
            if (!context)
                throw new Error('Page not found');
            const newVersion = (context.narrationVersion || 0) + 1;
            // Update page
            const { error: updateError } = await index_1.supabase
                .from('story_pages')
                .update({
                narration_text: narrationText,
                narration_version: newVersion,
                updated_at: new Date().toISOString()
            })
                .eq('id', pageId);
            if (updateError)
                throw updateError;
            // Save revision
            const { error: revisionError } = await index_1.supabase
                .from('page_revisions')
                .insert({
                page_id: pageId,
                revision_type: 'narration',
                version_number: newVersion,
                content: narrationText,
                agent_prompt: agentPrompt,
                agent_model: agentModel,
                agent_tokens_used: tokensUsed
            });
            if (revisionError)
                throw revisionError;
            // Transition to user review
            await this.transitionState(pageId, 'user_reviewing_narration');
            return {
                success: true,
                newState: 'user_reviewing_narration',
                message: 'Narration updated successfully',
                data: { version: newVersion }
            };
        }
        catch (error) {
            console.error('Error updating narration:', error);
            return {
                success: false,
                newState: 'error',
                message: error.message || 'Failed to update narration'
            };
        }
    }
    /**
     * User approves narration
     */
    async approveNarration(pageId) {
        try {
            await this.transitionState(pageId, 'generating_dialogue');
            return {
                success: true,
                newState: 'generating_dialogue',
                message: 'Narration approved, generating dialogue'
            };
        }
        catch (error) {
            return {
                success: false,
                newState: 'error',
                message: error.message || 'Failed to approve narration'
            };
        }
    }
    /**
     * User requests narration revision
     */
    async requestNarrationRevision(pageId, feedbackText) {
        try {
            // Get current revision
            const context = await this.getPageContext(pageId);
            if (!context)
                throw new Error('Page not found');
            // Find latest narration revision
            const { data: latestRevision, error: revisionError } = await index_1.supabase
                .from('page_revisions')
                .select('id')
                .eq('page_id', pageId)
                .eq('revision_type', 'narration')
                .order('version_number', { ascending: false })
                .limit(1)
                .single();
            if (revisionError)
                throw revisionError;
            // Save feedback
            const { error: feedbackError } = await index_1.supabase
                .from('user_feedback')
                .insert({
                page_id: pageId,
                revision_id: latestRevision?.id,
                feedback_text: feedbackText,
                feedback_type: 'revision_request'
            });
            if (feedbackError)
                throw feedbackError;
            // Transition back to generating
            await this.transitionState(pageId, 'generating_narration', {
                revision_requested: true,
                user_feedback: feedbackText
            });
            return {
                success: true,
                newState: 'generating_narration',
                message: 'Revision requested, regenerating narration'
            };
        }
        catch (error) {
            return {
                success: false,
                newState: 'error',
                message: error.message || 'Failed to request revision'
            };
        }
    }
    /**
     * Update dialogue (called by agent)
     */
    async updateDialogue(pageId, dialogueJson, agentPrompt, agentModel, tokensUsed) {
        try {
            const context = await this.getPageContext(pageId);
            if (!context)
                throw new Error('Page not found');
            const newVersion = (context.dialogueVersion || 0) + 1;
            // Update page
            const { error: updateError } = await index_1.supabase
                .from('story_pages')
                .update({
                dialogue_json: dialogueJson,
                dialogue_version: newVersion,
                updated_at: new Date().toISOString()
            })
                .eq('id', pageId);
            if (updateError)
                throw updateError;
            // Save revision
            const { error: revisionError } = await index_1.supabase
                .from('page_revisions')
                .insert({
                page_id: pageId,
                revision_type: 'dialogue',
                version_number: newVersion,
                content: JSON.stringify(dialogueJson),
                agent_prompt: agentPrompt,
                agent_model: agentModel,
                agent_tokens_used: tokensUsed
            });
            if (revisionError)
                throw revisionError;
            // Transition to user review
            await this.transitionState(pageId, 'user_reviewing_dialogue');
            return {
                success: true,
                newState: 'user_reviewing_dialogue',
                message: 'Dialogue updated successfully',
                data: { version: newVersion }
            };
        }
        catch (error) {
            console.error('Error updating dialogue:', error);
            return {
                success: false,
                newState: 'error',
                message: error.message || 'Failed to update dialogue'
            };
        }
    }
    /**
     * User approves dialogue
     */
    async approveDialogue(pageId) {
        try {
            await this.transitionState(pageId, 'page_approved');
            // Update approved_at timestamp
            await index_1.supabase
                .from('story_pages')
                .update({ approved_at: new Date().toISOString() })
                .eq('id', pageId);
            return {
                success: true,
                newState: 'page_approved',
                message: 'Page approved and completed'
            };
        }
        catch (error) {
            return {
                success: false,
                newState: 'error',
                message: error.message || 'Failed to approve dialogue'
            };
        }
    }
    /**
     * Get page history (all revisions and feedback)
     */
    async getPageHistory(pageId) {
        try {
            const [revisionsResult, feedbackResult] = await Promise.all([
                index_1.supabase
                    .from('page_revisions')
                    .select('*')
                    .eq('page_id', pageId)
                    .order('created_at', { ascending: false }),
                index_1.supabase
                    .from('user_feedback')
                    .select('*')
                    .eq('page_id', pageId)
                    .order('created_at', { ascending: false })
            ]);
            if (revisionsResult.error)
                throw revisionsResult.error;
            if (feedbackResult.error)
                throw feedbackResult.error;
            return {
                revisions: revisionsResult.data,
                feedback: feedbackResult.data
            };
        }
        catch (error) {
            console.error('Error getting page history:', error);
            return { revisions: [], feedback: [] };
        }
    }
}
exports.StoryOrchestrator = StoryOrchestrator;
// Export singleton instance
exports.orchestrator = new StoryOrchestrator();
