/* Barusik Poker · the table on screen. Built once per room and then only patched, so nothing blinks when a
   move comes in: seats, cards and chips stay the same elements and only what changed is touched.
   Every player sits as her character with her tomato basket beside her; tomatoes fly basket → face.
   © 2026 Bar Lvovski. All rights reserved. */
(function (root) {
  'use strict';
  const P = root.Poker, A = root.PokerArt;
  const RK = { 10: '10', 11: 'J', 12: 'Q', 13: 'K', 14: 'A' }, SU = ['♠', '♥', '♦', '♣'];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (v) => `<bdi class="n">${Number(v || 0).toLocaleString('en-US')}</bdi>`;
  const label = (c) => (RK[P.rankOf(c)] || P.rankOf(c)) + SU[P.suitOf(c)];
  function card(c, cls = '') {
    if (c === 'back') return `<span class="card back ${cls}" aria-hidden="true"></span>`;
    if (c == null) return `<span class="card ghost ${cls}" aria-hidden="true"></span>`;
    const r = P.rankOf(c), s = P.suitOf(c);
    return `<span class="card ${s === 1 || s === 2 ? 'red' : ''} ${cls}" role="img" aria-label="${label(c)}"><span class="r">${RK[r] || r}<i>${SU[s]}</i></span><span class="s">${SU[s]}</span></span>`;
  }
  let audio;
  function splatSound() {
    try {
      audio ||= new (root.AudioContext || root.webkitAudioContext)();
      const t = audio.currentTime, len = 0.28, buf = audio.createBuffer(1, audio.sampleRate * len, audio.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
      const src = audio.createBufferSource(), f = audio.createBiquadFilter(), g = audio.createGain();
      src.buffer = buf; f.type = 'lowpass'; f.frequency.setValueAtTime(1600, t); f.frequency.exponentialRampToValueAtTime(220, t + len);
      g.gain.setValueAtTime(0.5, t); src.connect(f).connect(g).connect(audio.destination); src.start(t);
    } catch {}
  }
  const reduced = () => root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function createTable(felt, fx, T, isRtl) {
    felt.innerHTML = `<div class="oval"><div class="mark">BARUSIK</div></div>
      <div class="center"><div class="board">${[0, 1, 2, 3, 4].map(() => card(null)).join('')}</div><div class="board b2 hide"></div><div class="potv hide"></div><div class="msg hide"></div></div>
      <div class="dbtn hide" aria-label="${esc(T.dealer)}" title="${esc(T.dealer)}">D</div><div class="seats"></div>`;
    const board = felt.querySelector('.board'), board2 = felt.querySelector('.board.b2'), pot = felt.querySelector('.potv'), msg = felt.querySelector('.msg'), dbtn = felt.querySelector('.dbtn'), seatsEl = felt.querySelector('.seats');
    let nodes = [], shape = '', last = { board: '' }, view = null, aiming = false;

    function pos(i, n, me) {
      const base = me >= 0 ? me : 0, k = (i - base + n) % n;
      const a = Math.PI / 2 + (k / n) * Math.PI * 2 * (isRtl() ? -1 : 1);
      const wide = felt.clientWidth > 640, rx = wide ? 44 : 39, ry = wide ? 41 : 44;
      const x = 50 + Math.cos(a) * rx, y = 50 + Math.sin(a) * ry;
      const b = k === 0 ? 0.36 : 0.56, ad = a + (isRtl() ? 0.4 : -0.4) * (k === 0 ? 1.4 : 1);
      return { k, x, y, bx: 50 + Math.cos(a) * rx * b, by: 50 + Math.sin(a) * ry * b, dx: 50 + Math.cos(ad) * rx * 0.63, dy: 50 + Math.sin(ad) * ry * 0.63 };
    }

    function build(n) {
      seatsEl.innerHTML = '';
      nodes = [];
      for (let i = 0; i < n; i++) {
        const el = document.createElement('div');
        el.className = 'seat empty-seat'; el.dataset.seat = i;
        el.innerHTML = `<button class="sit hide" type="button">${esc(T.sitHere)}</button><div class="emptyl hide">${esc(T.empty)}</div>
          <div class="who hide"><div class="av" data-av><div class="avs"></div><div class="hole"></div></div>
            <div class="plate"><span class="tag hide"></span><div class="nm"></div><div class="ch"></div><div class="hand"></div><div class="timer"><i></i></div></div>
            <div class="bask"><button class="bkb" type="button" aria-label="${esc(T.basket)}"></button><button class="bkn" type="button"></button></div></div>`;
        const bet = document.createElement('div'); bet.className = 'chipst hide';
        const win = document.createElement('div'); win.className = 'chipst win hide';
        seatsEl.appendChild(el); seatsEl.appendChild(bet); seatsEl.appendChild(win);
        const q = (s) => el.querySelector(s);
        const nd = { el, bet, win, sit: q('.sit'), emptyl: q('.emptyl'), who: q('.who'), av: q('.av'), avs: q('.avs'), hole: q('.hole'), tag: q('.tag'), nm: q('.nm'), ch: q('.ch'), hand: q('.hand'), timer: q('.timer i'), bask: q('.bask'), bkb: q('.bkb'), bkn: q('.bkn'), k: {} };
        nd.sit.onclick = () => view && view.onSit && view.onSit(i);
        nd.bkn.onclick = (e) => { e.stopPropagation(); if (view && i === view.me && view.onBuy) view.onBuy(); };
        nd.av.onclick = (e) => {
          if (!view) return;
          if (aiming && i !== view.me) { e.stopPropagation(); setAim(false); view.onThrow && view.onThrow(i); return; }
          if (i === view.me && view.onAvatar) view.onAvatar();
        };
        dragThrow(nd, i);
        nodes.push(nd);
      }
    }

    // tap your basket: aim, then tap a face. Or drag a tomato from the basket onto a face.
    function setAim(on) {
      aiming = on && !!view && view.me >= 0;
      felt.classList.toggle('aiming', aiming);
      if (aiming && view.onAimHint) view.onAimHint();
    }
    felt.addEventListener('click', (e) => { if (aiming && !e.target.closest('.av') && !e.target.closest('.bask')) setAim(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && aiming) setAim(false); });
    function dragThrow(nd, i) {
      let start = null, ghost = null;
      nd.bkb.addEventListener('pointerdown', (e) => {
        if (!view || i !== view.me || !view.onThrow) return;
        start = { x: e.clientX, y: e.clientY }; nd.bkb.setPointerCapture(e.pointerId);
      });
      nd.bkb.addEventListener('pointermove', (e) => {
        if (!start) return;
        if (!ghost && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 12) {
          ghost = document.createElement('div'); ghost.className = 'flyt drag'; ghost.innerHTML = A.tomatoSVG(); document.body.appendChild(ghost); setAim(true);
        }
        if (ghost) { ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; }
      });
      const end = (e) => {
        if (!start) return;
        const wasDrag = !!ghost; start = null;
        if (ghost) { ghost.remove(); ghost = null; }
        if (!wasDrag) { setAim(!aiming); return; }
        const hit = document.elementsFromPoint(e.clientX, e.clientY).map((x) => x.closest && x.closest('.seat')).find((s) => s && s.dataset.seat != null);
        setAim(false);
        const to = hit ? +hit.dataset.seat : -1;
        if (to >= 0 && to !== view.me && view.seats[to]) view.onThrow(to);
      };
      nd.bkb.addEventListener('pointerup', end);
      nd.bkb.addEventListener('pointercancel', () => { start = null; if (ghost) { ghost.remove(); ghost = null; } setAim(false); });
    }

    function update(v) {
      view = v;
      const key = `${v.n}|${v.me}|${felt.clientWidth > 640}|${isRtl()}`;
      if (v.n !== nodes.length) build(v.n);
      if (key !== shape) {
        shape = key;
        nodes.forEach((nd, i) => { const p = pos(i, v.n, v.me); nd.p = p; nd.el.style.left = p.x + '%'; nd.el.style.top = p.y + '%'; nd.bet.style.left = nd.win.style.left = p.bx + '%'; nd.bet.style.top = nd.win.style.top = p.by + '%'; nd.el.classList.toggle('right', p.x > 52); nd.el.classList.toggle('top', p.y < 40); nd.el.classList.toggle('me', i === v.me); });
      }
      // board
      const bkey = v.board.join(',');
      if (bkey !== last.board) {
        const had = last.board ? last.board.split(',').length : 0;
        board.innerHTML = [0, 1, 2, 3, 4].map((i) => card(v.board[i] ?? null, v.board[i] != null && i >= had ? 'in' : '')).join('');
        last.board = bkey;
      }
      const b2 = (v.board2 || []).join(',');
      if (b2 !== last.board2) { board2.classList.toggle('hide', !b2); if (b2) board2.innerHTML = v.board2.map((c, i) => card(c, i >= (v.board || []).length - (5 - v.board2.length) ? 'in' : '')).join(''); last.board2 = b2; }
      const win = new Set(); v.seats.forEach((s) => s && s.best && s.best.forEach((c) => win.add(c)));
      board.querySelectorAll('.card').forEach((el, i) => { const c = v.board[i]; el.classList.toggle('hl', win.size > 0 && c != null && win.has(c)); el.classList.toggle('dim', win.size > 0 && c != null && !win.has(c)); });
      const tot = v.pot + v.seats.reduce((t, x) => t + (x && x.bet ? x.bet : 0), 0);
      pot.classList.toggle('hide', !tot); if (tot) pot.innerHTML = `<span class="chip"></span>` + (v.pot && tot !== v.pot && T.total ? `${esc(T.pot)} ${num(v.pot)} <small>${esc(T.total)} ${num(tot)}</small>` : `${esc(T.pot)} ${num(tot)}`);
      msg.classList.toggle('hide', !v.msg); if (v.msg) msg.innerHTML = v.msg;
      // dealer button
      const bn = v.button != null && v.seats[v.button] ? nodes[v.button] : null;
      dbtn.classList.toggle('hide', !bn); if (bn) { dbtn.style.left = bn.p.dx + '%'; dbtn.style.top = bn.p.dy + '%'; }
      // seats
      v.seats.forEach((s, i) => {
        const nd = nodes[i]; if (!nd) return;
        const me = i === v.me, k = nd.k;
        nd.el.classList.toggle('empty-seat', !s);
        nd.who.classList.toggle('hide', !s);
        nd.sit.classList.toggle('hide', !!s || !v.canSit);
        nd.emptyl.classList.toggle('hide', !!s || v.canSit);
        nd.bet.classList.toggle('hide', !s || !s.bet);
        nd.win.classList.toggle('hide', !s || !s.win);
        if (!s) { k.uid = null; return; }
        const lk = s.ph || s.av || 0;
        if (k.av !== lk) { nd.avs.innerHTML = s.ph ? `<span class="ph"><img src="${esc(s.ph)}" alt="" draggable="false" loading="lazy"></span>` : A.avatarSVG(s.av || 0); k.av = lk; nd.el.classList.toggle('photo', !!s.ph); }
        if (k.name !== s.name) { nd.nm.textContent = s.name; k.name = s.name; }
        nd.ch.innerHTML = num(s.chips);
        const tag = s.allIn ? T.allin : s.away ? T.isAway : '';
        nd.tag.classList.toggle('hide', !tag); nd.tag.textContent = tag; nd.tag.classList.toggle('grey', !s.allIn);
        nd.hand.textContent = s.hand || '';
        nd.el.classList.toggle('turn', v.toAct === i);
        nd.el.classList.toggle('folded', !!s.folded);
        nd.el.classList.toggle('winner', !!s.win);
        nd.el.classList.toggle('mine', me);
        // cards: only touched when they change
        const cards = s.cards === 'back' ? Array(v.holes || 2).fill('back') : Array.isArray(s.cards) ? s.cards : [];
        const ck = cards.join(',') + '|' + (v.hand || 0);
        if (ck !== k.cards) {
          const fresh = !k.cards || k.cards.split('|')[1] !== String(v.hand || 0) || (k.cards.startsWith('back') && cards[0] !== 'back');
          nd.hole.innerHTML = cards.map((c, j) => card(c, fresh ? `in d${j}` : '')).join('');
          nd.hole.classList.toggle('four', cards.length > 2);
          k.cards = ck;
        }
        nd.hole.querySelectorAll('.card').forEach((el, j) => { const c = cards[j]; el.classList.toggle('hl', win.size > 0 && c !== 'back' && win.has(c)); el.classList.toggle('dim', win.size > 0 && c !== 'back' && !win.has(c)); });
        // turn timer: restart only for a new turn
        const tk = v.toAct === i ? v.until : 0;
        if (tk !== k.timer) {
          k.timer = tk; nd.timer.classList.remove('go'); nd.timer.style.animation = 'none'; nd.timer.style.transform = 'scaleX(0)';
          if (tk) { const left = Math.max(0, tk - Date.now()); void nd.timer.offsetWidth; nd.timer.style.transform = `scaleX(${Math.min(1, left / (v.turnSec * 1000))})`; nd.timer.style.animation = ''; nd.timer.style.animationDuration = left + 'ms'; nd.timer.classList.add('go'); }
        }
        if (s.bet) nd.bet.innerHTML = `<span class="chip ${s.bet >= (v.bb || 1) * 10 ? 'b' : ''}"></span>${num(s.bet)}`;
        if (s.win) nd.win.innerHTML = `+${num(s.win)}`;
        // basket
        const showB = v.baskets !== false;
        nd.bask.classList.toggle('hide', !showB);
        if (showB) {
          const t = s.tom ?? 0;
          if (k.tom !== t) { nd.bkb.innerHTML = A.basketSVG(t === Infinity ? 7 : t); nd.bkn.textContent = t === Infinity ? '∞' : t > 999 ? '999+' : String(t); k.tom = t; }
          nd.bkn.disabled = !me || !v.onBuy; nd.bkn.title = me ? T.buyT : ''; nd.bkn.setAttribute('aria-label', `${t} ${T.tomatoes}${me ? ' · ' + T.buyT : ''}`);
          nd.bkb.disabled = !me; nd.bkb.title = me ? T.aim : '';
        }
        nd.av.classList.toggle('clickable', me && !!v.onAvatar);
        nd.av.setAttribute('aria-label', me ? T.pickLook : (v.onThrow ? `${T.throwAt.replace('{n}', s.name)}` : s.name));
        k.uid = s.uid;
      });
    }

    /* a tomato from one seat's basket to another's face */
    function throwAt(from, to, opts = {}) {
      const a = nodes[from], b = nodes[to];
      if (!b || !b.avs.firstElementChild) return;
      const box = fx.getBoundingClientRect();
      const fr = (a && !a.who.classList.contains('hide') ? a.bkb : felt).getBoundingClientRect();
      const tr = b.avs.getBoundingClientRect();
      const x0 = fr.left + fr.width / 2 - box.left, y0 = (a ? fr.top + fr.height * 0.3 : fr.top) - box.top;
      const x1 = tr.left + tr.width / 2 - box.left, y1 = tr.top + tr.height * (b.el.classList.contains('photo') ? 0.38 : 0.42) - box.top;
      const done = () => {
        const sp = document.createElement('div'); sp.className = 'splat2'; sp.innerHTML = A.splatSVG();
        const w = tr.width * 0.95; sp.style.width = w + 'px'; sp.style.left = x1 + 'px'; sp.style.top = y1 + 'px';
        fx.appendChild(sp); setTimeout(() => sp.remove(), 3600);
        b.el.classList.remove('hit'); void b.el.offsetWidth; b.el.classList.add('hit');
        clearTimeout(b.hitT); b.hitT = setTimeout(() => b.el.classList.remove('hit'), 1700);
        if (!opts.quiet) splatSound();
        opts.onHit && opts.onHit();
      };
      if (reduced()) return done();
      const el = document.createElement('div'); el.className = 'flyt'; el.innerHTML = A.tomatoSVG();
      fx.appendChild(el);
      const dist = Math.hypot(x1 - x0, y1 - y0), lift = Math.min(160, 50 + dist * 0.35), steps = 18, frames = [];
      for (let s = 0; s <= steps; s++) {
        const t = s / steps, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t - Math.sin(Math.PI * t) * lift, sc = 0.9 + Math.sin(Math.PI * t) * 0.5;
        frames.push({ transform: `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${t * 720}deg) scale(${sc})`, offset: t });
      }
      const anim = el.animate(frames, { duration: Math.min(900, 420 + dist * 0.9), easing: 'cubic-bezier(.35,.05,.55,1)', fill: 'forwards' });
      anim.onfinish = () => { el.remove(); done(); };
    }

    return { update, throwAt, setAim, seatOf: (i) => nodes[i] };
  }
  root.PokerTable = { createTable, card, label };
})(window);
