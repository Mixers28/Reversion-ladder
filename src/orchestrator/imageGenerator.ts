/**
 * Image pre-generation module for webtoon chapters
 * Batch-calls Pollinations.ai using storyboard prompts
 * Caches URLs in chapter manifest
 */

import fetch from 'node-fetch';
import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';

const POLLINATIONS_BASE_URL = 'https://image.pollinations.ai/prompt/';

export interface ImageGenerationResult {
  panel_id: number;
  url: string;
  prompt: string;
  generated_at: string;
  success: boolean;
  error?: string;
}

export interface ImageGenerationBatch {
  chapter_id: string;
  total_panels: number;
  succeeded: number;
  failed: number;
  results: ImageGenerationResult[];
  generated_at: string;
}

/**
 * Generate images for all panels in a chapter
 * Reads storyboard_prompts.json and calls Pollinations.ai
 */
export async function generateChapterImages(
  chapterId: string,
  chapterPath: string
): Promise<ImageGenerationBatch> {
  const storyboardPath = resolve(chapterPath, 'storyboard_prompts.json');
  
  try {
    const storyboardData = JSON.parse(readFileSync(storyboardPath, 'utf-8'));
    
    if (!Array.isArray(storyboardData)) {
      throw new Error('Storyboard prompts must be an array');
    }

    console.log(`🎨 Generating images for ${storyboardData.length} panels...\n`);

    const results: ImageGenerationResult[] = [];
    let succeeded = 0;
    let failed = 0;

    // Process panels sequentially to avoid rate limiting
    for (const panel of storyboardData) {
      try {
        const prompt = panel.prompt || '';
        
        if (!prompt.trim()) {
          console.log(`  ⚠️  Panel ${panel.panel_id}: Empty prompt, skipping`);
          results.push({
            panel_id: panel.panel_id,
            url: '',
            prompt: '',
            generated_at: new Date().toISOString(),
            success: false,
            error: 'Empty prompt'
          });
          failed++;
          continue;
        }

        console.log(`  📤 Panel ${panel.panel_id}...`);
        
        // Generate image via Pollinations.ai
        const url = await generateImage(prompt);

        console.log(`  ✓ Panel ${panel.panel_id}: ${url.substring(0, 60)}...`);

        results.push({
          panel_id: panel.panel_id,
          url,
          prompt: prompt.substring(0, 200), // Store truncated prompt for reference
          generated_at: new Date().toISOString(),
          success: true
        });

        succeeded++;

        // Small delay to avoid rate limiting
        await delay(500);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(`  ❌ Panel ${panel.panel_id}: ${errorMsg}`);
        
        results.push({
          panel_id: panel.panel_id,
          url: '',
          prompt: panel.prompt || '',
          generated_at: new Date().toISOString(),
          success: false,
          error: errorMsg
        });

        failed++;
      }
    }

    const batch: ImageGenerationBatch = {
      chapter_id: chapterId,
      total_panels: storyboardData.length,
      succeeded,
      failed,
      results,
      generated_at: new Date().toISOString()
    };

    // Save batch results to manifest
    const manifestPath = resolve(chapterPath, 'build/manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    manifest.images = batch;
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`\n✅ Image generation complete`);
    console.log(`  ✓ Succeeded: ${succeeded}/${storyboardData.length}`);
    console.log(`  ✗ Failed: ${failed}/${storyboardData.length}\n`);

    return batch;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ Image generation failed: ${errorMsg}`);
    
    return {
      chapter_id: chapterId,
      total_panels: 0,
      succeeded: 0,
      failed: 1,
      results: [],
      generated_at: new Date().toISOString()
    };
  }
}

/**
 * Generate a single image via Pollinations.ai
 */
async function generateImage(prompt: string): Promise<string> {
  // Encode prompt for URL
  const encodedPrompt = encodeURIComponent(prompt);
  const imageUrl = `${POLLINATIONS_BASE_URL}${encodedPrompt}`;

  // Verify the URL works by making a HEAD request
  const response = await fetch(imageUrl, { method: 'HEAD', redirect: 'follow' });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to generate image`);
  }

  return imageUrl;
}

/**
 * Sleep utility
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
