-- WORTHY Manga Story Orchestrator Database Schema
-- Version: 1.0
-- Created: 2025-12-29

-- ============================================================================
-- CANONICAL REFERENCES TABLE
-- Stores story bible, canonical references, and Worthy.md for agent context
-- ============================================================================

CREATE TABLE IF NOT EXISTS canonical_refs (
  id TEXT PRIMARY KEY,
  ref_type TEXT NOT NULL CHECK (ref_type IN ('story_bible', 'canonical_refs', 'worthy_md', 'character_profile', 'world_rule')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_canonical_refs_type ON canonical_refs(ref_type);
CREATE INDEX idx_canonical_refs_active ON canonical_refs(active);

-- ============================================================================
-- STORY PAGES TABLE
-- One row per page (vertical scroll segment) in a chapter
-- ============================================================================

CREATE TABLE IF NOT EXISTS story_pages (
  id TEXT PRIMARY KEY, -- e.g., "ch01_page_001"
  chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  page_number INT NOT NULL,
  narration_text TEXT,
  narration_version INT DEFAULT 1,
  dialogue_json JSONB, -- Array of {speaker, text, emotion, position_hint}
  dialogue_version INT DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 
    'awaiting_user_input', 
    'generating_narration', 
    'user_reviewing_narration', 
    'generating_dialogue', 
    'user_reviewing_dialogue', 
    'approved', 
    'archived'
  )),
  user_input_text TEXT, -- Original user concept for the page
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  UNIQUE(chapter_id, page_number)
);

CREATE INDEX idx_story_pages_chapter ON story_pages(chapter_id);
CREATE INDEX idx_story_pages_status ON story_pages(status);
CREATE INDEX idx_story_pages_chapter_page ON story_pages(chapter_id, page_number);

-- ============================================================================
-- PAGE REVISIONS TABLE
-- Audit trail for all narration/dialogue changes
-- ============================================================================

CREATE TABLE IF NOT EXISTS page_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id TEXT NOT NULL REFERENCES story_pages(id) ON DELETE CASCADE,
  revision_type TEXT NOT NULL CHECK (revision_type IN ('narration', 'dialogue')),
  version_number INT NOT NULL,
  content TEXT NOT NULL, -- For narration: text. For dialogue: JSON string
  agent_prompt TEXT, -- The full prompt sent to LLM
  agent_model TEXT, -- e.g., "gpt-4-turbo", "claude-opus-3"
  agent_tokens_used INT,
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(page_id, revision_type, version_number)
);

CREATE INDEX idx_page_revisions_page ON page_revisions(page_id);
CREATE INDEX idx_page_revisions_type ON page_revisions(revision_type);

-- ============================================================================
-- USER FEEDBACK TABLE
-- Comments from user during review loops
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id TEXT NOT NULL REFERENCES story_pages(id) ON DELETE CASCADE,
  revision_id UUID REFERENCES page_revisions(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  feedback_type TEXT DEFAULT 'revision_request' CHECK (feedback_type IN (
    'revision_request',
    'note',
    'approval_comment'
  )),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_feedback_page ON user_feedback(page_id);
CREATE INDEX idx_user_feedback_revision ON user_feedback(revision_id);

-- ============================================================================
-- PANEL PROMPTS TABLE
-- ComfyUI prompts generated after chapter completion
-- ============================================================================

CREATE TABLE IF NOT EXISTS panel_prompts (
  id TEXT PRIMARY KEY, -- e.g., "ch01_panel_001"
  chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  panel_number INT NOT NULL,
  shot_type TEXT CHECK (shot_type IN ('full_black', 'close', 'medium', 'wide', 'insert', 'action_close', 'establishing')),
  description TEXT NOT NULL, -- Visual notes for the panel
  comfy_ui_prompt TEXT NOT NULL, -- Formatted prompt for ComfyUI
  negative_prompt TEXT,
  style_preset TEXT, -- References canon/styles.json
  mood TEXT,
  generated_image_url TEXT, -- Optional: user uploads result
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(chapter_id, panel_number)
);

CREATE INDEX idx_panel_prompts_chapter ON panel_prompts(chapter_id);

-- ============================================================================
-- ORCHESTRATOR STATE TABLE
-- Tracks current workflow state per page
-- ============================================================================

CREATE TABLE IF NOT EXISTS orchestrator_state (
  id TEXT PRIMARY KEY, -- Same as page_id
  page_id TEXT NOT NULL UNIQUE REFERENCES story_pages(id) ON DELETE CASCADE,
  current_state TEXT NOT NULL CHECK (current_state IN (
    'awaiting_user_input',
    'generating_narration',
    'user_reviewing_narration',
    'generating_dialogue',
    'user_reviewing_dialogue',
    'page_approved',
    'error'
  )),
  previous_state TEXT,
  state_data JSONB, -- Additional context (e.g., retry_count, error_message)
  last_transition_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orchestrator_state_current ON orchestrator_state(current_state);
CREATE INDEX idx_orchestrator_state_page ON orchestrator_state(page_id);

-- ============================================================================
-- AGENT EXECUTION LOG TABLE
-- Tracks all agent calls for debugging and cost monitoring
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_execution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id TEXT REFERENCES story_pages(id) ON DELETE SET NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('narrator', 'dialogue', 'reviewer', 'panel_generator')),
  agent_model TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  response_text TEXT,
  tokens_used INT,
  execution_time_ms INT,
  status TEXT CHECK (status IN ('success', 'error', 'timeout', 'rate_limited')),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agent_execution_page ON agent_execution_log(page_id);
CREATE INDEX idx_agent_execution_type ON agent_execution_log(agent_type);
CREATE INDEX idx_agent_execution_status ON agent_execution_log(status);
CREATE INDEX idx_agent_execution_created ON agent_execution_log(created_at DESC);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Current page status summary
CREATE OR REPLACE VIEW v_page_status_summary AS
SELECT 
  sp.id,
  sp.chapter_id,
  sp.page_number,
  sp.status,
  sp.narration_version,
  sp.dialogue_version,
  os.current_state,
  sp.created_at,
  sp.updated_at,
  sp.approved_at,
  COUNT(DISTINCT pr.id) as total_revisions,
  COUNT(DISTINCT uf.id) as feedback_count
FROM story_pages sp
LEFT JOIN orchestrator_state os ON sp.id = os.page_id
LEFT JOIN page_revisions pr ON sp.id = pr.page_id
LEFT JOIN user_feedback uf ON sp.id = uf.page_id
GROUP BY sp.id, sp.chapter_id, sp.page_number, sp.status, sp.narration_version, 
         sp.dialogue_version, os.current_state, sp.created_at, sp.updated_at, sp.approved_at;

-- View: Chapter progress summary
CREATE OR REPLACE VIEW v_chapter_progress AS
SELECT 
  c.id as chapter_id,
  c.title,
  COUNT(sp.id) as total_pages,
  COUNT(CASE WHEN sp.status = 'approved' THEN 1 END) as approved_pages,
  COUNT(CASE WHEN sp.status IN ('generating_narration', 'generating_dialogue') THEN 1 END) as in_progress_pages,
  MAX(sp.page_number) as last_page_number,
  MAX(sp.updated_at) as last_activity,
  COUNT(pp.id) as panel_count
FROM chapters c
LEFT JOIN story_pages sp ON c.id = sp.chapter_id
LEFT JOIN panel_prompts pp ON c.id = pp.chapter_id
GROUP BY c.id, c.title;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Transition orchestrator state
CREATE OR REPLACE FUNCTION transition_orchestrator_state(
  p_page_id TEXT,
  p_new_state TEXT,
  p_state_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE orchestrator_state
  SET 
    previous_state = current_state,
    current_state = p_new_state,
    state_data = COALESCE(p_state_data, state_data),
    last_transition_at = NOW()
  WHERE page_id = p_page_id;
  
  -- Also update story_pages status to match
  UPDATE story_pages
  SET status = p_new_state, updated_at = NOW()
  WHERE id = p_page_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Create new page with initial state
CREATE OR REPLACE FUNCTION create_story_page(
  p_chapter_id TEXT,
  p_user_input TEXT
)
RETURNS TEXT AS $$
DECLARE
  v_page_id TEXT;
  v_page_number INT;
BEGIN
  -- Get next page number
  SELECT COALESCE(MAX(page_number), 0) + 1 
  INTO v_page_number
  FROM story_pages 
  WHERE chapter_id = p_chapter_id;
  
  -- Generate page ID
  v_page_id := p_chapter_id || '_page_' || LPAD(v_page_number::TEXT, 3, '0');
  
  -- Insert page
  INSERT INTO story_pages (id, chapter_id, page_number, user_input_text, status)
  VALUES (v_page_id, p_chapter_id, v_page_number, p_user_input, 'awaiting_user_input');
  
  -- Initialize orchestrator state
  INSERT INTO orchestrator_state (id, page_id, current_state)
  VALUES (v_page_id, v_page_id, 'awaiting_user_input');
  
  RETURN v_page_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE canonical_refs IS 'Stores story bible and canonical references for agent context';
COMMENT ON TABLE story_pages IS 'One page per vertical scroll segment in a chapter';
COMMENT ON TABLE page_revisions IS 'Audit trail for all narration/dialogue changes';
COMMENT ON TABLE user_feedback IS 'User comments during review loops';
COMMENT ON TABLE panel_prompts IS 'ComfyUI prompts generated after chapter completion';
COMMENT ON TABLE orchestrator_state IS 'Tracks current workflow state per page';
COMMENT ON TABLE agent_execution_log IS 'Tracks all agent calls for debugging and cost monitoring';

COMMENT ON FUNCTION transition_orchestrator_state IS 'Updates orchestrator state with automatic status sync';
COMMENT ON FUNCTION create_story_page IS 'Creates new page with initial state and sequential page number';
