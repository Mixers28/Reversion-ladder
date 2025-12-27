/**
 * LLM integration for Mode B (fully automated chapter generation)
 * Uses Anthropic Claude 3.5 Sonnet for superior creative writing
 */

import Anthropic from '@anthropic-ai/sdk';
import { validateSchema } from './validators';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

export interface LLMPromptConfig {
  prompt_type: 'plot' | 'script' | 'dialogue' | 'storyboard' | 'continuity';
  system_message: string;
  user_message: string;
  requires_json?: boolean;
  temperature?: number;
}

export interface LLMRunResult {
  success: boolean;
  output: string;
  attempts: number;
  error?: string;
}

class LLMRunner {
  private client: Anthropic;
  private apiKey: string;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error(
        '❌ No Anthropic API key provided!\n' +
        'Set ANTHROPIC_API_KEY environment variable or pass --anthropic-key argument'
      );
    }
    this.apiKey = key;
    this.client = new Anthropic({ apiKey: key });
  }

  async runPrompt(config: LLMPromptConfig): Promise<LLMRunResult> {
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
      attempts++;

      try {
        console.log(`  📤 Running ${config.prompt_type} prompt (attempt ${attempts}/${MAX_RETRIES})...`);

        const response = await this.client.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          temperature: config.temperature || 0.7,
          system: config.system_message,
          messages: [
            {
              role: 'user',
              content: config.user_message,
            },
          ],
        });

        const output = this.extractTextContent(response);

        // Validate JSON output if required
        if (config.requires_json) {
          try {
            JSON.parse(output);
            console.log(`  ✓ ${config.prompt_type} generated successfully\n`);
            return {
              success: true,
              output,
              attempts,
            };
          } catch (jsonError) {
            if (attempts < MAX_RETRIES) {
              console.log(`  ⚠️  Invalid JSON, retrying...\n`);
              await this.delay(RETRY_DELAY_MS);
              continue;
            } else {
              return {
                success: false,
                output,
                attempts,
                error: `Failed to generate valid JSON after ${MAX_RETRIES} attempts`,
              };
            }
          }
        }

        console.log(`  ✓ ${config.prompt_type} generated successfully\n`);
        return {
          success: true,
          output,
          attempts,
        };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(`  ❌ API call failed: ${errorMsg}`);

        if (attempts < MAX_RETRIES) {
          console.log(`  ⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...\n`);
          await this.delay(RETRY_DELAY_MS);
        } else {
          return {
            success: false,
            output: '',
            attempts,
            error: `API call failed after ${MAX_RETRIES} attempts: ${errorMsg}`,
          };
        }
      }
    }

    return {
      success: false,
      output: '',
      attempts,
      error: `Failed after ${MAX_RETRIES} attempts`,
    };
  }

  private extractTextContent(response: any): string {
    if (response.content && Array.isArray(response.content) && response.content.length > 0) {
      const content = response.content[0];
      if (content.type === 'text' && content.text) {
        let text = content.text;
        // Strip markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        return text.trim();
      }
    }
    return '';
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export async function runFullAutoPipeline(
  plotPrompt: string,
  scriptPrompt: string,
  dialoguePrompt: string,
  storyboardPrompt: string,
  continuityPrompt: string,
  apiKey?: string
): Promise<{
  plot_result: LLMRunResult;
  script_result: LLMRunResult;
  dialogue_result: LLMRunResult;
  storyboard_result: LLMRunResult;
  continuity_result: LLMRunResult;
}> {
  const runner = new LLMRunner(apiKey);

  console.log('🤖 Mode B: Auto-running LLM pipeline');
  console.log('====================================\n');

  const plot_result = await runner.runPrompt({
    prompt_type: 'plot',
    system_message:
      'You are a webtoon narrative architect. Generate detailed chapter plots as JSON.',
    user_message: plotPrompt,
    requires_json: true,
    temperature: 0.7,
  });

  if (!plot_result.success) {
    console.error(`❌ Plot generation failed: ${plot_result.error}`);
    process.exit(1);
  }

  const script_result = await runner.runPrompt({
    prompt_type: 'script',
    system_message: 'You are a webtoon script validator. Validate and refine chapter scripts as JSON.',
    user_message: scriptPrompt,
    requires_json: true,
    temperature: 0.5,
  });

  if (!script_result.success) {
    console.error(`❌ Script generation failed: ${script_result.error}`);
    process.exit(1);
  }

  const dialogue_result = await runner.runPrompt({
    prompt_type: 'dialogue',
    system_message:
      'You are a webtoon dialogue writer. Create punchy, authentic character dialogue.',
    user_message: dialoguePrompt,
    requires_json: false,
    temperature: 0.8,
  });

  if (!dialogue_result.success) {
    console.error(`❌ Dialogue generation failed: ${dialogue_result.error}`);
    process.exit(1);
  }

  const storyboard_result = await runner.runPrompt({
    prompt_type: 'storyboard',
    system_message:
      'You are a storyboard prompt engineer for visual consistency. Generate image prompts as JSON.',
    user_message: storyboardPrompt,
    requires_json: true,
    temperature: 0.6,
  });

  if (!storyboard_result.success) {
    console.error(`❌ Storyboard generation failed: ${storyboard_result.error}`);
    process.exit(1);
  }

  const continuity_result = await runner.runPrompt({
    prompt_type: 'continuity',
    system_message:
      'You are a webtoon quality assurance reviewer. Review for narrative consistency and canon.',
    user_message: continuityPrompt,
    requires_json: false,
    temperature: 0.5,
  });

  if (!continuity_result.success) {
    console.error(`❌ Continuity review failed: ${continuity_result.error}`);
    process.exit(1);
  }

  return {
    plot_result,
    script_result,
    dialogue_result,
    storyboard_result,
    continuity_result,
  };
}
