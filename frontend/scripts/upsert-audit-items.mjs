#!/usr/bin/env node
// Upsert items from public/audit-items.json into Supabase table audit_items
// Usage:
//   SUPABASE_URL=... SUPABASE_KEY=... node frontend/scripts/upsert-audit-items.mjs
// Notes:
// - SUPABASE_KEY can be anon key if RLS allows insert for authenticated; otherwise use service role in a secure environment.

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

const root = path.resolve(process.cwd());
const jsonPath = path.resolve(root, 'public', 'audit-items.json');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY){
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in environment.');
  process.exit(1);
}

if (!fs.existsSync(jsonPath)){
  console.error('Input JSON not found:', jsonPath);
  process.exit(1);
}

const items = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
if (!Array.isArray(items) || items.length===0){
  console.error('No items to upsert.');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const rows = items.map(x => ({ id: x.id, title_ko: x.titleKo, title_en: x.titleEn }));

async function run(){
  const BATCH = 200;
  let total = 0;
  for (let i=0;i<rows.length;i+=BATCH){
    const part = rows.slice(i, i+BATCH);
    const { error } = await supabase.from('audit_items').upsert(part, { onConflict: 'id' });
    if (error){
      console.error('Upsert failed on batch', i, error.message || error);
      process.exit(1);
    }
    total += part.length;
    console.log(`Upserted ${total}/${rows.length}`);
  }
  console.log('Done.');
}

run().catch(err=>{ console.error(err); process.exit(1); });


