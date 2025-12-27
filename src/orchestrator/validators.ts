import Ajv from 'ajv';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const ajv = new Ajv();

// Load schema
const schemaPath = resolve(__dirname, '../../schemas/chapter_script.schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
const validate = ajv.compile(schema);

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate chapter script against JSON schema
 */
export function validateSchema(scriptData: any): ValidationResult {
  const result: ValidationResult = { valid: false, errors: [], warnings: [] };

  if (!validate(scriptData)) {
    result.errors = validate.errors?.map(err => `${err.instancePath} ${err.message}`) || [];
    return result;
  }

  result.valid = true;
  return result;
}

/**
 * Canon checks for WORTHY Ch. 1
 */
export function validateWorthyCanon(scriptData: any, chapterId: string): ValidationResult {
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };

  if (chapterId !== 'ch01_opening') {
    // Canon checks only for Chapter 1
    return result;
  }

  const allText = JSON.stringify(scriptData).toLowerCase();
  const visualText = scriptData.panels.map((p: any) => p.visual_notes.join(' ').toLowerCase()).join(' ');

  // Required beats (keywords)
  const requiredBeats = [
    { keyword: 'grave', label: 'mass grave' },
    { keyword: 'mark', label: 'MC Mark/rash' },
    { keyword: 'scavenger', label: 'scavengers' },
    { keyword: 'mom', label: '"mom" misdirect line' }
  ];

  requiredBeats.forEach(beat => {
    if (!allText.includes(beat.keyword)) {
      result.warnings.push(`Missing canon beat: ${beat.label}`);
    }
  });

  // Check for overlong exposition (> 60 words per block)
  scriptData.panels.forEach((panel: any, idx: number) => {
    panel.dialogue.forEach((line: any) => {
      const wordCount = line.text.split(/\s+/).length;
      if (wordCount > 18) {
        result.warnings.push(
          `Panel ${panel.panel_id}: Dialogue too long (${wordCount} words, recommended < 18): "${line.text.substring(0, 50)}..."`
        );
      }
    });

    if (panel.on_panel_text) {
      panel.on_panel_text.forEach((text: string) => {
        const wordCount = text.split(/\s+/).length;
        if (wordCount > 20) {
          result.warnings.push(
            `Panel ${panel.panel_id}: On-panel text too long (${wordCount} words): "${text.substring(0, 50)}..."`
          );
        }
      });
    }
  });

  // Check for Filter lecture (should not appear in Ch. 1)
  if (allText.includes('filter') && allText.match(/filter.*explain|filter.*lecture|filter.*rule/i)) {
    result.warnings.push('Warning: Ch. 1 should not lecture about The Filter. Keep it as vague rumor only.');
  }

  // Check for Five Pillars lecture (should not appear in Ch. 1)
  if (allText.match(/five pillar.*explain|five pillar.*system|core.*body.*mind.*flow/i)) {
    result.warnings.push('Warning: Ch. 1 should not explain Five Pillars system. Keep it implicit.');
  }

  return result;
}

/**
 * Run all validations
 */
export function validateChapterScript(scriptData: any, chapterId: string): ValidationResult {
  const schemaResult = validateSchema(scriptData);
  if (!schemaResult.valid) {
    return schemaResult;
  }

  const canonResult = validateWorthyCanon(scriptData, chapterId);
  return {
    valid: canonResult.errors.length === 0,
    errors: canonResult.errors,
    warnings: canonResult.warnings
  };
}
