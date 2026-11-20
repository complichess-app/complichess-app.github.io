/* Barusik Poker · hand history, the replayer, stats and private notes on players.
   Hands come from the `poker` function (po_hands): your own cards and the ones shown at showdown, nobody else's.
   Notes, colours and saved hands stay on this device. © 2026 Bar Lvovski. All rights reserved. */
(function (root) {
  'use strict';
  const P = root.Poker, PT = root.PokerTable;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fill = (s, o) => String(s).replace(/\{(\w)\}/g, (_, k) => o[k] ?? '');
  const num = (v) => PT.num(v), card = PT.card;
  const load = (k) => { try { return JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch { return {}; } };
  const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const signed = (v) => `<span class="${v > 0 ? 'pos' : v < 0 ? 'neg' : 'mute'}">${v > 0 ? '+' : ''}${num(v)}</span>`;

  /* ---------- notes and colours on players ---------- */
  const NK = 'barusik.poker.notes', SK = 'barusik.poker.saved';
  let NOTES = load(NK), SAVED = load(SK);
  const COLORS = ['', '#E5484D', '#F76B15', '#FFD60A', '#30A46C', '#3E8EF7', '#8E4EC6', '#E93D82'];
  function notes() { const o = {}; for (const [u, n] of Object.entries(NOTES)) o[u] = { c: n.c || (n.t ? '#9AA6A0' : ''), t: n.t || '' }; return o; }
  function notePop(T, anchor, who, statLine, done) {
    document.querySelectorAll('.note-pop').forEach((x) => x.remove());
    const cur = NOTES[who.uid] || { c: '', t: '' };
    const el = document.createElement('div'); el.className = 'note-pop'; el.dir = 'auto';
    el.innerHTML = `<b>${esc(fill(T.notesT, { n: who.name }))}</b>${statLine ? `<div class="stat" dir="ltr">${statLine}</div>` : ''}
      <div class="swatches">${COLORS.map((c) => `<button type="button" data-c="${c}" aria-pressed="${(cur.c || '') === c}" title="${c ? '' : esc(T.noColor)}" style="background:${c || 'transparent'}">${c ? '' : '∅'}</button>`).join('')}</div>
      <textarea maxlength="400" placeholder="${esc(T.notesP)}" dir="auto">${esc(cur.t)}</textarea>
      <div class="row"><button type="button" class="btn ghost small" data-x>${esc(T.cancel)}</button><button type="button" class="btn small" data-s>${esc(T.save)}</button></div>`;
    document.body.appendChild(el);
    const r = anchor.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
    el.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
    el.style.top = Math.max(8, r.top - h - 10 < 8 ? r.bottom + 10 : r.top - h - 10) + 'px';
    let c = cur.c || '';
    el.querySelectorAll('[data-c]').forEach((b) => (b.onclick = () => { c = b.dataset.c; el.querySelectorAll('[data-c]').forEach((x) => x.setAttribute('aria-pressed', x === b)); }));
    const close = () => { el.remove(); removeEventListener('pointerdown', off, true); };
    const off = (e) => { if (!el.contains(e.target)) close(); };
    setTimeout(() => addEventListener('pointerdown', off, true), 0);
    el.querySelector('[data-x]').onclick = close;
    el.querySelector('[data-s]').onclick = () => {
      const t = el.querySelector('textarea').value.trim();
      if (!t && !c) delete NOTES[who.uid]; else NOTES[who.uid] = { c, t, name: who.name };
      store(NK, NOTES); close(); done && done();
    };
    el.querySelector('textarea').focus();
  }

  /* ---------- stats from the hand history ---------- */
  const VOL = new Set(['call', 'bet', 'raise']);
  function statsOf(hands) {
    const S = {};
    for (const h of hands) {
      for (const p of h.players || []) {
        const x = (S[p.uid] ||= { uid: p.uid, name: p.name, hands: 0, vpip: 0, pfr: 0, sd: 0, wsd: 0, net: 0, best: 0, worst: 0, series: [] });
        x.name = p.name; x.hands++;
        const pre = (h.acts || []).filter((a) => a.s === p.seat && a.st === 'preflop');
        if (pre.some((a) => VOL.has(a.k))) x.vpip++;
        if (pre.some((a) => a.k === 'raise' || a.k === 'bet')) x.pfr++;
        if (h.sd && !p.folded) { x.sd++; if ((p.net || 0) > 0) x.wsd++; }
        x.net += p.net || 0; x.best = Math.max(x.best, p.net || 0); x.worst = Math.min(x.worst, p.net || 0);
      }
    }
    return S;
  }
  const pct = (a, b) => (b ? Math.round((a / b) * 100) + '%' : '–');
  const statLine = (x) => (x ? `${x.hands} hands · VPIP ${pct(x.vpip, x.hands)} · PFR ${pct(x.pfr, x.hands)} · WTSD ${pct(x.sd, x.hands)} · Net ${PT.fmt(x.net)}` : '');

  function spark(values) {
    if (values.length < 2) return '';
    let acc = 0; const pts = values.map((v) => (acc += v));
    pts.unshift(0);
    const lo = Math.min(...pts), hi = Math.max(...pts), W = 300, H = 70, sx = W / (pts.length - 1), sy = (H - 10) / ((hi - lo) || 1);
    const xy = pts.map((v, i) => `${(i * sx).toFixed(1)},${(H - 5 - (v - lo) * sy).toFixed(1)}`).join(' ');
    const zero = H - 5 - (0 - lo) * sy;
    return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><line x1="0" x2="${W}" y1="${zero}" y2="${zero}" stroke="rgba(255,255,255,.15)" stroke-dasharray="3 4"/><polyline points="${xy}" fill="none" stroke="${acc >= 0 ? '#5FE0A0' : '#FF9C8A'}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
  }

  function renderStats(T, pane, roomHands, myHands, me) {
    const S = statsOf(roomHands || []), M = statsOf(myHands || [])[me];
    let h = '';
    if (M) {
      const series = (myHands || []).slice().reverse().map((x) => (x.players.find((p) => p.uid === me) || {}).net || 0);
      h += `<h3>${esc(T.myStats)}</h3><div class="kpis">
        <div><b>${M.hands}</b><span>${esc(T.handsN)}</span></div><div><b>${signed(M.net)}</b><span>${esc(T.netN)}</span></div><div><b>${pct(M.vpip, M.hands)}</b><span>VPIP</span></div>
        <div><b>${pct(M.pfr, M.hands)}</b><span>PFR</span></div><div><b>${pct(M.sd, M.hands)}</b><span>WTSD</span></div><div><b>${pct(M.wsd, M.sd)}</b><span>W$SD</span></div>
        <div><b>${signed(M.best)}</b><span>${esc(T.bigWin)}</span></div><div><b>${signed(M.worst)}</b><span>${esc(T.bigLoss)}</span></div></div>${spark(series)}`;
    }
    const rows = Object.values(S).sort((a, b) => b.hands - a.hands);
    h += `<h3>${esc(T.tableStats)}</h3>` + (rows.length ? `<table class="stats"><thead><tr><th>${esc(T.player)}</th><th>${esc(T.handsN)}</th><th>VPIP</th><th>PFR</th><th>WTSD</th><th>W$SD</th><th>${esc(T.netN)}</th></tr></thead><tbody>${rows.map((x) => `<tr><td><bdi>${esc(x.name)}</bdi></td><td>${x.hands}</td><td>${pct(x.vpip, x.hands)}</td><td>${pct(x.pfr, x.hands)}</td><td>${pct(x.sd, x.hands)}</td><td>${pct(x.wsd, x.sd)}</td><td>${signed(x.net)}</td></tr>`).join('')}</tbody></table>` : `<p class="mute" dir="auto">${esc(T.noHands)}</p>`);
    h += `<p class="mute small" dir="auto" style="margin-top:12px">${esc(T.statsNote)}</p>`;
    pane.innerHTML = h;
  }

  /* ---------- the list of hands ---------- */
  function renderHands(T, pane, hands, me, o) {
    const f = o.filter || 'all';
    const mine = (h) => (h.players || []).find((p) => p.uid === me);
    const list = (hands || []).filter((h) => { const m = mine(h); return f === 'all' || (f === 'won' && m && m.net > 0) || (f === 'lost' && m && m.net < 0) || (f === 'sd' && h.sd) || (f === 'saved' && SAVED[h.id] != null); });
    pane.innerHTML = `${o.scopeHTML || ''}<div class="hfil">${[['all', T.allF], ['won', T.wonF], ['lost', T.lostF], ['sd', T.sdF], ['saved', T.savedF]].map(([k, l]) => `<button type="button" data-f="${k}" aria-pressed="${f === k}">${esc(l)}</button>`).join('')}</div>`
      + (list.length ? list.map((h) => {
        const m = mine(h), cs = m && h.cards ? h.cards[m.seat] : null;
        const win = (h.results || [])[0];
        const winName = win ? (h.players.find((p) => p.seat === win.seats[0]) || {}).name : '';
        return `<div class="hrow" data-id="${h.id}" role="button" tabindex="0"><span class="hn2">#${h.n}</span>
          <span class="mini">${cs ? cs.map((c) => card(c)).join('') : ''}<span style="width:6px"></span>${(h.board || []).map((c) => card(c)).join('')}</span>
          <span class="net">${m ? signed(m.net) : `<bdi>${esc(winName)}</bdi> ${num(win ? win.amount : 0)}`}</span>
          <span class="star${SAVED[h.id] != null ? ' on' : ''}" data-star="${h.id}" role="button" aria-label="${esc(T.save2)}">★</span>
          ${SAVED[h.id] ? `<span class="tagt" dir="auto">${esc(SAVED[h.id])}</span>` : ''}</div>`;
      }).join('') : `<p class="mute" dir="auto">${esc(o.empty || T.noHands)}</p>`);
    pane.querySelectorAll('[data-f]').forEach((b) => (b.onclick = () => o.onFilter(b.dataset.f)));
    pane.querySelectorAll('[data-star]').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); toggleSave(T, +b.dataset.star); o.onFilter(f); }));
    pane.querySelectorAll('.hrow').forEach((r) => { const open = () => replay(T, hands.find((x) => x.id === +r.dataset.id), me, () => o.onFilter(f)); r.onclick = open; r.onkeydown = (e) => { if (e.key === 'Enter') open(); }; });
    o.bindScope && o.bindScope(pane);
  }
  function toggleSave(T, id) {
    if (SAVED[id] != null) delete SAVED[id];
    else { const t = prompt(T.tagQ, '') ; if (t === null) return; SAVED[id] = t.trim().slice(0, 60); }
    store(SK, SAVED);
  }

  /* ---------- the replayer: step through a hand ---------- */
  function replay(T, h, me, changed) {
    if (!h) return;
    const steps = [{ k: 'start' }].concat(h.acts || []).concat([{ k: 'end' }]);
    const players = (h.players || []).slice().sort((a, b) => a.seat - b.seat);
    const meIdx = Math.max(0, players.findIndex((p) => p.uid === me));
    const d = document.createElement('dialog'); d.className = 'replay'; d.dir = 'ltr';
    document.body.appendChild(d);
    let i = 0, timer = null;
    const nameOf = (seat) => (players.find((p) => p.seat === seat) || {}).name || '?';
    function stateAt(n) {
      const S = { stack: {}, bet: {}, fold: {}, pot: 0, board: [], board2: null, last: null, say: '' };
      for (const p of players) { S.stack[p.seat] = p.stack; S.bet[p.seat] = 0; }
      for (let j = 1; j <= n && j < steps.length; j++) {
        const a = steps[j];
        if (a.k === 'board') { for (const s in S.bet) { S.pot += S.bet[s]; S.bet[s] = 0; } S.board = a.b; if (a.b2) S.board2 = a.b2; const b = a.b.map(PT.label); S.say = `${b.length === 3 ? 'Flop' : b.length === 4 ? 'Turn' : 'River'}: ${b.join(' ')}`; S.last = null; continue; }
        if (a.k === 'end') { S.say = ''; continue; }
        const nm = `<b>${esc(nameOf(a.s))}</b>`;
        if (a.k === 'fold') { S.fold[a.s] = true; S.say = fill(esc(T.lfold), { n: nm }); }
        else if (a.k === 'check') S.say = fill(esc(T.lcheck), { n: nm });
        else if (a.k === 'back') { S.bet[a.s] -= a.a; S.stack[a.s] += a.a; S.say = fill(esc(T.lback), { n: nm, a: num(a.a) }); }
        else if (a.k === 'ante' || a.k === 'bomb') { S.stack[a.s] -= a.a; S.pot += a.a; S.say = fill(esc(a.k === 'ante' ? T.lante : T.lbombp), { n: nm, a: num(a.a) }); }
        else if (a.k === 'sb' || a.k === 'bb' || a.k === 'straddle' || a.k === 'call') { S.stack[a.s] -= a.a; S.bet[a.s] += a.a; S.say = fill(esc(T['l' + a.k]), { n: nm, a: num(a.a) }); }
        else if (a.k === 'bet' || a.k === 'raise') { const add = a.a - S.bet[a.s]; S.stack[a.s] -= add; S.bet[a.s] = a.a; S.say = fill(esc(a.k === 'bet' ? T.lbet : T.lraise), { n: nm, a: num(a.a) }) + (a.all ? esc(T.lall) : ''); }
        S.last = a.s;
      }
      if (n >= steps.length - 1) {
        for (const s in S.bet) { S.pot += S.bet[s]; S.bet[s] = 0; }
        S.board = h.board || S.board; S.board2 = h.board2 || S.board2;
        for (const p of players) S.stack[p.seat] = p.stack + (p.net || 0);
        S.say = (h.results || []).map((r) => `🏆 <b>${esc(r.seats.map(nameOf).join(', '))}</b> ${num(r.amount)}${r.cat != null ? ' · ' + esc(T.hands[r.cat]) : r.low ? ' · ' + esc(T.lowH) : ''}`).join('&nbsp;&nbsp;');
        S.end = true;
      }
      return S;
    }
    function paint() {
      const S = stateAt(i);
      const n = players.length;
      const seatsHTML = players.map((p, k) => {
        const a = Math.PI / 2 + (((k - meIdx + n) % n) / n) * Math.PI * 2;
        const x = 50 + Math.cos(a) * 42, y = 50 + Math.sin(a) * 40;
        const cs = h.cards && h.cards[p.seat];
        const showCards = cs && (p.uid === me || S.end);
        return `<div class="rp-seat${S.last === p.seat ? ' act' : ''}${S.fold[p.seat] ? ' fold' : ''}" style="left:${x}%;top:${y}%"><div class="cs2">${showCards ? cs.map((c) => card(c)).join('') : ''}</div><bdi>${esc(p.name)}</bdi><i>${num(S.stack[p.seat])}</i>${S.bet[p.seat] ? `<small>${num(S.bet[p.seat])}</small>` : ''}${S.end ? `<div>${signed(p.net || 0)}</div>` : ''}</div>`;
      }).join('');
      d.innerHTML = `<div class="rp-top"><b dir="auto">${esc(T.replay)} #${h.n}</b><span class="mute small">${new Date(h.at).toLocaleString()}</span><button class="btn ghost small" data-sv>${SAVED[h.id] != null ? '★ ' + esc(T.saved) : '☆ ' + esc(T.save2)}</button><button class="btn ghost small" data-x aria-label="${esc(T.cancel)}">✕</button></div>
        <div class="rp-table">${seatsHTML}<div class="rp-mid"><div class="potline"><span class="pot">${esc(T.pot)} <b>${num(S.pot + Object.values(S.bet).reduce((a, b) => a + b, 0))}</b></span></div><div class="board">${[0, 1, 2, 3, 4].map((k) => card(S.board[k] ?? null)).join('')}</div>${S.board2 ? `<div class="board">${[0, 1, 2, 3, 4].map((k) => card(S.board2[k] ?? null)).join('')}</div>` : ''}</div></div>
        <div class="rp-say" dir="ltr">${S.say || '&nbsp;'}</div>
        <div class="rp-ctl"><button class="btn ghost small" data-g="0">⏮</button><button class="btn ghost small" data-g="-1">◀</button><button class="btn small" data-p>${timer ? '❚❚' : '▶'}</button><button class="btn ghost small" data-g="1">▶︎|</button><button class="btn ghost small" data-g="end">⏭</button></div>`;
      d.querySelector('[data-x]').onclick = () => d.close();
      d.querySelector('[data-sv]').onclick = () => { toggleSave(T, h.id); paint(); changed && changed(); };
      d.querySelectorAll('[data-g]').forEach((b) => (b.onclick = () => { stop(); const g = b.dataset.g; i = g === '0' ? 0 : g === 'end' ? steps.length - 1 : Math.max(0, Math.min(steps.length - 1, i + +g)); paint(); }));
      d.querySelector('[data-p]').onclick = () => { if (timer) { stop(); paint(); } else play(); };
    }
    const stop = () => { clearInterval(timer); timer = null; };
    const play = () => { if (i >= steps.length - 1) i = 0; timer = setInterval(() => { i++; if (i >= steps.length - 1) { i = steps.length - 1; stop(); } paint(); }, 900); paint(); };
    d.addEventListener('close', () => { stop(); d.remove(); });
    d.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { stop(); i = Math.min(steps.length - 1, i + 1); paint(); } else if (e.key === 'ArrowLeft') { stop(); i = Math.max(0, i - 1); paint(); } });
    paint(); d.showModal(); play();
  }

  root.PokerHist = { notes, notePop, statsOf, statLine, renderHands, renderStats, replay };
})(window);
