// 測試共用：放公司概覽樣本、用測試 AI 做認證
import fs from 'node:fs';
import path from 'node:path';
const sleep = ms => new Promise(r => setTimeout(r, ms));

// 用 fixtures 嘅樣本做公司概覽（等同 AI 已經擬好）
export function seedCompany(DATA, PROTO, file = 'sample-company-page.js') {
  const t = fs.readFileSync(path.join(PROTO, 'fixtures', file), 'utf8').replace(/^﻿/, '').trim()
    .replace(/^window\.STARTUP_OS_PAGE\s*=\s*/, '').replace(/;\s*$/, '');
  fs.mkdirSync(path.join(DATA, 'company'), { recursive: true });
  fs.writeFileSync(path.join(DATA, 'company', 'page.json'), JSON.stringify(JSON.parse(t), null, 2));
}

// 經系統設定介面認證測試 AI；回傳最後狀態
export async function certify(BASE, host = 'test') {
  const origin = BASE.replace(/\/$/, '');
  const r = await fetch(origin + '/api/setup', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify({ action: 'certify', host }) });
  if (r.status !== 202) throw new Error('certify start ' + r.status);
  for (let i = 0; i < 120; i++) {
    await sleep(500);
    const s = await (await fetch(origin + '/api/setup')).json();
    if (s.certify && s.certify.state !== 'running') return s;
  }
  throw new Error('certify timeout');
}

// 直接寫認證紀錄（同認證程式一樣嘅雜湊同版本），開機補做測試唔使先起伺服器
export async function certifyDirect(DATA, PROTO, adapterPath) {
  const { pathToFileURL } = await import('node:url');
  const lib = await import(pathToFileURL(path.join(PROTO, 'host-lib.mjs')).href);
  const h = { ...JSON.parse(fs.readFileSync(adapterPath, 'utf8')), file: path.resolve(adapterPath) };
  h.id = h.id || 'test';
  fs.mkdirSync(path.join(DATA, 'ledger'), { recursive: true });
  fs.writeFileSync(path.join(DATA, 'ledger', 'adapter-cert.json'), JSON.stringify({ host: h.file, label: h.label || h.name, certifiedAt: new Date().toISOString(), version: lib.version(h), argsHash: lib.hashHost(h), results: [] }));
}
