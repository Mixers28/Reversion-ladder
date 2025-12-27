import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { resolve } from 'path';

export interface ChapterBundle {
  chapter_id: string;
  title: string;
  description: string;
  script: any; // Full script.json
  capture_md: string;
  dialogue_md: string;
  storyboard_prompts: any[];
  continuity_report: string;
}

/**
 * Write chapter bundle to /chapters/ch01_opening/
 */
export function writeChapterBundle(bundle: ChapterBundle): { bundlePath: string; files: string[] } {
  const bundlePath = resolve(__dirname, `../../chapters/${bundle.chapter_id}`);
  const buildPath = resolve(bundlePath, 'build');
  const files: string[] = [];

  // Create directories
  mkdirSync(bundlePath, { recursive: true });
  mkdirSync(buildPath, { recursive: true });

  // Write script.json (core data)
  const scriptPath = resolve(bundlePath, 'script.json');
  writeFileSync(scriptPath, JSON.stringify(bundle.script, null, 2));
  files.push(scriptPath);

  // Write capture.md (human-readable source)
  const capturePath = resolve(bundlePath, 'capture.md');
  writeFileSync(capturePath, bundle.capture_md);
  files.push(capturePath);

  // Write dialogue.md (variants + notes)
  const dialoguePath = resolve(bundlePath, 'dialogue.md');
  writeFileSync(dialoguePath, bundle.dialogue_md);
  files.push(dialoguePath);

  // Write storyboard_prompts.json (image generation)
  const storyboardPath = resolve(bundlePath, 'storyboard_prompts.json');
  writeFileSync(storyboardPath, JSON.stringify(bundle.storyboard_prompts, null, 2));
  files.push(storyboardPath);

  // Write continuity_report.md
  const continuityPath = resolve(bundlePath, 'continuity_report.md');
  writeFileSync(continuityPath, bundle.continuity_report);
  files.push(continuityPath);

  // Write manifest.json
  const manifestPath = resolve(buildPath, 'manifest.json');
  const manifest = {
    chapter_id: bundle.chapter_id,
    title: bundle.title,
    description: bundle.description,
    created_at: new Date().toISOString(),
    panel_count: bundle.script.panels.length,
    choice_points: bundle.script.choice_points.length,
    style_id: bundle.script.style_id,
    files: {
      script: 'script.json',
      capture: 'capture.md',
      dialogue: 'dialogue.md',
      storyboard_prompts: 'storyboard_prompts.json',
      continuity_report: 'continuity_report.md'
    }
  };
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  files.push(manifestPath);

  return { bundlePath, files };
}

/**
 * Write root-level mirror file for backward compatibility
 */
export function writeRootMirror(chapterId: string, captureMd: string, versionNumber: number = 3): string {
  const rootPath = resolve(__dirname, `../../Chapter ${chapterId.split('_')[1]} Capture v${versionNumber.toString().padStart(2, '0')}.md`);
  writeFileSync(rootPath, captureMd);
  return rootPath;
}

/**
 * Generate capture.md from script.json
 */
export function generateCaptureMd(script: any): string {
  const lines: string[] = [
    `# ${script.chapter_id}`,
    '',
    `**Title:** ${script.title || '(untitled)'}`,
    `**Style:** ${script.style_id}`,
    `**Panels:** ${script.panels.length}`,
    `**Choice Points:** ${script.choice_points.length}`,
    '',
    '---',
    ''
  ];

  script.panels.forEach((panel: any) => {
    lines.push(`## Panel ${panel.panel_id}: ${panel.location}`);
    lines.push(`**Shot:** ${panel.shot}`);
    lines.push('');

    lines.push('**Visual:**');
    panel.visual_notes.forEach((note: string) => {
      lines.push(`- ${note}`);
    });
    lines.push('');

    if (panel.characters.length > 0) {
      lines.push(`**Characters:** ${panel.characters.join(', ')}`);
      lines.push('');
    }

    if (panel.dialogue.length > 0) {
      lines.push('**Dialogue:**');
      panel.dialogue.forEach((line: any) => {
        lines.push(`- **${line.speaker}:** "${line.text}"`);
      });
      lines.push('');
    }

    if (panel.sfx && panel.sfx.length > 0) {
      lines.push(`**SFX:** ${panel.sfx.join(' | ')}`);
      lines.push('');
    }

    if (panel.thought) {
      lines.push(`**Thought:** "${panel.thought}"`);
      lines.push('');
    }

    if (panel.on_panel_text && panel.on_panel_text.length > 0) {
      lines.push('**On-Panel Text:**');
      panel.on_panel_text.forEach((text: string) => {
        lines.push(`- ${text}`);
      });
      lines.push('');
    }

    if (panel.notes) {
      lines.push(`**Notes:** ${panel.notes}`);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  });

  if (script.choice_points.length > 0) {
    lines.push('## Choice Points');
    lines.push('');

    script.choice_points.forEach((choice: any) => {
      lines.push(`### Panel ${choice.panel_id}`);
      lines.push(`**Q:** ${choice.question}`);
      lines.push('');
      choice.choices.forEach((opt: any, idx: number) => {
        lines.push(`${idx + 1}. "${opt.text}" → Panel ${opt.leads_to_panel}`);
      });
      lines.push('');
    });
  }

  return lines.join('\n');
}
