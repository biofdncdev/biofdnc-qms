import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve('frontend/docs/rmd-source/data');
const OUT_DIR = path.resolve('frontend/public/rmd');

function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

function readFiles(dir){
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.js'));
}

function extractJSX(source){
  // crude: get between return ( ... )
  const m = source.match(/return\s*\(([\s\S]*?)\);/);
  return m ? m[1] : '';
}

function replaceAll(s, pairs){
  let out = s;
  for (const [a, b] of pairs){ out = out.replace(a, b); }
  return out;
}

function convertTables(html){
  // thead: convert TableHead block with th
  html = html.replace(/<TableHead[^>]*>([\s\S]*?)<\/TableHead>/g, (_, inner) => {
    let t = inner
      .replace(/<TableRow[^>]*>/g, '<tr>')
      .replace(/<\/TableRow>/g, '</tr>')
      .replace(/<TableCell[^>]*>/g, '<th>')
      .replace(/<\/TableCell>/g, '</th>');
    return `<thead>${t}</thead>`;
  });
  // tbody rows
  html = html.replace(/<TableBody[^>]*>([\s\S]*?)<\/TableBody>/g, (_, inner) => {
    let t = inner
      .replace(/<TableRow[^>]*>/g, '<tr>')
      .replace(/<\/TableRow>/g, '</tr>')
      .replace(/<TableCell[^>]*>/g, '<td>')
      .replace(/<\/TableCell>/g, '</td>');
    return `<tbody>${t}</tbody>`;
  });
  // table tag
  html = html.replace(/<Table[^>]*>/g, '<table class="table">')
             .replace(/<\/Table>/g, '</table>');
  // remove TableContainer/Paper wrappers
  html = html.replace(/<TableContainer[^>]*>/g, '')
             .replace(/<\/TableContainer>/g, '')
             .replace(/<Paper[^>]*>/g, '')
             .replace(/<\/Paper>/g, '');
  return html;
}

function convertLists(html){
  // map StyledListItem with paddingLeft to depth classes
  html = html.replace(/<StyledListItem([^>]*)>/g, (m, attrs) => {
    let level = 1;
    const pxMatch = attrs && attrs.match(/paddingLeft\s*:\s*['\"]?(\d+)px/);
    if (pxMatch) {
      const px = parseInt(pxMatch[1], 10);
      if (px >= 60) level = 3;
      else if (px >= 40) level = 2;
    }
    return level > 1 ? `<li class=\"d${level}\">` : '<li>';
  });
  html = html.replace(/<\/StyledListItem>/g, '</li>')
             .replace(/<StyledList[^>]*>/g, '<ul>')
             .replace(/<\/StyledList>/g, '</ul>');
  return html;
}

function convertTypography(html){
  html = html.replace(/<SectionTitle[^>]*>/g, '<h2>')
             .replace(/<\/SectionTitle>/g, '</h2>')
             .replace(/<SubsectionTitle[^>]*>/g, '<h3>')
             .replace(/<\/SubsectionTitle>/g, '</h3>')
             .replace(/<Paragraph[^>]*>/g, '<p>')
             .replace(/<\/Paragraph>/g, '</p>')
             .replace(/<Typography[^>]*variant="subtitle1"[^>]*>/g, '<h3>')
             .replace(/<Typography[^>]*>/g, '<p>')
             .replace(/<\/Typography>/g, '</p>');
  return html;
}

function convertContainers(html){
  html = html.replace(/<Divider[^>]*\/>/g, '<hr />')
             .replace(/<Box[^>]*>/g, '<div>')
             .replace(/<\/Box>/g, '</div>');
  return html;
}

function sanitize(html){
  // strip comments and leftover imports/exports
  return html
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\{\s*\/\/.*?\}/g, '')
    .replace(/\n\s*\n\s*\n/g, '\n\n');
}

function wrap(html){
  return `<div class="doc">\n${html}\n</div>\n`;
}

function convertFile(srcPath){
  const raw = fs.readFileSync(srcPath, 'utf8');
  const jsx = extractJSX(raw);
  if (!jsx) return null;
  let html = jsx;
  html = convertTables(html);
  html = convertLists(html);
  html = convertTypography(html);
  html = convertContainers(html);
  html = sanitize(html);
  html = wrap(html);
  return html;
}

function outName(file){
  // e.g. BF-RM-GM-01_Content.js -> BF-RM-GM-01.html
  const base = path.basename(file).replace('_Content.js', '').replace('.js','');
  return `${base}.html`;
}

function main(){
  ensureDir(OUT_DIR);
  const files = readFiles(SRC_DIR);
  if (!files.length){
    console.log('No source files found in', SRC_DIR);
    return;
  }
  let ok = 0, fail = 0;
  for (const f of files){
    try{
      const html = convertFile(path.join(SRC_DIR, f));
      if (!html) { fail++; continue; }
      const out = path.join(OUT_DIR, outName(f));
      fs.writeFileSync(out, html, 'utf8');
      ok++;
    }catch(e){
      console.error('Failed to convert', f, e.message);
      fail++;
    }
  }
  console.log(`Converted ${ok} files. Failed: ${fail}`);
}

main();
