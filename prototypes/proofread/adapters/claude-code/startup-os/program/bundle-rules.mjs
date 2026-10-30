// 程式檔清單（MVP 規格 2026-10-29 第 2 節第 1、6 項）：安裝（install.mjs）同插件打包（build-plugin.mjs）共用同一張排除清單。
// 次序：先排除插件資料夾本身同市集資訊資料夾（避免將插件複製入插件），再排除資料、示範、設計稿、截圖、交接筆記。
// fixtures/ 唔排除：交資料、情景演練、紅藍對打、示範種子都要讀入面嘅虛構範本（「從田間到餐桌」），排除咗交資料會失敗。
import fs from 'node:fs';
import path from 'node:path';

export const EXCLUDE_PATHS = ['adapters/claude-code/startup-os', 'adapters/claude-code/.claude-plugin'];
export const EXCLUDE_TOP = ['data', 'demo-data', 'mockups', 'screenshots', 'PROTOTYPE-HANDOFF.md', 'node_modules', '.git'];
// 安裝時另外唔帶嘅開發用檔（安裝後由安裝命令自己生成或者用唔着）
export const INSTALL_SKIP = ['VERSION', 'START-HERE.md', 'run-schedule.cmd', 'run-schedule.sh', '開始.cmd', 'start-here-template.md'];

// 列出程式檔（相對路徑，用「/」分隔，按字母排）
export function programFiles(root, extraSkip = []) {
  const out = [];
  (function walk(dir, rel) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const r = rel ? rel + '/' + e.name : e.name;
      if (EXCLUDE_PATHS.includes(r)) continue;
      if (!rel && (EXCLUDE_TOP.includes(e.name) || extraSkip.includes(e.name))) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, r); else if (e.isFile()) out.push(r);
    }
  })(root, '');
  return out.sort();
}

// 版本號：插件資訊檔（喺插件入面行：program/../.claude-plugin；喺原型行：adapters/claude-code/startup-os/.claude-plugin）
export function pluginVersion(root) {
  for (const f of [path.join(root, '..', '.claude-plugin', 'plugin.json'), path.join(root, 'adapters', 'claude-code', 'startup-os', '.claude-plugin', 'plugin.json'), path.join(root, 'VERSION')]) {
    try {
      const t = fs.readFileSync(f, 'utf8');
      const v = f.endsWith('.json') ? JSON.parse(t).version : t.trim();
      if (/^\d+\.\d+\.\d+$/.test(String(v))) return String(v);
    } catch { }
  }
  return '';
}
