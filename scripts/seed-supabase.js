#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const narrativeFile = path.join(__dirname, '../Reverson Ladder.json');
const narrative = JSON.parse(fs.readFileSync(narrativeFile, 'utf8'));

const { panels, choice_points } = narrative;

function escapeSql(str) {
  return str.replace(/'/g, "''");
}

const panelsJson = escapeSql(JSON.stringify(panels));
const choicesJson = escapeSql(JSON.stringify(choice_points));

const sql = `INSERT INTO chapters (id, title, description, panels, choice_points, status)
VALUES (
  'ch01_opening',
  'Chapter 1: The Tribunal',
  'The Tribunal judges an ex-apex cultivator. A fall. A crack. A mortal realm awakening.',
  '${panelsJson}'::jsonb,
  '${choicesJson}'::jsonb,
  'published'
);`;

console.log(sql);
console.log('\n-- Copy the above SQL and paste into: Supabase Dashboard → SQL Editor');
console.log('-- Then click "Execute"');
