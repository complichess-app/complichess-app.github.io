/* Barusik admin · poker. Every open room, the first 30 seconds to take a new one, and inside a room:
   every hand, who's ahead, the cards still to come, seats, chips and settings. Talks only to the `poker` function,
   which checks is_admin() (two-step sign-in) on every call. © 2026 Bar Lvovski */
(() => {
  'use strict';
  const SB_URL = 'https://iktmyrfbejtjsiehcrar.supabase.co', KEY = 'sb_publishable_vEUqQPQSE0EG7YRnwNeAbg_PzViDO1a';
  const P = window.Poker, T = window.POKER_T.he;
  const sb = window.supabase.createClient(SB_URL, KEY, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'complichess-auth' } });
  const app = document.getElementById('app');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (v) => `<bdi class="n">${Number(v || 0).toLocaleString('en-US')}</bdi>`;
  const fill = (s, o) => String(s).replace(/\{(\w)\}/g, (_, k) => o[k] ?? '');
  const ago = (t) => { const s = Math.round((Date.now() - Date.parse(t)) / 1000); if (!Number.isFinite(s)) return ''; return s < 60 ? `לפני ${s} שנ׳` : s < 3600 ? `לפני ${Math.round(s / 60)} דק׳` : `לפני ${Math.round(s / 3600)} שע׳`; };
  const toast = (s) => { document.querySelectorAll('.toast').forEach((x) => x.remove()); const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = s; document.body.appendChild(el); setTimeout(() => el.remove(), 3500); };
  const RK = { 10: '10', 11: 'J', 12: 'Q', 13: 'K', 14: 'A' }, SU = ['♠', '♥', '♦', '♣'];
  const card = (c, cls = '') => c == null ? `<span class="card ghost ${cls}"></span>` : `<span class="card ${P.suitOf(c) === 1 || P.suitOf(c) === 2 ? 'red' : ''} ${cls}" role="img" aria-label="${(RK[P.rankOf(c)] || P.rankOf(c)) + SU[P.suitOf(c)]}"><span class="r">${RK[P.rankOf(c)] || P.rankOf(c)}<i>${SU[P.suitOf(c)]}</i></span><span class="s">${SU[P.suitOf(c)]}</span></span>`;

  // how the hand ends if nobody folds: hand names on the final boards, who takes what
  const HANDS = ['קלף גבוה', 'זוג', 'שני זוגות', 'שלישייה', 'רצף', 'צבע', 'פול האוס', 'רביעייה', 'רצף בצבע'];
  const lowTxt = (v) => { const r = []; for (let i = 0; i < 5; i++) { r.unshift(9 - (v % 16)); v = Math.floor(v / 16); } return r.map((x) => (x === 1 ? 'A' : x)).join('-'); };
  const handOn = (cards, board, game) => {
    if (!cards || cards.length < 2 || !board || board.length < 5) return '';
    const hi = HANDS[P.category(P.value(cards, board))];
    const lo = P.hiLo && P.hiLo(game) ? P.lowValue(cards, board) : 0;
    return lo ? `${hi} · לואו ${lowTxt(lo)}` : hi;
  };
  // the old server (before the function update) sends only the cards still to come: work it out from those
  function guess(v, contenders, game) {
    const A = v.board.concat(v.upcoming || []); if (A.length < 5) return null;
    const B = v.board2 ? v.board2.concat(v.upcoming2 || []) : null;
    const best = (board, run) => {
      const out = []; let top = -1, w = [];
      for (const p of contenders) { const x = P.value(p.cards, board); if (x > top) { top = x; w = [p.seat]; } else if (x === top) w.push(p.seat); }
      out.push({ seats: w, run, low: false });
      if (P.hiLo && P.hiLo(game)) { let lt = 0, lw = []; for (const p of contenders) { const x = P.lowValue(p.cards, board); if (x > lt) { lt = x; lw = [p.seat]; } else if (x && x === lt) lw.push(p.seat); } if (lw.length) out.push({ seats: lw, run, low: true }); }
      return out;
    };
    return { board: A, board2: B, results: B ? [...best(A, 1), ...best(B, 2)] : best(A, 0), players: null };
  }
  function endHTML(sc, title, names, cardsOf, game, amt) {
    if (!sc) return '';
    const groups = {}; const lines = [];
    for (const r of sc.results) {
      if (r.uncontested) continue;
      const g = `${r.run}|${r.low ? 1 : 0}`; const k = (groups[g] = (groups[g] || 0) + 1);
      const board = r.run === 2 ? sc.board2 : sc.board;
      const many = sc.results.filter((x) => `${x.run}|${x.low ? 1 : 0}` === g).length > 1;
      const tag = [r.run ? `לוח ${r.run}` : '', r.low ? 'לואו' : '', many ? (k === 1 ? 'קופה ראשית' : 'קופת צד') : ''].filter(Boolean).join(' · ');
      const who = r.seats.map((x) => `<b>${esc(names[x] || '?')}</b>`).join(' + ');
      const hand = r.seats.length ? esc(r.low ? 'לואו ' + lowTxt(P.lowValue(cardsOf[r.seats[0]], board)) : HANDS[P.category(P.value(cardsOf[r.seats[0]], board))]) : '';
      lines.push(`<div>🏆 ${tag ? `<span class="mute">${tag}:</span> ` : ''}${who} · ${hand}${amt && r.amount != null ? ` · ${num(r.amount)}${r.seats.length > 1 ? ' <span class="mute">(מתחלקים)</span>' : ''}` : ''}</div>`);
    }
    return `<div class="end">${title ? `<div class="hd">${title}</div>` : ''}${lines.join('')}</div>`;
  }

  let session = null;
  async function call(a, body = {}) {
    const { data } = await sb.auth.getSession(); session = data.session;
    const r = await fetch(`${SB_URL}/functions/v1/poker`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}`, apikey: KEY }, body: JSON.stringify({ a, ...body }) });
    const j = await r.json().catch(() => ({ error: 'server' }));
    if (j.error) throw new Error(T.err[j.error] || j.error);
    return j;
  }
  const run = (a, body, ok) => call(a, body).then((r) => { if (ok) toast(ok); refresh(); return r; }).catch((e) => toast('שגיאה: ' + e.message));

  let ROOMS = [], ROOM = null, VIEW = null, CODE = new URLSearchParams(location.search).get('r'), seen = new Set(), first = true, ticker = null;

  function beep() { try { const a = new (window.AudioContext || window.webkitAudioContext)(); [0, 0.18].forEach((d) => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = 988; g.gain.setValueAtTime(0.0001, a.currentTime + d); g.gain.exponentialRampToValueAtTime(0.2, a.currentTime + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + d + 0.15); o.connect(g).connect(a.destination); o.start(a.currentTime + d); o.stop(a.currentTime + d + 0.2); }); } catch {} }

  async function loadRooms() {
    const r = await call('rooms');
    ROOMS = r.rooms;
    for (const x of ROOMS) {
      if (x.host_kind === 'waiting' && !seen.has(x.id)) {
        if (!first) { beep(); if ('Notification' in window && Notification.permission === 'granted') new Notification('חדר פוקר חדש', { body: `${x.creator || ''} פתח חדר. 30 שניות לקחת את הניהול.`, tag: x.id }); }
      }
      seen.add(x.id);
    }
    first = false;
  }
  async function loadRoom() {
    if (!CODE) { ROOM = null; VIEW = null; return; }
    const [{ data }, v] = await Promise.all([sb.from('po_rooms').select('*').eq('id', CODE).maybeSingle(), call('view', { room: CODE }).catch(() => null)]);
    ROOM = data; VIEW = v;
  }
  let busy = false, again = false;
  async function refresh() {
    if (busy) { again = true; return; }
    busy = true;
    try { await Promise.all([loadRooms(), loadRoom()]); draw(); } catch (e) { app.innerHTML = `<div class="box"><h1>לא הצלחתי לטעון</h1><p class="mute">${esc(e.message)}</p><p class="mute small">אם זה עוד לא הותקן: ב־Supabase מריצים את <b dir="ltr">supabase/poker.sql</b> ומעלים את הפונקציה <b dir="ltr">poker</b>.</p><button onclick="location.reload()">רענון</button></div>`; }
    busy = false;
    if (again) { again = false; refresh(); }
  }

  function roomsHTML() {
    const now = Date.now();
    return `<section class="panel"><div class="top" style="margin-bottom:10px"><h2>חדרים פתוחים</h2><span class="pill">${ROOMS.length}</span><span class="sp"></span>
      ${'Notification' in window && Notification.permission !== 'granted' ? '<button class="ghost small" data-a="notif">התראה כשנפתח חדר</button>' : ''}
      <button class="small" data-a="new">חדר חדש שלי</button></div>
      <div class="rooms">${ROOMS.map((r) => { const left = Math.ceil((Date.parse(r.offer_until) - now) / 1000); const wait = r.host_kind === 'waiting'; return `<div class="room ${wait ? 'wait' : ''} ${r.id === CODE ? 'on' : ''}">
        <div class="top"><b>${esc(r.name || r.id)}</b><span class="pill g n">${esc(r.id)}</span></div>
        <div class="small mute">פתח: ${esc(r.creator || '?')} · ${ago(r.created_at)} · ${r.seated} יושבים · יד ${r.hand}${r.requests ? ` · <span style="color:var(--warn)">${r.requests} בקשות</span>` : ''}</div>
        <div class="tools">${wait ? `<span class="pill w">${left > 0 ? `<bdi class="n" data-cd="${Date.parse(r.offer_until)}">${left}</bdi> שנ׳ לקחת` : 'עובר לפותח…'}</span><button class="small" data-a="take" data-id="${esc(r.id)}">לקחת ניהול</button>` : `<span class="pill ${r.host_kind === 'admin' ? 'y' : ''}">${r.host_kind === 'admin' ? 'אתה מנהל' : 'מנוהל ע״י שחקן'}</span>`}
        <button class="ghost small" data-a="open" data-id="${esc(r.id)}">ניהול מלא</button><a class="small" href="/poker/?r=${esc(r.id)}" target="_blank" rel="noopener">לשולחן</a></div></div>`; }).join('') || '<p class="mute">אין חדרים פתוחים כרגע.</p>'}</div></section>`;
  }

  function logLine(e) {
    const a = e.a != null ? num(e.a) : '', n = esc(e.name || ''), all = e.all ? esc(T.lall) : '';
    const m = { hand: () => `<div class="hd">${fill(T.lhand, { a: e.n })}</div>`, sb: () => fill(T.lsb, { n, a }), bb: () => fill(T.lbb, { n, a }), fold: () => fill(T.lfold, { n }), check: () => fill(T.lcheck, { n }), call: () => fill(T.lcall, { n, a }) + all, bet: () => fill(T.lbet, { n, a }) + all, raise: () => fill(T.lraise, { n, a }) + all,
      board: () => fill(T.lboard, { a: `<span class="board" style="display:inline-flex;gap:3px">${e.b.map((c) => (RK[P.rankOf(c)] || P.rankOf(c)) + SU[P.suitOf(c)]).join(' ')}</span>` }), back: () => fill(T.lback, { n, a }),
      win: () => e.cat == null ? fill(T.lwin, { n: esc((e.names || []).join(', ')), a }) : fill(T.lwinH, { n: esc((e.names || []).join(', ')), a, h: HANDS[e.cat] }),
      sit: () => fill(T.lsit, { n, a }), left: () => fill(T.lleft, { n, a }), rebuy: () => fill(T.lrebuy, { n, a }), kick: () => fill(T.lkick, { n }), host: () => fill(T.lhost, { n }), admin: () => T.ladmin, pause: () => T.lpause, resume: () => T.lresume, closed: () => T.lclosed, away: () => fill(T.laway, { n }), ask: () => fill(T.lask, { n }), denied: () => fill(T.ldenied, { n }), chips: () => fill(T.lchips, { n, a }), throw: () => fill(T.lthrowI || T.lthrow, { n, i: esc((T.items || {})[e.it || 'tomato'] || ''), t: esc(e.to || '') }), ante: () => fill(T.lante, { n, a }), straddle: () => fill(T.lstraddle, { n, a }), bomb: () => fill(T.lbombp, { n, a }), b72: () => fill(T.l72, { n, a }), bombon: () => fill(T.lbombon, { a }), bomboff: () => T.lbomboff, board2: () => fill(T.lboard2, { a: e.b.map((c) => (RK[P.rankOf(c)] || P.rankOf(c)) + SU[P.suitOf(c)]).join(' ') }), buy: () => fill(T.lbuyI || T.lbuy, { n, a, i: esc((T.items || {})[e.it || 'tomato'] || '') }), show: () => fill(T.lshow, { n }), settings: () => fill(T.lsettings, { a: `${e.sb}/${e.bb}` }) }[e.k];
    const s = m ? m() : '';
    return s.startsWith('<div') ? s : `<div>${s}</div>`;
  }

  function roomHTML() {
    if (!CODE) return '';
    if (!ROOM) return `<section class="panel"><p class="mute">החדר ${esc(CODE)} לא נמצא או נסגר.</p></section>`;
    const s = ROOM.state, g = s.settings, live = s.live, v = VIEW || { players: [], board: [], upcoming: [] };
    const playing = live && live.stage !== 'done' && live.stage !== 'idle';
    const turn = s.turn ? s.turn.s : -1;
    const byseat = Object.fromEntries((v.players || []).map((p) => [p.seat, p]));
    const seats = s.seats.map((x, i) => x ? { ...x, i, p: byseat[i] } : null).filter(Boolean);
    const game = g.game || 'nlh', fut = v.future || null;
    const f = s.pendingSettings || g, rit = f.runTwice === 'ask' ? 'ask' : f.runTwice === true || f.runTwice === 'yes' ? 'yes' : 'no';
    const contenders = (v.players || []).filter((p) => !p.out && !p.folded && p.cards && p.cards.length >= 2);
    const names = Object.fromEntries(seats.map((x) => [x.i, x.name])), cardsOf = Object.fromEntries((v.players || []).map((p) => [p.seat, p.cards]));
    const guessed = !fut && playing && contenders.length >= 2 ? guess(v, contenders, game) : null;
    // nobody can bet any more (all in): the amounts are final, not just the hands
    const final = !!fut && (v.ask || contenders.filter((p) => p.chips > 0).length < 2);
    const hostLabel = ROOM.host_kind === 'admin' ? 'אתה' : ROOM.host_kind === 'waiting' ? 'מחכה לך' : (s.seats.find((x) => x && x.uid === ROOM.host) || {}).name || s.creator;
    const pot = live ? live.pot : 0;
    return `<section class="panel"><div class="top"><h2>${esc(s.title || ROOM.name)}</h2><span class="pill g n">${esc(ROOM.id)}</span><span class="pill">${T[g.game || 'nlh']} · ${num(g.sb)}/${num(g.bb)}</span><span class="pill">מנהל החדר: ${esc(hostLabel)}</span>${s.paused ? '<span class="pill w">מושהה</span>' : s.playing ? '<span class="pill y">משחקים</span>' : '<span class="pill">לא התחיל</span>'}
      <span class="sp"></span>${ROOM.host_kind !== 'admin' ? '<button class="small" data-a="take" data-id="' + esc(ROOM.id) + '">לקחת ניהול</button>' : ''}
      ${!s.playing || s.paused ? `<button class="small" data-a="${s.paused ? 'resume' : 'start'}">${s.paused ? 'להמשיך' : 'להתחיל'}</button>` : '<button class="ghost small" data-a="pause">השהיה</button>'}
      <button class="${s.bombNext ? '' : 'ghost '}small" data-a="bomb">💣 ${s.bombNext ? 'לבטל בומב פוט' : 'בומב פוט ביד הבאה'}</button><button class="ghost small" data-a="next">יד הבאה</button><a href="/poker/?r=${esc(ROOM.id)}" target="_blank" rel="noopener">לשולחן ↗</a><button class="red small" data-a="close">סגירת החדר</button></div></section>
      ${(s.requests || []).length ? `<section class="panel"><h3 style="margin-bottom:8px">בקשות</h3>${s.requests.map((r) => `<div class="req"><b>${esc(r.name)}</b><span>${r.kind === 'sit' ? 'רוצה לשבת עם' : 'מבקש עוד'}</span><input type="number" value="${r.amount}" data-amt="${esc(r.id)}" aria-label="כמה צ׳יפים"><button class="small" data-a="ok" data-id="${esc(r.id)}">לאשר</button><button class="ghost small" data-a="no" data-id="${esc(r.id)}">לסרב</button></div>`).join('')}</section>` : ''}
      <div class="grid"><section class="panel" style="display:flex;flex-direction:column;gap:10px">
        <div class="top"><h3>השולחן</h3><span class="pill">יד ${s.handNo || 0}</span>${live ? `<span class="pill">${esc({ preflop: 'לפני הפלופ', flop: 'פלופ', turn: 'טרן', river: 'ריבר', done: 'היד נגמרה' }[live.stage] || live.stage)}</span>` : ''}<span class="sp"></span><span>קופה ${num(pot)}</span></div>
        ${(() => { // the boards, the cards still to come marked
          const row = (have, more, label) => `<div class="board">${[0, 1, 2, 3, 4].map((i) => have[i] != null ? card(have[i]) : playing && more[i - have.length] != null ? card(more[i - have.length], 'up') : card(null)).join('')}${label ? `<span class="small mute bl">${label}</span>` : ''}</div>`;
          let h = row(v.board || [], v.upcoming || [], v.board2 || (fut && fut.twice) ? 'לוח 1' : '');
          if (v.board2) h += row(v.board2, v.upcoming2 || [], 'לוח 2');
          else if (fut && fut.twice && fut.twice.board2) h += row(v.board, fut.twice.board2.slice(v.board.length), 'לוח 2, אם מריצים פעמיים');
          return h + (playing && (v.upcoming || []).length ? '<span class="small mute">מסומן = הקלפים הבאים בחפיסה</span>' : '');
        })()}
        ${playing && contenders.length >= 2 && (fut ? fut.once : guessed) ? `<section class="endbox"><h3>איך היד נגמרת${final ? '' : ' <span class="small mute">(אם אף אחד לא מתקפל)</span>'}</h3>${fut && fut.twice ? endHTML(fut.once, 'אם מריצים פעם אחת', names, cardsOf, game, final) + endHTML(fut.twice, 'אם מריצים פעמיים', names, cardsOf, game, final) : endHTML(fut ? fut.once : guessed, '', names, cardsOf, game, final)}${final ? '' : '<p class="small mute">עוד יש הימורים, אז הסכום הסופי עוד לא ידוע.</p>'}</section>` : ''}
        ${seats.map((x) => { const p = x.p; const inIt = p && !p.folded && !p.out && p.cards && p.cards.length >= 2;
          const cat = p && p.cards && p.cards.length >= 2 && v.board.length >= 3 ? handOn(p.cards, v.board.length === 5 ? v.board : null, game) || HANDS[P.category(P.value(p.cards, v.board))] : '';
          // per run: the hand they end with, and whether it wins
          const endLine = (sc) => { if (!sc) return ''; const wins = sc.results.filter((r) => r.seats.includes(x.i));
            const parts = (sc.board2 ? [[sc.board, 1], [sc.board2, 2]] : [[sc.board, 0]]).map(([b, run]) => { const hiW = wins.some((r) => r.run === run && !r.low), loW = wins.some((r) => r.run === run && r.low); const lo = P.hiLo(game) ? P.lowValue(p.cards, b) : 0; return `${run ? `לוח ${run}: ` : ''}<b>${esc(HANDS[P.category(P.value(p.cards, b))])}</b>${hiW ? ' 🏆' : ''}${lo ? ` · לואו ${lowTxt(lo)}${loW ? ' 🏆' : ''}` : ''}`; });
            return parts.join(' · '); };
          const scs = fut ? (fut.twice ? [[fut.once, 'פעם אחת'], [fut.twice, 'פעמיים']] : [[fut.once, '']]) : guessed ? [[guessed, '']] : [];
          const ends = playing && inIt && contenders.length >= 2 ? scs.filter(([sc]) => sc).map(([sc, l]) => `<div class="fut">${l ? `<span class="mute">${l}:</span> ` : 'בסוף: '}${endLine(sc)}</div>`).join('') : '';
          const mine = fut && fut.once && fut.once.players ? fut.once.players.find((q) => q.seat === x.i) : null;
          const wonAny = scs.some(([sc]) => sc && sc.results.some((r) => r.seats.includes(x.i)));
          const netOf = (sc) => { const q = sc && sc.players ? sc.players.find((y) => y.seat === x.i) : null; return q ? `<span class="${q.net > 0 ? 'pos' : q.net < 0 ? 'neg' : ''}">${q.net > 0 ? '+' : q.net < 0 ? '−' : ''}${num(Math.abs(q.net))}</span>` : ''; };
          const right = !playing || contenders.length < 2 ? '' : final && mine ? (fut.twice ? `<div class="two"><span class="mute">פעם אחת</span>${netOf(fut.once)}<span class="mute">פעמיים</span>${netOf(fut.twice)}</div>` : netOf(fut.once)) : inIt ? (wonAny ? '🏆' : '<span class="neg small">מפסיד</span>') : '';
          return `<div class="pl ${turn === x.i && playing ? 'turn' : ''} ${p && p.folded ? 'fold' : ''} ${playing && wonAny && inIt ? 'win' : ''}"><div class="cards">${p && p.cards ? p.cards.map((c) => card(c)).join('') : card(null) + card(null)}</div>
          <div><div class="nm">${esc(x.name)} ${(v.bots || {})[x.uid] ? '<span class="pill y">🤖 בוט אגדי משחק (רק אתה רואה)</span>' : (v.botOk || {})[x.uid] ? '<span class="pill">🤖 יש לו בוט, כבוי</span>' : ''} ${x.uid === ROOM.host ? '<span class="pill">מנהל</span>' : ''} ${x.away ? '<span class="pill w">לא ליד השולחן</span>' : ''} ${p && p.folded ? '<span class="pill">ויתר</span>' : ''}</div>
            <div class="sub">צ׳יפים ${num(x.chips)}${p && p.bet ? ` · הימור ${num(p.bet)}` : ''}${p && p.total ? ` · ביד ${num(p.total)}` : ''}${cat && !ends ? ` · ${esc(cat)}` : ''}${final && mine && !fut.twice && inIt ? ` · בסוף ${num(mine.after)}` : ''}</div>
            ${ends}
            <div class="tools" style="margin-top:6px"><input type="number" min="0" value="${x.chips}" data-chips="${x.i}" aria-label="צ׳יפים של ${esc(x.name)}"><button class="ghost small" data-a="chips" data-seat="${x.i}">לקבוע צ׳יפים</button><button class="ghost small" data-a="add" data-seat="${x.i}" data-v="${g.minBuy}">+${num(g.minBuy)}</button><button class="ghost small" data-a="kick" data-seat="${x.i}">להוציא</button>${x.uid !== ROOM.host ? `<button class="ghost small" data-a="host" data-seat="${x.i}">להעביר ניהול</button>` : ''}${(v.botOk || {})[x.uid] ? `<button class="ghost small" data-a="bot" data-seat="${x.i}" data-v="0">🤖 לקחת את הבוט</button>` : `<button class="ghost small" data-a="bot" data-seat="${x.i}" data-v="1">🤖 לתת בוט אגדי</button>`}</div></div>
          <div class="odds">${right}</div></div>`; }).join('') || '<p class="mute">אין אף אחד ליד השולחן.</p>'}
      </section>
      <div style="display:flex;flex-direction:column;gap:16px">
        <section class="panel"><h3 style="margin-bottom:8px">הגדרות${s.pendingSettings ? ' <span class="pill w">נכנסות ביד הבאה</span>' : ''}</h3><form class="form" id="setf">
          <label>שם החדר<input name="title" value="${esc(s.title || '')}" maxlength="20"></label>
          <label style="grid-column:span 2">סוג משחק<select name="game" style="height:38px">${['nlh', 'plo5', 'plo', 'plh', 'plo58', 'plo8', 'plo6', 'plo68'].map((x) => `<option value="${x}"${(f.game || 'nlh') === x ? ' selected' : ''}>${esc(T[x] || x)}</option>`).join('')}</select></label>
          <label>סמול<input name="sb" type="number" value="${f.sb}"></label><label>ביג<input name="bb" type="number" value="${f.bb}"></label>
          <label>כניסה מינימלית<input name="minBuy" type="number" value="${f.minBuy}"></label><label>כניסה מקסימלית<input name="maxBuy" type="number" value="${f.maxBuy}"></label>
          <label>מינ׳ רייז<input name="minRaise" type="number" value="${f.minRaise || f.bb}"></label><label>אנטה<input name="ante" type="number" value="${f.ante || 0}"></label><label>בונוס 7-2<input name="bonus72" type="number" value="${f.bonus72 || 0}"></label><label>בומב פוט<input name="bombAmt" type="number" value="${f.bombAmt || f.bb * 2}"></label>
          <label>להריץ פעמיים<select name="runTwice" style="height:38px">${[['no', 'לא'], ['yes', 'תמיד'], ['ask', 'לשאול את השחקנים']].map(([k, l]) => `<option value="${k}"${rit === k ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
          <label>שניות לתור<input name="turn" type="number" value="${f.turn}"></label><label>בנק זמן (שנ׳)<input name="timeBank" type="number" min="0" max="300" value="${f.timeBank ?? 30}"></label><label>מקומות<input name="seats" type="number" min="2" max="9" value="${f.seats}"></label>
          <label style="flex-direction:row;align-items:center;gap:8px;color:var(--ink)"><input name="straddle" type="checkbox" ${f.straddle ? 'checked' : ''} style="height:20px;width:20px">סטראדל</label>
          <label style="flex-direction:row;align-items:center;gap:8px;color:var(--ink)"><input name="double" type="checkbox" ${f.double ? 'checked' : ''} style="height:20px;width:20px">שני לוחות</label>
          <label style="flex-direction:row;align-items:center;gap:8px;color:var(--ink)"><input name="rabbit" type="checkbox" ${f.rabbit !== false ? 'checked' : ''} style="height:20px;width:20px">ציד ארנבים</label>
          <label style="flex-direction:row;align-items:center;gap:8px;color:var(--ink)"><input name="approve" type="checkbox" ${f.approve ? 'checked' : ''} style="height:20px;width:20px">כניסה באישור</label>
          <button>שמירה</button></form></section>
        <section class="panel"><h3 style="margin-bottom:8px">צ׳יפים</h3><table><thead><tr><th></th><th>נכנס</th><th>יצא</th><th>סיכום</th></tr></thead><tbody>${Object.entries(s.ledger || {}).map(([uid, l]) => { const seat = s.seats.find((x) => x && x.uid === uid); const now = seat ? seat.chips : 0; const net = now + l.out - l.in; return `<tr><td>${esc(l.name)}</td><td>${num(l.in)}</td><td>${num(l.out + now)}</td><td class="${net > 0 ? 'pos' : net < 0 ? 'neg' : ''}">${num(net)}</td></tr>`; }).join('')}</tbody></table></section>
        <section class="panel"><h3 style="margin-bottom:8px">צ׳אט</h3><div class="log" id="chat">${(s.chat || []).map((m) => `<div><b>${esc(m.name)}:</b> <bdi>${esc(m.text)}</bdi></div>`).join('') || '<p class="mute">אין הודעות</p>'}</div>
          <form id="say" class="tools" style="margin-top:8px"><input name="t" maxlength="200" placeholder="לכתוב לשולחן בשם ברוסיק" style="flex:1"><button class="small">שליחה</button></form></section>
        <section class="panel"><h3 style="margin-bottom:8px">מה קרה</h3><div class="log" id="log">${(s.log || []).map(logLine).join('')}</div></section>
      </div></div>`;
  }

  function draw() {
    const active = document.activeElement; const keep = active && active.tagName === 'INPUT' && app.contains(active);
    if (keep) { drawRoomsOnly(); return; } // don't wipe what Bar is typing
    app.innerHTML = `<div class="top"><h1>פוקר</h1><span class="sp"></span><a href="/admin/">← לניהול הראשי</a></div>${roomsHTML()}<div id="roomv" style="display:flex;flex-direction:column;gap:16px">${roomHTML()}</div>`;
    ['log', 'chat'].forEach((id) => { const el = document.getElementById(id); if (el) el.scrollTop = el.scrollHeight; });
    wire();
  }
  function drawRoomsOnly() { const s = app.querySelector('section.panel'); if (s) { s.outerHTML = roomsHTML(); wire(); } }

  function wire() {
    app.querySelectorAll('[data-a]').forEach((el) => {
      if (el.dataset.w) return; el.dataset.w = 1;
      el.addEventListener('click', async (e) => {
        e.preventDefault();
        const a = el.dataset.a, id = el.dataset.id, seat = el.dataset.seat != null ? +el.dataset.seat : null;
        if (a === 'take') return run('take', { room: id }, 'החדר שלך');
        if (a === 'open') { CODE = id; history.replaceState(null, '', '?r=' + id); return refresh(); }
        if (a === 'notif') { await Notification.requestPermission(); return draw(); }
        if (a === 'new') { const r = await call('create', { title: 'Barusik', name: 'Barusik' }).catch((x) => toast(x.message)); if (r && r.room) { CODE = r.room; history.replaceState(null, '', '?r=' + r.room); refresh(); } return; }
        if (a === 'start') return run('start', { room: CODE });
        if (a === 'pause') return run('pause', { room: CODE, on: true });
        if (a === 'resume') return run('pause', { room: CODE, on: false });
        if (a === 'next') return run('next', { room: CODE });
        if (a === 'bomb') return run('bomb', { room: CODE, on: !ROOM.state.bombNext });
        if (a === 'close') { if (confirm('לסגור את החדר לכולם?')) run('close', { room: CODE }, 'נסגר'); return; }
        if (a === 'ok' || a === 'no') { const amt = app.querySelector(`[data-amt="${id}"]`); return run('approve', { room: CODE, req: id, ok: a === 'ok', amount: amt ? +amt.value : undefined }); }
        if (a === 'chips') return run('chips', { room: CODE, seat, to: +app.querySelector(`[data-chips="${seat}"]`).value }, 'עודכן');
        if (a === 'add') { const cur = ROOM.state.seats[seat].chips; return run('chips', { room: CODE, seat, to: cur + +el.dataset.v }, 'נוסף'); }
        if (a === 'kick') { if (confirm('להוציא את השחקן מהשולחן?')) run('kick', { room: CODE, seat }); return; }
        if (a === 'host') return run('host', { room: CODE, seat }, 'הניהול הועבר');
        if (a === 'bot') return run('bot', { room: CODE, seat, on: el.dataset.v === '1', start: el.dataset.v === '1' }, el.dataset.v === '1' ? 'הבוט האגדי משחק בשבילו' : 'הבוט נלקח');
      });
    });
    const f = document.getElementById('setf');
    if (f && !f.dataset.w) { f.dataset.w = 1; f.addEventListener('submit', (e) => { e.preventDefault(); const d = new FormData(f); const o = {}; for (const k of ['sb', 'bb', 'minBuy', 'maxBuy', 'turn', 'seats', 'minRaise', 'ante', 'bonus72', 'bombAmt']) o[k] = +d.get(k); o.timeBank = +d.get('timeBank'); o.approve = !!d.get('approve'); o.game = d.get('game'); o.runTwice = d.get('runTwice'); o.straddle = !!d.get('straddle'); o.double = !!d.get('double'); o.rabbit = !!d.get('rabbit'); call('settings', { room: CODE, settings: o, title: d.get('title') }).then((r) => { toast(r && r.next ? 'נשמר. נכנס לתוקף ביד הבאה' : 'נשמר'); refresh(); }).catch((e2) => toast('שגיאה: ' + e2.message)); }); }
    const say = document.getElementById('say');
    if (say && !say.dataset.w) { say.dataset.w = 1; say.addEventListener('submit', (e) => { e.preventDefault(); const i = say.querySelector('input'); const text = i.value.trim(); if (!text) return; i.value = ''; i.blur(); run('say', { room: CODE, text }); }); }
  }

  async function start() {
    const { data } = await sb.auth.getSession(); session = data.session;
    if (!session) { app.innerHTML = '<div class="box"><h1>צריך להתחבר</h1><p class="mute">מתחברים בדף הניהול הראשי (כולל קוד האימות) וחוזרים לכאן.</p><a href="/admin/">לדף הניהול</a></div>'; return; }
    const { data: ok } = await sb.rpc('is_admin');
    if (ok !== true) { app.innerHTML = '<div class="box"><h1>רק למנהל</h1><p class="mute">הדף הזה פתוח רק לחשבון המנהל, אחרי קוד האימות הדו־שלבי.</p><a href="/admin/">לדף הניהול</a></div>'; return; }
    await refresh();
    sb.channel('po-admin').on('postgres_changes', { event: '*', schema: 'public', table: 'po_rooms' }, () => refresh()).subscribe();
    setInterval(() => { if (!document.hidden) refresh(); }, 5000);
    // the 30-second countdowns
    ticker = setInterval(() => app.querySelectorAll('[data-cd]').forEach((el) => { el.textContent = Math.max(0, Math.ceil((+el.dataset.cd - Date.now()) / 1000)); }), 500);
  }
  start();
})();
