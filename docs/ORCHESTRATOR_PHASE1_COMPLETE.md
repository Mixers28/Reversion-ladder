# Orchestrator Implementation - Phase 1 Complete

## What Changed

### Database Schema (`schemas/orchestrator.schema.sql`)
Created comprehensive PostgreSQL schema with:
- **7 new tables**: `canonical_refs`, `story_pages`, `page_revisions`, `user_feedback`, `panel_prompts`, `orchestrator_state`, `agent_execution_log`
- **2 views**: `v_page_status_summary`, `v_chapter_progress` for efficient queries
- **2 functions**: `transition_orchestrator_state()`, `create_story_page()` for state management
- **Indexes**: Optimized for common query patterns (chapter_id, page_number, status)

### Backend Core (`backend/src/orchestrator/`)
Implemented foundational orchestrator logic:

1. **storyOrchestrator.ts** (320 lines)
   - State machine controller with 6 states
   - Methods: `startPage()`, `approveNarration()`, `requestNarrationRevision()`, `updateDialogue()`, etc.
   - Handles all state transitions and database updates
   - Tracks revision history automatically

2. **contextBuilder.ts** (170 lines)
   - Loads canonical references from database
   - Assembles prior pages for context
   - Formats context into LLM-ready prompts
   - Provides helper methods for specific reference types

3. **API Routes** (`backend/src/routes/orchestrator.ts`, 320 lines)
   - 10 endpoints covering full workflow:
     - `POST /api/orchestrator/start-page`
     - `GET /api/orchestrator/page/:pageId/status`
     - `POST /api/orchestrator/page/:pageId/narration`
     - `POST /api/orchestrator/page/:pageId/approve-narration`
     - `POST /api/orchestrator/page/:pageId/revise-narration`
     - `POST /api/orchestrator/page/:pageId/dialogue`
     - `POST /api/orchestrator/page/:pageId/approve-dialogue`
     - `GET /api/orchestrator/page/:pageId/history`
     - `GET /api/orchestrator/chapters`
     - `GET /api/orchestrator/chapter/:chapterId/pages`

### Seed Script (`scripts/seed-orchestrator-tables.js`)
- Loads Worthy.md, Story Bible, CANONICAL_REFERENCES.md into database
- Creates test chapter and page for validation
- Verifies all tables exist and are accessible
- Provides clear next-steps output

### Backend Integration
- Updated `backend/src/index.ts` to register orchestrator routes
- Routes available at `/api/orchestrator/*`

---

## How to Test

### 1. Apply Database Schema

```bash
# Connect to Supabase and run the schema file
psql $DATABASE_URL -f schemas/orchestrator.schema.sql

# OR use Supabase SQL Editor and paste contents of orchestrator.schema.sql
```

### 2. Seed Database

```bash
# Make sure .env has SUPABASE_URL and SUPABASE_KEY
cd /mnt/e/GD/Mahau
node scripts/seed-orchestrator-tables.js
```

**Expected output:**
- ✓ Tables verified
- ✓ Canonical references loaded (3 files)
- ✓ Test chapter created: `ch01_test_orchestrator`
- ✓ Test page created: `ch01_test_orchestrator_page_001`

### 3. Start Backend

```bash
cd backend
npm run dev
```

### 4. Test API Endpoints

**Test 1: Start a new page**
```bash
curl -X POST http://localhost:3001/api/orchestrator/start-page \
  -H "Content-Type: application/json" \
  -d '{
    "chapterId": "ch01_test_orchestrator",
    "userInput": "MC discovers the Mark glows when sensing danger"
  }'
```

Expected: `{ success: true, pageId: "ch01_test_orchestrator_page_002", state: "generating_narration" }`

**Test 2: Check page status**
```bash
curl http://localhost:3001/api/orchestrator/page/ch01_test_orchestrator_page_001/status
```

Expected: JSON with current state, page number, user input

**Test 3: Update narration (simulate agent)**
```bash
curl -X POST http://localhost:3001/api/orchestrator/page/ch01_test_orchestrator_page_001/narration \
  -H "Content-Type: application/json" \
  -d '{
    "narrationText": "Cold mud pressed against his face. The flies were the worst part...",
    "agentModel": "test-manual",
    "tokensUsed": 0
  }'
```

Expected: `{ success: true, state: "user_reviewing_narration", version: 1 }`

**Test 4: Approve narration**
```bash
curl -X POST http://localhost:3001/api/orchestrator/page/ch01_test_orchestrator_page_001/approve-narration
```

Expected: State transitions to `generating_dialogue`

**Test 5: Request revision**
```bash
curl -X POST http://localhost:3001/api/orchestrator/page/ch01_test_orchestrator_page_001/revise-narration \
  -H "Content-Type: application/json" \
  -d '{ "feedbackText": "Add more sensory details about the cold" }'
```

Expected: State transitions back to `generating_narration`

**Test 6: View history**
```bash
curl http://localhost:3001/api/orchestrator/page/ch01_test_orchestrator_page_001/history
```

Expected: JSON with `revisions[]` and `feedback[]` arrays

**Test 7: List chapters**
```bash
curl http://localhost:3001/api/orchestrator/chapters
```

Expected: Array of chapters with progress stats

**Test 8: Get agent context (for debugging)**
```bash
curl http://localhost:3001/api/orchestrator/page/ch01_test_orchestrator_page_001/context
```

Expected: Formatted context with canonical refs + prior pages

### 5. Verify Database State

```sql
-- Check page was created
SELECT * FROM story_pages;

-- Check orchestrator state
SELECT * FROM orchestrator_state;

-- Check revisions
SELECT * FROM page_revisions ORDER BY created_at DESC;

-- Check feedback
SELECT * FROM user_feedback;

-- Check canonical refs loaded
SELECT id, ref_type, title FROM canonical_refs;

-- Use views
SELECT * FROM v_page_status_summary;
SELECT * FROM v_chapter_progress;
```

---

## Risks / Follow-ups

### Immediate Risks
1. **No AI Agent Implementation**: Routes are ready but agents (narrator, dialogue) not yet implemented
   - **Mitigation**: Can test manually by POSTing to narration/dialogue endpoints
   - **Next step**: Implement `backend/src/orchestrator/agents/narratorAgent.ts`

2. **No Frontend**: Users cannot interact with orchestrator yet
   - **Mitigation**: Use curl/Postman for testing
   - **Next step**: Create `frontend/src/pages/orchestrator/` pages

3. **No Error Recovery**: If agent call fails, state stuck in `generating_*`
   - **Mitigation**: Manual state transition via SQL for now
   - **TODO**: Add retry mechanism and timeout handling

4. **No Rate Limiting**: Could generate excessive LLM API calls
   - **Mitigation**: Not critical until agents implemented
   - **TODO**: Add max revisions per page (suggest: 5)

5. **Database Migration on Production**: Schema changes might conflict with existing data
   - **Mitigation**: Orchestrator tables are separate from existing `chapters` table
   - **Rollback**: Run `DROP TABLE` statements for new tables

### Follow-up Tasks (Priority Order)

**High Priority:**
1. Implement Narrator Agent (`agents/narratorAgent.ts`) - **BLOCKING**
2. Implement Dialogue Agent (`agents/dialogueAgent.ts`) - **BLOCKING**
3. Create frontend page creation UI (`frontend/src/pages/orchestrator/page/[pageId].tsx`)
4. Add error handling and retry logic to orchestrator

**Medium Priority:**
5. Implement Reviewer Agent (advisory only)
6. Implement Panel Generator Agent
7. Add WebSocket for real-time status updates (replace polling)
8. Create revision history viewer in frontend
9. Add prompt template management UI

**Low Priority:**
10. Add rate limiting middleware
11. Implement cost tracking dashboard
12. Add user authentication (currently single-user)
13. Export panel prompts as ComfyUI-compatible JSON
14. Image upload for generated panels

### Known Limitations
- **Single-user only**: No user_id in tables (OK for MVP)
- **Synchronous workflow**: Agent calls block API responses (consider job queue later)
- **No caching**: Canonical refs loaded on every request (add Redis later if needed)
- **No rollback**: Cannot undo state transitions (add restore_version endpoint?)

### Testing Gaps
- No unit tests yet (recommend adding for state machine logic)
- No integration tests for full workflow
- No load testing (single page creation time unknown)
- No error scenario testing (LLM timeout, invalid JSON, etc.)

---

## Architecture Notes

### State Machine Flow
```
awaiting_user_input
  ↓ (user submits input)
generating_narration
  ↓ (agent generates narration)
user_reviewing_narration
  ↓ (user approves)              ↓ (user requests revision)
generating_dialogue            generating_narration (loop)
  ↓ (agent generates dialogue)
user_reviewing_dialogue
  ↓ (user approves)
page_approved
```

### Database Design Decisions
- **story_pages.status** mirrors **orchestrator_state.current_state** for query convenience
- **page_revisions** stores full content for audit trail (not just diffs)
- **user_feedback** links to revision_id for precise tracking
- **panel_prompts** separate table (generated after chapter complete, not per page)
- **agent_execution_log** for debugging and cost monitoring

### API Design Patterns
- RESTful endpoints with clear intent (`approve-narration` vs `revise-narration`)
- Separate endpoints for agent updates vs user actions
- Consistent response format: `{ success, state, message, data }`
- State transitions happen server-side (client cannot directly set state)

---

## Next Session Recommendations

**Option A: Implement AI Agents (Coder role)**
- Create `narratorAgent.ts` with OpenAI/Claude integration
- Create `dialogueAgent.ts`
- Add prompt templates
- Test end-to-end workflow with real LLM

**Option B: Build Frontend (Coder role)**
- Create orchestrator dashboard page
- Create page creation/review interface
- Add status indicators and approval buttons
- Test manual workflow (paste agent outputs)

**Option C: Polish & Document (Reviewer role)**
- Add error handling to all endpoints
- Write API documentation
- Create Postman collection
- Add logging and monitoring

**Recommended:** Option A (Agents) - unblocks full workflow testing

---

## Files Created/Modified Summary

### Created (5 files)
- `schemas/orchestrator.schema.sql` (450 lines)
- `scripts/seed-orchestrator-tables.js` (180 lines)
- `backend/src/orchestrator/storyOrchestrator.ts` (320 lines)
- `backend/src/orchestrator/contextBuilder.ts` (170 lines)
- `backend/src/routes/orchestrator.ts` (320 lines)

### Modified (1 file)
- `backend/src/index.ts` (added orchestrator route import + registration)

**Total new code:** ~1,440 lines
**Total files touched:** 6

---

**Phase 1 Status: ✅ COMPLETE**

Foundation is solid. Ready for agent implementation or frontend development.
