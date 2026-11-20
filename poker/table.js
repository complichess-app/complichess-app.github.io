/* Barusik Poker · the table on screen.
   Built once per room and then only patched: seats, cards and chips keep their elements, and what moved is animated
   (bets slide in from the player, go to the pot at the end of a street, the pot goes to the winner).
   Seats go clockwise from you at the bottom, the way the cards are dealt.
   © 2026 Bar Lvovski. All rights reserved. */
(function (root) {
  'use strict';
  const P = root.Poker, A = root.PokerArt;
  const RK = { 10: '10', 11: 'J', 12: 'Q', 13: 'K', 14: 'A' }, SU = ['♠', '♥', '♦', '♣'], SN = ['s', 'h', 'd', 'c'];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const label = (c) => (RK[P.rankOf(c)] || P.rankOf(c)) + SU[P.suitOf(c)];

  /* ---------- the player's own settings: four-colour deck, sound, amounts in big blinds ---------- */
  const PREFS_KEY = 'barusik.poker.prefs';
  const prefs = (() => { let p = {}; try { p = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') || {}; } catch {} return { four: !!p.four, sound: p.sound !== false, bbs: !!p.bbs, felt: p.felt || 'green', back: p.back || 'red' }; })();
  const FELTS = { green: '#1B6B4D', blue: '#1E5A8C', teal: '#17706B', red: '#852B2B', purple: '#57388A', gray: '#454E52', black: '#202427' };
  const BACKS = { red: '#7E1D2A', blue: '#1F3F7A', green: '#1D5C3A', black: '#1A1C1E', gold: '#8A6417' };
  function applyTheme() {
    const h = document.documentElement;
    h.classList.toggle('deck4', prefs.four);
    for (const f in FELTS) h.classList.toggle('felt-' + f, prefs.felt === f && f !== 'green');
    for (const b in BACKS) h.classList.toggle('back-' + b, prefs.back === b && b !== 'red');
  }
  function setPref(k, v) { prefs[k] = v; try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch {} applyTheme(); }
  applyTheme();
  let BB = 0; // set by the table: amounts can be shown in big blinds
  const fmt = (v) => {
    v = Number(v || 0);
    if (prefs.bbs && BB > 0) { const x = v / BB; return (Math.round(x * 10) / 10).toLocaleString('en-US') + ' BB'; }
    return v.toLocaleString('en-US');
  };
  const num = (v) => `<bdi class="n">${fmt(v)}</bdi>`;

  function card(c, cls = '') {
    if (c === 'back') return `<span class="card back ${cls}" aria-hidden="true"><i></i></span>`;
    if (c == null) return `<span class="card slot ${cls}" aria-hidden="true"></span>`;
    const r = P.rankOf(c), s = P.suitOf(c);
    return `<span class="card ${SN[s]} ${cls}" role="img" aria-label="${label(c)}"><b>${RK[r] || r}</b><i>${SU[s]}</i><u>${SU[s]}</u></span>`;
  }

  /* ---------- sounds, made on the spot (no files to load) ----------
     Clay chips clacking, cards flicked and slapped, a knock for a check, a chime for your turn. */
  let ac = null, out = null;
  const ctx = () => {
    try {
      if (!ac) {
        ac = new (root.AudioContext || root.webkitAudioContext)();
        const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
        out = ac.createGain(); out.gain.value = 0.9; out.connect(comp).connect(ac.destination);
      }
      if (ac.state === 'suspended') ac.resume();
      return ac;
    } catch { return null; }
  };
  // browsers keep sound off until the first tap or key
  const unlock = () => { ctx(); removeEventListener('pointerdown', unlock, true); removeEventListener('keydown', unlock, true); };
  addEventListener('pointerdown', unlock, true); addEventListener('keydown', unlock, true);
  function noise(len, f0, f1, gain, type = 'bandpass', q = 1, at = 0, curve = 2.2) {
    const a = ctx(); if (!a) return;
    const t = a.currentTime + at, buf = a.createBuffer(1, Math.max(1, Math.floor(a.sampleRate * len)), a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, curve);
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    s.buffer = buf; f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + len);
    g.gain.value = gain; s.connect(f).connect(g).connect(out); s.start(t);
  }
  function tone(freq, len, gain, at = 0, type = 'sine', to = 0) {
    const a = ctx(); if (!a) return;
    const t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + len);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g).connect(out); o.start(t); o.stop(t + len + 0.05);
  }
  // one clay chip landing on another: a bright click with a short ring
  const clack = (at, v = 1) => { const f = 2600 + Math.random() * 1600; noise(0.018, f * 1.6, f, 0.55 * v, 'bandpass', 3, at, 3); tone(f, 0.05, 0.05 * v, at, 'triangle'); noise(0.04, 900, 500, 0.12 * v, 'lowpass', 0.7, at + 0.004); };
  const on = () => prefs.sound;
  const sfx = {
    // a bet: a few chips, more for a bigger bet
    chip(n = 3) { if (!on()) return; const k = Math.max(2, Math.min(7, n)); for (let i = 0; i < k; i++) clack(i * (0.035 + Math.random() * 0.03), 1 - i * 0.07); },
    // the chips pulled into the middle at the end of a street
    sweep() { if (!on()) return; noise(0.22, 1800, 700, 0.16, 'bandpass', 0.8); for (let i = 0; i < 6; i++) clack(0.05 + i * 0.03 + Math.random() * 0.02, 0.6); },
    // the pot pushed to the winner: a long cascade and a little fanfare
    win() { if (!on()) return; for (let i = 0; i < 12; i++) clack(i * (0.028 + i * 0.004), 0.9); [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.32, 0.07, 0.25 + i * 0.09, 'triangle')); tone(1568, 0.5, 0.03, 0.62, 'sine'); },
    allin() { if (!on()) return; tone(140, 0.45, 0.35, 0, 'sine', 55); noise(0.35, 400, 120, 0.25, 'lowpass', 0.8); for (let i = 0; i < 8; i++) clack(0.08 + i * 0.03, 0.8); },
    // a card flicked across the felt
    deal(n = 1, gap = 0.09) { if (!on()) return; for (let i = 0; i < n; i++) { noise(0.05, 6000, 2400, 0.22, 'highpass', 0.6, i * gap, 2.5); noise(0.03, 1400, 900, 0.1, 'bandpass', 1, i * gap + 0.03); } },
    // the board turned over: a slap
    board(n = 1, gap = 0.09) { if (!on()) return; for (let i = 0; i < n; i++) { noise(0.06, 4200, 1500, 0.3, 'bandpass', 0.7, i * gap, 3); tone(170, 0.06, 0.12, i * gap, 'sine', 90); } },
    check() { if (!on()) return; [0, 0.13].forEach((t) => { tone(190, 0.09, 0.45, t, 'sine', 110); noise(0.05, 1200, 400, 0.35, 'lowpass', 0.8, t); }); },
    fold() { if (!on()) return; noise(0.2, 2600, 500, 0.2, 'bandpass', 0.9, 0, 1.4); },
    turn() { if (!on()) return; [[880, 0], [1318.5, 0.11]].forEach(([f, t]) => { tone(f, 0.35, 0.12, t); tone(f * 3, 0.12, 0.02, t); }); },
    tick() { if (!on()) return; noise(0.012, 5000, 3000, 0.35, 'bandpass', 4); tone(1700, 0.03, 0.04); },
    bell() { if (!on()) return; tone(988, 0.4, 0.1); tone(784, 0.5, 0.1, 0.18); },
    pop() { if (!on()) return; tone(700, 0.07, 0.08, 0, 'sine', 1300); },
    click() { if (!on()) return; noise(0.01, 3000, 2000, 0.12, 'bandpass', 2); },
    splat() { if (!on()) return; noise(0.32, 1500, 160, 0.6, 'lowpass', 0.9, 0, 1.6); tone(220, 0.18, 0.15, 0, 'sine', 70); noise(0.12, 600, 200, 0.25, 'lowpass', 1, 0.08); },
    whoosh() { if (!on()) return; noise(0.35, 500, 3000, 0.12, 'bandpass', 0.7, 0, 1); },
  };
  const reduced = () => root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const headSVG = (i) => A.avatarSVG(i).replace('viewBox="0 0 100 110"', 'viewBox="17 8 66 66"');

  /* =================== the table =================== */
  function createTable(host, T) {
    host.innerHTML = `<div class="tbl" dir="ltr">
        <div class="rail"><div class="felt"><span class="logo" aria-hidden="true">BARUSIK</span></div></div>
        <div class="center">
          <div class="potline hide"><span class="pot"></span><span class="tot"></span></div>
          <div class="board">${[0, 1, 2, 3, 4].map(() => card(null)).join('')}</div>
          <div class="board b2 hide"></div>
          <div class="cmsg hide"></div>
        </div>
        <div class="dbtn hide" title="${esc(T.dealer)}">D</div>
        <div class="seats"></div>
        <div class="aimbar hide" dir="auto"></div>
        <div class="fx" aria-hidden="true"></div>
        <div class="probe" aria-hidden="true"><i></i><b></b></div>
      </div>`;
    const tbl = host.firstElementChild, $ = (s) => tbl.querySelector(s);
    const probe = $('.probe'), board = $('.board'), board2 = $('.board.b2'), potline = $('.potline'), cmsg = $('.cmsg'), dbtn = $('.dbtn'), seatsEl = $('.seats'), fx = $('.fx'), aimbar = $('.aimbar');
    let nodes = [], shape = '', view = null, aiming = false;
    const last = { board: '', board2: '', hand: -1, bets: [], wins: [], pot: 0, center: '' };

    /* where everything sits. Seats go round a rounded track that follows the rail, evenly spaced along it,
       clockwise from you at the bottom; the bet sits between the player and the middle, past her cards. */
    function geometry(n, me) {
      const W = tbl.clientWidth || 1, H = tbl.clientHeight || 1, tall = H > W * 1.05;
      const bw = probe.offsetWidth || W * 0.15, bh = probe.offsetHeight || 54, ov = bh * 0.42; // ov: the avatar sticks out on the left
      const hcH = (probe.firstElementChild ? probe.firstElementChild.offsetWidth : 40) * 1.4, mcH = (probe.lastElementChild ? probe.lastElementChild.offsetWidth : 60) * 1.4;
      const rl = tall ? [0.09, 0.09, 0.08, 0.11] : [0.075, 0.075, 0.09, 0.08]; // left right top bottom, as in the CSS
      const cx = W * (rl[0] + (1 - rl[0] - rl[1]) / 2), cy = H * (rl[2] + (1 - rl[2] - rl[3]) / 2);
      const A = Math.min(W * (1 - rl[0] - rl[1]) / 2, W / 2 - bw / 2 - ov - 4), B = Math.min(H * (1 - rl[2] - rl[3]) / 2, cy - bh / 2 - 2);
      // the board's box (and the pot line over it), so bets keep out of it
      const tr = tbl.getBoundingClientRect(), bR = board.getBoundingClientRect();
      const br = bR.width ? { l: bR.left - tr.left - 18, r: bR.right - tr.left + 18, t: bR.top - tr.top - 40, b: bR.bottom - tr.top + 16 } : null;
      const R = Math.min(A, B), sx = A - R, sy = B - R, L = 4 * sx + 4 * sy + 2 * Math.PI * R;
      const arc = (ox, oy, a0, d) => { const a = a0 + d / R; return [ox + Math.cos(a) * R, oy + Math.sin(a) * R]; };
      function point(d) { // from the bottom middle, clockwise on screen (to the left first)
        const segs = [
          [sx, (t) => [cx - t, cy + B]],
          [Math.PI * R / 2, (t) => arc(cx - sx, cy + sy, Math.PI / 2, t)],
          [2 * sy, (t) => [cx - A, cy + sy - t]],
          [Math.PI * R / 2, (t) => arc(cx - sx, cy - sy, Math.PI, t)],
          [2 * sx, (t) => [cx - sx + t, cy - B]],
          [Math.PI * R / 2, (t) => arc(cx + sx, cy - sy, Math.PI * 1.5, t)],
          [2 * sy, (t) => [cx + A, cy - sy + t]],
          [Math.PI * R / 2, (t) => arc(cx + sx, cy + sy, 0, t)],
          [sx, (t) => [cx + sx - t, cy + B]],
        ];
        for (const [len, f] of segs) { if (d <= len + 1e-6) return f(d); d -= len; }
        return [cx, cy + B];
      }
      const out = [];
      for (let i = 0; i < n; i++) {
        const k = ((i - (me >= 0 ? me : 0)) % n + n) % n;
        const [x, y] = point((k / n) * L);
        let ux = cx - x, uy = cy - y; const m = Math.hypot(ux, uy) || 1; ux /= m; uy /= m;
        const below = y > cy + B * 0.35;
        const reach = Math.abs(ux) * (bw / 2 + (ux < 0 ? ov : 0)) + Math.abs(uy) * bh / 2;
        const d = below ? bh / 2 + (k === 0 ? mcH : hcH * 1.12) * 0.9 + 16 : reach + 24;
        let bx = x + ux * d, by = y + uy * d;
        // on a standing table the side seats bet straight in front of them
        if (tall && Math.abs(ux) > 0.5 && !below) { bx = x + Math.sign(ux) * (bw / 2 + (ux < 0 ? ov : 0) + 26); by = y + bh * 0.1; }
        // never on top of the board: slide out above or below it
        if (br && bx > br.l && bx < br.r && by > br.t && by < br.b) by = y < (br.t + br.b) / 2 ? br.t : br.b;
        // the dealer button: beside the box, clear of the avatar on the left and of your own tomatoes on the right
        const side = x > cx + 4 ? 1 : -1;
        let dx = below ? x + side * (bw / 2 + (side < 0 ? ov : 0) + 14) : x + ux * (reach + 12) + (x < cx - 4 ? 1 : -1) * bw * 0.32, dy = below ? y - bh * 0.15 : y + uy * (reach + 12);
        if (tall && Math.abs(ux) > 0.5 && !below) { dx = x + Math.sign(ux) * (bw / 2 - 6); dy = y - bh / 2 - 12; }
        if (br && dx > br.l && dx < br.r && dy > br.t && dy < br.b) dy = y < (br.t + br.b) / 2 ? br.t - 4 : br.b + 4;
        const P = (v, w) => (v / w) * 100;
        out.push({ k, x: P(x, W), y: P(y, H), bx: P(bx, W), by: P(by, H), dx: P(dx, W), dy: P(dy, H), top: y < cy - B * 0.35, side: Math.abs(ux) > 0.8 ? (ux > 0 ? 'l' : 'r') : '' });
      }
      return out;
    }

    function build(n) {
      seatsEl.innerHTML = ''; nodes = [];
      for (let i = 0; i < n; i++) {
        const el = document.createElement('div');
        el.className = 'seat empty'; el.dataset.seat = i;
        el.innerHTML = `<button class="sit hide" type="button">${esc(T.sitHere)}</button><button class="move hide" type="button" aria-label="${esc(T.sitHere)}">+</button>
          <div class="pl hide">
            <div class="cards"></div>
            <div class="box">
              <span class="av" aria-hidden="true"><span class="avs"></span></span>
              <span class="who"><bdi class="nm"></bdi><span class="st"></span></span>
              <button class="tom" type="button"><span aria-hidden="true">🍅</span><b></b></button>
              <span class="tm"><i></i></span>
            </div>
            <span class="tag hide"></span>
            <span class="hn hide"></span>
            <span class="bub hide" dir="auto"></span>
          </div>`;
        const bet = document.createElement('div'); bet.className = 'bet hide';
        seatsEl.appendChild(bet); seatsEl.appendChild(el);
        const q = (s) => el.querySelector(s);
        const nd = { el, bet, sit: q('.sit'), move: q('.move'), pl: q('.pl'), cards: q('.cards'), box: q('.box'), av: q('.av'), avs: q('.avs'), nm: q('.nm'), st: q('.st'), tom: q('.tom'), tomN: q('.tom b'), tm: q('.tm i'), tag: q('.tag'), hn: q('.hn'), bub: q('.bub'), k: {} };
        nd.sit.onclick = () => view && view.onSit && view.onSit(i);
        nd.move.onclick = () => view && view.onSit && view.onSit(i);
        nd.box.addEventListener('click', (e) => {
          if (!view || e.target.closest('.tom')) return;
          if (aiming && i !== view.me) { e.stopPropagation(); setAim(false); view.onThrow && view.onThrow(i); return; }
          if (i === view.me && view.onAvatar && e.target.closest('.av')) return view.onAvatar();
          if (i !== view.me && view.onNote && view.seats[i]) view.onNote(i, nd.box);
        });
        nd.tom.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!view) return;
          if (i !== view.me) { if (aiming) { setAim(false); view.onThrow && view.onThrow(i); } return; }
          if (nd.dragged) { nd.dragged = false; return; }
          const t = view.seats[i] && view.seats[i].tom;
          if (!t && view.onBuy) return view.onBuy();
          setAim(!aiming);
        });
        dragThrow(nd, i);
        nodes.push(nd);
      }
    }

    /* tomatoes: tap your 🍅 and then a player, or drag it onto her */
    function setAim(on) {
      aiming = on && !!view && view.me >= 0 && !!view.onThrow;
      tbl.classList.toggle('aiming', aiming);
      aimbar.classList.toggle('hide', !aiming);
      if (aiming) {
        aimbar.innerHTML = `<span>${esc(T.aimHint)}</span>${view.onBuy ? `<button type="button" data-b>${esc(T.buyT)}</button>` : ''}<button type="button" data-x aria-label="${esc(T.cancel)}">✕</button>`;
        aimbar.querySelector('[data-x]').onclick = (e) => { e.stopPropagation(); setAim(false); };
        const b = aimbar.querySelector('[data-b]'); if (b) b.onclick = (e) => { e.stopPropagation(); setAim(false); view.onBuy(); };
      }
    }
    tbl.addEventListener('click', (e) => { if (aiming && !e.target.closest('.box') && !e.target.closest('.aimbar')) setAim(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && aiming) setAim(false); });
    function dragThrow(nd, i) {
      let start = null, ghost = null;
      nd.tom.addEventListener('pointerdown', (e) => {
        if (!view || i !== view.me || !view.onThrow || !(view.seats[i] && view.seats[i].tom)) return;
        start = { x: e.clientX, y: e.clientY, id: e.pointerId };
      });
      nd.tom.addEventListener('pointermove', (e) => {
        if (!start) return;
        if (!ghost && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) {
          try { nd.tom.setPointerCapture(start.id); } catch {}
          ghost = document.createElement('div'); ghost.className = 'flyt drag'; ghost.innerHTML = A.tomatoSVG(); document.body.appendChild(ghost);
          tbl.classList.add('aiming');
        }
        if (ghost) { ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; }
      });
      const end = (e, cancel) => {
        if (!start) return;
        start = null;
        if (!ghost) return;
        ghost.remove(); ghost = null; nd.dragged = true; setTimeout(() => (nd.dragged = false), 50);
        tbl.classList.toggle('aiming', aiming);
        if (cancel) return;
        const hit = document.elementsFromPoint(e.clientX, e.clientY).map((x) => x.closest && x.closest('.seat')).find((s) => s && s.dataset.seat != null);
        const to = hit ? +hit.dataset.seat : -1;
        if (to >= 0 && to !== view.me && view.seats[to]) view.onThrow(to);
      };
      nd.tom.addEventListener('pointerup', (e) => end(e, false));
      nd.tom.addEventListener('pointercancel', (e) => end(e, true));
    }

    /* ---------- flying chips ---------- */
    const at = (el, fx0 = 0.5, fy0 = 0.5) => { const b = tbl.getBoundingClientRect(), r = el.getBoundingClientRect(); return { x: r.left - b.left + r.width * fx0, y: r.top - b.top + r.height * fy0 }; };
    const pct = (x, y) => ({ x: (x / 100) * tbl.clientWidth, y: (y / 100) * tbl.clientHeight });
    function fly(from, to, n = 3, delay = 0, done) {
      if (reduced() || document.hidden) { done && done(); return; }
      for (let j = 0; j < n; j++) {
        const c = document.createElement('span'); c.className = 'flychip' + (j % 3 === 1 ? ' b' : j % 3 === 2 ? ' g' : '');
        fx.appendChild(c);
        const a = c.animate([{ transform: `translate(${from.x}px,${from.y}px) translate(-50%,-50%) scale(.9)`, opacity: 0 }, { opacity: 1, offset: 0.15 }, { transform: `translate(${to.x}px,${to.y}px) translate(-50%,-50%) scale(1)`, opacity: 1 }],
          { duration: 420, delay: delay + j * 45, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' });
        a.onfinish = () => { c.remove(); if (j === n - 1 && done) done(); };
      }
    }

    function update(v) {
      view = v; BB = v.bb || 0;
      tbl.classList.toggle('seated', v.me >= 0);
      if (v.n !== nodes.length) { build(v.n); shape = ''; }
      const key = `${v.n}|${v.me}|${tbl.clientWidth}x${tbl.clientHeight}`;
      if (key !== shape) {
        shape = key;
        const g = geometry(v.n, v.me);
        nodes.forEach((nd, i) => {
          const p = (nd.p = g[i]);
          nd.el.style.left = p.x + '%'; nd.el.style.top = p.y + '%';
          nd.bet.style.left = p.bx + '%'; nd.bet.style.top = p.by + '%';
          nd.el.classList.toggle('me', i === v.me); nd.el.classList.toggle('top', p.top);
          nd.el.classList.toggle('s-l', p.side === 'l'); nd.el.classList.toggle('s-r', p.side === 'r');
        });
      }
      const newHand = v.hand !== last.hand;
      if (newHand) { last.bets = []; last.wins = []; last.pot = 0; last.rabbit = ''; }

      /* the board: new cards come in one street at a time (a run-out deals the turn and the river after the flop) */
      const bkey = v.board.join(',');
      if (bkey !== last.board) {
        const had = newHand || !last.board ? 0 : last.board.split(',').length;
        const delays = [];
        let d = 0;
        for (let i = 0; i < 5; i++) {
          if (v.board[i] == null || i < had) { delays.push(-1); continue; }
          if (i === 3 && had < 3) d += 900; if (i === 4 && had < 4) d += 900;
          delays.push(i < 3 ? d + i * 90 : d);
        }
        board.innerHTML = [0, 1, 2, 3, 4].map((i) => card(v.board[i] ?? null, delays[i] >= 0 ? 'deal' : '')).join('');
        board.querySelectorAll('.card').forEach((el, i) => { if (delays[i] >= 0) el.style.animationDelay = delays[i] + 'ms'; });
        // a slap for each card as it lands: the flop together, the turn and the river on their own
        const flop = delays.slice(0, 3).filter((x) => x >= 0);
        if (flop.length) setTimeout(() => sfx.board(flop.length, 0.09), flop[0]);
        delays.forEach((x, i) => { if (i >= 3 && x >= 0) setTimeout(() => sfx.board(1), x); });
        last.board = bkey;
      }
      const b2 = (v.board2 || []).join(',');
      if (b2 !== last.board2) {
        // double board: a second board dealt with the first; run it twice: the second run, after the first
        board2.classList.toggle('hide', !b2 && !v.double);
        if (v.double) {
          const had = newHand || !last.board2 ? 0 : last.board2.split(',').length;
          board2.innerHTML = [0, 1, 2, 3, 4].map((i) => card((v.board2 || [])[i] ?? null, (v.board2 || [])[i] != null && i >= had ? 'deal' : '')).join('');
          board2.querySelectorAll('.card.deal').forEach((el, i) => (el.style.animationDelay = 150 + i * 90 + 'ms'));
        } else if (b2) { const same = v.board2.filter((c, i) => c === v.board[i]).length; board2.innerHTML = v.board2.map((c, i) => card(c, i >= same ? 'deal' : 'ghosted')).join(''); board2.querySelectorAll('.card.deal').forEach((el, i) => (el.style.animationDelay = 1900 + i * 500 + 'ms')); }
        last.board2 = b2;
      }
      tbl.classList.toggle('dbl', !!v.double || !!b2);
      // rabbit hunting: the cards that would have come, see-through, in the empty places
      const rk = v.rabbit && v.rabbit.length ? v.rabbit.join(',') : '';
      if (rk !== last.rabbit) {
        last.rabbit = rk;
        if (rk) board.querySelectorAll('.card').forEach((el, i) => { if (v.board[i] == null && v.rabbit[i] != null) { el.outerHTML = card(v.rabbit[i], 'rabbit deal'); } });
      }
      const win = new Set(); v.seats.forEach((s) => s && s.best && s.best.forEach((c) => win.add(c)));
      board.querySelectorAll('.card').forEach((el, i) => { const c = v.board[i]; el.classList.toggle('hl', win.size > 0 && c != null && win.has(c)); el.classList.toggle('dim', win.size > 0 && c != null && !win.has(c)); });

      /* the pot: what's in the middle, and the total with the bets still in front of the players */
      const bets = v.seats.reduce((t, x) => t + (x && x.bet ? x.bet : 0), 0);
      const tot = v.pot + bets;
      potline.classList.toggle('hide', !tot);
      if (tot) potline.innerHTML = `<span class="pot">${esc(T.pot)} <b>${num(v.pot || tot)}</b></span>${v.pot && bets ? `<span class="tot">${esc(T.total)} ${num(tot)}</span>` : ''}`;

      /* the middle: a message, or the host's START */
      const ck = (v.msg || '') + '|' + (v.centerBtn ? v.centerBtn.label : '');
      if (ck !== last.center) {
        last.center = ck;
        cmsg.classList.toggle('hide', !v.msg && !v.centerBtn);
        cmsg.innerHTML = (v.msg ? `<span dir="auto">${v.msg}</span>` : '') + (v.centerBtn ? `<button type="button" class="cbtn">${esc(v.centerBtn.label)}</button>` : '');
        const cb = cmsg.querySelector('.cbtn'); if (cb) cb.onclick = () => view.centerBtn && view.centerBtn.onClick();
      }

      /* dealer button */
      const bn = v.button != null && v.seats[v.button] ? nodes[v.button] : null;
      dbtn.classList.toggle('hide', !bn);
      if (bn) { dbtn.style.left = bn.p.dx + '%'; dbtn.style.top = bn.p.dy + '%'; }

      /* seats */
      let wonNow = false, swept = false;
      v.seats.forEach((s, i) => {
        const nd = nodes[i]; if (!nd) return;
        const me = i === v.me, k = nd.k;
        nd.el.classList.toggle('empty', !s);
        nd.pl.classList.toggle('hide', !s);
        nd.sit.classList.toggle('hide', !!s || !v.canSit || v.me >= 0);
        nd.move.classList.toggle('hide', !!s || !v.canSit || v.me < 0);
        if (!s) { nd.bet.classList.add('hide'); k.uid = null; k.cards = ''; return; }
        if (k.uid !== s.uid) { k.av = null; k.name = null; k.tom = null; }
        const lk = s.av || 0;
        if (k.av !== lk) { nd.avs.innerHTML = headSVG(lk); k.av = lk; }
        if (k.name !== s.name) { nd.nm.textContent = s.name; k.name = s.name; }
        const stx = s.away ? `<em>${esc(T.isAway)}</em>` : s.allIn && s.cards ? `<em class="ai">${esc(T.allin)}</em>` : num(s.chips);
        if (k.st !== stx) { nd.st.innerHTML = stx; k.st = stx; }
        nd.el.classList.toggle('turn', v.toAct === i);
        nd.el.classList.toggle('bank', v.toAct === i && !!v.bankOn);
        const nc = (v.notes && v.notes[s.uid]) || null;
        nd.box.style.setProperty('--nc', nc && nc.c ? nc.c : 'transparent');
        nd.el.classList.toggle('noted', !!(nc && (nc.c || nc.t)));
        nd.box.title = nc && nc.t ? `${s.name}: ${nc.t}` : s.name;
        nd.el.classList.toggle('folded', !!s.folded);
        nd.el.classList.toggle('out', !s.cards && !s.folded && v.stage && v.stage !== 'done');
        nd.el.classList.toggle('winner', !!s.win);
        nd.el.classList.toggle('away', !!s.away);
        // a tag above the box: the winner's take, or the hand shown at showdown
        const tag = s.win ? `+${fmt(s.win)}` : '';
        if (k.tag !== tag) { nd.tag.textContent = tag; nd.tag.classList.toggle('hide', !tag); k.tag = tag; }
        const hn = !me && s.hand && Array.isArray(s.cards) ? s.hand : '';
        if (k.hn !== hn) { nd.hn.textContent = hn; nd.hn.classList.toggle('hide', !hn); k.hn = hn; }

        // cards: replaced only when they change
        const cards = s.folded ? [] : s.cards === 'back' ? Array(v.holes || 2).fill('back') : Array.isArray(s.cards) ? s.cards : [];
        const ck2 = cards.join(',') + '|' + v.hand;
        if (ck2 !== k.cards) {
          const prev = k.cards || '';
          const dealt = !prev || prev.split('|')[1] !== String(v.hand) || prev.split('|')[0] === '';
          const flip = !dealt && prev.startsWith('back') && cards[0] !== 'back';
          nd.cards.innerHTML = cards.map((c, j) => card(c, dealt ? 'deal' : flip ? 'flip' : '')).join('');
          if (dealt) { nd.cards.querySelectorAll('.card').forEach((el, j) => (el.style.animationDelay = (j * 2 + nd.p.k) * 45 + 'ms')); if (me && cards.length) sfx.deal(Math.min(cards.length, 4), 0.09); }
          nd.cards.classList.toggle('four', cards.length > 2);
          nd.cards.classList.toggle('up', cards.length > 0 && cards[0] !== 'back');
          if (prev && cards.length === 0 && prev.split('|')[0] && prev.split('|')[1] === String(v.hand) && s.folded) sfx.fold();
          k.cards = ck2;
        }
        nd.cards.querySelectorAll('.card').forEach((el, j) => { const c = cards[j]; el.classList.toggle('hl', win.size > 0 && c !== 'back' && win.has(c)); el.classList.toggle('dim', win.size > 0 && c !== 'back' && !win.has(c) && !!s.win); });

        // the turn clock: restarted only for a new turn
        const tk = v.toAct === i && v.until ? v.until : 0;
        if (tk !== k.timer) {
          k.timer = tk; clearTimeout(k.hurry); clearInterval(k.ticks);
          nd.el.classList.remove('hurry');
          nd.tm.getAnimations().forEach((a) => a.cancel());
          if (tk) {
            const total = v.turnSec * 1000, left = Math.max(0, tk - Date.now()), from = Math.min(1, left / total);
            nd.tm.animate([{ transform: `scaleX(${from})` }, { transform: 'scaleX(0)' }], { duration: left, easing: 'linear', fill: 'forwards' });
            k.hurry = setTimeout(() => {
              nd.el.classList.add('hurry');
              if (me) { sfx.tick(); k.ticks = setInterval(() => { if (Date.now() < tk) sfx.tick(); else clearInterval(k.ticks); }, 1000); }
            }, Math.max(0, left - Math.min(8000, total * 0.3)));
          }
        }

        // bets: chips slide from the player to the bet spot
        const bet = s.bet || 0, was = newHand ? 0 : last.bets[i] || 0;
        nd.bet.classList.toggle('hide', !bet);
        if (bet) nd.bet.innerHTML = `<span class="stk ${bet >= (v.bb || 1) * 10 ? 'big' : ''}"></span>${num(bet)}`;
        if (bet > was && !newHand) { fly(at(nd.box), pct(nd.p.bx, nd.p.by), 2); if (s.allIn && !k.allin) sfx.allin(); else sfx.chip(2 + Math.round(Math.log10(Math.max(1, (bet - was) / Math.max(1, v.bb || 1))) * 2)); }
        else if (bet > was && newHand) sfx.chip(2);
        k.allin = !!s.allIn;
        if (!bet && was && !s.win && !newHand) { fly(pct(nd.p.bx, nd.p.by), at(potline.classList.contains('hide') ? board : potline), 2); swept = true; }

        // won: the pot comes to her
        const w = s.win || 0;
        if (w && !last.wins[i]) { fly(at(board), at(nd.box), 5, 250); wonNow = true; }
        last.wins[i] = w; last.bets[i] = bet;

        // the tomato badge
        const t = s.tom ?? 0;
        nd.tom.classList.toggle('hide', v.baskets === false);
        if (k.tom !== t) { nd.tomN.textContent = t === Infinity ? '∞' : t > 999 ? '999+' : String(t); k.tom = t; }
        nd.tom.classList.toggle('mine', me);
        nd.tom.title = me ? T.aim : `${t === Infinity ? '∞' : t} ${T.tomatoes}`;
        nd.tom.setAttribute('aria-label', me ? `${T.aim} (${t === Infinity ? '∞' : t})` : `${s.name}: ${t === Infinity ? '∞' : t} ${T.tomatoes}`);
        nd.av.classList.toggle('pick', me && !!v.onAvatar);
        k.uid = s.uid;
      });
      if (wonNow) setTimeout(() => sfx.win(), 250); else if (swept) setTimeout(() => sfx.sweep(), 120);
      last.hand = v.hand; last.pot = v.pot;
    }

    /* a tomato from one player to another's face */
    function throwAt(from, to, opts = {}) {
      const a = nodes[from], b = nodes[to];
      if (!b || b.pl.classList.contains('hide')) return;
      const p0 = a && !a.pl.classList.contains('hide') ? at(a.tom) : at(board);
      const p1 = at(b.av);
      const done = () => {
        const sp = document.createElement('div'); sp.className = 'splat2'; sp.innerHTML = A.splatSVG();
        sp.style.width = Math.max(56, b.av.offsetWidth * 1.9) + 'px'; sp.style.left = p1.x + 'px'; sp.style.top = p1.y + 'px';
        fx.appendChild(sp); setTimeout(() => sp.remove(), 3600);
        b.el.classList.remove('hit'); void b.el.offsetWidth; b.el.classList.add('hit');
        clearTimeout(b.hitT); b.hitT = setTimeout(() => b.el.classList.remove('hit'), 1700);
        if (!opts.quiet) sfx.splat();
        opts.onHit && opts.onHit();
      };
      if (reduced()) return done();
      const el = document.createElement('div'); el.className = 'flyt'; el.innerHTML = A.tomatoSVG();
      fx.appendChild(el);
      const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y), lift = Math.min(150, 40 + dist * 0.3), steps = 18, frames = [];
      for (let s = 0; s <= steps; s++) {
        const t = s / steps, x = p0.x + (p1.x - p0.x) * t, y = p0.y + (p1.y - p0.y) * t - Math.sin(Math.PI * t) * lift, sc = 0.9 + Math.sin(Math.PI * t) * 0.5;
        frames.push({ transform: `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${t * 720}deg) scale(${sc})`, offset: t });
      }
      if (!opts.quiet) sfx.whoosh();
      const anim = el.animate(frames, { duration: Math.min(850, 380 + dist * 0.8), easing: 'cubic-bezier(.35,.05,.55,1)', fill: 'forwards' });
      anim.onfinish = () => { el.remove(); done(); };
    }

    /* a chat line over the player's seat for a few seconds, like PokerNow */
    function bubble(i, text) {
      const nd = nodes[i]; if (!nd || nd.pl.classList.contains('hide')) return;
      nd.bub.textContent = text; nd.bub.classList.remove('hide'); sfx.pop(); nd.bub.style.animation = 'none'; void nd.bub.offsetWidth; nd.bub.style.animation = '';
      clearTimeout(nd.bubT); nd.bubT = setTimeout(() => nd.bub.classList.add('hide'), 5000);
    }

    return { update, throwAt, bubble, setAim, relayout: () => { shape = ''; if (view) update(view); } };
  }

  root.PokerTable = { createTable, card, label, fmt, num, prefs, setPref, sfx, FELTS, BACKS };
})(window);
