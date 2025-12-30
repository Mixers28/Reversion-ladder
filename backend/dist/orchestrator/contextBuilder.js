"use strict";
/**
 * Context Builder - Assembles context for AI agents
 *
 * Loads canonical references, prior pages, and formats them
 * for agent consumption
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextBuilder = exports.ContextBuilder = void 0;
const index_1 = require("../index");
class ContextBuilder {
    /**
     * Load all active canonical references
     */
    async loadCanonicalRefs() {
        try {
            const { data, error } = await index_1.supabase
                .from('canonical_refs')
                .select('*')
                .eq('active', true)
                .order('ref_type');
            if (error)
                throw error;
            return data || [];
        }
        catch (error) {
            console.error('Error loading canonical refs:', error);
            return [];
        }
    }
    /**
     * Load prior approved pages for a chapter
     */
    async loadPriorPages(chapterId, beforePageNumber) {
        try {
            const { data, error } = await index_1.supabase
                .from('story_pages')
                .select('page_number, narration_text, dialogue_json')
                .eq('chapter_id', chapterId)
                .eq('status', 'approved')
                .lt('page_number', beforePageNumber)
                .order('page_number', { ascending: true });
            if (error)
                throw error;
            return (data || []).map(page => ({
                pageNumber: page.page_number,
                narrationText: page.narration_text || '',
                dialogueJson: page.dialogue_json || []
            }));
        }
        catch (error) {
            console.error('Error loading prior pages:', error);
            return [];
        }
    }
    /**
     * Get chapter metadata
     */
    async getChapterMetadata(chapterId) {
        try {
            const { data, error } = await index_1.supabase
                .from('chapters')
                .select('id, title, description')
                .eq('id', chapterId)
                .single();
            if (error)
                throw error;
            return data;
        }
        catch (error) {
            console.error('Error loading chapter metadata:', error);
            return null;
        }
    }
    /**
     * Build full context for an agent
     */
    async buildContext(chapterId, pageNumber, userInput) {
        try {
            const [canonicalRefs, priorPages, chapterMetadata] = await Promise.all([
                this.loadCanonicalRefs(),
                this.loadPriorPages(chapterId, pageNumber),
                this.getChapterMetadata(chapterId)
            ]);
            if (!chapterMetadata) {
                throw new Error('Chapter not found');
            }
            return {
                canonicalRefs,
                priorPages,
                currentPage: {
                    pageNumber,
                    userInput
                },
                chapterMetadata: {
                    chapterId: chapterMetadata.id,
                    title: chapterMetadata.title,
                    description: chapterMetadata.description
                }
            };
        }
        catch (error) {
            console.error('Error building context:', error);
            return null;
        }
    }
    /**
     * Format context as text for LLM prompts
     */
    formatContextForPrompt(context) {
        let prompt = '';
        // Add canonical references
        prompt += '# CANONICAL REFERENCES\n\n';
        for (const ref of context.canonicalRefs) {
            prompt += `## ${ref.title} (${ref.ref_type})\n\n`;
            prompt += `${ref.content}\n\n`;
            prompt += '---\n\n';
        }
        // Add prior pages summary
        if (context.priorPages.length > 0) {
            prompt += '# PRIOR PAGES (THIS CHAPTER)\n\n';
            for (const page of context.priorPages) {
                prompt += `## Page ${page.pageNumber}\n\n`;
                prompt += `${page.narrationText}\n\n`;
                if (page.dialogueJson && page.dialogueJson.length > 0) {
                    prompt += '**Dialogue:**\n';
                    for (const dialogue of page.dialogueJson) {
                        prompt += `- ${dialogue.speaker}: "${dialogue.text}"\n`;
                    }
                    prompt += '\n';
                }
                prompt += '---\n\n';
            }
        }
        else {
            prompt += '# PRIOR PAGES\n\n';
            prompt += 'This is the first page of the chapter.\n\n';
            prompt += '---\n\n';
        }
        // Add current page info
        prompt += '# CURRENT PAGE\n\n';
        prompt += `**Page Number:** ${context.currentPage.pageNumber}\n`;
        prompt += `**User Input:** ${context.currentPage.userInput}\n\n`;
        return prompt;
    }
    /**
     * Get specific canonical reference by type
     */
    async getCanonicalRefByType(refType) {
        try {
            const { data, error } = await index_1.supabase
                .from('canonical_refs')
                .select('*')
                .eq('ref_type', refType)
                .eq('active', true)
                .single();
            if (error)
                throw error;
            return data;
        }
        catch (error) {
            console.error(`Error loading canonical ref type ${refType}:`, error);
            return null;
        }
    }
    /**
     * Get user feedback for a page (for revision prompts)
     */
    async getPageFeedback(pageId) {
        try {
            const { data, error } = await index_1.supabase
                .from('user_feedback')
                .select('feedback_text')
                .eq('page_id', pageId)
                .eq('feedback_type', 'revision_request')
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            return (data || []).map(f => f.feedback_text);
        }
        catch (error) {
            console.error('Error loading page feedback:', error);
            return [];
        }
    }
}
exports.ContextBuilder = ContextBuilder;
// Export singleton instance
exports.contextBuilder = new ContextBuilder();
