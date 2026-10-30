// 測試用假觀測程式：讀 <SOS_DATA>/fake-observe.json 照出；同真觀測程式一樣只收雜湊清單，會話有 cwd 就按雜湊（連上層資料夾）篩。
// 收到嘅 stdin 原樣寫入 <SOS_DATA>/fake-observe-input.json，等測試核對伺服器冇交路徑。
// {"mode":"garbage"} 出亂碼；{"mode":"hang"} 唔答（測硬上限）；{"delayMs":n} 等 n 毫秒先答（測 2.5 秒「觀測逾時」）
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
const D = process.env.SOS_DATA || '.';
let cfg = {};
try { cfg = JSON.parse(fs.readFileSync(path.join(D, 'fake-observe.json'), 'utf8')); } catch { }
let input = '';
try { input = fs.readFileSync(0, 'utf8'); } catch { }
try { fs.writeFileSync(path.join(D, 'fake-observe-input.json'), input); } catch { }
let hashes = new Set();
try { hashes = new Set((JSON.parse(input).folders || []).map(f => f.hash)); } catch { }
const normFolder = p => { const s = path.resolve(String(p)).replace(/\\/g, '/').replace(/\/+$/, ''); return process.platform === 'win32' ? s.toLowerCase() : s; };
const folderHash = p => crypto.createHash('sha256').update(normFolder(p)).digest('hex');
function inScope(cwd) { for (let p = path.resolve(cwd), i = 0; i < 64; i++) { if (hashes.has(folderHash(p))) return true; const up = path.dirname(p); if (up === p) return false; p = up; } return false; }
const answer = () => process.stdout.write(JSON.stringify({ ok: true, host: 'claude', sessions: (cfg.sessions || []).filter(s => !s.cwd || inScope(s.cwd)), problems: cfg.problems || [] }) + '\n');
if (cfg.mode === 'garbage') process.stdout.write('not json\n');
else if (cfg.mode === 'hang') setTimeout(() => { }, 60000);
else if (cfg.delayMs) setTimeout(answer, Number(cfg.delayMs));
else answer();
