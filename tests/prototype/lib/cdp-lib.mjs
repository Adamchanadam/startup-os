// 無頭 Chrome 小工具：開頁、等、撳、截圖（元素範圍）
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function openChrome(CHROME, profile, cport) {
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars', `--remote-debugging-port=${cport}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
  async function json(u) { for (let i = 0; i < 80; i++) { try { const r = await fetch(u); if (r.ok) return await r.json(); } catch { } await sleep(250); } throw new Error('devtools'); }
  const pg = (await json(`http://127.0.0.1:${cport}/json/list`)).find(t => t.type === 'page');
  const ws = new WebSocket(pg.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let seq = 0; const pend = new Map(); const errors = [];
  ws.onmessage = m => {
    const d = JSON.parse(m.data);
    if (d.id && pend.has(d.id)) { const p = pend.get(d.id); pend.delete(d.id); d.error ? p.rej(new Error(JSON.stringify(d.error))) : p.res(d.result); }
    if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text);
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++seq; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Page.enable'); await send('Runtime.enable');
  const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(e.slice(0, 80) + ' -> ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text)); return r.result.value; };
  let W = 1440;
  const H = w => w === 390 ? 844 : w === 1024 ? 768 : 900;
  async function go(url, w = 1440, wait = 1600) { W = w; await send('Emulation.setDeviceMetricsOverride', { width: w, height: H(w), deviceScaleFactor: 1, mobile: w < 600 }); await send('Page.navigate', { url }); await sleep(wait); }
  async function click(sel) {
    await ev(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({block:'center'})`); await sleep(150);
    const r = await ev(`(()=>{const r=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: r.x, y: r.y, button: 'left', buttons: 1, clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: r.x, y: r.y, button: 'left', buttons: 0, clickCount: 1 });
    await sleep(500);
  }
  async function type(sel, text) { await ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});e.focus();e.value='';})()`); await send('Input.insertText', { text }); await ev(`document.querySelector(${JSON.stringify(sel)}).dispatchEvent(new Event('input',{bubbles:true}))`); }
  // 截圖：sel 有就影嗰個元素（可以好長）；冇就影而家畫面；full 就影整頁
  async function shot(file, sel, { full = false, pad = 12, maxH = 9000, height = 0 } = {}) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    if (sel || full) {
      const box = await ev(`(()=>{const e=${sel ? `document.querySelector(${JSON.stringify(sel)})` : 'document.documentElement'};const r=e.getBoundingClientRect();return {y:r.top+window.scrollY,h:${sel ? 'r.height' : 'document.documentElement.scrollHeight'}}})()`);
      const total = await ev('document.documentElement.scrollHeight');
      await send('Emulation.setDeviceMetricsOverride', { width: W, height: Math.min(Math.max(total, H(W)), 16000), deviceScaleFactor: 1, mobile: W < 600 });
      await sleep(400);
      const y = Math.max(0, box.y - pad), h = Math.min(height || box.h + pad * 2, maxH, total - Math.max(0, box.y - pad));
      const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y, width: W, height: h, scale: 1 } });
      fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
      await send('Emulation.setDeviceMetricsOverride', { width: W, height: H(W), deviceScaleFactor: 1, mobile: W < 600 }); await sleep(250);
      return;
    }
    const r = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(file, Buffer.from(r.data, 'base64'));
  }
  return { send, ev, go, click, type, shot, errors, close: () => { try { ws.close(); } catch { } chrome.kill(); }, width: () => W };
}
