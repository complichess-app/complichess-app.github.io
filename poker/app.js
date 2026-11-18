/* Barusik Poker · the app: home, rooms with friends (through the `poker` function), and practice against bots.
   © 2026 Bar Lvovski. All rights reserved. */
(() => {
  'use strict';
  const SB_URL = 'https://iktmyrfbejtjsiehcrar.supabase.co', SB_KEY = 'sb_publishable_vEUqQPQSE0EG7YRnwNeAbg_PzViDO1a';
  const FN = SB_URL + '/functions/v1/poker';
  const P = window.Poker, ALL = window.POKER_T;
  const LANGS = ['he', 'en', 'ar', 'ru', 'es', 'fr'], NAMES = { he: 'עברית', en: 'English', ar: 'العربية', ru: 'Русский', es: 'Español', fr: 'Français' };
  const qs = new URLSearchParams(location.search);
  let L = qs.get('lang'); try { L = L || localStorage.getItem('barusik.lang'); } catch {}
  L = (L || (navigator.language || 'he')).slice(0, 2); if (!ALL[L]) L = 'he';
  let T = ALL[L];
  const rtl = () => L === 'he' || L === 'ar';
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fill = (s, o) => String(s).replace(/\{(\w)\}/g, (_, k) => o[k] ?? '');
  const num = (v) => `<bdi class="n">${Number(v || 0).toLocaleString('en-US')}</bdi>`;
  const errT = (code) => T.err[code] || T.err.server;
  const app = $('#app');

  function toast(s) { document.querySelectorAll('.toast').forEach((x) => x.remove()); const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = s; document.body.appendChild(el); setTimeout(() => el.remove(), 3200); }
  const say = (s) => { const el = $('#live'); el.textContent = ''; setTimeout(() => { el.textContent = s; }, 30); };
  let audio;
  const ding = () => { try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); const o = audio.createOscillator(), g = audio.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(0.0001, audio.currentTime); g.gain.exponentialRampToValueAtTime(0.12, audio.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.25); o.connect(g).connect(audio.destination); o.start(); o.stop(audio.currentTime + 0.3); } catch {} if (navigator.vibrate) navigator.vibrate(60); };

  /* ---------- language ---------- */
  function setLang(l) {
    L = l; T = ALL[L];
    try { localStorage.setItem('barusik.lang', L); } catch {}
    document.documentElement.lang = L; document.documentElement.dir = rtl() ? 'rtl' : 'ltr';
    $('#brandT').textContent = T.title; $('#langL').textContent = T.lang;
    document.title = T.title + ' · Barusik';
    route();
  }
  const sel = $('#lang');
  sel.innerHTML = LANGS.map((l) => `<option value="${l}"${l === L ? ' selected' : ''}>${NAMES[l]}</option>`).join('');
  sel.addEventListener('change', () => setLang(sel.value));

  /* ---------- account (the one Barusik account) ---------- */
  const sb = window.supabase ? window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'complichess-auth' } }) : null;
  let session = null, USER = null, GOOGLE = false;
  const myName = () => (USER && (USER.user_metadata?.username || USER.user_metadata?.full_name || (USER.email || '').split('@')[0])) || '';
  function drawAcct() {
    const el = $('#acct');
    el.innerHTML = USER ? `<b>${esc(myName())}</b><button class="btn ghost small" id="out">${esc(T.signOut)}</button>` : '';
    $('#out')?.addEventListener('click', async () => { await sb.auth.signOut(); });
  }
  if (sb) {
    sb.auth.onAuthStateChange((_e, s) => { const had = !!USER; session = s; USER = s?.user || null; drawAcct(); if (had !== !!USER) route(); });
    fetch(`${SB_URL}/auth/v1/settings`, { headers: { apikey: SB_KEY } }).then((r) => (r.ok ? r.json() : null)).then((j) => { GOOGLE = !!(j && j.external && j.external.google); if (!USER && !roomId()) route(); }).catch(() => {});
  }

  async function call(a, body = {}) {
    if (!session) throw new Error('sign_in');
    if (navigator.onLine === false) throw new Error('offline');
    let r;
    try { r = await fetch(FN, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}`, apikey: SB_KEY }, body: JSON.stringify({ a, ...body }) }); }
    catch { throw new Error('notReady'); }
    if (r.status === 404) throw new Error('notReady');
    const j = await r.json().catch(() => ({ error: 'server' }));
    if (j.error) throw new Error(j.error);
    dispatchEvent(new Event('poker:moved'));
    return j;
  }
  const fail = (e) => toast(errT(e.message));

  function loginBox(back) {
    const box = document.createElement('div');
    box.className = 'box';
    let mode = 'in';
    const draw = (msg = '') => {
      box.innerHTML = `<h2>${esc(mode === 'in' ? T.signIn : T.signUp)}</h2><p>${esc(T.needIn)}</p>
        ${GOOGLE ? `<button class="btn gbtn" id="lg">${esc(T.google)}</button><div class="or">${esc(T.or)}</div>` : ''}
        <form id="lf" style="display:flex;flex-direction:column;gap:10px">
          ${mode === 'up' ? `<label>${esc(T.uname)}<input id="lu" autocomplete="username" maxlength="20" required></label>` : ''}
          <label>${esc(T.email)}<input id="le" type="email" dir="ltr" autocomplete="email" required></label>
          <label>${esc(T.password)}<input id="lp" type="password" dir="ltr" autocomplete="${mode === 'in' ? 'current-password' : 'new-password'}" required minlength="6"></label>
          <div class="err" id="lm">${esc(msg)}</div>
          <button class="btn">${esc(mode === 'in' ? T.signIn : T.signUp)}</button>
          <button type="button" class="btn ghost small" id="lt">${esc(mode === 'in' ? T.toUp : T.toIn)}</button>
        </form>`;
      $('#lt', box).onclick = () => { mode = mode === 'in' ? 'up' : 'in'; draw(); };
      $('#lg', box)?.addEventListener('click', () => sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + '/poker/' + (back || ''), queryParams: { prompt: 'select_account' } } }));
      $('#lf', box).onsubmit = async (e) => {
        e.preventDefault();
        const em = $('#le', box).value.trim(), pw = $('#lp', box).value, un = mode === 'up' ? $('#lu', box).value.trim() : '';
        const m = (s) => { $('#lm', box).textContent = s; };
        if (pw.length < 6 || (mode === 'up' && (un.length < 2 || un.length > 20))) return m(T.short);
        try {
          if (mode === 'up') {
            const r = await sb.auth.signUp({ email: em, password: pw, options: { data: { username: un }, emailRedirectTo: 'https://barusik.com/poker/' + (back || '') } });
            if (r.error) throw r.error;
            if (!r.data.session) { mode = 'in'; draw(T.check); return; }
          } else {
            const r = await sb.auth.signInWithPassword({ email: em, password: pw });
            if (r.error) throw r.error;
          }
        } catch (x) { m(x && x.status === 400 ? T.badLogin : errT(navigator.onLine === false ? 'offline' : 'server')); }
      };
    };
    draw();
    return box;
  }

  /* ---------- cards ---------- */
  const RK = { 10: '10', 11: 'J', 12: 'Q', 13: 'K', 14: 'A' }, SU = ['♠', '♥', '♦', '♣'];
  const cardLabel = (c) => (RK[P.rankOf(c)] || P.rankOf(c)) + SU[P.suitOf(c)];
  function cardHTML(c, cls = '') {
    if (c === 'back') return `<span class="card back ${cls}" aria-hidden="true"></span>`;
    if (c == null) return `<span class="card ghost ${cls}" aria-hidden="true"></span>`;
    const r = P.rankOf(c), s = P.suitOf(c);
    return `<span class="card ${s === 1 || s === 2 ? 'red' : ''} ${cls}" role="img" aria-label="${cardLabel(c)}"><span class="r">${RK[r] || r}<i>${SU[s]}</i></span><span class="s">${SU[s]}</span></span>`;
  }

  /* ---------- routing ---------- */
  const roomId = () => (qs.get('r') || location.hash.replace(/^#r=?/, '') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  let leaveRoom = null;
  function go(url) { history.pushState(null, '', url); qs.forEach((_, k) => qs.delete(k)); new URLSearchParams(location.search).forEach((v, k) => qs.set(k, v)); route(); }
  addEventListener('popstate', () => { qs.forEach((_, k) => qs.delete(k)); new URLSearchParams(location.search).forEach((v, k) => qs.set(k, v)); route(); });
  function route() {
    if (leaveRoom) { leaveRoom(); leaveRoom = null; }
    document.body.classList.remove('in-room');
    const r = roomId();
    if (r) return openRoom(r);
    if (qs.has('practice')) return openPractice();
    drawHome();
  }
  $('#brand').addEventListener('click', (e) => { e.preventDefault(); go('./'); });

  /* ---------- home ---------- */
  function drawHome() {
    const fan = [P.parse('As'), P.parse('Kh'), P.parse('Qd'), P.parse('Jc'), P.parse('Ts')];
    const sample = [['As Ks Qs Js Ts'], ['9c 9d 9h 9s 2d'], ['Kh Kd Kc 4s 4h'], ['Ad Jd 8d 6d 3d'], ['9s 8h 7d 6c 5s'], ['Qc Qd Qh 7s 2c'], ['Jh Js 4c 4d Ac'], ['Th Tc 8s 5d 2h'], ['Ah Jc 8d 6s 3c']];
    app.innerHTML = `<div class="home">
      <section class="hero"><div><h1>${esc(T.title).replace(/(\S+)$/, '<em>$1</em>')}</h1><p>${esc(T.sub)}</p></div>
        <div class="fan" aria-hidden="true">${fan.map((c, i) => `<span class="fc" style="transform:translateX(-50%) rotate(${(i - 2) * 11}deg) translateY(${Math.abs(i - 2) * 8}px);animation-delay:${i * 70}ms">${cardHTML(c)}</span>`).join('')}</div></section>
      <div class="grid3" id="boxes"></div>
      <div class="note"><span aria-hidden="true">🪙</span><span>${esc(T.chipsOnly)}</span></div>
      <section style="margin-top:28px"><h2 style="font-size:18px;margin:0">${esc(T.rules)}</h2><p class="mute small" style="margin:2px 0 0">${esc(T.rulesT)}</p>
        <div class="ranks">${T.hands.slice().reverse().map((h, i) => `<div><span class="mini">${sample[i][0].split(' ').map((s) => cardHTML(P.parse(s))).join('')}</span><span>${esc(h)}</span></div>`).join('')}</div></section>
    </div>`;
    const boxes = $('#boxes');
    if (!USER) boxes.appendChild(loginBox());
    else {
      const c = document.createElement('form'); c.className = 'box';
      c.innerHTML = `<h2>${esc(T.create)}</h2><p>${esc(T.createT)}</p>
        <label>${esc(T.roomName)}<input name="title" maxlength="20" value="${esc(myName())}"></label>
        <label>${esc(T.yourName)}<input name="name" maxlength="20" required value="${esc(myName())}"></label>
        <div class="row"><label>${esc(T.blinds)}<select name="bl">${[[5, 10], [10, 20], [25, 50], [50, 100], [100, 200], [500, 1000]].map(([s, b], i) => `<option value="${s}/${b}"${i === 1 ? ' selected' : ''}>${s}/${b}</option>`).join('')}</select></label>
        <label>${esc(T.seats)}<select name="seats">${[2, 4, 6, 8, 9].map((n) => `<option${n === 9 ? ' selected' : ''}>${n}</option>`).join('')}</select></label></div>
        <label class="check"><input type="checkbox" name="approve" checked>${esc(T.approveOn)}</label>
        <button class="btn">${esc(T.createGo)}</button>`;
      c.onsubmit = async (e) => {
        e.preventDefault();
        const f = new FormData(c); const [s, b] = String(f.get('bl')).split('/').map(Number);
        const btn = $('button', c); btn.disabled = true;
        try {
          const r = await call('create', { title: f.get('title'), name: f.get('name'), settings: { sb: s, bb: b, seats: +f.get('seats'), approve: !!f.get('approve'), minBuy: b * 50, maxBuy: b * 200 } });
          try { localStorage.setItem('barusik.poker.name', String(f.get('name'))); } catch {}
          go('?r=' + r.room);
        } catch (x) { fail(x); btn.disabled = false; }
      };
      boxes.appendChild(c);
    }
    const j = document.createElement('form'); j.className = 'box';
    j.innerHTML = `<h2>${esc(T.join)}</h2><label>${esc(T.code)}<input name="code" dir="ltr" maxlength="8" autocapitalize="characters" autocomplete="off" required style="text-transform:uppercase;letter-spacing:.2em;font-family:var(--fd)"></label><button class="btn ghost">${esc(T.joinGo)}</button>`;
    j.onsubmit = (e) => { e.preventDefault(); const v = String(new FormData(j).get('code')).toUpperCase().replace(/[^A-Z0-9]/g, ''); if (v) go('?r=' + v); };
    boxes.appendChild(j);
    const p = document.createElement('form'); p.className = 'box';
    p.innerHTML = `<h2>${esc(T.practice)}</h2><p>${esc(T.practiceT)}</p><label>${esc(T.bots)}<select name="bots">${[1, 2, 3, 4, 5].map((n) => `<option${n === 5 ? ' selected' : ''}>${n}</option>`).join('')}</select></label><button class="btn ghost">${esc(T.practiceGo)}</button>`;
    p.onsubmit = (e) => { e.preventDefault(); go('?practice=' + new FormData(p).get('bots')); };
    boxes.appendChild(p);
  }

  /* ---------- the table, drawn from a plain view ---------- */
  // view: { n, me, seats[{name,chips,bet,folded,allIn,cards,away,leaving,win,hand}|null], button, sb, bb, board, pot, toAct, until, turnSec, msg, canSit }
  let lastBoard = '', lastHole = '';
  function seatPos(i, n, me) {
    const base = me >= 0 ? me : 0;
    const k = (i - base + n) % n;
    const a = Math.PI / 2 + (k / n) * Math.PI * 2 * (rtl() ? -1 : 1);
    const wide = innerWidth > 640;
    const b = k === 0 ? 0.55 : 0.68, rx = wide ? 45 : 41, ry = wide ? 42 : 45, ad = a + (rtl() ? 0.42 : -0.42) * (k === 0 ? 1.3 : 1);
    return { dx: 50 + Math.cos(ad) * rx * 0.66, dy: 50 + Math.sin(ad) * ry * 0.66, x: 50 + Math.cos(a) * (wide ? 45 : 41), y: 50 + Math.sin(a) * (wide ? 42 : 45), bx: 50 + Math.cos(a) * (wide ? 45 : 41) * b, by: 50 + Math.sin(a) * (wide ? 42 : 45) * b };
  }
  function drawTable(felt, v, onSit) {
    const bkey = v.board.join(',');
    const newBoard = bkey !== lastBoard; const prevBoard = lastBoard ? lastBoard.split(',').length : 0; lastBoard = bkey;
    const win = new Set(); for (const s of v.seats) if (s && s.win) s.best?.forEach((c) => win.add(c));
    let html = `<div class="oval"><div class="mark">BARUSIK</div></div><div class="center">
      <div class="board">${[0, 1, 2, 3, 4].map((i) => cardHTML(v.board[i] ?? null, (newBoard && i >= prevBoard && v.board[i] != null ? 'in ' : '') + (win.size && v.board[i] != null ? (win.has(v.board[i]) ? 'hl' : 'dim') : ''))).join('')}</div>
      ${v.pot ? `<div class="potv"><span class="chip"></span>${esc(T.pot)} ${num(v.pot)}</div>` : ''}
      ${v.msg ? `<div class="msg">${v.msg}</div>` : ''}</div>`;
    for (let i = 0; i < v.n; i++) {
      const s = v.seats[i]; const p = seatPos(i, v.n, v.me);
      if (!s) {
        html += `<div class="seat" style="left:${p.x}%;top:${p.y}%">${v.canSit ? `<button class="empty" data-sit="${i}">${esc(T.sitHere)}</button>` : `<div class="empty">${esc(T.empty)}</div>`}</div>`;
        continue;
      }
      const me = i === v.me;
      const cards = s.cards === 'back' ? ['back', 'back'] : Array.isArray(s.cards) ? s.cards : [];
      const hk = me ? cards.join(',') + v.hand : '';
      const fresh = me && hk !== lastHole; if (me) lastHole = hk;
      const turn = v.toAct === i;
      const left = turn && v.until ? Math.max(0, v.until - Date.now()) : 0;
      html += `<div class="seat ${me ? 'me' : ''} ${turn ? 'turn' : ''} ${s.folded ? 'folded' : ''} ${s.win ? 'win' : ''}" style="left:${p.x}%;top:${p.y}%">
        <div class="hole">${cards.map((c) => cardHTML(c, (fresh ? 'in ' : '') + (win.size && c !== 'back' ? (win.has(c) ? 'hl' : 'dim') : ''))).join('')}</div>
        <div class="plate">${s.allIn ? `<span class="tag">${esc(T.allin)}</span>` : s.away ? `<span class="tag" style="background:#555;color:#eee">${esc(T.isAway)}</span>` : ''}
          <div class="nm">${esc(s.name)}${me && s.name !== T.you ? ` <span class="mute small">(${esc(T.you)})</span>` : ''}</div>
          <div class="ch">${num(s.chips)}</div>
          ${s.hand ? `<div class="hand">${esc(s.hand)}</div>` : ''}
          ${turn && v.until ? `<div class="timer"><i class="go" style="animation-duration:${left}ms;transform:scaleX(${Math.min(1, left / (v.turnSec * 1000))})"></i></div>` : ''}
        </div></div>`;
      if (s.bet > 0) html += `<div class="chipst" style="left:${p.bx}%;top:${p.by}%"><span class="chip ${s.bet >= (v.bb || 1) * 10 ? 'b' : ''}"></span>${num(s.bet)}</div>`;
      if (s.win) html += `<div class="chipst" style="left:${p.bx}%;top:${p.by}%;color:var(--ok)">+${num(s.win)}</div>`;
    }
    if (v.button != null && v.seats[v.button]) { const p = seatPos(v.button, v.n, v.me); html += `<div class="dbtn" style="left:${p.dx}%;top:${p.dy}%" title="${esc(T.dealer)}" aria-label="${esc(T.dealer)}">D</div>`; }
    felt.innerHTML = html;
    felt.querySelectorAll('[data-sit]').forEach((b) => (b.onclick = () => onSit(+b.dataset.sit)));
  }

  function drawActions(el, v, o, send) {
    if (!o) { el.innerHTML = v.under || ''; return; }
    const me = v.seats[v.me];
    const pot = v.pot;
    const clamp = (x) => Math.max(o.minTo, Math.min(o.maxTo, Math.round(x)));
    const cur = me.bet + o.toCall;
    const size = (f) => clamp(cur + (pot + o.toCall) * f);
    const step = Math.max(1, Math.floor((v.bb || 2) / 2));
    el.innerHTML = `<div class="row"><b style="color:var(--brass-2)">${esc(T.yourTurn)}</b></div>
      ${o.raise ? `<div class="sizer"><button data-x="${size(0.5)}">${esc(T.half)}</button><button data-x="${size(1)}">${esc(T.potB)}</button><button data-x="${o.maxTo}">${esc(T.allin)}</button>
        <input type="range" min="${o.minTo}" max="${o.maxTo}" step="${step}" value="${o.minTo}" aria-label="${esc(o.bet ? T.bet : T.raise)}"><input type="number" min="${o.minTo}" max="${o.maxTo}" step="${step}" value="${o.minTo}" inputmode="numeric" aria-label="${esc(T.amount)}"></div>` : ''}
      <div class="row">${o.fold ? `<button class="act f" data-a="fold">${esc(T.fold)}</button>` : ''}
        <button class="act c" data-a="${o.check ? 'check' : 'call'}">${o.check ? esc(T.checkB) : fill(esc(T.call), { a: num(o.call) })}${!o.check && o.call >= me.chips ? ' · ' + esc(T.allin) : ''}</button>
        ${o.raise ? `<button class="act r" data-a="raise"></button>` : ''}</div>`;
    const range = $('input[type=range]', el), box = $('input[type=number]', el), rb = $('[data-a=raise]', el);
    const label = () => { const x = clamp(+box.value || o.minTo); rb.innerHTML = x >= o.maxTo ? esc(T.allin) + ' ' + num(x) : fill(esc(o.bet ? T.betA : T.raiseTo), { a: num(x) }); };
    if (range) { range.oninput = () => { box.value = range.value; label(); }; box.oninput = () => { range.value = box.value; label(); }; el.querySelectorAll('[data-x]').forEach((b) => (b.onclick = () => { box.value = range.value = b.dataset.x; label(); })); label(); }
    el.querySelectorAll('[data-a]').forEach((b) => (b.onclick = () => { el.querySelectorAll('button').forEach((x) => (x.disabled = true)); send(b.dataset.a, b.dataset.a === 'raise' ? clamp(+box.value) : 0); }));
  }

  const handName = (cat) => (cat == null ? '' : T.hands[cat]);
  function logLine(e) {
    const a = e.a != null ? num(e.a) : '';
    const n = esc(e.name || ''); const all = e.all ? esc(T.lall) : '';
    switch (e.k) {
      case 'hand': return `<div class="hd">${fill(esc(T.lhand), { a: e.n })}</div>`;
      case 'sb': return fill(esc(T.lsb), { n, a }); case 'bb': return fill(esc(T.lbb), { n, a });
      case 'fold': return fill(esc(T.lfold), { n }); case 'check': return fill(esc(T.lcheck), { n });
      case 'call': return fill(esc(T.lcall), { n, a }) + all; case 'bet': return fill(esc(T.lbet), { n, a }) + all; case 'raise': return fill(esc(T.lraise), { n, a }) + all;
      case 'board': return fill(esc(T.lboard), { a: `<bdi dir="ltr">${e.b.map(cardLabel).join(' ')}</bdi>` });
      case 'back': return fill(esc(T.lback), { n, a });
      case 'win': return (e.cat == null ? fill(esc(T.lwin), { n: esc((e.names || []).join(', ')), a }) : fill(esc(T.lwinH), { n: esc((e.names || []).join(', ')), a, h: esc(handName(e.cat)) }));
      case 'sit': return fill(esc(T.lsit), { n, a }); case 'left': return fill(esc(T.lleft), { n, a }); case 'rebuy': return fill(esc(T.lrebuy), { n, a });
      case 'kick': return fill(esc(T.lkick), { n }); case 'host': return fill(esc(T.lhost), { n }); case 'admin': return esc(T.ladmin);
      case 'pause': return esc(T.lpause); case 'resume': return esc(T.lresume); case 'closed': return esc(T.lclosed);
      case 'away': return fill(esc(T.laway), { n }); case 'ask': return fill(esc(T.lask), { n }); case 'denied': return fill(esc(T.ldenied), { n });
      case 'chips': return fill(esc(T.lchips), { n, a }); case 'settings': return fill(esc(T.lsettings), { a: `<bdi class="n">${e.sb}/${e.bb}</bdi>` });
      default: return '';
    }
  }

  /* ---------- the room screen (shared by rooms and practice) ---------- */
  function roomShell(title, extraTabs) {
    document.body.classList.add('in-room');
    app.innerHTML = `<div class="roomwrap"><div class="stage">
        <div class="bar" id="bar"><h1>${esc(title)}</h1></div>
        <div id="banner"></div>
        <div class="felt" id="felt"></div>
        <div class="actions" id="acts"></div>
      </div>
      <aside class="side" id="side"><div class="tabs" role="tablist" id="tabs">${extraTabs.map(([k, l], i) => `<button role="tab" data-t="${k}" aria-selected="${i === 0}">${esc(l)}</button>`).join('')}<span style="flex:1"></span><button class="sidebtn btn ghost small" id="sideX" aria-label="×">×</button></div>
        <div class="pane" id="pane"></div><div id="sidefoot"></div></aside></div>`;
    $('#sideX').onclick = () => $('#side').classList.remove('open');
  }

  /* ================= rooms with friends ================= */
  function openRoom(id) {
    lastBoard = ''; lastHole = '';
    if (!USER) {
      app.innerHTML = `<div class="home"><div class="grid3" style="grid-template-columns:minmax(0,460px);justify-content:center;padding-top:30px"></div></div>`;
      $('.grid3', app).appendChild(loginBox('?r=' + id));
      return;
    }
    roomShell(id, [['log', T.log], ['chat', T.chat], ['ledger', T.ledger]]);
    let room = null, my = { hand: -1, cards: null }, tab = 'log', unread = 0, admin = false, timers = [], alive = true, chan = null, lastTurnMine = false;
    const st = () => room.state;
    const isHost = () => room && (room.host === USER.id || admin);
    const mySeat = () => (st().seats || []).findIndex((s) => s && s.uid === USER.id);

    sb.rpc('is_admin').then((r) => { admin = r.data === true; if (room) draw(); });

    async function load() {
      const r = await sb.from('po_rooms').select('*').eq('id', id).maybeSingle();
      if (!alive) return;
      if (r.error && /po_rooms|relation|schema/i.test(r.error.message)) { app.innerHTML = `<div class="home"><div class="note">${esc(T.err.notReady)}</div><p><a class="btn" href="?practice=5">${esc(T.practice)}</a></p></div>`; return; }
      if (!r.data) { app.innerHTML = `<div class="home"><div class="note">${esc(T.err.no_room)}</div><p><a class="btn" href="./">${esc(T.title)}</a></p></div>`; return; }
      apply(r.data);
    }
    function apply(row) {
      if (room && row.version < room.version) return;
      const prevChat = room ? (room.state.chat || []).length : null;
      room = row;
      if (room.status === 'closed') { app.innerHTML = `<div class="home"><div class="note">${esc(T.closed)}</div><p><a class="btn" href="./">${esc(T.title)}</a></p></div>`; return; }
      if (prevChat != null && (st().chat || []).length > prevChat && tab !== 'chat') unread++;
      const live = st().live, ms = mySeat();
      const handNo = st().handNo || 0;
      if (ms >= 0 && live && live.players[ms] && live.players[ms].has && my.hand !== handNo) { my.hand = handNo; my.cards = null; call('my', { room: id }).then((r) => { if (r.hand === handNo) { my.cards = r.cards; draw(); } }).catch(() => {}); }
      if (!live || !live.players[ms]) my.cards = null;
      schedule();
      draw();
    }
    // the clock lives on the server; any open page may nudge it when a deadline passes
    function schedule() {
      timers.forEach(clearTimeout); timers = [];
      const now = Date.now(), jitter = () => 250 + Math.random() * 700;
      const at = [];
      if (room.host_kind === 'waiting') at.push(Date.parse(room.offer_until));
      if (st().turn) at.push(st().turn.until);
      if (st().nextAt && st().playing && !st().paused) at.push(st().nextAt);
      for (const t of at) timers.push(setTimeout(() => call('tick', { room: id }).catch(() => {}), Math.max(0, t - now) + jitter()));
      if (room.host_kind === 'waiting') timers.push(setInterval(drawBanner, 1000));
    }
    function view() {
      const s = st(), live = s.live, ms = mySeat();
      const n = s.settings.seats;
      const showdown = live && live.stage === 'done' && s.hand && s.hand.results;
      const winners = {};
      if (showdown) for (const r of s.hand.results) for (const [seat, a] of Object.entries(r.share)) winners[seat] = (winners[seat] || 0) + a;
      const seats = Array.from({ length: n }, (_, i) => {
        const x = s.seats[i]; if (!x) return null;
        const p = live && live.players[i];
        let cards = null;
        if (p && !p.out) {
          if (p.cards) cards = p.cards;
          else if (i === ms && my.cards) cards = my.cards;
          else if (p.has) cards = 'back';
        }
        let hand = '', best = null;
        if (showdown && Array.isArray(cards) && cards.length === 2 && live.stage === 'done' && s.hand.board.length === 5 && !p.folded) { const sc = P.evaluate(cards.concat(s.hand.board)); hand = handName(P.category(sc)); if (winners[i]) best = P.bestFive(cards.concat(s.hand.board)); }
        else if (i === ms && Array.isArray(cards) && s.hand && s.hand.board.length >= 3 && live.stage !== 'done') hand = handName(P.category(P.evaluate(cards.concat(s.hand.board))));
        return { name: x.name, chips: x.chips, bet: p ? p.bet : 0, folded: p ? p.folded : false, allIn: p ? p.allIn : false, cards, away: x.away, leaving: x.leaving, win: winners[i] || 0, hand, best };
      });
      const pot = live ? (live.stage === 'done' ? 0 : live.pot - seats.reduce((t, x) => t + (x ? x.bet : 0), 0)) : 0;
      const myReq = (s.requests || []).find((r) => r.uid === USER.id);
      let msg = '';
      if (s.paused) msg = esc(T.paused);
      else if (!s.playing) msg = esc(isHost() ? T.needTwo : T.waitStart);
      else if (!live || live.stage === 'done' || live.stage === 'idle') { const el = (s.seats || []).filter((x) => x && x.chips > 0 && !x.away).length; if (el < 2) msg = esc(T.needTwo); }
      if (myReq) msg = esc(T.pending);
      return { n, me: ms, seats, button: s.hand ? s.hand.button : null, sb: s.hand?.sb, bb: s.settings.bb, board: s.hand ? s.hand.board : [], pot: Math.max(0, pot), toAct: s.turn ? s.turn.s : -1, until: s.turn ? s.turn.until : 0, turnSec: s.settings.turn, msg, canSit: ms < 0 && !myReq, hand: s.handNo || 0 };
    }
    function drawBanner() {
      const el = $('#banner'); if (!el || !room) return;
      const s = st();
      let h = '';
      if (room.host_kind === 'waiting') { const left = Math.max(0, Math.ceil((Date.parse(room.offer_until) - Date.now()) / 1000)); h = `<div class="banner">⏳ ${fill(esc(T.waitAdmin), { s: `<bdi class="n">${left}</bdi>` })}</div>`; }
      const reqs = isHost() ? (s.requests || []) : [];
      if (reqs.length) h += `<div class="banner" style="color:var(--ivory)">${reqs.map((r) => `<span>${fill(esc(r.kind === 'sit' ? T.wantsSeat : T.wantsChips), { n: esc(r.name), a: num(r.amount) })}</span><button class="btn small" data-ok="${esc(r.id)}">${esc(T.approve)}</button><button class="btn ghost small" data-no="${esc(r.id)}">${esc(T.deny)}</button>`).join('<span style="width:100%"></span>')}</div>`;
      el.innerHTML = h;
      el.querySelectorAll('[data-ok]').forEach((b) => (b.onclick = () => call('approve', { room: id, req: b.dataset.ok, ok: true }).catch(fail)));
      el.querySelectorAll('[data-no]').forEach((b) => (b.onclick = () => call('approve', { room: id, req: b.dataset.no, ok: false }).catch(fail)));
    }
    function drawBar() {
      const s = st(), ms = mySeat();
      const hostName = room.host_kind === 'admin' ? T.adminHost : room.host === USER.id ? T.youHost : room.host_kind === 'player' ? fill(T.hostIs, { n: (s.seats.find((x) => x && x.uid === room.host) || {}).name || s.creator }) : '';
      $('#bar').innerHTML = `<h1>${esc(s.title || room.name || id)}</h1><span class="pill b n">${esc(id)}</span><span class="pill">${num(s.settings.sb)}/${num(s.settings.bb)}</span>${hostName ? `<span class="pill ${room.host_kind === 'admin' ? 'g' : ''}">${esc(hostName)}</span>` : ''}
        <span style="flex:1"></span>
        <button class="btn small" id="share">${esc(T.share)}</button>
        ${isHost() && (!s.playing || s.paused) ? `<button class="btn small" id="go">${esc(s.paused ? T.resume : T.start)}</button>` : ''}
        ${isHost() && s.playing && !s.paused ? `<button class="btn ghost small" id="pz">${esc(T.pause)}</button>` : ''}
        ${ms >= 0 ? (s.seats[ms].away ? `<button class="btn small" id="bk">${esc(T.back)}</button>` : `<button class="btn ghost small" id="aw">${esc(T.away)}</button>`) + `<button class="btn ghost small" id="rb">${esc(T.rebuy)}</button><button class="btn ghost small" id="lv">${esc(T.leave)}</button>` : ''}
        <button class="btn ghost small sidebtn" id="sideO">${esc(T.log)}${unread ? ' •' : ''}</button>
`;
      $('#share').onclick = async () => { const url = `${location.origin}/poker/?r=${id}`; try { if (navigator.share) await navigator.share({ title: T.title, text: T.shareText, url }); else { await navigator.clipboard.writeText(url); toast(T.copied); } } catch {} };
      $('#go')?.addEventListener('click', () => call(s.paused ? 'pause' : 'start', { room: id, on: false }).catch(fail));
      $('#pz')?.addEventListener('click', () => call('pause', { room: id, on: true }).catch(fail));
      $('#bk')?.addEventListener('click', () => call('back', { room: id }).catch(fail));
      $('#aw')?.addEventListener('click', () => call('away', { room: id }).catch(fail));
      $('#lv')?.addEventListener('click', () => call('leave', { room: id }).catch(fail));
      $('#rb')?.addEventListener('click', () => askChips('rebuy'));
      $('#sideO')?.addEventListener('click', () => { $('#side').classList.add('open'); });
    }
    function askChips(kind, seat) {
      const s = st().settings;
      const d = document.createElement('dialog');
      d.innerHTML = `<h2>${esc(kind === 'sit' ? T.sitT : T.rebuy)}</h2><form method="dialog">
        ${kind === 'sit' ? `<label>${esc(T.yourName)}<input name="name" maxlength="20" required value="${esc((() => { try { return localStorage.getItem('barusik.poker.name'); } catch { return ''; } })() || myName())}"></label>` : ''}
        <label>${esc(T.amount)} <span class="mute small n">(${s.minBuy.toLocaleString('en-US')}–${s.maxBuy.toLocaleString('en-US')})</span><input name="amount" type="number" inputmode="numeric" min="${kind === 'sit' ? s.minBuy : s.bb}" max="${s.maxBuy}" value="${s.minBuy}" required></label>
        <p class="mute small" style="margin:0">${esc(T.chipsOnly)}</p>
        <div class="row"><button value="x" class="btn ghost" formnovalidate>${esc(T.cancel)}</button><button value="ok" class="btn">${esc(kind === 'sit' ? (isHost() || !s.approve ? T.sitGo : T.ask) : T.rebuy)}</button></div></form>`;
      document.body.appendChild(d); d.showModal();
      d.addEventListener('close', async () => {
        const f = new FormData($('form', d)); d.remove();
        if (d.returnValue !== 'ok') return;
        try {
          if (kind === 'sit') { try { localStorage.setItem('barusik.poker.name', String(f.get('name'))); } catch {} const r = await call('sit', { room: id, seat, name: f.get('name'), amount: +f.get('amount') }); if (r.pending) toast(T.pending); }
          else { const r = await call('rebuy', { room: id, amount: +f.get('amount') }); if (r.pending) toast(T.pending); }
        } catch (x) { fail(x); }
      });
    }
    function drawSide() {
      const s = st(), pane = $('#pane');
      const tabs = [['log', T.log], ['chat', T.chat], ['ledger', T.ledger]].concat(isHost() ? [['host', T.settings]] : []);
      $('#tabs').innerHTML = tabs.map(([k, l]) => `<button role="tab" data-t="${k}" aria-selected="${tab === k}">${esc(l)}${k === 'chat' && unread ? '<span class="dot"></span>' : ''}</button>`).join('') + '<span style="flex:1"></span><button class="sidebtn btn ghost small" id="sideX" aria-label="×">×</button>';
      $('#tabs').querySelectorAll('[data-t]').forEach((b) => (b.onclick = () => { tab = b.dataset.t; if (tab === 'chat') unread = 0; drawSide(); drawBar(); }));
      $('#sideX').onclick = () => $('#side').classList.remove('open');
      const foot = $('#sidefoot'); foot.innerHTML = '';
      if (tab === 'log') { pane.innerHTML = (s.log || []).map((e) => { const l = logLine(e); return l.startsWith('<div') ? l : `<div class="li">${l}</div>`; }).join(''); pane.scrollTop = pane.scrollHeight; }
      else if (tab === 'chat') {
        pane.innerHTML = (s.chat || []).map((m) => `<div class="li"><b${m.admin ? ' style="color:var(--ok)"' : ''}>${esc(m.name)}:</b> <bdi>${esc(m.text)}</bdi></div>`).join('') || '<p class="mute">💬</p>';
        pane.scrollTop = pane.scrollHeight;
        foot.innerHTML = `<form class="chatbox"><input maxlength="200" placeholder="${esc(T.say)}" aria-label="${esc(T.say)}"><button class="btn small">${esc(T.send)}</button></form>`;
        $('form', foot).onsubmit = (e) => { e.preventDefault(); const i = $('input', foot); const text = i.value.trim(); if (!text) return; i.value = ''; call('say', { room: id, text }).catch(fail); };
      } else if (tab === 'ledger') {
        const rows = Object.entries(s.ledger || {}).map(([uid, l]) => { const seat = s.seats.find((x) => x && x.uid === uid); const now = seat ? seat.chips : 0; const net = now + l.out - l.in; return `<tr><td>${esc(l.name)}</td><td>${num(l.in)}</td><td>${num(l.out + now)}</td><td class="${net > 0 ? 'pos' : net < 0 ? 'neg' : ''}">${net > 0 ? '+' : ''}${num(net)}</td></tr>`; }).join('');
        pane.innerHTML = `<table class="ledger"><thead><tr><th></th><th>${esc(T.inL)}</th><th>${esc(T.outL)}</th><th>${esc(T.net)}</th></tr></thead><tbody>${rows}</tbody></table><p class="mute small">${esc(T.chipsOnly)}</p>`;
      } else if (tab === 'host') {
        const g = s.settings;
        pane.innerHTML = `<form id="setf" style="display:flex;flex-direction:column;gap:8px">
          <label>${esc(T.roomName)}<input name="title" maxlength="20" value="${esc(s.title || '')}"></label>
          <label>${esc(T.sb)}<input name="sb" type="number" min="1" value="${g.sb}"></label><label>${esc(T.bb)}<input name="bb" type="number" min="2" value="${g.bb}"></label>
          <label>${esc(T.minBuy)}<input name="minBuy" type="number" value="${g.minBuy}"></label><label>${esc(T.maxBuy)}<input name="maxBuy" type="number" value="${g.maxBuy}"></label>
          <label>${esc(T.turnTime)}<input name="turn" type="number" min="10" max="300" value="${g.turn}"></label>
          <label>${esc(T.seats)}<input name="seats" type="number" min="2" max="9" value="${g.seats}"></label>
          <label>${esc(T.approveOn)}<input name="approve" type="checkbox" ${g.approve ? 'checked' : ''} style="width:20px;height:20px;accent-color:var(--brass)"></label>
          <button class="btn small">${esc(T.save)}</button></form>
          <div class="hd">${esc(T.seats)}</div>
          ${s.seats.map((x, i) => x ? `<div class="pl"><b>${esc(x.name)}</b>${num(x.chips)}${x.uid !== USER.id ? `<button class="btn ghost small" data-kick="${i}">${esc(T.kick)}</button>` : ''}${x.uid !== room.host ? `<button class="btn ghost small" data-host="${i}">${esc(T.makeHost)}</button>` : ''}</div>` : '').join('')}
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">${s.playing ? `<button class="btn ghost small" id="nx">${esc(T.nextHand)}</button>` : ''}<button class="btn red small" id="cl">${esc(T.close)}</button></div>`;
        $('#setf').onsubmit = (e) => { e.preventDefault(); const f = new FormData(e.target); const o = {}; for (const k of ['sb', 'bb', 'minBuy', 'maxBuy', 'turn', 'seats']) o[k] = +f.get(k); o.approve = !!f.get('approve'); call('settings', { room: id, settings: o, title: f.get('title') }).then(() => toast('✓')).catch(fail); };
        pane.querySelectorAll('[data-kick]').forEach((b) => (b.onclick = () => call('kick', { room: id, seat: +b.dataset.kick }).catch(fail)));
        pane.querySelectorAll('[data-host]').forEach((b) => (b.onclick = () => call('host', { room: id, seat: +b.dataset.host }).catch(fail)));
        $('#nx')?.addEventListener('click', () => call('next', { room: id }).catch(fail));
        $('#cl').onclick = () => { if (confirm(T.closeQ)) call('close', { room: id }).catch(fail); };
      }
    }
    function draw() {
      if (!room || !$('#felt')) return;
      const v = view(), s = st();
      drawBar(); drawBanner();
      drawTable($('#felt'), v, (seat) => askChips('sit', seat));
      const mine = s.turn && s.turn.s === v.me && v.me >= 0;
      if (mine && !lastTurnMine) { ding(); say(T.yourTurn); }
      lastTurnMine = mine;
      const myReq = (s.requests || []).find((r) => r.uid === USER.id);
      v.under = myReq ? `<div class="row"><span class="mute">${esc(T.pending)}</span><button class="btn ghost small" id="cx">${esc(T.cancel)}</button></div>` : v.me >= 0 && s.live && !s.live.players[v.me] && s.live.stage !== 'done' ? `<div class="row mute">${esc(T.waitHand)}</div>` : '';
      drawActions($('#acts'), v, mine ? s.turn.o : null, (type, to) => call('act', { room: id, type, to }).catch((x) => { fail(x); draw(); }));
      $('#cx')?.addEventListener('click', () => call('cancel', { room: id }).catch(fail));
      if ($('#side').contains(document.activeElement) && document.activeElement.tagName === 'INPUT') return; // don't wipe what they're typing
      drawSide();
    }

    load();
    chan = sb.channel('po-' + id).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'po_rooms', filter: `id=eq.${id}` }, (p) => apply(p.new)).subscribe();
    // a safety net for a dropped connection
    const poll = setInterval(() => { if (document.visibilityState === 'visible') load(); }, 8000);
    const vis = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', vis);
    let quick; const moved = () => { clearTimeout(quick); quick = setTimeout(load, 120); };
    addEventListener('poker:moved', moved);
    leaveRoom = () => { alive = false; removeEventListener('poker:moved', moved); timers.forEach(clearTimeout); clearInterval(poll); document.removeEventListener('visibilitychange', vis); if (chan) sb.removeChannel(chan); };
  }

  /* ================= practice against bots ================= */
  const BOTS = ['Mika', 'Rafi', 'Noa', 'Omar', 'Lena', 'Ivan', 'Sofia', 'Pierre'];
  function openPractice() {
    lastBoard = ''; lastHole = '';
    const nb = Math.max(1, Math.min(5, +qs.get('practice') || 5));
    let bank = 10000; try { bank = +(localStorage.getItem('barusik.poker.bank') ?? 10000); } catch {}
    if (!(bank > 0)) bank = 10000;
    const save = () => { try { localStorage.setItem('barusik.poker.bank', String(table.seats[0].chips)); } catch {} };
    roomShell(T.practice, [['log', T.log]]);
    const log = [];
    const names = BOTS.slice().sort(() => Math.random() - 0.5);
    const styles = Object.keys(P.STYLES);
    let turn = -1, result = null, timer = null, alive = true;
    const table = new P.Table({
      sb: 10, bb: 20,
      players: [{ id: 'me', name: myName() || T.you, chips: bank, human: true }].concat(Array.from({ length: nb }, (_, i) => ({ id: 'b' + i, name: names[i], chips: 2000, style: styles[Math.floor(Math.random() * styles.length)] }))),
      on: (type, d) => {
        const nm = (s) => table.seats[s].name;
        if (type === 'hand') { result = null; log.push({ k: 'hand', n: d.hand }); }
        else if (type === 'blind') log.push({ k: d.kind, name: nm(d.seat), a: d.amount });
        else if (type === 'act') log.push({ k: d.type, name: nm(d.seat), a: d.amount ?? d.to, all: d.allIn });
        else if (type === 'board') log.push({ k: 'board', b: d.board });
        else if (type === 'uncalled') log.push({ k: 'back', name: nm(d.seat), a: d.amount });
        else if (type === 'turn') turn = d.seat;
        else if (type === 'result') { turn = -1; result = d.results; for (const r of d.results) log.push({ k: 'win', names: r.seats.map(nm), a: r.amount, cat: r.score == null ? null : P.category(r.score) }); }
      },
    });
    table.button = Math.floor(Math.random() * table.seats.length);
    function view() {
      const t = table, done = t.stage === 'done';
      const win = {}; if (done && result) for (const r of result) for (const [s, a] of Object.entries(r.share)) win[s] = (win[s] || 0) + a;
      const seats = t.seats.map((p, i) => {
        if (p.out && !done) return { name: p.name, chips: p.chips, bet: 0, cards: null, folded: true };
        const show = i === 0 || (done && p.shown);
        const cards = p.cards.length ? (show ? p.cards : p.folded ? null : 'back') : null;
        let hand = '', best = null;
        if (Array.isArray(cards) && t.board.length >= 3 && !p.folded) { hand = handName(P.category(P.evaluate(cards.concat(t.board)))); if (win[i] && done && t.board.length === 5) best = P.bestFive(cards.concat(t.board)); }
        return { name: p.name, chips: p.chips, bet: p.bet, folded: p.folded, allIn: p.allIn, cards, win: win[i] || 0, hand, best };
      });
      const pot = done ? 0 : t.pot() - t.seats.reduce((a, p) => a + p.bet, 0);
      let msg = '';
      if (t.seats[0].chips === 0 && done) msg = esc(T.lost);
      else if (t.seats.slice(1).every((p) => p.chips === 0) && done) msg = esc(T.won);
      return { n: t.seats.length, me: 0, seats, button: t.button, bb: t.bb, board: t.board || [], pot, toAct: turn, until: 0, turnSec: 30, msg, canSit: false, hand: t.hand };
    }
    function draw() {
      if (!alive) return;
      const v = view();
      $('#bar').innerHTML = `<h1>${esc(T.practice)}</h1><span class="pill">10/20</span><span class="pill b">${esc(T.practiceBank)}: ${num(table.seats[0].chips)}</span><span style="flex:1"></span><button class="btn ghost small" id="ng">${esc(T.newGame)}</button><button class="btn ghost small sidebtn" id="sideO">${esc(T.log)}</button><div class="watch" style="width:100%">${esc(T.chipsOnly)}</div>`;
      $('#ng').onclick = () => { try { localStorage.setItem('barusik.poker.bank', String(Math.max(table.seats[0].chips, 10000))); } catch {} clearTimeout(timer); alive = false; route(); };
      $('#sideO').onclick = () => $('#side').classList.add('open');
      drawTable($('#felt'), v, () => {});
      const mine = turn === 0 && table.stage !== 'done';
      if (mine) say(T.yourTurn);
      const broke = table.stage === 'done' && table.seats[0].chips === 0;
      v.under = broke ? `<div class="row"><button class="btn" id="rf">${esc(T.refill)}</button></div>` : '';
      drawActions($('#acts'), v, mine ? table.options(0) : null, (type, to) => { table.act(0, { type, to }); step(); });
      $('#rf')?.addEventListener('click', () => { table.seats[0].chips = 10000; save(); step(); });
      $('#pane').innerHTML = log.slice(-80).map((e) => { const l = logLine(e); return l.startsWith('<div') ? l : `<div class="li">${l}</div>`; }).join('');
      $('#pane').scrollTop = 1e9;
    }
    function step() {
      if (!alive) return;
      clearTimeout(timer);
      draw();
      if (table.stage === 'done' || table.stage === 'idle') {
        save();
        // bots that went broke get up, a fresh one sits down
        table.seats.forEach((p, i) => { if (i && p.chips === 0) { p.chips = 2000; p.name = BOTS[(BOTS.indexOf(p.name) + nb + 1) % BOTS.length]; p.style = styles[Math.floor(Math.random() * styles.length)]; } });
        if (table.seats[0].chips === 0) return;
        timer = setTimeout(() => { table.startHand(); step(); }, table.hand ? 3200 : 300);
        return;
      }
      if (turn > 0) timer = setTimeout(() => { table.act(turn, P.decide(table, turn)); step(); }, 550 + Math.random() * 900);
    }
    leaveRoom = () => { alive = false; clearTimeout(timer); save(); };
    step();
  }

  document.documentElement.lang = L; document.documentElement.dir = rtl() ? 'rtl' : 'ltr';
  $('#brandT').textContent = T.title; document.title = T.title + ' · Barusik';
  if (sb) sb.auth.getSession().then(({ data }) => { session = data.session; USER = session?.user || null; drawAcct(); route(); });
  else route();
})();
