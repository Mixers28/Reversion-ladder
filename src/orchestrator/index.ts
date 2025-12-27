#!/usr/bin/env node

import { parseNarativeInput, createChapterPlan } from './plan';
import { buildPromptPack } from './promptBuilder';
import { validateChapterScript } from './validators';
import { writeChapterBundle, writeRootMirror, generateCaptureMd } from './compiler';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const args = process.argv.slice(2).join(' ');

console.log('🎬 WORTHY Webtoon Orchestrator');
console.log('================================\n');

// Step 1: Parse input
const parsed = parseNarativeInput(args);

if (!parsed.chapter_id || !parsed.title || !parsed.user_narrative) {
  console.error('❌ Missing required arguments!');
  console.error('Usage: pnpm run make:chapter --id ch01_opening --title "Title" --narrative "..."');
  console.error('Optional: --panels 20 --style grave_black_ink --description "..."');
  process.exit(1);
}

// Step 2: Create plan
const plan = createChapterPlan(
  parsed.chapter_id as string,
  parsed.title as string,
  parsed.description || 'Chapter plan',
  parsed.style_id as string,
  parsed.panel_count as number,
  parsed.user_narrative as string
);

console.log(`✓ Chapter Plan Created`);
console.log(`  ID: ${plan.chapter_id}`);
console.log(`  Title: ${plan.title}`);
console.log(`  Panels: ${plan.panel_count}`);
console.log(`  Style: ${plan.style_id}`);
console.log(`  Characters: ${plan.character_list.join(', ')}`);
console.log(`  Key beats: ${plan.key_beats.join(', ')}\n`);

// Step 3: Build prompt pack
const prompts = buildPromptPack(
  plan.chapter_id,
  plan.title,
  plan.user_narrative,
  plan.style_id,
  plan.panel_count
);

// Write prompts to /prompts_out/
const promptsOutPath = resolve(__dirname, `../../prompts_out/${plan.chapter_id}`);
const promptsResultsPath = resolve(promptsOutPath, 'results');
mkdirSync(promptsResultsPath, { recursive: true });

writeFileSync(resolve(promptsOutPath, 'plot_prompt.txt'), prompts.plot_prompt);
writeFileSync(resolve(promptsOutPath, 'script_prompt.txt'), prompts.script_prompt);
writeFileSync(resolve(promptsOutPath, 'dialogue_prompt.txt'), prompts.dialogue_prompt);
writeFileSync(resolve(promptsOutPath, 'storyboard_prompt.txt'), prompts.storyboard_prompt);
writeFileSync(resolve(promptsOutPath, 'continuity_prompt.txt'), prompts.continuity_prompt);

console.log(`✓ Prompt Pack Generated`);
console.log(`  Location: ${promptsOutPath}`);
console.log(`  Next step: Copy LLM outputs to ${promptsResultsPath}/\n`);

console.log(`📝 MANUAL STEP REQUIRED`);
console.log(`1. Open prompts in ${promptsOutPath}/`);
console.log(`2. Run each through your LLM (Claude, GPT, etc.)`);
console.log(`3. Save outputs to ${promptsResultsPath}/`);
console.log(`   - plot_result.json`);
console.log(`   - script_result.json`);
console.log(`   - dialogue_result.md`);
console.log(`   - storyboard_result.json`);
console.log(`   - continuity_result.md`);
console.log(`4. Run: pnpm run compile:chapter --id ${plan.chapter_id}\n`);

console.log('💾 Saved files:');
console.log(`  - ${promptsOutPath}/plot_prompt.txt`);
console.log(`  - ${promptsOutPath}/script_prompt.txt`);
console.log(`  - ${promptsOutPath}/dialogue_prompt.txt`);
console.log(`  - ${promptsOutPath}/storyboard_prompt.txt`);
console.log(`  - ${promptsOutPath}/continuity_prompt.txt\n`);

console.log('🎯 Mode A (Prompt Generation) Complete!');
process.exit(0);
