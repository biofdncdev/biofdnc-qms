#!/usr/bin/env node
// Convert 'src/asset/Audit Evaluation Items.csv' to 'public/audit-items.json'
// CSV columns:
// 1) number, 2) titleKo, 3) titleEn
// Output: [{ number, titleKo, titleEn }]

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';
import xlsx from 'xlsx';

const root = path.resolve(process.cwd());
const srcPath = path.resolve(root, 'src/asset', 'Audit Evaluation Items.csv');
const outDir = path.resolve(root, 'public');
const outPath = path.resolve(outDir, 'audit-items.json');
const hashPath = path.resolve(outDir, 'audit-items.hash.txt');

if (!fs.existsSync(srcPath)) {
  console.error('Input Excel file not found:', srcPath);
  process.exit(1);
}

const wb = xlsx.readFile(srcPath, { type: 'file' });
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false });

const items = [];
for (let r = 0; r < rows.length; r++) {
  const row = rows[r] || [];
  const num = parseInt((row[0] || '').toString().trim(), 10);
  const titleKo = (row[1] || '').toString().trim();
  const titleEn = (row[2] || '').toString().trim();
  if (!Number.isFinite(num)) continue;
  items.push({ number: num, titleKo, titleEn });
}

fs.mkdirSync(outDir, { recursive: true });
const json = JSON.stringify(items, null, 2);
fs.writeFileSync(outPath, json, 'utf-8');
const hash = crypto.createHash('md5').update(json).digest('hex');
fs.writeFileSync(hashPath, hash, 'utf-8');
console.log(`Wrote ${items.length} items -> ${outPath}`);
console.log(`Hash -> ${hashPath}: ${hash}`);


