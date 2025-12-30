/**
 * Seed script for WORTHY Manga Story Orchestrator
 * 
 * This script:
 * 1. Loads canonical references (Worthy.md, Story Bible, etc.)
 * 2. Seeds orchestrator tables in Supabase
 * 
 * Usage:
 *   node scripts/seed-orchestrator-tables.js
 * 
 * Requirements:
 *   - SUPABASE_URL and SUPABASE_KEY in .env
 *   - Orchestrator schema already applied to database
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function loadCanonicalReferences() {
  console.log('📚 Loading canonical references...');
  
  const refs = [];
  
  // Load Worthy Story Bible
  try {
    const storyBiblePath = path.join(__dirname, '..', 'Worthy Story Bible.md');
    const storyBibleContent = fs.readFileSync(storyBiblePath, 'utf-8');
    refs.push({
      id: 'worthy_story_bible_v1',
      ref_type: 'story_bible',
      title: 'WORTHY Story Bible',
      content: storyBibleContent,
      version: '1.0',
      active: true
    });
    console.log('  ✓ Loaded Worthy Story Bible.md');
  } catch (err) {
    console.warn('  ⚠ Could not load Worthy Story Bible.md:', err.message);
  }
  
  // Load CANONICAL_REFERENCES.md
  try {
    const canonicalRefsPath = path.join(__dirname, '..', 'CANONICAL_REFERENCES.md');
    const canonicalRefsContent = fs.readFileSync(canonicalRefsPath, 'utf-8');
    refs.push({
      id: 'canonical_references_v1',
      ref_type: 'canonical_refs',
      title: 'Canonical References',
      content: canonicalRefsContent,
      version: '1.0',
      active: true
    });
    console.log('  ✓ Loaded CANONICAL_REFERENCES.md');
  } catch (err) {
    console.warn('  ⚠ Could not load CANONICAL_REFERENCES.md:', err.message);
  }
  
  // Load Worthy.md (chapter concepts)
  try {
    const worthyPath = path.join(__dirname, '..', 'Worthy.md');
    const worthyContent = fs.readFileSync(worthyPath, 'utf-8');
    refs.push({
      id: 'worthy_concepts_v1',
      ref_type: 'worthy_md',
      title: 'WORTHY Concepts',
      content: worthyContent,
      version: '1.0',
      active: true
    });
    console.log('  ✓ Loaded Worthy.md');
  } catch (err) {
    console.warn('  ⚠ Could not load Worthy.md:', err.message);
  }
  
  // TODO: Load character profiles from canon/ directory
  // TODO: Load world rules from canon/ directory
  
  return refs;
}

async function seedCanonicalRefs(refs) {
  console.log('\n💾 Seeding canonical_refs table...');
  
  for (const ref of refs) {
    const { error } = await supabase
      .from('canonical_refs')
      .upsert(ref, { onConflict: 'id' });
    
    if (error) {
      console.error(`  ✗ Error inserting ${ref.id}:`, error.message);
    } else {
      console.log(`  ✓ Inserted ${ref.id}`);
    }
  }
}

async function createTestChapter() {
  console.log('\n📖 Creating test chapter for orchestrator...');
  
  // Check if test chapter already exists
  const { data: existingChapter } = await supabase
    .from('chapters')
    .select('id')
    .eq('id', 'ch01_test_orchestrator')
    .single();
  
  if (existingChapter) {
    console.log('  ✓ Test chapter already exists: ch01_test_orchestrator');
    return 'ch01_test_orchestrator';
  }
  
  // Create test chapter
  const testChapter = {
    id: 'ch01_test_orchestrator',
    title: 'Chapter 1: Test Orchestrator',
    description: 'Test chapter for validating orchestrator workflow',
    panels: [],
    choice_points: [],
    status: 'draft'
  };
  
  const { error } = await supabase
    .from('chapters')
    .insert(testChapter);
  
  if (error) {
    console.error('  ✗ Error creating test chapter:', error.message);
    return null;
  }
  
  console.log('  ✓ Created test chapter: ch01_test_orchestrator');
  return 'ch01_test_orchestrator';
}

async function createTestPage(chapterId) {
  console.log('\n📄 Creating test page...');
  
  if (!chapterId) {
    console.error('  ✗ No chapter ID provided');
    return;
  }
  
  // Use the create_story_page function
  const { data, error } = await supabase
    .rpc('create_story_page', {
      p_chapter_id: chapterId,
      p_user_input: 'MC wakes in the mass grave. Cold, mud, flies. Realizes he\'s alive but others aren\'t. Scavengers approach.'
    });
  
  if (error) {
    console.error('  ✗ Error creating test page:', error.message);
    return;
  }
  
  console.log(`  ✓ Created test page: ${data}`);
  return data;
}

async function verifyTables() {
  console.log('\n🔍 Verifying orchestrator tables...');
  
  const tables = [
    'canonical_refs',
    'story_pages',
    'page_revisions',
    'user_feedback',
    'panel_prompts',
    'orchestrator_state',
    'agent_execution_log'
  ];
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`  ✗ Table ${table} not found or not accessible:`, error.message);
    } else {
      console.log(`  ✓ Table ${table} exists (${count || 0} rows)`);
    }
  }
}

async function main() {
  console.log('🚀 WORTHY Orchestrator Seed Script\n');
  console.log('='.repeat(50));
  
  // Verify Supabase connection
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error('❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in .env');
    process.exit(1);
  }
  
  console.log('✓ Supabase credentials found\n');
  
  try {
    // Verify tables exist
    await verifyTables();
    
    // Load and seed canonical references
    const refs = await loadCanonicalReferences();
    if (refs.length > 0) {
      await seedCanonicalRefs(refs);
    } else {
      console.warn('\n⚠ No canonical references loaded');
    }
    
    // Create test chapter and page
    const chapterId = await createTestChapter();
    if (chapterId) {
      await createTestPage(chapterId);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Seed script completed successfully!');
    console.log('\nNext steps:');
    console.log('  1. Verify data in Supabase dashboard');
    console.log('  2. Test orchestrator API endpoints');
    console.log('  3. Create frontend interface for page creation');
    
  } catch (error) {
    console.error('\n❌ Seed script failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
main();
