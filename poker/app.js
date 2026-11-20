/* Barusik Poker · the app: home, rooms with friends (through the `poker` function), and practice against bots.
   © 2026 Bar Lvovski. All rights reserved. */
(() => {
  'use strict';
  const SB_URL = 'https://iktmyrfbejtjsiehcrar.supabase.co', SB_KEY = 'sb_publishable_vEUqQPQSE0EG7YRnwNeAbg_PzViDO1a';
  const FN = SB_URL + '/functions/v1/poker';
  const P = window.Poker, ALL = window.POKER_T, PT = window.PokerTable;
  // the basket: what it holds and what each costs (the server charges the same)
  const A = window.PokerArt, ITEMS = (window.PokerArt && window.PokerArt.ITEMS) || ['tomato'];
  const PRICES = { tomato: 100, poop: 300, knife: 600, dildo: 1000 }, FULL = { tomato: Infinity, poop: Infinity, knife: Infinity, dildo: Infinity };
  const itemTag = (k) => `<span class="ii">${A.itemSVG(k || 'tomato')}</span>${esc(T.items[k || 'tomato'])}`;
  const LANGS = ['he', 'en', 'ar', 'ru', 'es', 'fr'], NAMES = { he: 'עברית', en: 'English', ar: 'العربية', ru: 'Русский', es: 'Español', fr: 'Français' };
  const qs = new URLSearchParams(location.search);
  let L = qs.get('lang'); try { L = L || localStorage.getItem('barusik.lang'); } catch {}
  L = (L || (navigator.language || 'he')).slice(0, 2); if (!ALL[L]) L = 'he';
  let T = ALL[L];
  const rtl = () => L === 'he' || L === 'ar';
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fill = (s, o) => String(s).replace(/\{(\w)\}/g, (_, k) => o[k] ?? '');
  const num = (v) => PT.num(v);
  const errT = (code) => T.err[code] || T.err.server;
  const app = $('#app');
  const phone = () => matchMedia('(max-aspect-ratio: 1/1)').matches;

  function toast(s) { document.querySelectorAll('.toast').forEach((x) => x.remove()); const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.dir = 'auto'; el.textContent = s; document.body.appendChild(el); setTimeout(() => el.remove(), 3200); }
  const say = (s) => { const el = $('#live'); el.textContent = ''; setTimeout(() => { el.textContent = s; }, 30); };
  const buzz = (p) => { try { if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) navigator.vibrate(p); } catch {} };

  /* ---------- language ---------- */
  function setLang(l) {
    L = l; T = ALL[L];
    try { localStorage.setItem('barusik.lang', L); } catch {}
    document.documentElement.lang = L; document.documentElement.dir = rtl() ? 'rtl' : 'ltr';
    $('#brandT').textContent = T.title; $('#langL').textContent = T.lang;
    document.title = T.title + ' · Barusik';
    const s = $('#lang'); if (s) s.value = L;
    route();
  }
  const sel = $('#lang');
  sel.innerHTML = LANGS.map((l) => `<option value="${l}"${l === L ? ' selected' : ''}>${NAMES[l]}</option>`).join('');
  sel.addEventListener('change', () => setLang(sel.value));

  /* ---------- account (the one Barusik account) ---------- */
  // Guests play under a name only. Their session lives under its own key, so it never shows up as a login on the rest of barusik.com.
  const GKEY = 'barusik-poker-guest';
  const mk = (key) => window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, storageKey: key } });
  const has = (k) => { try { return !!localStorage.getItem(k); } catch { return false; } };
  const sbMain = window.supabase ? mk('complichess-auth') : null;
  const sbGuest = window.supabase && !has('complichess-auth') && has(GKEY) ? mk(GKEY) : null;
  const sb = sbGuest || sbMain;
  const isGuest = () => !!(USER && USER.is_anonymous);
  let session = null, USER = null, GOOGLE = false;
  const myName = () => (USER && (USER.user_metadata?.username || USER.user_metadata?.full_name || (USER.email || '').split('@')[0])) || '';
  async function signOut() { await sb.auth.signOut(); if (sbGuest) { try { localStorage.removeItem(GKEY); } catch {} } location.href = './'; }
  function drawAcct() {
    const el = $('#acct');
    el.innerHTML = USER ? `<b>${esc(myName())}</b>${isGuest() ? `<span class="pill">${esc(T.guestTag)}</span>` : ''}<button class="btn ghost small" id="out">${esc(T.signOut)}</button>` : '';
    $('#out')?.addEventListener('click', signOut);
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
    const keep = { em: '', un: '', gn: (() => { try { return localStorage.getItem('barusik.poker.name') || ''; } catch { return ''; } })() };
    const draw = (msg = '') => {
      box.innerHTML = `<form id="gf" class="guest"><h2>${esc(T.guest)}</h2><p>${esc(T.guestT)}</p>
          <label>${esc(T.guestName)}<input id="gn" maxlength="20" minlength="2" required autocomplete="nickname" value="${esc(keep.gn || '')}"></label>
          <div class="err" id="gm" role="alert"></div>
          <button class="btn">${esc(T.guestGo)}</button></form>
        <div class="or">${esc(T.orAccount)}</div>
        <h2>${esc(mode === 'in' ? T.signIn : T.signUp)}</h2><p>${esc(T.needIn)}</p>
        ${GOOGLE ? `<button class="btn gbtn" id="lg">${esc(T.google)}</button><div class="or">${esc(T.or)}</div>` : ''}
        <form id="lf" style="display:flex;flex-direction:column;gap:10px">
          ${mode === 'up' ? `<label>${esc(T.uname)}<input id="lu" autocomplete="username" maxlength="20" required value="${esc(keep.un)}"></label>` : ''}
          <label>${esc(T.email)}<input id="le" type="email" dir="ltr" autocomplete="email" required value="${esc(keep.em)}"></label>
          <label>${esc(T.password)}<input id="lp" type="password" dir="ltr" autocomplete="${mode === 'in' ? 'current-password' : 'new-password'}" required minlength="6"></label>
          <div class="err" id="lm" role="alert">${esc(msg)}</div>
          <button class="btn">${esc(mode === 'in' ? T.signIn : T.signUp)}</button>
          ${mode === 'in' ? `<button type="button" class="btn ghost small" id="lf2">${esc(T.forgot)}</button>` : ''}
          <button type="button" class="btn ghost small" id="lt">${esc(mode === 'in' ? T.toUp : T.toIn)}</button>
        </form>`;
      $('#gf', box).onsubmit = async (e) => {
        e.preventDefault();
        const name = $('#gn', box).value.trim().replace(/\s+/g, ' '); keep.gn = name;
        if (name.length < 2 || name.length > 20) { $('#gm', box).textContent = T.short; return; }
        const b = $('#gf button', box); b.disabled = true;
        const g = mk(GKEY);
        const r = await g.auth.signInAnonymously({ options: { data: { username: name } } });
        if (r.error) { b.disabled = false; $('#gm', box).textContent = authErr(r.error); return; }
        try { localStorage.setItem('barusik.poker.name', name); } catch {}
        location.reload();
      };
      const save = () => { keep.em = $('#le', box).value.trim(); const u = $('#lu', box); if (u) keep.un = u.value.trim(); };
      $('#lt', box).onclick = () => { save(); mode = mode === 'in' ? 'up' : 'in'; draw(); };
      $('#lg', box)?.addEventListener('click', () => sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + '/poker/' + (back || ''), queryParams: { prompt: 'select_account' } } }));
      $('#lf2', box)?.addEventListener('click', async () => {
        save();
        if (!keep.em) { $('#lm', box).textContent = T.email; $('#le', box).focus(); return; }
        const r = await sb.auth.resetPasswordForEmail(keep.em, { redirectTo: `https://barusik.com/${L}/` });
        $('#lm', box).textContent = r.error ? authErr(r.error) : T.resetSent;
      });
      $('#lf', box).onsubmit = async (e) => {
        e.preventDefault();
        save();
        const pw = $('#lp', box).value;
        const m = (s) => { $('#lm', box).textContent = s; };
        if (pw.length < 6 || (mode === 'up' && (keep.un.length < 2 || keep.un.length > 20))) return m(T.short);
        const btn = $('#lf button.btn', box); btn.disabled = true;
        try {
          if (mode === 'up') {
            const r = await sb.auth.signUp({ email: keep.em, password: pw, options: { data: { username: keep.un }, emailRedirectTo: 'https://barusik.com/poker/' + (back || '') } });
            if (r.error) throw r.error;
            if (r.data.user && Array.isArray(r.data.user.identities) && r.data.user.identities.length === 0) { mode = 'in'; draw(T.exists); return; }
            if (!r.data.session) { mode = 'in'; draw(T.check); return; }
          } else {
            const r = await sb.auth.signInWithPassword({ email: keep.em, password: pw });
            if (r.error) throw r.error;
          }
        } catch (x) {
          if (x && (x.code === 'user_already_exists' || x.code === 'email_exists' || /already/i.test(x.message || ''))) { mode = 'in'; draw(T.exists); return; }
          m(authErr(x));
        }
        btn.disabled = false;
      };
    };
    draw();
    return box;
  }
  function authErr(x) {
    if (navigator.onLine === false) return T.err.offline;
    const c = (x && x.code) || '', st = x && x.status;
    if (c === 'invalid_credentials' || (st === 400 && /invalid/i.test(x.message || ''))) return T.badLogin;
    if (c === 'email_not_confirmed') return T.check;
    if (c === 'weak_password') return T.weak;
    if (c === 'over_request_rate_limit' || c === 'over_email_send_rate_limit' || st === 429) return T.tooMany;
    if (c === 'validation_failed' || c === 'email_address_invalid') return T.badEmail;
    return T.err.server;
  }

  /* ---------- cards ---------- */
  const RK = { 10: '10', 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
  const GAMES = ['nlh', 'plo5', 'plo', 'plh', 'plo58', 'plo8', 'plo6', 'plo68'];
  const SHORT = { nlh: 'NLH', plh: 'PLH', plo: 'PLO', plo8: 'PLO Hi/Lo', plo5: 'PLO5', plo58: 'PLO5 Hi/Lo', plo6: 'PLO6', plo68: 'PLO6 Hi/Lo' };
  // the newer server (hand history, double board, Hi/Lo, time bank, rabbit) answers `myhands`; an older one doesn't know it
  let PLUS = null, plusP = null;
  function probePlus() {
    if (PLUS === true || !session || (PLUS === false && Date.now() - (probePlus.at || 0) < 20000)) return Promise.resolve(PLUS);
    probePlus.at = Date.now();
    return (plusP ||= call('myhands', { limit: 1 }).then(() => (PLUS = true), (x) => { PLUS = x.message === 'offline' || x.message === 'notReady' ? null : false; plusP = null; return PLUS; }));
  }
  const games = () => (PLUS ? GAMES : ['nlh', 'plh', 'plo']);
  const H = window.PokerHist;
  const cardLabel = PT.label, cardHTML = PT.card;

  /* ---------- routing ---------- */
  const roomId = () => (qs.get('r') || location.hash.replace(/^#r=?/, '') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  let leaveRoom = null;
  function go(url) { history.pushState(null, '', url); qs.forEach((_, k) => qs.delete(k)); new URLSearchParams(location.search).forEach((v, k) => qs.set(k, v)); route(); }
  addEventListener('popstate', () => { qs.forEach((_, k) => qs.delete(k)); new URLSearchParams(location.search).forEach((v, k) => qs.set(k, v)); route(); });
  let routed = false;
  function route() {
    routed = true;
    if (leaveRoom) { leaveRoom(); leaveRoom = null; }
    document.body.classList.remove('in-room', 'drawer-open');
    document.querySelectorAll('.drawer,.scrim,.menu').forEach((x) => x.remove());
    const r = roomId();
    if (r) return openRoom(r);
    if (qs.has('practice')) return openPractice();
    drawHome();
  }
  $('#brand').addEventListener('click', (e) => { e.preventDefault(); go('./'); });

  /* ---------- home ---------- */
  function drawHome() {
    const fan = [P.parse('As'), P.parse('Kh'), P.parse('Qd'), P.parse('Jc'), P.parse('Ts')];
    const sample = ['As Ks Qs Js Ts', '9c 9d 9h 9s 2d', 'Kh Kd Kc 4s 4h', 'Ad Jd 8d 6d 3d', '9s 8h 7d 6c 5s', 'Qc Qd Qh 7s 2c', 'Jh Js 4c 4d Ac', 'Th Tc 8s 5d 2h', 'Ah Jc 8d 6s 3c'];
    app.innerHTML = `<div class="home">
      <section class="hero"><div><h1>${esc(T.title).replace(/(\S+)$/, '<em>$1</em>')}</h1><p>${esc(T.sub)}</p></div>
        <div class="fan" aria-hidden="true">${fan.map((c, i) => `<span class="fc" style="transform:translateX(-50%) rotate(${(i - 2) * 11}deg) translateY(${Math.abs(i - 2) * 8}px);animation-delay:${i * 70}ms">${cardHTML(c)}</span>`).join('')}</div></section>
      <div class="grid3" id="boxes"></div>
      <div class="note"><span aria-hidden="true">🪙</span><span>${esc(T.chipsOnly)}</span></div>
      <section style="margin-top:28px"><h2 style="font-size:18px;margin:0">${esc(T.rules)}</h2><p class="mute small" style="margin:2px 0 0">${esc(T.rulesT)}</p>
        <div class="ranks">${T.hands.slice().reverse().map((h, i) => `<div><span class="mini">${sample[i].split(' ').map((s) => cardHTML(P.parse(s))).join('')}</span><span>${esc(h)}</span></div>`).join('')}</div></section>
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
        <label>${esc(T.game)}<select name="game">${games().map((g) => `<option value="${g}">${esc(T[g])}</option>`).join('')}</select></label>
        <label>${esc(T.maxBuy)}<input name="maxBuy" type="number" inputmode="numeric" min="100" max="100000000" step="100" value="100000"></label>
        <label class="check"><input type="checkbox" name="approve" checked>${esc(T.approveOn)}</label>
        <button class="btn">${esc(T.createGo)}</button>`;
      c.onsubmit = async (e) => {
        e.preventDefault();
        const f = new FormData(c); const [s, b] = String(f.get('bl')).split('/').map(Number);
        const btn = $('button.btn', c); btn.disabled = true;
        try {
          const r = await call('create', { title: f.get('title'), name: f.get('name'), settings: { sb: s, bb: b, seats: +f.get('seats'), approve: !!f.get('approve'), minBuy: b * 50, maxBuy: Math.max(b * 50, +f.get('maxBuy') || 100000), game: f.get('game'), minRaise: b } });
          try { localStorage.setItem('barusik.poker.name', String(f.get('name'))); } catch {}
          go('?r=' + r.room);
        } catch (x) { fail(x); btn.disabled = false; }
      };
      boxes.appendChild(c);
      if (PLUS !== true) probePlus().then((ok) => { const sel2 = $('select[name=game]', c); if (ok && sel2) sel2.innerHTML = games().map((g) => `<option value="${g}">${esc(T[g])}</option>`).join(''); });
    }
    const j = document.createElement('form'); j.className = 'box';
    j.innerHTML = `<h2>${esc(T.join)}</h2><label>${esc(T.code)}<input name="code" dir="ltr" maxlength="8" autocapitalize="characters" autocomplete="off" required style="text-transform:uppercase;letter-spacing:.2em;font-family:var(--fd)"></label><button class="btn ghost">${esc(T.joinGo)}</button>`;
    j.onsubmit = (e) => { e.preventDefault(); const v = String(new FormData(j).get('code')).toUpperCase().replace(/[^A-Z0-9]/g, ''); if (v) go('?r=' + v); };
    boxes.appendChild(j);
    const p = document.createElement('form'); p.className = 'box';
    p.innerHTML = `<h2>${esc(T.practice)}</h2><p>${esc(T.practiceT)}</p><label>${esc(T.bots)}<select name="bots">${[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `<option${n === 5 ? ' selected' : ''}>${n}</option>`).join('')}</select></label><button class="btn ghost">${esc(T.practiceGo)}</button>`;
    p.onsubmit = (e) => { e.preventDefault(); go('?practice=' + new FormData(p).get('bots')); };
    boxes.appendChild(p);
  }

  /* ---------- what you hold, PokerNow-style: "Two Pair (9,8)" ---------- */
  const rk = (r) => RK[r] || String(r);
  function handDesc(cards, board) {
    if (!Array.isArray(cards) || cards.length < 2 || cards[0] === 'back') return '';
    board = board || [];
    if (board.length < 3) {
      if (cards.length !== 2) return '';
      const [a, b] = cards.map(P.rankOf);
      return a === b ? `${T.hands[1]} (${rk(a)})` : `${T.hands[0]} (${rk(Math.max(a, b))})`;
    }
    const cat = P.category(P.value(cards, board));
    const five = P.bestFive(cards, board).map(P.rankOf);
    const cnt = {}; five.forEach((r) => (cnt[r] = (cnt[r] || 0) + 1));
    const groups = Object.keys(cnt).map(Number).sort((x, y) => cnt[y] - cnt[x] || y - x);
    const top = (() => { const s = five.slice().sort((x, y) => y - x); return s[0] === 14 && s[1] === 5 ? 5 : s[0]; })();
    const what = cat === 2 || cat === 6 ? `${rk(groups[0])},${rk(groups[1])}` : cat === 4 || cat === 8 ? `${top === 5 ? 'A' : rk(top - 4)}-${rk(top)}` : cat === 5 ? rk(Math.max(...five)) : rk(groups[0]);
    return `${T.hands[cat]} (${what})`;
  }
  const handName = (cat) => (cat == null ? '' : T.hands[cat]);
  function logLine(e) {
    const a = e.a != null ? num(e.a) : '';
    const n = `<bdi class="cs">${esc(e.name || '')}</bdi>`; const all = e.all ? esc(T.lall) : '';
    switch (e.k) {
      case 'hand': return `<div class="hd">${fill(esc(T.lhand), { a: e.n })}</div>`;
      case 'sb': return fill(esc(T.lsb), { n, a }); case 'bb': return fill(esc(T.lbb), { n, a }); case 'ante': return fill(esc(T.lante), { n, a }); case 'straddle': return fill(esc(T.lstraddle), { n, a }); case 'bomb': return fill(esc(T.lbombp), { n, a });
      case 'fold': return fill(esc(T.lfold), { n }); case 'check': return fill(esc(T.lcheck), { n });
      case 'call': return fill(esc(T.lcall), { n, a }) + all; case 'bet': return fill(esc(T.lbet), { n, a }) + all; case 'raise': return fill(esc(T.lraise), { n, a }) + all;
      case 'board': { const fb = (x) => { const b = x.map(cardLabel); return `[${b.slice(0, 3).join(' ')}]${b.length > 3 ? ' [' + b.slice(3).join('] [') + ']' : ''}`; }; const st = e.b.length === 3 ? 'Flop' : e.b.length === 4 ? 'Turn' : e.b.length === 5 ? 'River' : 'Board'; return `<b>${st}:</b> ${fb(e.b)}${e.b2 ? ' · ' + fb(e.b2) : ''}`; }
      case 'back': return fill(esc(T.lback), { n, a });
      case 'board2': return fill(esc(T.lboard2), { a: e.b.map(cardLabel).join(' ') });
      case 'b72': return fill(esc(T.l72), { n, a });
      case 'bombon': return fill(esc(T.lbombon), { a }); case 'bomboff': return esc(T.lbomboff);
      case 'win': { const ns = `<bdi class="cs">${esc((e.names || []).join(', '))}</bdi>`; return (e.run ? `<b>${esc(fill(T.runN, { a: e.run }))}</b> ` : '') + (e.cat == null && !e.low ? fill(esc(T.lwin), { n: ns, a }) : fill(esc(T.lwinH), { n: ns, a, h: esc(e.low ? T.lowH : handName(e.cat)) })); }
      case 'sit': return fill(esc(T.lsit), { n, a }); case 'left': return fill(esc(T.lleft), { n, a }); case 'rebuy': return fill(esc(T.lrebuy), { n, a });
      case 'kick': return fill(esc(T.lkick), { n }); case 'host': return fill(esc(T.lhost), { n }); case 'admin': return esc(T.ladmin);
      case 'ask2': return `<b>${esc(T.lask2)}</b>`; case 'rit': return `<b>${esc(e.twice ? T.lritTwice : T.lritOnce)}</b>`;
      case 'pause': return esc(T.lpause); case 'resume': return esc(T.lresume); case 'closed': return esc(T.lclosed);
      case 'away': return fill(esc(T.laway), { n }); case 'ask': return fill(esc(T.lask), { n }); case 'denied': return fill(esc(T.ldenied), { n });
      case 'chips': return fill(esc(T.lchips), { n, a });
      case 'throw': return fill(esc(T.lthrowI), { n, i: itemTag(e.it), t: `<bdi class="cs">${esc(e.to || '')}</bdi>` });
      case 'buy': return fill(esc(T.lbuyI), { n, a, i: itemTag(e.it) });
      case 'show': return fill(esc(T.lshow), { n }) + (e.b ? ` [${e.b.map(cardLabel).join(' ')}]` : '');
      case 'settings': return fill(esc(e.next ? T.lsettingsNext : T.lsettings), { a: `<bdi class="n">${e.sb}/${e.bb}</bdi>` }) + (e.game ? ` · ${esc(T[e.game] || '')}` : '');
      default: return '';
    }
  }
  const logHTML = (list) => list.map((e) => { const l = logLine(e); if (!l) return ''; return l.startsWith('<div') ? l : `<div class="li${e.k === 'win' ? ' win' : ''}" dir="${e.k === 'throw' || e.k === 'buy' ? 'auto' : 'ltr'}">${l}</div>`; }).join('');

  /* ---------- the action dock, PokerNow's way ----------
     your turn: FOLD · CHECK/CALL · RAISE (RAISE opens the sizing panel above, the table never moves)
     someone else's turn: CHECK/FOLD and CALL ANY ticked in advance. Keys: F, C (or K), R, Enter, Esc. */
  const pre = { v: '', key: '' };
  function drawActions(el, v, o, send, extra) {
    const me = v.seats[v.me];
    const street = `${v.hand}|${(v.board || []).length}`;
    if (pre.key && pre.key !== street) pre.v = '';
    el.classList.toggle('mine', !!o);
    const hs = me && v.myHand ? `<span class="hs">${esc(v.myHand)}</span>` : '';
    if (!o) {
      el._key = '';
      const waiting = me && Array.isArray(me.cards) && !me.folded && !me.allIn && v.toAct >= 0 && v.toAct !== v.me;
      const key = ['w', street, pre.v, extra.html || '', !!waiting, hs].join('|');
      if (el._wkey === key) return; el._wkey = key;
      el.innerHTML = `<div class="info">${hs}</div>` + (waiting ? `<div class="row">${[['f', T.fold], ['cf', T.checkFold], ['ca', T.callAny]].map(([k, l]) => `<button class="act p${pre.v === k ? ' on' : ''}" data-pre="${k}" aria-pressed="${pre.v === k}">${esc(l)}</button>`).join('')}</div>` : '') + (extra.html || '');
      el.querySelectorAll('[data-pre]').forEach((b) => (b.onclick = () => { pre.v = pre.v === b.dataset.pre ? '' : b.dataset.pre; pre.key = street; el._wkey = ''; drawActions(el, v, o, send, extra); }));
      extra.bind && extra.bind(el);
      return;
    }
    el._wkey = '';
    const key = [street, o.toCall, o.minTo, o.maxTo, o.check, o.raise, hs].join('|');
    if (el._key === key) return; // the same decision: keep whatever the player was sliding
    el._key = key;
    // a box ticked in advance plays itself the moment the turn arrives
    if (pre.v && pre.key === street) {
      const k = pre.v; pre.v = '';
      el.innerHTML = `<div class="info">${hs}</div>`;
      return send(k === 'f' ? 'fold' : k === 'cf' ? (o.check ? 'check' : 'fold') : (o.check ? 'check' : 'call'), 0);
    }
    const pot = v.pot + v.seats.reduce((t, x) => t + (x ? x.bet : 0), 0);
    const clamp = (x) => Math.max(o.minTo, Math.min(o.maxTo, Math.round(x)));
    const cur = me.bet + o.toCall;
    const size = (f) => clamp(cur + (pot + o.toCall) * f);
    const step = Math.max(1, v.bb >= 20 ? Math.floor(v.bb / 2) : 1);
    const word = o.bet ? T.bet : T.raise;
    // pot limit: the top of the slider is the pot, so it says POT; ALL IN only when it really is everything
    const maxL = o.maxTo >= (o.allTo ?? me.bet + me.chips) ? T.allin : T.potB;
    let open = false, sure = false;
    // before the flop with nothing but the blinds in: sizes in big blinds; otherwise parts of the pot
    const open1 = !(v.board || []).length && cur <= (v.bb || 0) * 2 && v.bb;
    const presets = !o.raise ? [] : (open1 ? [['2 BB', clamp(v.bb * 2)], ['2.5 BB', clamp(v.bb * 2.5)], ['3 BB', clamp(v.bb * 3)], ['4 BB', clamp(v.bb * 4)], [T.potB, size(1)], [maxL, o.maxTo]] : [[T.minB, o.minTo], [T.half, size(0.5)], [T.q3, size(0.75)], [T.potB, size(1)], [maxL, o.maxTo]])
      .filter((x, i, all) => i === all.length - 1 || (x[1] >= o.minTo && x[1] < o.maxTo && all.findIndex((y) => y[1] === x[1]) === i));
    const paint = () => {
      const callB = o.check ? `<button class="act c" data-k="c">${esc(T.checkB)}</button>` : `<button class="act c" data-k="c">${esc(T.callW)}<small>${num(o.call)}${o.call >= me.chips ? ' · ' + esc(T.allin) : ''}</small></button>`;
      const raiseB = o.raise ? (open ? `<button class="act r" data-k="go"></button>` : `<button class="act r" data-k="r">${esc(word)}</button>`) : '';
      el.innerHTML = (open ? `<div class="raisep">
            <div class="presets">${presets.map(([l, x]) => `<button type="button" data-x="${x}">${esc(l)}</button>`).join('')}</div>
            <div class="slide"><button class="stepb" type="button" data-d="-1" aria-label="−">−</button><input type="range" min="${o.minTo}" max="${o.maxTo}" step="${step}" value="${o.minTo}" aria-label="${esc(word)}"><button class="stepb" type="button" data-d="1" aria-label="+">+</button><input type="number" min="${o.minTo}" max="${o.maxTo}" step="1" value="${o.minTo}" inputmode="numeric" aria-label="${esc(T.amount)}"></div>
          </div>` : '')
        + `<div class="info">${hs}<span class="yt">${esc(T.yourTurn)}</span></div>`
        + `<div class="row">${open ? `<button class="act b" data-k="back">${esc(T.back2)}</button>` : `<button class="act f${sure ? ' sure' : ''}" data-k="f">${esc(sure ? T.foldSure : T.fold)}</button>${callB}`}${raiseB}</div>`
        + (matchMedia('(hover:hover)').matches ? `<div class="keys">${esc(T.keys)}</div>` : '');
      const done = (type, to) => { el.querySelectorAll('button,input').forEach((x) => (x.disabled = true)); PT.sfx.click(); send(type, to); };
      const btn = (k) => $(`[data-k=${k}]`, el);
      if (!open) {
        btn('f').onclick = () => done('fold', 0);
        btn('c').onclick = () => done(o.check ? 'check' : 'call', 0);
        btn('r') && (btn('r').onclick = () => { if (o.minTo >= o.maxTo) return done('raise', o.maxTo); open = true; paint();
          // on a computer the amount box is ready to type into; on a phone the keyboard waits until the box itself is tapped
          if (matchMedia('(hover: hover) and (pointer: fine)').matches) { const b = $('input[type=number]', el); b.focus({ preventScroll: true }); b.select(); } });
        return;
      }
      const range = $('input[type=range]', el), box = $('input[type=number]', el), go = btn('go');
      const label = () => { const x = clamp(+box.value || o.minTo); go.innerHTML = x >= o.maxTo ? `${esc(maxL)}<small>${num(x)}</small>` : o.bet ? `${esc(T.bet)}<small>${num(x)}</small>` : `${esc(T.raise)}<small>${esc(T.toW)} ${num(x)}</small>`; };
      const setTo = (x) => { box.value = range.value = clamp(x); label(); };
      range.oninput = () => { box.value = range.value; label(); };
      box.oninput = () => { range.value = box.value; label(); };
      box.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); go.click(); } };
      el.querySelectorAll('[data-x]').forEach((b) => (b.onclick = () => setTo(+b.dataset.x)));
      el.querySelectorAll('[data-d]').forEach((b) => (b.onclick = () => setTo((+box.value || o.minTo) + (+b.dataset.d) * (v.bb || step))));
      btn('back').onclick = () => { open = false; paint(); };
      go.onclick = () => done('raise', clamp(+box.value));
      label();
    };
    paint();
  }
  addEventListener('keydown', (e) => {
    const el = $('#acts'); if (!el || !el.classList.contains('mine') || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target; if (t && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && t.type !== 'range' && t.type !== 'number')) || document.querySelector('dialog[open]')) return;
    const k = e.key.toLowerCase();
    const hit = (s) => { const b = $(s, el); if (b && !b.disabled) { e.preventDefault(); b.click(); } };
    if (t && t.tagName === 'INPUT' && t.type === 'number' && /^[0-9]$/.test(k)) return;
    if (k === 'f') hit('[data-k=f]'); else if (k === 'c' || k === 'k') hit('[data-k=c]'); else if (k === 'r') hit('[data-k=r]');
    else if (k === 'escape') hit('[data-k=back]'); else if (k === 'enter' && (!t || t.tagName !== 'INPUT')) hit('[data-k=go]');
  });

  /* ---------- the room screen (rooms and practice) ---------- */
  let drawerTab = null;
  function roomShell() {
    document.body.classList.add('in-room');
    app.innerHTML = `<div class="room" id="room" dir="ltr">
        <div class="rbar" id="rbar"></div>
        <div class="tablearea" id="felt"></div>
        <div class="dock" dir="ltr"><div class="chatdock hide" id="chatdock"></div><span></span><div class="acts" id="acts" aria-live="off"></div></div>
        <div class="banner" id="banner"></div>
      </div>`;
    const scrim = document.createElement('div'); scrim.className = 'scrim'; scrim.id = 'scrim';
    const side = document.createElement('aside'); side.className = 'drawer'; side.id = 'side'; side.dir = 'ltr';
    side.innerHTML = `<div class="tabs" role="tablist" id="tabs"></div><div class="pane" id="pane"></div><div id="sidefoot"></div>`;
    document.body.append(scrim, side);
    scrim.onclick = () => closeDrawer();
    drawerTab = null;
  }
  function openDrawer(tab, draw) { drawerTab = tab; $('#side').classList.add('open'); document.body.classList.add('drawer-open'); if (phone()) $('#scrim').classList.add('on'); draw && draw(); }
  function closeDrawer() { drawerTab = null; $('#side')?.classList.remove('open'); $('#scrim')?.classList.remove('on'); document.body.classList.remove('drawer-open'); }
  function menu(anchor, items) {
    document.querySelectorAll('.menu').forEach((x) => x.remove());
    const m = document.createElement('div'); m.className = 'menu'; m.dir = 'ltr';
    m.innerHTML = items.map((it, i) => (it === '-' ? '<hr>' : `<button type="button" data-i="${i}">${esc(it[0])}</button>`)).join('');
    document.body.appendChild(m);
    const r = anchor.getBoundingClientRect(); m.style.top = r.bottom + 6 + 'px'; m.style.right = Math.max(8, innerWidth - r.right) + 'px';
    m.querySelectorAll('[data-i]').forEach((b) => (b.onclick = () => { m.remove(); items[+b.dataset.i][1](); }));
    setTimeout(() => addEventListener('pointerdown', function off(e) { if (!m.contains(e.target)) { m.remove(); removeEventListener('pointerdown', off, true); } }, true), 0);
  }
  function prefsHTML() {
    const p = PT.prefs;
    return `<h3>${esc(T.prefs)}</h3>
      <label>${esc(T.fourColor)}<input type="checkbox" data-pref="four" ${p.four ? 'checked' : ''}></label>
      <label>${esc(T.sounds)}<input type="checkbox" data-pref="sound" ${p.sound ? 'checked' : ''}></label>
      <label>${esc(T.showBB)}<input type="checkbox" data-pref="bbs" ${p.bbs ? 'checked' : ''}></label>
      <label>${esc(T.felt)}<span class="swatches">${Object.entries(PT.FELTS).map(([k, c]) => `<button type="button" data-felt="${k}" aria-pressed="${p.felt === k}" style="background:${c}" aria-label="${k}"></button>`).join('')}</span></label>
      <label>${esc(T.backC)}<span class="swatches">${Object.entries(PT.BACKS).map(([k, c]) => `<button type="button" data-back="${k}" aria-pressed="${p.back === k}" style="background:${c}" aria-label="${k}"></button>`).join('')}</span></label>
      <label>${esc(T.lang)}<select data-lang>${LANGS.map((l) => `<option value="${l}"${l === L ? ' selected' : ''}>${NAMES[l]}</option>`).join('')}</select></label>`;
  }
  function bindPrefs(pane, redraw) {
    pane.querySelectorAll('[data-pref]').forEach((x) => (x.onchange = () => { PT.setPref(x.dataset.pref, x.checked); redraw(); }));
    pane.querySelectorAll('[data-felt]').forEach((x) => (x.onclick = () => { PT.setPref('felt', x.dataset.felt); redraw(); }));
    pane.querySelectorAll('[data-back]').forEach((x) => (x.onclick = () => { PT.setPref('back', x.dataset.back); redraw(); }));
    const l = pane.querySelector('[data-lang]'); if (l) l.onchange = () => setLang(l.value);
  }

  /* ---------- characters ---------- */
  const lookHTML = (l) => PokerArt.avatarSVG((l && l.av) || 0);
  function savedLook() {
    let av = Math.floor(Math.random() * PokerArt.count);
    try { const v = localStorage.getItem('barusik.poker.look'); if (v != null && v !== '') av = (+v || 0) % PokerArt.count; } catch {}
    return { av, ph: '' };
  }
  function pickLook(cur, then) {
    const d = document.createElement('dialog');
    d.className = 'looks';
    d.innerHTML = `<h2>${esc(T.pickLook)}</h2><div class="lookgrid">
      ${PokerArt.LOOKS.map((l, i) => `<button type="button" class="look${cur && i === cur.av ? ' on' : ''}" data-i="${i}"><span class="avs">${PokerArt.avatarSVG(i)}</span><b>${esc(l.name)}</b></button>`).join('')}</div>
      <div class="row"><button class="btn ghost" data-x>${esc(T.cancel)}</button></div>`;
    document.body.appendChild(d); d.showModal();
    const done = (l) => { try { localStorage.setItem('barusik.poker.look', String(l.av)); } catch {} d.close(); then(l); };
    d.querySelector('[data-x]').onclick = () => d.close();
    d.querySelectorAll('[data-i]').forEach((b) => (b.onclick = () => done({ av: +b.dataset.i, ph: '' })));
    d.addEventListener('close', () => d.remove());
  }

  /* ================= rooms with friends ================= */
  function openRoom(id) {
    if (!USER) {
      app.innerHTML = `<div class="home"><div class="grid3" style="grid-template-columns:minmax(0,460px);justify-content:center;padding-top:30px"></div></div>`;
      $('.grid3', app).appendChild(loginBox('?r=' + id));
      return;
    }
    roomShell();
    let room = null, my = { hand: -1, cards: null }, unread = 0, admin = false, timers = [], alive = true, chan = null, lastTurnMine = false, chatSeen = null;
    let tbl = null, seenThrows = null, wonHand = 0, bchan = null, pendingThrows = 0, lastReqs = 0;
    let rabbit = null; // {hand, board}: the cards that would have come, only for me
    const hist = { room: null, mine: null, filter: 'all', scope: 'room', loading: false, off: false, hand: -1 };
    async function loadHist(force) {
      const want = hist.scope === 'mine' || drawerTab === 'stats' ? ['room', 'mine'] : ['room'];
      const hn = st().handNo || 0;
      if (!force && hist.hand === hn && want.every((k) => hist[k])) return;
      hist.loading = true;
      try {
        for (const k of want) { const r = await call(k === 'room' ? 'hands' : 'myhands', { room: id, limit: 100 }); hist[k] = r.hands || []; }
        hist.hand = hn; hist.off = false;
      } catch (x) { if (x.message === 'no_history' || x.message === 'bad_action') hist.off = true; }
      hist.loading = false;
      if (drawerTab === 'hands' || drawerTab === 'stats') drawSide();
    }
    const onNote = (i, el) => { const x = st().seats[i]; if (!x) return; const S = hist.room ? H.statsOf(hist.room)[x.uid] : null; H.notePop(T, el, { uid: x.uid, name: x.name }, H.statLine(S), () => draw()); if (!hist.room) loadHist(); };
    const counts = {};
    const st = () => room.state;
    const isHost = () => room && (room.host === USER.id || admin);
    const mySeat = () => (st().seats || []).findIndex((s) => s && s.uid === USER.id);
    const myBag = () => counts[USER.id] || {};
    // a basket row: tomatoes always; poop, knives and toys once the new columns are in the database
    const bagOf = (x) => ({ tomato: x.tomatoes | 0, poop: x.poop | 0, knife: x.knife | 0, dildo: x.dildo | 0 });
    let itemsReady = true;

    async function loadCounts() {
      if (!room) return;
      const uids = [...new Set([USER.id, ...(st().seats || []).filter(Boolean).map((x) => x.uid)])];
      let r = await sb.from('po_baskets').select('uid,tomatoes,poop,knife,dildo').in('uid', uids);
      if (r.error) { itemsReady = false; r = await sb.from('po_baskets').select('uid,tomatoes').in('uid', uids); }
      if (r.error || !alive) return;
      for (const u of uids) counts[u] = {};
      for (const x of r.data || []) counts[x.uid] = bagOf(x);
      draw();
    }
    bchan = sb.channel('po-baskets-' + id).on('postgres_changes', { event: '*', schema: 'public', table: 'po_baskets' }, (p) => {
      const x = p.new; if (!x || !x.uid || !(x.uid in counts)) return;
      if (x.uid === USER.id && pendingThrows > 0) return; // my own throws are already counted down
      counts[x.uid] = bagOf(x); draw();
    }).subscribe();
    async function throwAt(seat, item) {
      const ms = mySeat(), it = ITEMS.includes(item) ? item : 'tomato';
      if (ms < 0) return toast(T.err.not_seated);
      if (!(myBag()[it] > 0)) { toast(fill(T.noItem, { i: T.items[it] })); return openShop(it); }
      const tid = Math.random().toString(36).slice(2, 10);
      (seenThrows ||= new Set()).add(tid);
      counts[USER.id] = { ...myBag(), [it]: myBag()[it] - 1 }; pendingThrows++; draw();
      tbl.throwAt(ms, seat, { item: it });
      try { await call(it === 'tomato' ? 'throw' : 'throwItem', { room: id, seat, tid, item: it }); }
      catch (x) { fail(x.message === 'bad_action' ? new Error('soon') : x); }
      finally { pendingThrows--; if (!pendingThrows) setTimeout(loadCounts, 400); }
    }
    // the shop: everything the basket can hold, paid from my stack at this table
    function openShop(want) {
      const d = document.createElement('dialog'); d.className = 'shopd';
      const bag = myBag(), stack = (st().seats[mySeat()] || {}).chips;
      d.innerHTML = `<h2>🧺 ${esc(T.shopT)}</h2><p class="mute small" style="margin:0">${esc(T.shopNote)}${stack != null ? `<br>${fill(esc(T.myStack), { a: `<b>${PT.fmt(stack)}</b>` })}` : ''}</p>
        <div class="shopl">${ITEMS.map((k) => `<div class="si${k === want ? ' want' : ''}" data-it="${k}"><span class="sic">${A.itemSVG(k)}</span>
          <span class="sn"><b>${esc(T.items[k])}</b><small>${esc(fill(T.chipsEach, { a: PT.fmt(PRICES[k]) }))} · ${esc(fill(T.haveN, { a: bag[k] | 0 }))}</small></span>
          <span class="qty"><button type="button" data-d="-1" aria-label="−">−</button><output>1</output><button type="button" data-d="1" aria-label="+">+</button></span>
          <button type="button" class="btn small" data-buy>${esc(T.buyGo)}</button></div>`).join('')}</div>
        <div class="row"><button type="button" class="btn ghost" data-x>${esc(T.shut || T.cancel)}</button></div>`;
      document.body.appendChild(d); d.showModal();
      const w = d.querySelector('.si.want'); if (w) w.scrollIntoView({ block: 'nearest' });
      d.addEventListener('close', () => d.remove());
      d.querySelector('[data-x]').onclick = () => d.close();
      d.querySelectorAll('.si').forEach((row) => {
        const k = row.dataset.it, o = row.querySelector('output');
        row.querySelectorAll('[data-d]').forEach((b) => (b.onclick = () => { const n = Math.max(1, Math.min(99, (+o.textContent || 1) + +b.dataset.d)); o.textContent = n; row.querySelector('[data-buy]').textContent = `${T.buyGo} · ${PT.fmt(n * PRICES[k])}`; }));
        row.querySelector('[data-buy]').onclick = async (e) => {
          const n = +o.textContent || 1; e.target.disabled = true;
          if (k !== 'tomato' && !itemsReady) { e.target.disabled = false; return fail(new Error('soon')); }
          try { await call(k === 'tomato' ? 'buy' : 'buyItem', { room: id, n, item: k }); counts[USER.id] = { ...myBag(), [k]: (myBag()[k] | 0) + n }; draw(); PT.sfx.toss(); toast(`🧺 +${n} ${T.items[k]}`); d.close(); }
          catch (x) { e.target.disabled = false; fail(x.message === 'bad_action' ? new Error('soon') : x); }
        };
      });
    }
    // tomatoes thrown by others: from their seat to the face
    function animateThrows() {
      const list = st().throws || [];
      if (seenThrows === null) { seenThrows = new Set(list.map((t) => t.id)); return; }
      for (const t of list) {
        if (seenThrows.has(t.id)) continue; seenThrows.add(t.id);
        if (Date.now() - t.at > 8000 || !tbl) continue;
        const me = mySeat();
        const it = t.it || 'tomato';
        tbl.throwAt(t.fs, t.to, { item: it, onHit: () => { if (t.to === me) { buzz(it === 'knife' ? [60, 30, 20] : [30, 40, 60]); say(fill(T.lthrowI, { n: t.from, i: T.items[it], t: t.name })); } } });
        const fu = (st().seats[t.fs] || {}).uid; if (fu && counts[fu]) counts[fu] = { ...counts[fu], [it]: Math.max(0, (counts[fu][it] | 0) - 1) };
      }
    }
    // new chat lines pop over the speaker's seat
    function chatBubbles() {
      const list = st().chat || [];
      if (chatSeen === null) { chatSeen = list.length ? list[list.length - 1].at : 0; return; }
      for (const m of list) {
        if (m.at <= chatSeen) continue;
        chatSeen = m.at;
        const i = (st().seats || []).findIndex((x) => x && x.uid === m.uid);
        if (i >= 0 && tbl) tbl.bubble(i, m.text);
        if (m.uid !== USER.id && drawerTab !== 'chat' && phone()) unread++;
      }
    }

    sb.rpc('is_admin').then((r) => { admin = r.data === true; if (room) draw(); });
    probePlus().then((ok) => { if (ok === false) hist.off = true; if (room) { $('#rbar')._key = ''; draw(); if (drawerTab) drawSide(); } });

    async function load() {
      const r = await sb.from('po_rooms').select('*').eq('id', id).maybeSingle();
      if (!alive) return;
      if (r.error && /po_rooms|relation|schema/i.test(r.error.message)) { gone(T.err.notReady, true); return; }
      if (!r.data) { gone(T.err.no_room); return; }
      apply(r.data);
    }
    function gone(text, practice) {
      alive = false; closeDrawer(); document.body.classList.remove('in-room');
      app.innerHTML = `<div class="home"><div class="note">${esc(text)}</div><p style="display:flex;gap:10px"><a class="btn" href="./">${esc(T.title)}</a>${practice ? `<a class="btn ghost" href="?practice=5">${esc(T.practice)}</a>` : ''}</p></div>`;
    }
    function apply(row) {
      if (!alive || (room && row.version < room.version)) return;
      room = row;
      if (room.status === 'closed') { gone(T.closed); return; }
      const live = st().live, ms = mySeat();
      const handNo = st().handNo || 0;
      if (ms >= 0 && live && live.players[ms] && live.players[ms].has && my.hand !== handNo) { my.hand = handNo; my.cards = null; call('my', { room: id }).then((r) => { if (r.hand === handNo) { my.cards = r.cards; draw(); } }).catch(() => { my.hand = -1; }); }
      if (!live || !live.players[ms]) my.cards = null;
      schedule();
      const seatKey = (st().seats || []).map((x) => (x ? x.uid : '')).join(',');
      if (seatKey !== apply.seatKey) { apply.seatKey = seatKey; loadCounts(); }
      chatBubbles();
      // a check knocks on the table
      const lg = st().log || [], lastAt = lg.length ? lg[lg.length - 1].at : 0;
      if (apply.logAt != null) for (const e of lg) if (e.at > apply.logAt && e.k === 'check') { PT.sfx.check(); break; }
      apply.logAt = lastAt;
      draw();
      animateThrows();
      const res = st().hand && st().hand.results;
      if (res && live && live.stage === 'done' && st().handNo !== wonHand) { const won = res.some((r) => r.seats.includes(ms)); wonHand = st().handNo; if (won) setTimeout(() => toast(T.gotT), 1200); setTimeout(loadCounts, 1500); }
    }
    // the clock lives on the server; any open page may nudge it when a deadline passes
    function schedule() {
      timers.forEach(clearTimeout); timers = [];
      const now = Date.now(), jitter = () => 250 + Math.random() * 700;
      const at = [];
      if (st().turn) at.push(st().turn.until);
      if (st().ask) at.push(st().ask.until);
      if (st().nextAt && st().playing && !st().paused) at.push(st().nextAt);
      for (const t of at) timers.push(setTimeout(() => call('tick', { room: id }).catch(() => {}), Math.max(0, t - now) + jitter()));
    }
    function view() {
      const s = st(), live = s.live, ms = mySeat();
      const n = s.settings.seats;
      const showdown = live && live.stage === 'done' && s.hand && s.hand.results;
      const winners = {};
      if (showdown) for (const r of s.hand.results) for (const [seat, a] of Object.entries(r.share)) winners[seat] = (winners[seat] || 0) + a;
      const board = s.hand ? s.hand.board : [];
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
        if (showdown && Array.isArray(cards) && board.length === 5 && !p.folded) { hand = handDesc(cards, board); if (winners[i]) best = P.bestFive(cards, board); }
        return { uid: x.uid, av: x.av || 0, bag: counts[x.uid] || {}, name: x.name, chips: x.chips, bet: p ? p.bet : 0, folded: p ? p.folded : false, allIn: p ? p.allIn : false, cards, away: x.away, leaving: x.leaving, win: winners[i] || 0, hand, best };
      });
      const inHandStage = live && live.stage !== 'done' && live.stage !== 'idle';
      const pot = live ? (live.stage === 'done' ? 0 : live.pot - seats.reduce((t, x) => t + (x ? x.bet : 0), 0)) : 0;
      const myReq = (s.requests || []).find((r) => r.uid === USER.id);
      let msg = '', centerBtn = null;
      if (s.paused) msg = esc(T.paused);
      else if (!s.playing) {
        const el = (s.seats || []).filter((x) => x && x.chips > 0 && !x.away).length;
        if (isHost()) { if (el >= 2) centerBtn = { label: T.start, onClick: () => call('start', { room: id }).catch(fail) }; else msg = esc(T.needTwo); }
        else msg = esc(T.waitStart);
      } else if (!inHandStage) { const el = (s.seats || []).filter((x) => x && x.chips > 0 && !x.away).length; if (el < 2) msg = esc(T.needTwo); }
      if (s.paused && isHost()) centerBtn = { label: T.resume, onClick: () => call('pause', { room: id, on: false }).catch(fail) };
      if (s.bombNext && !inHandStage) msg = '💣 ' + esc(T.bombComing);
      if (s.ask) msg = esc(T.ritWait) + ': ' + s.ask.seats.map((x) => `<bdi>${esc((s.seats[x] || {}).name || '?')}</bdi> ${x in (s.ask.votes || {}) ? (s.ask.votes[x] ? '✌️' : '☝️') : '…'}`).join(' · ');
      if (ms < 0 && !myReq && !msg && !centerBtn && !inHandStage) msg = esc(T.pickSeat);
      const mine = ms >= 0 ? seats[ms] : null;
      const board2 = (s.hand && s.hand.board2) || null;
      let myHand = mine && Array.isArray(mine.cards) && !mine.folded ? handDesc(mine.cards, board) : '';
      if (myHand && board2 && board2.length >= 3) myHand += '  |  ' + handDesc(mine.cards, board2);
      return { holes: (s.hand && s.hand.holes) || (P.HOLES && P.HOLES[s.settings.game]) || 2, onThrow: throwAt, onBuy: openShop, prices: PRICES,
        onAvatar: () => pickLook({ av: s.seats[ms].av || 0 }, (l) => call('avatar', { room: id, avatar: l.av, photo: '' }).catch(fail)),
        onSit: (seat) => (ms >= 0 ? (inHandStage && live.players[ms] && !live.players[ms].out ? toast(T.err.in_hand) : call('move', { room: id, seat }).catch(fail)) : askChips('sit', seat)),
        n, me: ms, seats, button: s.hand ? s.hand.button : null, bb: s.settings.bb, board, board2, double: !!(s.hand ? s.hand.double : s.settings.double) && !!s.hand, pot: Math.max(0, pot),
        rabbit: rabbit && rabbit.hand === (s.handNo || 0) && live && live.stage === 'done' ? rabbit.board : null, bankOn: !!(s.turn && s.turn.bank), notes: H.notes(), onNote,
        toAct: s.turn ? s.turn.s : -1, until: s.turn ? s.turn.until : 0, turnSec: s.turn && s.turn.bank ? s.turn.bankSec || s.settings.timeBank : s.settings.turn, msg, centerBtn, canSit: !myReq, hand: s.handNo || 0, stage: live ? live.stage : '', myHand };
    }
    function drawBanner() {
      const el = $('#banner'); if (!el || !room) return;
      const reqs = isHost() ? (st().requests || []) : [];
      if (reqs.length > lastReqs) { PT.sfx.bell(); buzz(80); }
      lastReqs = reqs.length;
      const key = reqs.map((r) => r.id).join(',');
      if (el._key === key) return; el._key = key;
      el.innerHTML = reqs.map((r) => `<div class="req" dir="auto"><span>${fill(esc(r.kind === 'sit' ? T.wantsSeat : T.wantsChips), { n: `<b>${esc(r.name)}</b>`, a: num(r.amount) })}</span><button class="rbtn green" data-ok="${esc(r.id)}">${esc(T.approve)}</button><button class="rbtn" data-no="${esc(r.id)}">${esc(T.deny)}</button></div>`).join('');
      el.querySelectorAll('[data-ok]').forEach((b) => (b.onclick = () => { b.disabled = true; call('approve', { room: id, req: b.dataset.ok, ok: true }).catch(fail); }));
      el.querySelectorAll('[data-no]').forEach((b) => (b.onclick = () => { b.disabled = true; call('approve', { room: id, req: b.dataset.no, ok: false }).catch(fail); }));
    }
    const share = async () => { const url = `${location.origin}/poker/?r=${id}`; try { if (navigator.share && phone()) await navigator.share({ title: T.title, text: T.shareText, url }); else { await navigator.clipboard.writeText(url); toast(T.copied); } } catch {} };
    function drawBar() {
      const s = st(), ms = mySeat(), me = ms >= 0 ? s.seats[ms] : null;
      const g = s.settings;
      const B = [];
      if (isHost() && (!s.playing || s.paused)) B.push(['go', s.paused ? T.resume : T.start, 'green wide', () => call(s.paused ? 'pause' : 'start', { room: id, on: false }).catch(fail)]);
      if (isHost() && s.playing && !s.paused) B.push(['pz', T.pause, 'wide', () => call('pause', { room: id, on: true }).catch(fail)]);
      if (me) {
        B.push(me.away ? ['bk', T.back, 'green wide keep', () => call('back', { room: id }).catch(fail)] : ['aw', T.away, 'wide', () => call('away', { room: id }).catch(fail)]);
        if (g.straddle) B.push(['sd', T.straddle + (me.straddle ? ' ✓' : ''), 'wide' + (me.straddle ? ' on' : ''), () => call('straddle', { room: id, on: !me.straddle }).catch(fail)]);
        B.push(['rb', T.rebuy, 'wide', () => askChips('rebuy')]);
        B.push(['lv', T.leave, 'wide', () => call('leave', { room: id }).catch(fail)]);
      }
      B.push(['snd', PT.prefs.sound ? '🔊' : '🔇', 'keep icon', () => { PT.setPref('sound', !PT.prefs.sound); if (PT.prefs.sound) PT.sfx.chip(3); $('#rbar')._key = ''; drawBar(); }]);
      B.push(['log', T.log, 'keep' + (drawerTab === 'log' ? ' on' : ''), () => toggle('log')]);
      B.push(['chat', T.chat, 'phoneonly keep' + (drawerTab === 'chat' ? ' on' : ''), () => toggle('chat')]);
      B.push(['ledger', T.ledger, 'wide' + (drawerTab === 'ledger' ? ' on' : ''), () => toggle('ledger')]);
      B.push(['opt', T.settings, 'wide' + (drawerTab === 'opt' ? ' on' : ''), () => toggle('opt')]);
      B.push(['share', T.share, 'gold wide', share]);
      const key = JSON.stringify([B.map((b) => b[0] + b[1] + b[2]), s.title, g.game, g.sb, g.bb, unread, PT.prefs.bbs, PT.prefs.sound, s.pendingSettings || 0]);
      const bar = $('#rbar');
      if (bar._key !== key) {
        bar._key = key;
        bar.innerHTML = `<a class="rb-home" href="./" aria-label="${esc(T.title)}">♠</a>
          <div class="rb-title"><b dir="auto">${esc(s.title || room.name || id)}</b><span class="code">${esc(id)}</span><span class="game">${esc(T[g.game || 'nlh'])} · <bdi class="n">${g.sb.toLocaleString('en-US')}/${g.bb.toLocaleString('en-US')}</bdi>${s.pendingSettings ? ` <span class="pill" style="background:rgba(217,164,65,.18);color:var(--brass2)">${esc(T.nextL)}: ${SHORT[s.pendingSettings.game] || ''} <bdi class="n">${s.pendingSettings.sb}/${s.pendingSettings.bb}</bdi></span>` : ''}</span></div>
          <span class="sp"></span>
          <div class="rb-btns" dir="ltr">${B.map(([k, l, c]) => `<button type="button" class="rbtn ${c.replace('phoneonly', '')}${c.includes('phoneonly') ? ' po' : ''}" data-b="${k}">${esc(l)}${k === 'chat' && unread ? '<span class="dot"></span>' : ''}</button>`).join('')}
          <button type="button" class="rbtn icon rb-menu keep" id="mnu" aria-label="${esc(T.menu)}">☰</button></div>`;
        bar.querySelector('.rb-home').onclick = (e) => { e.preventDefault(); go('./'); };
        bar.querySelectorAll('[data-b]').forEach((b) => (b.onclick = () => B.find((x) => x[0] === b.dataset.b)[3]()));
        $('#mnu').onclick = (e) => menu(e.currentTarget, B.filter((b) => b[0] !== 'chat' || phone()).map((b) => [b[1], b[3]]).concat(['-', [T.leaveRoom, () => go('./')], [T.signOut, signOut]]));
      }
    }
    function toggle(tab) { if (drawerTab === tab) closeDrawer(); else { if (tab === 'chat') unread = 0; openDrawer(tab); } drawSide(); drawBar(); }
    function askChips(kind, seat) {
      const s = st().settings;
      let look = savedLook();
      const d = document.createElement('dialog');
      d.innerHTML = `<h2>${esc(kind === 'sit' ? T.sitT : T.rebuy)}</h2><form method="dialog">
        ${kind === 'sit' ? `<div class="lookrow"><span class="avs" id="lkv">${lookHTML(look)}</span><button type="button" class="btn ghost small" id="lkb">${esc(T.pickLook)}</button></div><label>${esc(T.yourName)}<input name="name" maxlength="20" required value="${esc((() => { try { return localStorage.getItem('barusik.poker.name'); } catch { return ''; } })() || myName())}"></label>` : ''}
        <label>${esc(T.amount)} <span class="mute small n">(${s.minBuy.toLocaleString('en-US')}–${s.maxBuy.toLocaleString('en-US')})</span><input name="amount" type="number" inputmode="numeric" min="${kind === 'sit' ? s.minBuy : s.bb}" max="${s.maxBuy}" value="${kind === 'sit' ? Math.min(s.maxBuy, Math.max(s.minBuy, s.bb * 100)) : s.minBuy}" required></label>
        <p class="mute small" style="margin:0">${esc(T.chipsOnly)}</p>
        <div class="row"><button value="x" class="btn ghost" formnovalidate>${esc(T.cancel)}</button><button value="ok" class="btn" autofocus>${esc(kind === 'sit' ? (isHost() || !s.approve ? T.sitGo : T.ask) : T.rebuy)}</button></div></form>`;
      document.body.appendChild(d); d.showModal();
      $('#lkb', d)?.addEventListener('click', () => pickLook(look, (l) => { look = l; $('#lkv', d).innerHTML = lookHTML(l); }));
      d.addEventListener('close', async () => {
        const f = new FormData($('form', d)); d.remove();
        if (d.returnValue !== 'ok') return;
        try {
          if (kind === 'sit') { try { localStorage.setItem('barusik.poker.name', String(f.get('name'))); } catch {} const r = await call('sit', { room: id, seat, name: f.get('name'), amount: +f.get('amount'), avatar: look.av, photo: '' }); if (r.pending) toast(T.pending); }
          else { const r = await call('rebuy', { room: id, amount: +f.get('amount') }); if (r.pending) toast(T.pending); }
        } catch (x) { fail(x); }
      });
    }
    function chatList() { return (st().chat || []).map((m) => `<div class="li" dir="auto"><b${m.admin ? ' style="color:var(--ok)"' : ''}>${esc(m.name)}:</b> ${esc(m.text)}</div>`).join(''); }
    const sendChat = (i) => { const text = i.value.trim(); if (!text) return; i.value = ''; call('say', { room: id, text }).catch(fail); };
    function drawChatDock() {
      const el = $('#chatdock'); if (!el) return;
      el.classList.toggle('hide', phone());
      if (!el.firstChild) {
        el.innerHTML = `<div class="msgs"></div><form><input maxlength="200" placeholder="${esc(T.say)}" aria-label="${esc(T.say)}" dir="auto"><button>${esc(T.send)}</button></form>`;
        $('form', el).onsubmit = (e) => { e.preventDefault(); sendChat($('input', el)); };
      }
      const k = (st().chat || []).length + ':' + ((st().chat || []).slice(-1)[0] || {}).at;
      if (el._k !== k) { el._k = k; const m = $('.msgs', el); m.innerHTML = chatList() || `<span class="mute">${esc(T.chatEmpty)}</span>`; m.scrollTop = 1e9; }
    }
    function drawSide() {
      if (!drawerTab) return;
      const s = st(), pane = $('#pane');
      const tabs = [['log', T.log], ['chat', T.chat], ['hands', T.hands2], ['stats', T.stats], ['ledger', T.ledger], ['opt', T.settings]];
      $('#tabs').innerHTML = `<div class="tl">${tabs.map(([k, l]) => `<button role="tab" data-t="${k}" aria-selected="${drawerTab === k}">${esc(l)}${k === 'chat' && unread ? '<span class="dot"></span>' : ''}</button>`).join('')}</div><button class="x" id="sideX" aria-label="${esc(T.cancel)}">×</button>`;
      $('#tabs [aria-selected=true]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      $('#tabs').querySelectorAll('[data-t]').forEach((b) => (b.onclick = () => { drawerTab = b.dataset.t; if (drawerTab === 'chat') unread = 0; drawSide(); drawBar(); }));
      $('#sideX').onclick = () => { closeDrawer(); drawBar(); };
      const sameTab = pane.dataset.tab === drawerTab; if (!sameTab) pane._okey = '';
      const foot = $('#sidefoot'); if (!(sameTab && drawerTab === 'opt')) foot.innerHTML = '';
      if (drawerTab !== 'opt') pane.dataset.tab = drawerTab;
      if (drawerTab === 'log') { pane.innerHTML = logHTML(s.log || []); pane.scrollTop = pane.scrollHeight; }
      else if (drawerTab === 'hands' || drawerTab === 'stats') {
        if (hist.off) { pane.innerHTML = `<p class="mute" dir="auto">${esc(T.histOff)}</p>`; return; }
        const k = hist.scope === 'mine' ? 'mine' : 'room';
        if (!hist[k] || (drawerTab === 'stats' && !hist.mine)) { pane.innerHTML = `<p class="mute" dir="auto">${esc(T.loading)}</p>`; if (!hist.loading) loadHist(); return; }
        if (hist.hand !== (s.handNo || 0) && !hist.loading) loadHist(true);
        if (drawerTab === 'stats') H.renderStats(T, pane, hist.room, hist.mine, USER.id);
        else H.renderHands(T, pane, hist[k], USER.id, {
          filter: hist.filter, onFilter: (f) => { hist.filter = f; drawSide(); },
          scopeHTML: `<div class="hfil">${[['room', T.thisRoom], ['mine', T.allMine]].map(([x, l]) => `<button type="button" data-sc="${x}" aria-pressed="${hist.scope === x}" dir="auto">${esc(l)}</button>`).join('')}</div>`,
          bindScope: (el) => el.querySelectorAll('[data-sc]').forEach((b) => (b.onclick = () => { hist.scope = b.dataset.sc; drawSide(); })),
        });
      }
      else if (drawerTab === 'chat') {
        pane.innerHTML = chatList() || `<p class="mute">${esc(T.chatEmpty)}</p>`;
        pane.scrollTop = pane.scrollHeight;
        foot.innerHTML = `<form class="chatbox"><input maxlength="200" placeholder="${esc(T.say)}" aria-label="${esc(T.say)}" dir="auto"><button class="btn small">${esc(T.send)}</button></form>`;
        $('form', foot).onsubmit = (e) => { e.preventDefault(); sendChat($('input', foot)); };
      } else if (drawerTab === 'ledger') {
        const rows = Object.entries(s.ledger || {}).map(([uid, l]) => { const seat = s.seats.find((x) => x && x.uid === uid); const now = seat ? seat.chips : 0; const net = now + l.out - l.in; return `<tr><td><bdi>${esc(l.name)}</bdi></td><td>${num(l.in)}</td><td>${num(l.out)}</td><td>${seat ? num(now) : '–'}</td><td class="${net > 0 ? 'pos' : net < 0 ? 'neg' : ''}">${net > 0 ? '+' : ''}${num(net)}</td></tr>`; }).join('');
        pane.innerHTML = `<table class="ledger"><thead><tr><th>${esc(T.player)}</th><th>${esc(T.inL)}</th><th>${esc(T.outL)}</th><th>${esc(T.stack)}</th><th>${esc(T.net)}</th></tr></thead><tbody>${rows}</tbody></table><p class="mute small" dir="auto">${esc(T.chipsOnly)}</p>`;
      } else if (drawerTab === 'opt') {
        // the form is redrawn only when something it shows changed, so half-made edits survive other players' moves
        const okey = JSON.stringify([s.settings, s.pendingSettings || 0, s.title, isHost(), s.bombNext, s.playing, (s.seats || []).map((x) => x && [x.uid, x.name, x.chips]), PT.prefs, L, PLUS]);
        if (pane.dataset.tab === 'opt' && pane._okey === okey) return;
        pane._okey = okey; pane.dataset.tab = 'opt';
        const g = s.pendingSettings || s.settings, host = isHost();
        pane.innerHTML = prefsHTML() + (host ? `<form id="setf" style="display:flex;flex-direction:column">
          <h3>${esc(T.gameOpts)}${s.pendingSettings ? ` <span class="pill" style="background:rgba(217,164,65,.18);color:var(--brass2)">${esc(T.nextL)}</span>` : ''}</h3>
          <p class="mute small" dir="auto" style="margin:0 0 6px">${esc(T.optsNote)}</p>
          <label>${esc(T.roomName)}<input name="title" maxlength="20" value="${esc(s.title || '')}" dir="auto"></label>
          <label>${esc(T.game)}<select name="game">${games().map((x) => `<option value="${x}"${g.game === x ? ' selected' : ''}>${esc(T[x])}</option>`).join('')}</select></label>
          <label>${esc(T.sb)}<input name="sb" type="number" min="1" value="${g.sb}"></label><label>${esc(T.bb)}<input name="bb" type="number" min="2" value="${g.bb}"></label>
          <label>${esc(T.minRaise)}<input name="minRaise" type="number" min="${g.bb}" value="${g.minRaise || g.bb}"></label>
          <label>${esc(T.ante)}<input name="ante" type="number" min="0" value="${g.ante || 0}"></label>
          <label>${esc(T.turnTime)}<input name="turn" type="number" min="10" max="300" value="${g.turn}"></label>
          ${PLUS ? `<label>${esc(T.timeBank)}<input name="timeBank" type="number" min="0" max="300" value="${g.timeBank ?? 30}"></label>` : ''}
          <label>${esc(T.seats)}<input name="seats" type="number" min="2" max="9" value="${g.seats}"></label>
          <label>${esc(T.minBuy)}<input name="minBuy" type="number" value="${g.minBuy}"></label><label>${esc(T.maxBuy)}<input name="maxBuy" type="number" value="${g.maxBuy}"></label>
          <label>${esc(T.approveOn)}<input name="approve" type="checkbox" ${g.approve ? 'checked' : ''}></label>
          <label>${esc(T.straddleOn)}<input name="straddle" type="checkbox" ${g.straddle ? 'checked' : ''}></label>
          ${PLUS ? `<label>${esc(T.runTwice)}<select name="runTwice">${[['no', T.ritNo], ['yes', T.ritYes], ['ask', T.ritAsk]].map(([v, l]) => `<option value="${v}"${(g.runTwice === true ? 'yes' : g.runTwice === false ? 'no' : g.runTwice == null ? 'ask' : g.runTwice) === v ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></label>` : `<label>${esc(T.runTwice)}<input name="runTwice" type="checkbox" ${g.runTwice ? 'checked' : ''}></label>`}
          ${PLUS ? `<label>${esc(T.dblOn)}<input name="double" type="checkbox" ${g.double ? 'checked' : ''}></label>
          <label>${esc(T.rabbitOn)}<input name="rabbit" type="checkbox" ${g.rabbit !== false ? 'checked' : ''}></label>` : ''}
          <label>${esc(T.bonus72)}<input name="bonus72" type="number" min="0" value="${g.bonus72 || 0}"></label>
          <label>${esc(T.bombAmt)}<input name="bombAmt" type="number" min="1" value="${g.bombAmt || g.bb * 2}"></label>
          <button class="btn small" style="margin-top:10px">${esc(T.save)}</button></form>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn ${s.bombNext ? '' : 'ghost'} small" id="bmb">💣 ${esc(s.bombNext ? T.bombCancel : T.bombNext)}</button>${s.playing ? `<button class="btn ghost small" id="nx">${esc(T.nextHand)}</button>` : ''}</div>
          <h3>${esc(T.players)}</h3>
          ${s.seats.map((x, i) => x ? `<div class="pl2"><b><bdi>${esc(x.name)}</bdi></b><input type="number" min="0" value="${x.chips}" data-stk="${i}" aria-label="${esc(T.setStack)} ${esc(x.name)}"><button class="btn ghost small" data-stkb="${i}">${esc(T.setStack)}</button>${x.uid !== USER.id ? `<button class="btn ghost small" data-kick="${i}">${esc(T.kick)}</button>` : ''}${x.uid !== room.host ? `<button class="btn ghost small" data-host="${i}">${esc(T.makeHost)}</button>` : ''}</div>` : '').join('')}
          <div style="margin-top:14px"><button class="btn red small" id="cl">${esc(T.close)}</button></div>` : '');
        bindPrefs(pane, () => { tbl && tbl.relayout(); draw(); drawSide(); });
        if (host) {
          $('#setf').onsubmit = (e) => { e.preventDefault(); const f = new FormData(e.target); const o = {}; for (const k of ['sb', 'bb', 'minBuy', 'maxBuy', 'turn', 'seats', 'minRaise', 'ante', 'bonus72', 'bombAmt', 'timeBank']) o[k] = +f.get(k); o.approve = !!f.get('approve'); o.runTwice = PLUS ? String(f.get('runTwice') || 'no') : !!f.get('runTwice'); o.straddle = !!f.get('straddle'); if (PLUS) { o.double = !!f.get('double'); o.rabbit = !!f.get('rabbit'); } else delete o.timeBank; o.game = f.get('game'); call('settings', { room: id, settings: o, title: f.get('title') }).then((r) => toast(r && r.next ? '✓ ' + T.savedNext : '✓ ' + T.savedNow)).catch(fail); };
          pane.querySelectorAll('[data-stkb]').forEach((b) => (b.onclick = () => { const i = +b.dataset.stkb; call('chips', { room: id, seat: i, to: +pane.querySelector(`[data-stk="${i}"]`).value }).then(() => toast('✓')).catch(fail); }));
          pane.querySelectorAll('[data-kick]').forEach((b) => (b.onclick = () => call('kick', { room: id, seat: +b.dataset.kick }).catch(fail)));
          pane.querySelectorAll('[data-host]').forEach((b) => (b.onclick = () => call('host', { room: id, seat: +b.dataset.host }).catch(fail)));
          $('#nx')?.addEventListener('click', () => call('next', { room: id }).catch(fail));
          $('#bmb').onclick = () => call('bomb', { room: id, on: !s.bombNext }).catch(fail);
          $('#cl').onclick = () => { if (confirm(T.closeQ)) call('close', { room: id }).catch(fail); };
        }
      }
    }
    function draw() {
      if (!alive || !room || !$('#felt')) return;
      const v = view(), s = st();
      drawBar(); drawBanner(); drawChatDock();
      if (!tbl) tbl = PT.createTable($('#felt'), T);
      tbl.update(v);
      const mine = s.turn && s.turn.s === v.me && v.me >= 0;
      if (mine && !lastTurnMine) { PT.sfx.turn(); buzz(60); say(T.yourTurn); if (phone() && drawerTab && drawerTab !== 'chat') { closeDrawer(); drawBar(); } }
      lastTurnMine = mine;
      const askMe = !!(s.ask && v.me >= 0 && s.ask.seats.includes(v.me));
      if (askMe && !draw.asked) { PT.sfx.bell(); buzz(60); }
      draw.asked = askMe;
      const myReq = (s.requests || []).find((r) => r.uid === USER.id);
      const me = v.me >= 0 ? s.seats[v.me] : null;
      const lp = s.live && v.me >= 0 ? s.live.players[v.me] : null;
      const canShow = lp && s.live.stage === 'done' && !lp.out && !lp.cards && my.cards;
      let html = '';
      const myVote = s.ask && v.me >= 0 && s.ask.seats.includes(v.me) && !(v.me in (s.ask.votes || {}));
      // who already asked for two runs, and how long is left to answer
      const askers = s.ask ? s.ask.seats.filter((x) => (s.ask.votes || {})[x] === true).map((x) => (s.seats[x] || {}).name).filter(Boolean) : [];
      if (myVote) html = `<div class="info"><span class="yt">${esc(T.ritQ)}</span>${askers.length ? `<span class="hs">✌️ ${esc(fill(T.ritWants, { n: askers.join(', ') }))}</span>` : ''}<span class="ritt" style="--t:${Math.max(0, (s.ask.until || 0) - Date.now()) / 1000}s"><i></i></span></div><div class="row"><button class="act c" data-rit="0">${esc(T.ritOnce)}</button><button class="act r" data-rit="1">${esc(T.ritTwice)}</button></div>`;
      else if (myReq) html = `<div class="row"><span class="waitl" style="flex:1;align-self:center" dir="auto">${esc(T.pending)}</span><button class="act s" id="cx" style="flex:0 0 auto;padding:0 18px">${esc(T.cancel)}</button></div>`;
      else if (me && me.away) html = `<div class="row"><button class="act c" id="imb">${esc(T.back)}</button></div>`;
      const canRabbit = PLUS && s.settings.rabbit && s.live && s.live.stage === 'done' && s.hand && (s.hand.board || []).length < 5 && !(rabbit && rabbit.hand === s.handNo);
      if (canShow || canRabbit) html = `<div class="row">${canShow ? `<button class="act s" id="shw">${esc(T.showCards)}</button>` : ''}${canRabbit ? `<button class="act s" id="rbt">🐇 ${esc(T.rabbit)}</button>` : ''}</div>`;
      else if (me && s.live && !lp && s.live.stage !== 'done' && s.live.stage !== 'idle') html = `<div class="waitl" dir="auto">${esc(T.waitHand)}</div>`;
      drawActions($('#acts'), v, mine ? s.turn.o : null, (type, to) => call('act', { room: id, type, to }).catch((x) => { fail(x); $('#acts')._key = ''; draw(); }), {
        html, bind: (el) => {
          const cx = $('#cx', el); if (cx) cx.onclick = () => call('cancel', { room: id }).catch(fail);
          const shw = $('#shw', el); if (shw) shw.onclick = () => { shw.disabled = true; call('show', { room: id }).catch(fail); };
          const imb = $('#imb', el); if (imb) imb.onclick = () => call('back', { room: id }).catch(fail);
          el.querySelectorAll('[data-rit]').forEach((b) => (b.onclick = () => { el.querySelectorAll('[data-rit]').forEach((x) => (x.disabled = true)); PT.sfx.click(); call('rit', { room: id, yes: b.dataset.rit === '1' }).catch(fail); }));
          const rbt = $('#rbt', el); if (rbt) rbt.onclick = () => { rbt.disabled = true; call('rabbit', { room: id }).then((r) => { rabbit = r; draw(); }).catch(fail); };
        },
      });
      if (drawerTab && !($('#side').contains(document.activeElement) && /INPUT|SELECT/.test(document.activeElement.tagName))) drawSide();
    }

    load();
    chan = sb.channel('po-' + id).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'po_rooms', filter: `id=eq.${id}` }, (p) => apply(p.new)).subscribe();
    // a safety net for a dropped connection
    const poll = setInterval(() => { if (document.visibilityState === 'visible') load(); }, 6000);
    const vis = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', vis);
    let quick; const moved = () => { clearTimeout(quick); quick = setTimeout(load, 80); };
    addEventListener('poker:moved', moved);
    let rz; const onResize = () => { clearTimeout(rz); rz = setTimeout(() => { if (tbl) tbl.relayout(); draw(); }, 120); }; addEventListener('resize', onResize);
    leaveRoom = () => { alive = false; removeEventListener('poker:moved', moved); timers.forEach(clearTimeout); clearInterval(poll); document.removeEventListener('visibilitychange', vis); if (chan) sb.removeChannel(chan); if (bchan) sb.removeChannel(bchan); removeEventListener('resize', onResize); };
  }

  /* ================= practice against bots ================= */
  const BOTS = ['Mika', 'Noa', 'Lena', 'Sofia', 'Yael', 'Maya', 'Lia', 'Tamar', 'Dana', 'Roni'];
  function openPractice() {
    let tbl = null;
    const looks = Array.from({ length: PokerArt.count }, (_, i) => i).sort(() => Math.random() - 0.5);
    const myLook = savedLook().av;
    const nb = Math.max(1, Math.min(8, +qs.get('practice') || 5));
    let bank = 10000; try { bank = +(localStorage.getItem('barusik.poker.bank') ?? 10000); } catch {}
    if (!(bank > 0)) bank = 10000;
    const save = () => { try { localStorage.setItem('barusik.poker.bank', String(table.seats[0].chips)); } catch {} };
    roomShell();
    const log = [];
    const names = BOTS.slice().sort(() => Math.random() - 0.5);
    const styles = Object.keys(P.STYLES);
    let turn = -1, result = null, timer = null, alive = true, lastTurnMine = false, prab = null;
    const table = new P.Table({
      sb: 10, bb: 20,
      players: [{ id: 'me', name: myName() || T.you, chips: bank, human: true }].concat(Array.from({ length: nb }, (_, i) => ({ id: 'b' + i, name: names[i], chips: 2000, style: styles[Math.floor(Math.random() * styles.length)] }))),
      on: (type, d) => {
        const nm = (s) => table.seats[s].name;
        if (type === 'hand') { result = null; log.push({ k: 'hand', n: d.hand }); }
        else if (type === 'blind') log.push({ k: d.kind, name: nm(d.seat), a: d.amount });
        else if (type === 'act') { log.push({ k: d.type, name: nm(d.seat), a: d.amount ?? d.to, all: d.allIn }); if (d.type === 'check') PT.sfx.check(); }
        else if (type === 'board') log.push({ k: 'board', b: d.board });
        else if (type === 'uncalled') log.push({ k: 'back', name: nm(d.seat), a: d.amount });
        else if (type === 'turn') turn = d.seat;
        else if (type === 'result') {
          turn = -1; result = d.results;
          for (const r of d.results) log.push({ k: 'win', names: r.seats.map(nm), a: r.amount, cat: r.score == null ? null : P.category(r.score) });
          // now and then a bot who just lost throws a tomato at the winner
          const w = d.results[0] && d.results[0].seats[0];
          if (w != null && Math.random() < 0.25) { const losers = table.seats.map((p, i) => i).filter((i) => i !== w && table.seats[i].cards.length && i !== 0); if (losers.length) setTimeout(() => botThrow(losers[Math.floor(Math.random() * losers.length)], w), 1600); }
        }
      },
    });
    table.button = Math.floor(Math.random() * table.seats.length);
    function view() {
      const t = table, done = t.stage === 'done';
      const win = {}; if (done && result) for (const r of result) for (const [s, a] of Object.entries(r.share)) win[s] = (win[s] || 0) + a;
      const seats = t.seats.map((p, i) => {
        const av = i === 0 ? myLook : looks.filter((x) => x !== myLook)[(i - 1) % (PokerArt.count - 1)];
        if (p.out && !done) return { uid: p.id, av, name: p.name, chips: p.chips, bet: 0, cards: null, folded: false, tom: Infinity };
        const show = i === 0 || (done && p.shown);
        const cards = p.cards.length ? (show ? p.cards : p.folded ? null : 'back') : null;
        let hand = '', best = null;
        if (done && Array.isArray(cards) && !p.folded && t.board.length === 5) { hand = handDesc(cards, t.board); if (win[i]) best = P.bestFive(cards, t.board); }
        return { uid: p.id, av, name: p.name, chips: p.chips, bet: p.bet, folded: p.folded, allIn: p.allIn, cards, win: win[i] || 0, hand, best, bag: FULL };
      });
      const pot = done ? 0 : t.pot() - t.seats.reduce((a, p) => a + p.bet, 0);
      let msg = '';
      if (t.seats[0].chips === 0 && done) msg = esc(T.lost);
      else if (t.seats.slice(1).every((p) => p.chips === 0) && done) msg = esc(T.won);
      const me = seats[0];
      return { n: t.seats.length, me: 0, seats, button: t.button, bb: t.bb, board: t.board || [], pot, toAct: turn, until: 0, turnSec: 30, msg, canSit: false, hand: t.hand, stage: t.stage, rabbit: prab && prab.hand === t.hand && done ? prab.board : null,
        myHand: Array.isArray(me.cards) && !me.folded ? handDesc(me.cards, t.board || []) : '', holes: 2 };
    }
    function drawBar() {
      const bar = $('#rbar');
      const key = table.seats[0].chips + '|' + drawerTab + '|' + PT.prefs.bbs + '|' + PT.prefs.sound;
      if (bar._key === key) return; bar._key = key;
      bar.innerHTML = `<a class="rb-home" href="./" aria-label="${esc(T.title)}">♠</a><div class="rb-title"><b dir="auto">${esc(T.practice)}</b><span class="game" dir="auto"><bdi class="n">10/20</bdi> · ${esc(T.practiceBank)}: ${num(table.seats[0].chips)}</span></div><span class="sp"></span>
        <div class="rb-btns" dir="ltr"><button type="button" class="rbtn keep icon" id="snd" aria-label="${esc(T.sounds)}">${PT.prefs.sound ? '🔊' : '🔇'}</button><button type="button" class="rbtn keep" id="ng">${esc(T.newGame)}</button><button type="button" class="rbtn keep${drawerTab === 'log' ? ' on' : ''}" id="lg">${esc(T.log)}</button><button type="button" class="rbtn keep${drawerTab === 'opt' ? ' on' : ''}" id="op">${esc(T.settings)}</button></div>`;
      bar.querySelector('.rb-home').onclick = (e) => { e.preventDefault(); go('./'); };
      $('#snd').onclick = () => { PT.setPref('sound', !PT.prefs.sound); if (PT.prefs.sound) PT.sfx.chip(3); bar._key = ''; drawBar(); };
      $('#ng').onclick = () => { try { localStorage.setItem('barusik.poker.bank', String(Math.max(table.seats[0].chips, 10000))); } catch {} clearTimeout(timer); alive = false; route(); };
      $('#lg').onclick = () => { if (drawerTab === 'log') closeDrawer(); else openDrawer('log'); drawSide(); drawBar(); };
      $('#op').onclick = () => { if (drawerTab === 'opt') closeDrawer(); else openDrawer('opt'); drawSide(); drawBar(); };
    }
    function drawSide() {
      if (!drawerTab) return;
      $('#tabs').innerHTML = `<div class="tl">${[['log', T.log], ['opt', T.settings]].map(([k, l]) => `<button role="tab" data-t="${k}" aria-selected="${drawerTab === k}">${esc(l)}</button>`).join('')}</div><button class="x" id="sideX" aria-label="${esc(T.cancel)}">×</button>`;
      $('#tabs').querySelectorAll('[data-t]').forEach((b) => (b.onclick = () => { drawerTab = b.dataset.t; drawSide(); drawBar(); }));
      $('#sideX').onclick = () => { closeDrawer(); drawBar(); };
      $('#sidefoot').innerHTML = '';
      const pane = $('#pane');
      if (drawerTab === 'log') { pane.innerHTML = logHTML(log.slice(-150)); pane.scrollTop = 1e9; }
      else { pane.innerHTML = prefsHTML(); bindPrefs(pane, () => { tbl && tbl.relayout(); draw(); drawSide(); }); }
    }
    function draw() {
      if (!alive) return;
      const v = view();
      drawBar();
      v.onThrow = (to, it) => { tbl.throwAt(0, to, { item: it }); log.push({ k: 'throw', name: table.seats[0].name, to: table.seats[to].name, it: it === 'tomato' ? undefined : it }); drawSide(); if (Math.random() < 0.35) setTimeout(() => botThrow(to, 0), 900 + Math.random() * 900); };
      v.onBuy = () => toast(T.practiceFree); v.prices = PRICES;
      if (!tbl) tbl = PT.createTable($('#felt'), T);
      tbl.update(v);
      const mine = turn === 0 && table.stage !== 'done';
      if (mine && !lastTurnMine) { PT.sfx.turn(); say(T.yourTurn); }
      lastTurnMine = mine;
      const broke = table.stage === 'done' && table.seats[0].chips === 0;
      drawActions($('#acts'), v, mine ? table.options(0) : null, (type, to) => { table.act(0, { type, to }); step(); }, {
        html: broke ? `<div class="row"><button class="act r" id="rf">${esc(T.refill)}</button></div>` : table.stage === 'done' && (table.board || []).length < 5 && !(prab && prab.hand === table.hand) ? `<div class="row"><button class="act s" id="rbt">🐇 ${esc(T.rabbit)}</button></div>` : '',
        bind: (el) => {
          const rf = $('#rf', el); if (rf) rf.onclick = () => { table.seats[0].chips = 10000; save(); step(); };
          const rb = $('#rbt', el); if (rb) rb.onclick = () => { const deck = table.deck.slice(), b = table.board.slice(); while (b.length < 5) { deck.pop(); const n = b.length === 0 ? 3 : 1; for (let k = 0; k < n; k++) b.push(deck.pop()); } prab = { hand: table.hand, board: b }; draw(); };
        },
      });
      drawSide();
    }
    function botThrow(from, to) {
      if (!alive || !tbl || !table.seats[from] || from === to) return;
      // mostly tomatoes; now and then something worse
      const r = Math.random(), it = r < 0.55 ? 'tomato' : r < 0.8 ? 'poop' : r < 0.93 ? 'knife' : 'dildo';
      tbl.throwAt(from, to, { item: it });
      log.push({ k: 'throw', name: table.seats[from].name, to: table.seats[to].name, it: it === 'tomato' ? undefined : it }); drawSide();
    }
    function step() {
      if (!alive) return;
      clearTimeout(timer);
      draw();
      if (table.stage === 'done' || table.stage === 'idle') {
        save();
        // bots that went broke get up, a fresh one sits down
        const runout = (table.board || []).length === 5 && result && !result[0].uncontested ? 1 : 0;
        table.seats.forEach((p, i) => { if (i && p.chips === 0) { p.chips = 2000; p.name = BOTS[(BOTS.indexOf(p.name) + nb + 1) % BOTS.length]; p.style = styles[Math.floor(Math.random() * styles.length)]; } });
        if (table.seats[0].chips === 0) return;
        timer = setTimeout(() => { table.startHand(); step(); }, table.hand ? 3600 + runout * 1200 : 400);
        return;
      }
      if (turn > 0) timer = setTimeout(() => { table.act(turn, P.decide(table, turn)); step(); }, 600 + Math.random() * 900);
    }
    let rz; const onResize = () => { clearTimeout(rz); rz = setTimeout(() => { if (tbl) tbl.relayout(); draw(); }, 120); }; addEventListener('resize', onResize);
    leaveRoom = () => { alive = false; clearTimeout(timer); save(); removeEventListener('resize', onResize); };
    step();
  }

  document.documentElement.lang = L; document.documentElement.dir = rtl() ? 'rtl' : 'ltr';
  $('#brandT').textContent = T.title; document.title = T.title + ' · Barusik';
  if (sb) sb.auth.getSession().then(({ data }) => { session = data.session; USER = session?.user || null; drawAcct(); if (!routed) route(); });
  else route();
})();
