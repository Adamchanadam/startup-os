// 記錄 4380 真實 data/ 嘅檔案數目同最後修改時間（試走前後各一次；只讀）
import fs from 'node:fs';
import path from 'node:path';
const [DIR, LABEL, OUT] = process.argv.slice(2);
let n = 0, latest = 0, latestFile = '';
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else { n++; const t = fs.statSync(p).mtimeMs; if (t > latest) { latest = t; latestFile = path.relative(DIR, p); } } } })(DIR);
const rec = { label: LABEL, at: new Date().toISOString(), files: n, latestModified: new Date(latest).toISOString(), latestFile: latestFile.replace(/\\/g, '/') };
fs.appendFileSync(OUT, JSON.stringify(rec) + '\n');
console.log(JSON.stringify(rec));
