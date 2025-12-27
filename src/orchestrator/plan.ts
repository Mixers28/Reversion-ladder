/**
 * Convert user narrative input into a structured chapter plan
 */

export interface ChapterPlan {
  chapter_id: string;
  title: string;
  description: string;
  style_id: string;
  panel_count: number;
  user_narrative: string;
  key_beats: string[];
  pacing_notes: string;
  character_list: string[];
}

export function parseNarativeInput(input: string): Partial<ChapterPlan> {
  // Parse command-line arguments from process.argv directly
  const argv = process.argv.slice(2);
  
  const result: Partial<ChapterPlan> = {
    panel_count: 20,
    style_id: 'grave_black_ink',
    key_beats: [],
    character_list: []
  };

  // Parse argv array
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    
    if (arg === '--id' && i + 1 < argv.length) {
      result.chapter_id = argv[++i];
    } else if (arg === '--title' && i + 1 < argv.length) {
      result.title = argv[++i];
    } else if (arg === '--panels' && i + 1 < argv.length) {
      result.panel_count = parseInt(argv[++i]);
    } else if (arg === '--style' && i + 1 < argv.length) {
      result.style_id = argv[++i];
    } else if (arg === '--narrative' && i + 1 < argv.length) {
      result.user_narrative = argv[++i];
    } else if (arg === '--description' && i + 1 < argv.length) {
      result.description = argv[++i];
    }
  }

  return result;
}

export function createChapterPlan(
  chapter_id: string,
  title: string,
  description: string,
  style_id: string,
  panel_count: number,
  user_narrative: string
): ChapterPlan {
  // Extract likely characters and beats from narrative
  const characters = extractCharacters(user_narrative);
  const beats = extractBeats(user_narrative);

  return {
    chapter_id,
    title,
    description,
    style_id,
    panel_count,
    user_narrative,
    key_beats: beats,
    pacing_notes: generatePacingNotes(panel_count, beats.length),
    character_list: characters
  };
}

function extractCharacters(narrative: string): string[] {
  // Simple heuristic: capitalize words that might be character names
  const words = narrative.split(/\s+/);
  const potentialChars = new Set<string>();

  words.forEach((word, idx) => {
    if (word[0]?.match(/[A-Z]/)) {
      const clean = word.replace(/[,.:;!?'"]/g, '');
      if (clean.length > 2 && clean !== 'The' && clean !== 'A' && clean !== 'I') {
        potentialChars.add(clean);
      }
    }
  });

  // Always include MC
  potentialChars.add('MC');

  return Array.from(potentialChars).slice(0, 10); // Limit to 10
}

function extractBeats(narrative: string): string[] {
  // Look for action verbs and key moments
  const actionPatterns = [
    /wakes? up/i,
    /finds? /i,
    /discovers? /i,
    /chooses? /i,
    /escapes? /i,
    /meets? /i,
    /fights? /i,
    /reveals? /i,
    /cliffhanger/i,
    /horn/i,
    /scouts/i,
    /grave/i,
    /mark/i,
    /rash/i
  ];

  const beats: string[] = [];
  actionPatterns.forEach(pattern => {
    if (pattern.test(narrative)) {
      const match = narrative.match(pattern);
      if (match) beats.push(match[0]);
    }
  });

  return beats;
}

function generatePacingNotes(panelCount: number, beatCount: number): string {
  const panelsPerBeat = Math.floor(panelCount / Math.max(beatCount, 1));
  return `Average ${panelsPerBeat} panels per major beat. Allocate more panels to action/revelation moments, fewer to exposition.`;
}
