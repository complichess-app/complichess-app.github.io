/* Barusik Crypto: the wallet half of the server page. © 2026 Bar Lvovski. All rights reserved.
   The wallets run on this computer (Wasabi for BTC, monero-wallet-rpc for XMR). This page reaches them only through the extension,
   which only talks to 127.0.0.1. It hands out deposit addresses, credits confirmed deposits, and sends a withdrawal only when Bar
   presses "send" here. Seeds, keys and wallet passwords never leave this computer. */
(() => {
'use strict';
const B = window.BS; if (!B) return;
const { sb, esc, tick, every, hasExt } = B;
const box = document.createElement('div'); box.className = 'wrap'; box.style.marginTop = '14px'; box.id = 'wallets';
document.body.appendChild(box);
const $ = (id) => document.getElementById(id);
const ASSETS = { BTC: { dp: 8, unit: 1e8, name: 'ביטקוין (Wasabi)' }, XMR: { dp: 12, unit: 1e12, name: 'מונרו (monero-wallet-rpc)' } };
let ON = false, ST = null, CFG = null, conn = { BTC: null, XMR: null }, wbal = { BTC: null, XMR: null }, LOG = [], busy = false, seq = 0;
const log = (t) => { LOG.unshift(new Date().toLocaleTimeString('he-IL') + ' · ' + t); LOG.length = Math.min(LOG.length, 30); draw(); };
const fmt = (n, a) => Number(n || 0).toFixed(a === 'BTC' ? 8 : 6).replace(/\.?0+$/, '') || '0';
const want = () => { try { return localStorage.getItem('bt-on') !== '0'; } catch { return true; } };

// ---------- the extension ----------
const waiting = new Map();
addEventListener('message', (e) => {
  if (e.source !== window || !e.data || e.data.src !== 'bt-hands-ext' || e.data.type !== 'wallet-result') return;
  const p = waiting.get(e.data.id); if (!p) return; waiting.delete(e.data.id);
  e.data.ok ? p.res(e.data.data) : p.rej(new Error(e.data.error || 'failed'));
});
const ext = (msg, ms = 60000) => new Promise((res, rej) => {
  if (!hasExt()) return rej(new Error('no extension'));
  const id = 'w' + (++seq) + Math.random().toString(36).slice(2, 6); waiting.set(id, { res, rej });
  window.postMessage({ src: 'bt-page-ext', ...msg, id }, location.origin);
  tick(ms).then(() => { if (waiting.has(id)) { waiting.delete(id); rej(new Error('the wallet did not answer')); } });
});
const rpc = (wallet, method, params, ms) => ext({ type: 'wallet', wallet, method, params }, ms);
const extVersion = () => document.documentElement.dataset.btExt || '';
const extOk = () => { const v = extVersion().split('.').map(Number); return v[0] > 1 || (v[0] === 1 && v[1] >= 1); };

// ---------- database ----------
const call = async (fn, args) => { const { data, error } = await sb.rpc(fn, args); if (error) throw new Error(error.message); return data; };
async function load() { try { ST = await call('cw_admin_state'); } catch (e) { ST = { error: e.message }; } draw(); }

// ---------- talk to each wallet ----------
async function check() {
  if (!hasExt() || !extOk()) { conn = { BTC: null, XMR: null }; return; }
  try { CFG = await ext({ type: 'wallet-cfg' }, 8000); } catch { CFG = null; }
  try { const b = await rpc('xmr', 'get_balance', { account_index: 0 }, 8000); wbal.XMR = { all: b.balance / 1e12, free: b.unlocked_balance / 1e12 }; conn.XMR = true; } catch (e) { conn.XMR = String(e.message); }
  try { const w = await rpc('btc', 'getwalletinfo', [], 8000); wbal.BTC = { all: Number(w.balance ?? 0) / 1e8, free: Number(w.balance ?? 0) / 1e8, name: w.walletName }; conn.BTC = true; } catch (e) { conn.BTC = String(e.message); }
}

async function makeAddresses() {
  for (const a of (ST?.addresses || []).filter((x) => x.status === 'queued')) {
    const label = 'barusik ' + a.uid.slice(0, 8);
    try {
      if (a.asset === 'XMR') {
        if (conn.XMR !== true) continue;
        const r = await rpc('xmr', 'create_address', { account_index: 0, label });
        await call('cw_admin_set_address', { p_uid: a.uid, p_asset: 'XMR', p_address: r.address, p_ext: 'sub ' + r.address_index });
      } else {
        if (conn.BTC !== true) continue;
        const r = await rpc('btc', 'getnewaddress', [label]);
        await call('cw_admin_set_address', { p_uid: a.uid, p_asset: 'BTC', p_address: r.address, p_ext: label });
      }
      log(`כתובת ${a.asset} חדשה ללקוח`);
    } catch (e) { log(`יצירת כתובת ${a.asset} נכשלה: ${e.message}`); }
  }
}

async function scanDeposits() {
  const ours = new Set((ST?.addresses || []).filter((x) => x.status === 'done').map((x) => x.asset + ':' + x.address));
  const seen = [];
  if (conn.XMR === true) {
    try {
      const r = await rpc('xmr', 'get_transfers', { in: true, pool: true, account_index: 0 });
      for (const t of [...(r.in || []), ...(r.pool || [])]) if (ours.has('XMR:' + t.address))
        seen.push(['XMR', t.address, t.txid, String(t.subaddr_index?.minor ?? 0), t.amount / 1e12, t.confirmations ?? 0]);
    } catch (e) { log('סריקת מונרו נכשלה: ' + e.message); }
  }
  if (conn.BTC === true) {
    let coins = null;
    try { coins = await rpc('btc', 'listcoins', []); } catch { try { coins = await rpc('btc', 'listunspentcoins', []); } catch (e) { log('סריקת ביטקוין נכשלה: ' + e.message); } }
    for (const c of coins || []) if (ours.has('BTC:' + c.address))
      seen.push(['BTC', c.address, c.txid, String(c.index), Number(c.amount) / 1e8, c.confirmations ?? (c.confirmed ? 1 : 0)]);
  }
  for (const [asset, address, txid, idx, amount, conf] of seen) {
    try {
      const r = await call('cw_admin_deposit', { p_asset: asset, p_address: address, p_txid: txid, p_idx: idx, p_amount: amount, p_conf: conf });
      if (r === 'credited now') log(`הפקדה של ${fmt(amount, asset)} ${asset} נכנסה ליתרת הלקוח`);
    } catch (e) { log('רישום הפקדה נכשל: ' + e.message); }
  }
}

// ---------- sending: only after Bar presses the button and confirms ----------
function coinsFor(coins, sats) {
  const ok = (coins || []).filter((c) => c.confirmed !== false && !c.spentBy).sort((a, b) => b.amount - a.amount), pick = []; let sum = 0;
  for (const c of ok) { pick.push({ transactionid: c.txid, index: c.index }); sum += Number(c.amount); if (sum >= sats + 30000) break; }
  return sum >= sats + 30000 ? pick : null;
}
async function send(w) {
  const what = `${fmt(w.amount, w.asset)} ${w.asset}\nאל: ${w.address}\nלקוח: ${w.email}`;
  let pass = '';
  if (w.asset === 'BTC') { pass = prompt(`שליחה מ-Wasabi\n${what}\n\nסיסמת הארנק ב-Wasabi (לא נשמרת בשום מקום):`); if (pass === null) return; }
  else if (!confirm(`שליחה מארנק המונרו\n${what}\n\nלשלוח עכשיו?`)) return;
  busy = true; draw();
  try { await call('cw_admin_claim', { p_id: w.id }); } catch (e) { busy = false; log('הבקשה כבר לא פתוחה'); await load(); return; }
  let txid = null;
  try {
    if (w.asset === 'XMR') {
      const r = await rpc('xmr', 'transfer', { destinations: [{ amount: Math.round(Number(w.amount) * 1e12), address: w.address }], account_index: 0, priority: 0 }, 120000);
      txid = r.tx_hash;
    } else {
      const sats = Math.round(Number(w.amount) * 1e8);
      let coins; try { coins = await rpc('btc', 'listunspentcoins', []); } catch { coins = []; }
      const pick = coinsFor(coins, sats);
      if (!pick) throw new Error('אין מספיק מטבעות מאושרים בארנק');
      const r = await rpc('btc', 'send', { payments: [{ sendto: w.address, amount: sats, label: 'barusik withdrawal ' + w.id }], coins: pick, feeTarget: 6, password: pass }, 120000);
      txid = r.txid;
    }
  } catch (e) {
    await call('cw_admin_unclaim', { p_id: w.id, p_note: String(e.message).slice(0, 200) }).catch(() => {});
    busy = false; log(`השליחה נכשלה ולא יצא כסף: ${e.message}`); await load(); return;
  }
  try { await call('cw_admin_sent', { p_id: w.id, p_txid: txid }); log(`נשלח ${fmt(w.amount, w.asset)} ${w.asset} · ${txid.slice(0, 12)}…`); }
  catch (e) { log(`נשלח (${txid}) אבל הרישום נכשל: ${e.message}. לסמן ידנית עם ה-txid`); }
  busy = false; await load();
}
async function manual(w) {
  const t = prompt(`שלחת ידנית מהארנק? הדבק את ה-txid של ${fmt(w.amount, w.asset)} ${w.asset}:`);
  if (!t) return;
  try { await call('cw_admin_sent', { p_id: w.id, p_txid: t.trim() }); log('סומן כנשלח'); } catch (e) { log('לא נשמר: ' + e.message); }
  await load();
}
async function reject(w) {
  const n = prompt('למה לדחות? (הלקוח יראה את זה, והכסף חוזר ליתרה שלו)', '');
  if (n === null) return;
  try { await call('cw_admin_reject', { p_id: w.id, p_note: n }); log('נדחה והוחזר ליתרה'); } catch (e) { log(e.message); }
  await load();
}

// ---------- the loop ----------
async function cycle() {
  if (!ON || busy) return;
  await check(); await load();
  if (ST && !ST.error) { await makeAddresses(); await scanDeposits(); await load(); }
}
every(30000, cycle);
window.addEventListener('bs-power', (e) => { ON = !!e.detail; if (ON) { log('שרת הארנקים הופעל'); cycle(); } else { log('שרת הארנקים כובה'); draw(); } });

// ---------- the card ----------
function draw() {
  if (!B.isAdmin()) { box.innerHTML = ''; return; }
  const dot = (v) => v === true ? '<span style="color:var(--on)">● מחובר</span>' : v === null ? '<span class="mute">● לא נבדק</span>' : `<span style="color:var(--off)">● לא מחובר</span> <span class="mute small">${esc(v)}</span>`;
  const owed = ST?.owed || {}, out = ST?.pending_out || {};
  const solv = (a) => wbal[a] ? `<div class="mute small">בארנק: <b>${fmt(wbal[a].all, a)}</b> · חייבים ללקוחות: <b>${fmt(owed[a], a)}</b> · ממתין למשיכה: <b>${fmt(out[a], a)}</b>${wbal[a].all + 1e-12 < Number(owed[a] || 0) + Number(out[a] || 0) ? ' <b style="color:var(--off)">· חסר בארנק!</b>' : ''}</div>` : '';
  const pend = (ST?.members || []).filter((m) => m.status === 'pending'), mem = (ST?.members || []).filter((m) => m.status !== 'pending');
  const wd = (ST?.withdrawals || []).filter((w) => w.status === 'requested' || w.status === 'sending'), done = (ST?.withdrawals || []).filter((w) => !['requested', 'sending'].includes(w.status)).slice(-8).reverse();
  let html = `<div class="card" style="display:flex;flex-direction:column;gap:12px">
    <div class="row" style="justify-content:space-between"><b style="font-size:19px">💰 ארנקי Barusik Crypto</b><span class="mute">${ON ? '<span style="color:var(--on)">פועל</span>' : 'כבוי (נדלק עם כפתור השרת)'}</span></div>`;
  if (!hasExt()) html += `<p class="mute">צריך את התוסף (למעלה).</p>`;
  else if (!extOk()) html += `<p style="color:var(--warn)">צריך לעדכן את התוסף לגרסה 1.1.0: מורידים שוב את התוסף מלמעלה, מחליפים את התיקייה ולוחצים ⟳ ב-chrome://extensions.</p>`;
  else {
    html += `<div>BTC: ${dot(conn.BTC)}${solv('BTC')}</div><div>XMR: ${dot(conn.XMR)}${solv('XMR')}</div>`;
    if (ST?.error) html += `<p style="color:var(--off)">${esc(ST.error)}${/cw_admin_state/.test(ST.error) ? ' · צריך להריץ את wallets.sql' : ''}</p>`;
  }
  html += `</div>`;
  if (pend.length || true) html += `<div class="card" style="display:flex;flex-direction:column;gap:10px"><b>משתמשים</b>
    ${pend.map((m) => `<div class="row"><span>${esc(m.email)}</span><span class="mute small">${esc(m.note || '')}</span><button data-ok="${m.uid}">אישור</button><button class="ghost" data-no="${m.uid}">חסימה</button></div>`).join('') || '<span class="mute small">אין בקשות הצטרפות.</span>'}
    ${mem.map((m) => `<div class="row small"><span>${esc(m.email)}</span><span class="mute">${m.status === 'approved' ? 'מאושר' : 'חסום'}</span>${m.status === 'approved' ? `<button class="ghost" data-no="${m.uid}">חסימה</button>` : `<button class="ghost" data-ok="${m.uid}">אישור</button>`}</div>`).join('')}
    <div class="row"><input id="cwEmail" type="email" dir="ltr" placeholder="email של משתמש קיים" style="flex:1;min-width:180px;padding:10px;border-radius:12px;border:1px solid var(--line);background:#0B0E28;color:var(--ink)"><button id="cwAdd" class="ghost">הוספה</button></div></div>`;
  html += `<div class="card" style="display:flex;flex-direction:column;gap:10px"><b>בקשות משיכה</b>
    ${wd.map((w) => `<div style="border-bottom:1px solid var(--line);padding-bottom:8px"><div><b>${fmt(w.amount, w.asset)} ${w.asset}</b> · ${esc(w.email)} ${w.status === 'sending' ? '<span style="color:var(--warn)">· בשליחה</span>' : ''}</div><div class="small" dir="ltr" style="word-break:break-all">${esc(w.address)}</div>
      <div class="row" style="margin-top:6px"><button data-send="${w.id}" ${busy || !ON || conn[w.asset] !== true || w.status !== 'requested' ? 'disabled' : ''}>שליחה מהארנק</button><button class="ghost" data-manual="${w.id}">נשלח ידנית</button><button class="ghost" data-rej="${w.id}">דחייה</button></div></div>`).join('') || '<span class="mute small">אין בקשות פתוחות.</span>'}
    ${done.length ? `<details><summary class="mute small">אחרונות</summary>${done.map((w) => `<div class="small">${fmt(w.amount, w.asset)} ${w.asset} · ${esc(w.email)} · ${w.status === 'sent' ? 'נשלח' : w.status === 'rejected' ? 'נדחה' : 'בוטל'} ${w.txid ? `<code>${esc(w.txid.slice(0, 16))}…</code>` : ''}</div>`).join('')}</details>` : ''}</div>`;
  const c = CFG || {};
  html += `<details class="card"><summary><b>חיבור לארנקים במחשב</b></summary>
    <p class="mute small" style="line-height:1.7">מונרו: מפעילים את <code>monero-wallet-rpc</code> מתיקיית Monero GUI עם <code>--rpc-bind-ip 127.0.0.1 --rpc-bind-port 18088 --rpc-login USER:PASS --wallet-file …</code><br>
    ביטקוין: ב-Wasabi, בקובץ ההגדרות <code>Config.json</code>: <code>"JsonRpcServerEnabled": true</code>, <code>JsonRpcUser</code> ו-<code>JsonRpcPassword</code>. Wasabi צריך להיות פתוח.<br>הסיסמאות כאן נשמרות רק בתוסף במחשב הזה.</p>
    <div class="form" style="display:grid;gap:8px">
      ${[['xmrUrl', 'כתובת מונרו', c.xmrUrl], ['xmrUser', 'משתמש מונרו', c.xmrUser], ['xmrPass', 'סיסמת RPC מונרו' + (c.xmrPass ? ' (שמורה)' : ''), ''], ['btcUrl', 'כתובת Wasabi', c.btcUrl], ['btcWallet', 'שם הארנק ב-Wasabi', c.btcWallet], ['btcUser', 'משתמש Wasabi RPC', c.btcUser], ['btcPass', 'סיסמת Wasabi RPC' + (c.btcPass ? ' (שמורה)' : ''), '']]
        .map(([k, l, v]) => `<label class="small">${l}<input data-cfg="${k}" ${k.endsWith('Pass') ? 'type="password" autocomplete="new-password"' : ''} dir="ltr" value="${esc(v ?? '')}" style="width:100%;padding:10px;border-radius:12px;border:1px solid var(--line);background:#0B0E28;color:var(--ink)"></label>`).join('')}
      <div class="row"><button id="cwSave" class="ghost">שמירה ובדיקה</button></div></div></details>`;
  if (LOG.length) html += `<div class="card"><b>פעילות הארנקים</b><div class="log">${LOG.map((l) => `<div>${esc(l)}</div>`).join('')}</div></div>`;
  box.innerHTML = html;
  const W = (id) => (ST?.withdrawals || []).find((w) => String(w.id) === String(id));
  box.querySelectorAll('[data-ok]').forEach((b) => b.onclick = async () => { await call('cw_admin_member', { p_uid: b.dataset.ok, p_status: 'approved' }).catch((e) => log(e.message)); load(); });
  box.querySelectorAll('[data-no]').forEach((b) => b.onclick = async () => { if (!confirm('לחסום את המשתמש? הוא לא יוכל למשוך עד שתאשר שוב.')) return; await call('cw_admin_member', { p_uid: b.dataset.no, p_status: 'blocked' }).catch((e) => log(e.message)); load(); });
  box.querySelectorAll('[data-send]').forEach((b) => b.onclick = () => send(W(b.dataset.send)));
  box.querySelectorAll('[data-manual]').forEach((b) => b.onclick = () => manual(W(b.dataset.manual)));
  box.querySelectorAll('[data-rej]').forEach((b) => b.onclick = () => reject(W(b.dataset.rej)));
  $('cwAdd') && ($('cwAdd').onclick = async () => { const v = $('cwEmail').value.trim(); if (!v) return; try { await call('cw_admin_add', { p_email: v }); log('נוסף ואושר: ' + v); } catch (e) { log(e.message); } load(); });
  $('cwSave') && ($('cwSave').onclick = async () => {
    const set = {}; box.querySelectorAll('[data-cfg]').forEach((i) => { set[i.dataset.cfg] = i.value; });
    try { CFG = await ext({ type: 'wallet-cfg', set }, 8000); log('ההגדרות נשמרו בתוסף'); } catch (e) { log('לא נשמר: ' + e.message); }
    await check(); draw();
  });
}

(async () => { for (let i = 0; i < 40 && !B.isAdmin(); i++) await tick(500); if (!B.isAdmin()) return; await load(); if (want()) { ON = true; cycle(); } else draw(); })();
})();
