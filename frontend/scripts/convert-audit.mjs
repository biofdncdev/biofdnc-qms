#!/usr/bin/env node
// Convert 'src/asset/Audit 질문지.xlsx' to 'public/audit-items.json'
// Columns:
// - A~C: Title (joined with spaces)
// - D, E: Sub-titles (joined with ' | ')
// Output schema: [{ id, titleKo, titleEn }]

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import xlsx from 'xlsx';

const root = path.resolve(process.cwd());
const srcPath = path.resolve(root, 'src/asset', 'Audit 질문지.xlsx');
const outDir = path.resolve(root, 'public');
const outPath = path.resolve(outDir, 'audit-items.json');

if (!fs.existsSync(srcPath)) {
  console.error('Input Excel file not found:', srcPath);
  process.exit(1);
}

const wb = xlsx.readFile(srcPath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false });

// Expect headers like: [A,B,C,D,E]
// We will scan all rows, pick tuples of C,D,E; A/B optional
const result = [];
let id = 1;
for (let r = 0; r < rows.length; r++) {
  const row = rows[r] || [];
  const colA = (row[0] || '').toString().trim();
  const colB = (row[1] || '').toString().trim();
  const colC = (row[2] || '').toString().trim();
  const colD = (row[3] || '').toString().trim();
  const colE = (row[4] || '').toString().trim();
  // Heuristic: treat as valid when column C (main question) exists
  if (!colC) continue;
  const title = [colA, colB, colC].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  const sub = [colD, colE].filter(Boolean).join(' | ').replace(/\s+/g,' ').trim();
  result.push({ id, titleKo: title, titleEn: sub });
  id++;
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
console.log(`Wrote ${result.length} items ->`, outPath);


