// 測試用假對手：讀 stdin 嘅 stream-json，每句回一個 result（扮對方加旁白；覆盤模型就回覆盤 JSON）
import fs from 'node:fs';
import readline from 'node:readline';
const [system, model] = process.argv.slice(2);
const sys = fs.existsSync(system) ? fs.readFileSync(system, 'utf8') : '';
let n = 0;
const out = o => process.stdout.write(JSON.stringify(o) + '\n');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', async line => {
  let j = null; try { j = JSON.parse(line); } catch { return; }
  const text = String(j.message && j.message.content || '');
  await new Promise(r => setTimeout(r, 250));
  if (model === 'review') {
    out({ type: 'result', is_error: false, total_cost_usd: 0, result: JSON.stringify({
      summary: '對方由謹慎變到肯試，最在意收錢快同保底價。', goal: { met: 'partly', why: '答應試供一週，未肯簽三個月' },
      questions: [{ id: 'Q1', asked: true, note: '問得好' }, { id: 'Q2', asked: false, note: '冇問浪費量' }],
      objections: [{ id: 'O1', raised: true, handled: 'good', note: '講清楚上門收' }, { id: 'O2', raised: true, handled: 'weak', note: '冇講半月結' }],
      why: [{ moment: '月結太長', reason: '佢周轉緊張', personaKey: 'interests' }],
      hidden: [{ id: 'H1', surfaced: false, note: '冇問批發商近況' }],
      fixes: ['先問佢而家點收錢'], betterLines: [{ instead: '我哋月結', try: '首兩個月可以半月結' }],
      card: { opening: '丙生，多謝你抽時間。', questions: ['批發商幾耐俾錢？', '每週有幾多菜要平賣？'], objections: [{ if: '月結太長', say: '首兩個月半月結' }], closing: '不如先試供一週，下週三我上門收？' } }) });
    return;
  }
  n++;
  const asked = /[？?]|幾|點樣/.test(text) ? ['Q' + n] : [];
  const handled = /保底|半月|後備|上門|免費/.test(text) ? ['O' + Math.max(1, n - 1)] : [];
  const tags = { mood: n >= 3 ? '有興趣' : '謹慎', moodScore: n >= 3 ? 1 : 0, raised: ['O' + n], handled, asked, goal: n >= 4 ? 2 : n >= 2 ? 1 : 0, suggestions: ['測試建議一 ' + n, '測試建議二 ' + n, '測試建議三 ' + n], hint: '測試提示 ' + n };
  out({ type: 'result', is_error: false, total_cost_usd: 0, result: `測試對方回應第 ${n} 句。\n#旁白\n${JSON.stringify(tags)}` });
});
