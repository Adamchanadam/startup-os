// 列出資料夾（唔包 data/、demo-data/）每份檔嘅 SHA-256，同清單比較
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto';
const [DIR, LIST] = process.argv.slice(2);
const now = {};
(function walk(d, rel) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const r = rel ? rel + '/' + e.name : e.name; if (!rel && (e.name === 'data' || e.name === 'demo-data')) continue; const p = path.join(d, e.name); if (e.isDirectory()) walk(p, r); else if (e.isFile()) now[r] = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'); } })(DIR, '');
const old = Object.fromEntries(fs.readFileSync(LIST, 'utf8').split('\n').filter(Boolean).map(l => { const [h, , f] = l.split('  '); return [f, h]; }));
const changed = Object.keys(now).filter(f => old[f] && old[f] !== now[f]), added = Object.keys(now).filter(f => !old[f]), removed = Object.keys(old).filter(f => !now[f]);
console.log(JSON.stringify({ files: Object.keys(now).length, changed, added, removed }, null, 1));
