// Fills the empty [data-t] / [data-list] elements of the plain-HTML apps with their Hebrew text at build time,
// so search engines, link previews, AI assistants and visitors without JavaScript see real content.
// The page's own script still repaints everything in the visitor's language when it runs.
// Usage: node tools/bake-text.mjs out/crypto/index.html out/penina/index.html
// © 2026 Bar Lvovski. All rights reserved.
import fs from 'node:fs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

for (const file of process.argv.slice(2)) {
  let html = fs.readFileSync(file, 'utf8');
  const start = html.indexOf('const T={');
  if (start < 0) { console.log(`skip ${file}: no dictionary`); continue; }
  // the dictionary ends at the first "};" that closes it at top level
  let depth = 0, i = start + 'const T='.length, end = -1, q = null;
  for (; i < html.length; i++) {
    const c = html[i];
    if (q) { if (c === '\\') { i++; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  const T = new Function(`return ${html.slice(start + 'const T='.length, end)}`)();
  const he = T.he, get = (k) => k.split('.').reduce((o, p) => (o == null ? o : o[p]), he);
  let n = 0;
  // <tag ... data-t="key" ...></tag>  →  same tag with the Hebrew text inside (only when empty)
  html = html.replace(/(<([a-z0-9]+)\b[^>]*\sdata-t="([^"]+)"[^>]*>)(<\/\2>)/g, (m, open, tag, key, close) => {
    const v = get(key);
    if (typeof v !== 'string' || key.startsWith('admin')) return m; // the admin panel stays empty until the owner signs in
    n++; return open + esc(v) + close;
  });
  html = html.replace(/(<(ol|ul)\b[^>]*\sdata-list="([^"]+)"[^>]*>)(<\/\2>)/g, (m, open, tag, key, close) => {
    const v = get(key);
    if (!Array.isArray(v)) return m;
    n++; return open + v.map((x) => `<li>${esc(x)}</li>`).join('') + close;
  });
  fs.writeFileSync(file, html);
  console.log(`${file}: ${n} elements filled`);
}
