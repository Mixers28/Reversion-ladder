#!/usr/bin/env node

import { parseNarativeInput, createChapterPlan } from './plan';
import { buildPromptPack } from './promptBuilder';
import { validateChapterScript } from './validators';
import { writeChapterBundle, writeRootMirror, generateCaptureMd } from './compiler';
import { runFullAutoPipeline } from './llmRunner';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

// Parse whether --auto flag is set
const isAutoMode = process.argv.includes('--auto');
const openaiKeyIndex = process.argv.indexOf('--openai-key');
const openaiKey = openaiKeyIndex > -1 ? process.argv[openaiKeyIndex + 1] : undefined;

const args = process.argv.slice(2).join(' ');

console.log('🎬 WORTHY Webtoon Orchestrator');
console.log('================================\n');

// Step 1: Parse input
const parsed = parseNarativeInput(args);

if (!parsed.chapter_id || !parsed.title || !parsed.user_narrative) {
  console.error('❌ Missing required arguments!');
  console.error('Usage: pnpm run make:chapter --id ch01_opening --title "Title" --narrative "..."');
  console.error('Optional: --panels 20 --style grave_black_ink');
  console.error('         --auto (for Mode B: auto-run LLM)');
  console.error('         --openai-key YOUR_KEY (or set OPENAI_API_KEY env var)');
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
console.log(`  Key beats: ${plan.key_beats.join(', ')}`);
console.log(`  Mode: ${isAutoMode ? '🤖 AUTO (Mode B)' : '📝 MANUAL (Mode A)'}\n`);

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
console.log(`  Location: ${promptsOutPath}\n`);

// Mode B: Auto-run LLM pipeline
if (isAutoMode) {
  console.log('🚀 Starting Mode B (Fully Automated)\n');

  (async () => {
    try {
      const llmResults = await runFullAutoPipeline(
        prompts.plot_prompt,
        prompts.script_prompt,
        prompts.dialogue_prompt,
        prompts.storyboard_prompt,
        prompts.continuity_prompt,
        openaiKey
      );

      // Save results
      console.log('💾 Saving LLM results...\n');

      writeFileSync(
        resolve(promptsResultsPath, 'plot_result.json'),
        llmResults.plot_result.output
      );
      writeFileSync(
        resolve(promptsResultsPath, 'script_result.json'),
        llmResults.script_result.output
      );
      writeFileSync(
        resolve(promptsResultsPath, 'dialogue_result.md'),
        llmResults.dialogue_result.output
      );
      writeFileSync(
        resolve(promptsResultsPath, 'storyboard_result.json'),
        llmResults.storyboard_result.output
      );
      writeFileSync(
        resolve(promptsResultsPath, 'continuity_result.md'),
        llmResults.continuity_result.output
      );

      console.log('✓ Results saved to /prompts_out/');
      console.log(`  - plot_result.json (attempts: ${llmResults.plot_result.attempts})`);
      console.log(`  - script_result.json (attempts: ${llmResults.script_result.attempts})`);
      console.log(`  - dialogue_result.md (attempts: ${llmResults.dialogue_result.attempts})`);
      console.log(
        `  - storyboard_result.json (attempts: ${llmResults.storyboard_result.attempts})`
      );
      console.log(
        `  - continuity_result.md (attempts: ${llmResults.continuity_result.attempts})\n`
      );

      // Step 4: Compile chapter
      console.log('🔨 Compiling chapter bundle...\n');

      // Read results for validation
      const scriptResult = JSON.parse(llmResults.script_result.output);

      // Validate
      const validation = validateChapterScript(scriptResult, plan.chapter_id);
      if (!validation.valid) {
        console.error('❌ Validation failed:');
        validation.errors.forEach((e) => console.error(`  - ${e}`));
        process.exit(1);
      }

      if (validation.warnings && validation.warnings.length > 0) {
        console.warn('⚠️  Warnings:');
        validation.warnings.forEach((w) => console.warn(`  - ${w}`));
      }

      // Generate capture MD from script
      const captureMd = generateCaptureMd(scriptResult);

      // Parse dialogue and storyboard outputs
      const storyboardResult = JSON.parse(llmResults.storyboard_result.output);

      // Build ChapterBundle object
      const bundle = {
        chapter_id: plan.chapter_id,
        title: plan.title,
        description: plan.user_narrative,
        script: scriptResult,
        capture_md: captureMd,
        dialogue_md: llmResults.dialogue_result.output,
        storyboard_prompts: storyboardResult,
        continuity_report: llmResults.continuity_result.output,
      };

      // Write bundle
      const { bundlePath } = writeChapterBundle(bundle);
      const rootMirrorPath = writeRootMirror(plan.chapter_id, captureMd);

      console.log(`\n✅ Mode B Pipeline Complete!`);
      console.log(`\n📂 Chapter bundle: ${bundlePath}`);
      console.log(`   - script.json`);
      console.log(`   - capture.md`);
      console.log(`   - dialogue.md`);
      console.log(`   - storyboard_prompts.json`);
      console.log(`   - continuity_report.md`);
      console.log(`   - build/manifest.json\n`);
      console.log(`📄 Root mirror: ${rootMirrorPath}\n`);
      console.log(`🚀 Next: git add -A && git push`);
      process.exit(0);

    } catch (error) {
      console.error('❌ Auto pipeline failed:', error);
      process.exit(1);
    }
  })();
} else {
  // Mode A: Manual prompt workflow
  console.log(`📝 MANUAL MODE (Mode A) REQUIRED`);
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

  console.log('💡 Tip: Use Mode B to automate this:');
  console.log(`   pnpm run make:chapter --id ${plan.chapter_id} --auto\n`);

  console.log('🎯 Mode A (Prompt Generation) Complete!');
  process.exit(0);
}

