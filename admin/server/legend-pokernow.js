/* The legendary bot at a PokerNow table: reads the table from the page, asks Barusik's engine (legend) for a move
   and presses the buttons, after a human-like pause. The extension loads it (after poker-engine.js) on every PokerNow page.
   Same controls as on barusik.com/poker: a strip (at the top here, it can be dragged) with on/off, speed, bet size and raises before the flop,
   and the screen's edges blink red when the pot is big. Everything is remembered in this browser. Play chips only.
   © Bar Lvovski. */
(async () => {
  if (window.__legend) window.__legend.stop();
  if (!window.Poker || !window.Poker.legend) {   // pasted by hand instead of loaded by the extension
    const code = await (await fetch('https://barusik.com/poker/engine.js?v=' + Date.now())).text();
    (0, eval)(code);
  }
  const P = window.Poker;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const num = (t) => { const m = String(t || '').replace(/,/g, '').match(/\d+(\.\d+)?/); return m ? +m[0] : 0; };
  const vis = (el) => !!el && el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden';
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- settings, kept in this browser ---------- */
  const KEY = 'barusik-legend';
  const CFG = Object.assign({ on: true, speed: 0, size: 0, bluff: -0.625, pre: true, style: {} }, (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } })());
  // what the game logs taught about each opponent: after the flop, how often they folded when bet into
  const TAL = { fold: 16, seen: 66 };
  CFG.opp ||= {};
  for (const n of ['טל', 'טל האוטיסטית', 'יהב']) CFG.opp[n] ||= { ...TAL };   // יהב: Tal's bot under another name
  CFG.lastOpp ||= { ...TAL };
  CFG.notes ||= [];
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(CFG)); } catch {} };

  /* ---------- reading the table ---------- */
  const SU = { s: 's', h: 'h', d: 'd', c: 'c', '♠': 's', '♥': 'h', '♦': 'd', '♣': 'c' };
  function readCard(el) {
    const txt = (el.innerText || el.textContent || '').replace(/\s+/g, '');
    const cls = [el, ...el.querySelectorAll('*')].map((x) => (typeof x.className === 'string' ? x.className : (x.className && x.className.baseVal) || '')).join(' ');
    let r = (txt.match(/^(10|[2-9TJQKA])/i) || [])[1];
    let s = (txt.match(/[♠♥♦♣]/) || [])[0];
    if (!s) { const m = cls.match(/card-([shdc])(?:\b|-)/) || cls.match(/suit-([shdc])\b/) || txt.match(/^(?:10|[2-9TJQKA])([shdc])$/i); if (m) s = m[1].toLowerCase(); }
    if (!r) { const m = cls.match(/(?:card|value)-(10|[2-9tjqka])(?:\b|-)/i); if (m) r = m[1]; }
    if (!r || !s || !SU[s]) return null;
    r = r === '10' ? 'T' : r.toUpperCase();
    return P.parse(r + SU[s]);
  }
  function cardsIn(root) {
    if (!root) return [];
    let els = $$('.card-container', root); if (!els.length) els = $$('.card', root);
    const out = [];
    for (const e of els) { const c = readCard(e); if (c != null && !out.includes(c)) out.push(c); }
    return out;
  }
  function blinds() {
    const ty = (($('.blind-value .current-type') || {}).innerText || 'NLH').toUpperCase();
    const v = $$('.blind-value .chips-value').map((e) => num(e.innerText));
    const game = /PLO\s*6/.test(ty) ? 'plo6' : /PLO\s*5/.test(ty) ? 'plo5' : /PLO|OMAHA/.test(ty) ? 'plo' : 'nlh';
    return { game, sb: v[0] || 10, bb: v[1] || 20 };
  }
  function seats() {
    return $$('.table-player').map((el) => {
      const name = ($('.table-player-name', el) || {}).innerText || '';
      const stackEl = $('.table-player-stack', el);
      const betEl = $('.table-player-bet-value', el) || (el.parentElement && $(`.table-player-bet-value.${[...el.classList].find((c) => /^table-player-\d+$/.test(c))}`, el.parentElement));
      const cardsEl = $('.table-player-cards', el);
      const hasCards = !!cardsEl && $$('.card, .card-container', cardsEl).length > 0;
      const folded = /fold/i.test(el.className) || /fold/i.test((($('.table-player-status-icon', el) || {}).className || ''));
      return { el, name: name.trim(), stack: num(stackEl && stackEl.innerText), bet: betEl ? num(betEl.innerText) : 0, inHand: hasCards && !folded, folded, me: el.classList.contains('you-player') };
    }).filter((s) => s.name);
  }
  // PokerNow's own buttons, only inside its decision box: call / raise (opens the amount box) / check / fold
  function buttons() {
    const bs = $$('.game-decisions-ctn .action-buttons button').filter((b) => vis(b) && !b.disabled);
    const by = (c, re) => bs.find((b) => b.classList.contains(c) && (!re || re.test(b.innerText.trim())));
    return { fold: by('fold'), check: by('check'), call: by('call', /^(call\b|all\s*in\b)/i), raise: by('raise'), all: bs };
  }
  const extraTime = () => $$('.game-decisions-ctn .time-bank').some((b) => vis(b) && /activated/i.test(b.innerText));
  // the pot: "total" (when shown) already counts the bets in front of the players; the main number does not
  function potTotal(ss) {
    const add = $('.table-pot-size .add-on-container'), main = $('.table-pot-size .main-value');
    if (add && vis(add) && !add.classList.contains('hidden')) return num(add.innerText);
    return num(main && main.innerText) + ss.reduce((a, s) => a + s.bet, 0);
  }
  function myTurn(ss, bt) {
    const me = ss.find((s) => s.me);
    if (me && /decision-current|current-player|to-act/.test(me.el.className)) return true;
    if ($$('.table-player').some((e) => /decision-current/.test(e.className))) return false;   // someone else is on the clock
    return !!(bt.fold || bt.call) && !bt.all.some((b) => /any/i.test(b.innerText));
  }

  /* ---------- the engine's view of this spot ---------- */
  function snapshot() {
    const b = blinds(), ss = seats(), me = ss.find((s) => s.me);
    if (!me) return { why: 'not seated' };
    const hole = cardsIn($('.table-player-cards', me.el));
    const board = cardsIn($('.table-cards'));
    const players = ss.filter((s) => s.inHand || s.me);
    if (hole.length < 2) return { why: 'no cards yet' };
    if (![0, 3, 4, 5].includes(board.length)) return { why: 'board ' + board.length };
    const pot = potTotal(ss), bets = players.reduce((a, s) => a + s.bet, 0), rest = Math.max(0, pot - bets);
    const share = rest / Math.max(1, players.length);
    const t = Object.create(P.Table.prototype);
    const sorted = players.map((s) => s.bet).sort((x, y) => y - x);
    Object.assign(t, {
      game: b.game, sb: b.sb, bb: b.bb, minOpen: b.bb, board,
      stage: board.length === 0 ? 'preflop' : board.length === 3 ? 'flop' : board.length === 4 ? 'turn' : 'river',
      currentBet: sorted[0] || 0, minRaise: Math.max(b.bb, (sorted[0] || 0) - (sorted[1] || 0)), on: () => {},
      seats: players.map((s) => ({ id: s.name, name: s.name, chips: s.stack, bet: s.bet, total: s.bet + share, cards: s.me ? hole : [], folded: false, out: false, allIn: s.stack === 0, canRaise: true, acted: false })),
    });
    t.toAct = t.seats.findIndex((p) => p.cards.length);
    return { t, seat: t.toAct, hole, board, pot, b, names: players.filter((s) => !s.me).map((s) => s.name) };
  }

  /* ---------- the opponents' style, for the bot to lean toward (as on barusik.com) ---------- */
  // every bet or raise we see nudges "aggr" up, every call or check down; the size of their bets is kept too
  const seen = { street: -1, bets: {}, top: 0, acted: {} };
  function learn(name, agg, to, pot) {
    const sv = (CFG.style[name] ||= { aggr: 0.25, size: 0.65 });
    sv.aggr = sv.aggr * 0.96 + (agg ? 0.04 : 0);
    if (agg && to) { const frac = to / Math.max(1, pot - to); sv.size = sv.size * 0.92 + Math.max(0.1, Math.min(3, frac)) * 0.08; }
    save();
  }
  function watch() {
    const ss = seats(), board = cardsIn($('.table-cards')).length, pot = potTotal(ss);
    const live = ss.filter((s) => s.inHand && !s.me);
    if (board !== seen.street) {
      // the street changed: whoever stayed in without putting chips in checked it through
      if (seen.street >= 0) for (const s of live) if (!seen.acted[s.name] && !seen.bets[s.name]) learn(s.name, false);
      seen.street = board; seen.bets = {}; seen.top = 0; seen.acted = {};
    }
    for (const s of live) {
      const was = seen.bets[s.name] || 0;
      if (s.bet > was) {
        if (s.bet > Math.max(seen.top, board === 0 ? blinds().bb : 0)) learn(s.name, true, s.bet, pot);
        else if (was || board) learn(s.name, false);
        seen.acted[s.name] = true;
      }
      seen.bets[s.name] = s.bet; seen.top = Math.max(seen.top, s.bet);
    }
  }
  function tableStyle(names) {
    const xs = names.map((n) => CFG.style[n]).filter(Boolean);
    if (!xs.length) return { aggr: 1, sizeF: 1 };
    const avg = (k) => xs.reduce((a, x) => a + x[k], 0) / xs.length;
    return { aggr: avg('aggr') / 0.25, sizeF: avg('size') / 0.65 };
  }

  /* ---------- how long a move takes: the same as the bot on barusik.com ---------- */
  // 3% instantly, 6% a slow 10-18 seconds, otherwise by the spot; the speed slider scales it (an instant move stays instant)
  function thinkMs(t, k, slow) {
    const cap = Math.max(1500, (CFG.turnMs || 15000) - 2500), r0 = Math.random();
    if (r0 < 0.03) return 150 + Math.floor(Math.random() * 350);
    if (r0 < 0.09) return Math.round(Math.min(cap, (10000 + Math.random() * 8000) * slow));
    const o = t.options(k), p = t.seats[k], pot = Math.max(1, t.pot()), street = t.board.length, bb = Math.max(1, t.bb);
    const allIn = o.toCall > 0 && o.toCall >= p.chips, big = o.toCall / pot;
    let lo = 2200, hi = 12000;
    if (street === 0 && o.toCall <= bb) { lo = 900; hi = 6000; }
    else if (street === 0) { lo = 1800; hi = 10000; }
    else if (o.check) { lo = 1300; hi = 8000; }
    else if (allIn) { lo = 5000; hi = 26000; }
    else if (big >= 0.6) { lo = 3500; hi = 19000; }
    if (street === 5) { lo *= 1.15; hi *= 1.25; }
    let ms = lo + (hi - lo) * Math.pow(Math.random(), 1.7);
    const r = Math.random();
    if (r < 0.07) ms += 3000 + Math.random() * 7000;
    else if (r < 0.17 && o.check) ms = 500 + Math.random() * 800;
    return Math.round(Math.max(400, Math.min(ms * slow, cap)));
  }

  /* ---------- pressing the buttons ---------- */
  const setVal = (input, v) => { const d = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value'); d.set.call(input, String(v)); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); };
  async function play(move, o) {
    const bt = buttons();
    if (move.type === 'raise' && bt.raise) {
      // the amount box: only inside PokerNow's decision box, never anywhere else on the page
      bt.raise.click();
      let input = null;
      for (let i = 0; i < 12 && !input; i++) { await sleep(120); input = $$('.game-decisions-ctn input').find((x) => vis(x) && /number|text|tel/.test(x.type)); }
      if (input) {
        setVal(input, move.to);
        const rg = $$('.game-decisions-ctn input[type=range]').find(vis); if (rg) setVal(rg, move.to);
        await sleep(250);
        if (num(input.value) !== move.to) { setVal(input, move.to); await sleep(200); }
        const box = input.closest('form') || $('.game-decisions-ctn');
        const go = $$('button, input[type=submit]', box).filter(vis).find((x) => /^(bet|raise)$/i.test((x.innerText || x.value || '').trim()) || (x.tagName === 'INPUT' && x.type === 'submit'));
        if (go) {
          go.click(); await sleep(900);
          const me = seats().find((x) => x.me);
          return 'raise ' + move.to + (me && me.bet && me.bet !== move.to ? ` (on the table: ${me.bet})` : '');
        }
      }
      const back = $$('.game-decisions-ctn button').filter(vis).find((x) => /^(back|cancel|close|x|×)$/i.test(x.innerText.trim()));
      if (back) { back.click(); await sleep(250); }
      move = { type: o.check ? 'check' : 'call' };
    }
    const b2 = buttons();
    if (move.type === 'fold' && b2.check) { b2.check.click(); return 'check'; }
    if (move.type === 'fold' && b2.fold) { b2.fold.click(); return 'fold'; }
    if (move.type === 'check' && b2.check) { b2.check.click(); return 'check'; }
    if ((move.type === 'call' || move.type === 'check') && b2.call) { b2.call.click(); return 'call'; }
    if (b2.check) { b2.check.click(); return 'check'; }
    return 'no button';
  }
  /* ---------- the game's log: how the opponents play, and chips that moved without a hand being played ---------- */
  const gameId = (location.pathname.match(/\/games\/([\w-]+)/) || [])[1];
  const LOG = { seen: new Set(), lines: [], next: 0, told: new Set(), prior: JSON.parse(JSON.stringify(CFG.opp)) };
  const nameIn = (m) => { const r = m.match(/"(.+?) @ [\w-]+"/); return r ? r[1] : null; };
  // every 8 seconds, and at our turn a fresh copy (asked after the turn began, never sooner than 1.5 s after the last one):
  // PokerNow answers 429 when asked faster, and then the bot waits 45 s and plays without the reading
  async function pullLog(since = 0) {
    if (LOG.pending) await LOG.pending;
    if (!gameId || S.dead || Date.now() < (LOG.block || 0)) return;
    if (since) { if ((LOG.last || 0) >= since) return; const w = 1500 - (Date.now() - (LOG.last || 0)); if (w > 0) await sleep(w); }
    else if (Date.now() < LOG.next) return;
    if (LOG.pending) return LOG.pending;
    LOG.last = Date.now(); LOG.next = Date.now() + 8000;
    LOG.pending = fetchLog().finally(() => { LOG.pending = null; });
    return LOG.pending;
  }
  async function fetchLog() {
    try {
      const r = await fetch(`/games/${gameId}/log`, { credentials: 'include' });
      if (r.status === 429) { LOG.block = Date.now() + 45000; return; }
      if (!r.ok) return;
      const fresh = ((await r.json()).logs || []).slice().reverse().filter((x) => { const k = x.created_at + x.msg; if (LOG.seen.has(k)) return false; LOG.seen.add(k); return true; });
      if (!fresh.length) return;
      LOG.lines.push(...fresh);
      if (LOG.lines.length > 6000) LOG.lines.splice(0, LOG.lines.length - 6000);
      digest(fresh);
      try { calibrate(); } catch (_e) { /* a line it could not read */ }
    } catch (_e) { /* offline for a moment */ }
  }
  function digest(fresh) {
    // an admin touching stacks, said in so many words
    for (const x of fresh) {
      if (!/admin/i.test(x.msg) || !/stack|chips/i.test(x.msg) || /approved the player|participation/i.test(x.msg)) continue;
      const names = [...x.msg.matchAll(/"(.+?) @ [\w-]+"/g)].map((r) => r[1]), v = x.msg.match(/from (\d[\d,]*) to (\d[\d,]*)/);
      note(v && names.length >= 2 ? `⚠️ ${names[0]} (המנהל) שינה את הצ'יפים של ${names[1]}: ${v[1]} → ${v[2]}` : '⚠️ ' + x.msg.replace(/ @ [\w-]+/g, ''));
    }
    // hands, money and habits, rebuilt from the lines kept
    const hands = []; let h = null, gap = [];
    for (const { msg: m } of LOG.lines) {
      if (/^-- starting hand #\d+/.test(m)) { h = { n: +m.match(/#(\d+)/)[1], gap, stacks: {}, lvl: {}, put: {}, won: {}, st: 0, acts: [] }; hands.push(h); gap = []; continue; }
      if (!h) { gap.push(m); continue; }
      if (/^-- ending hand/.test(m)) { for (const [k, v] of Object.entries(h.lvl)) h.put[k] = (h.put[k] || 0) + v; h.done = true; h = null; continue; }
      if (/^Player stacks:/.test(m)) { for (const x of m.split('|')) { const n = nameIn(x), v = x.match(/\((\d[\d,]*)\)\s*$/); if (n && v) h.stacks[n] = +v[1].replace(/,/g, ''); } continue; }
      if (/^(Flop|Turn|River)/.test(m)) { if (!/second run/i.test(m)) { for (const [k, v] of Object.entries(h.lvl)) h.put[k] = (h.put[k] || 0) + v; h.lvl = {}; h.st++; } continue; }
      const who = nameIn(m); if (!who) continue;
      let r;
      if ((r = m.match(/(?:posts an? (?:missing |missed )?(?:small blind|big blind|straddle) of|raises to|bets|calls) (\d[\d,]*)/))) { const v = +r[1].replace(/,/g, ''); h.lvl[who] = Math.max(h.lvl[who] || 0, v); }
      else if ((r = m.match(/posts an ante of (\d[\d,]*)/))) h.put[who] = (h.put[who] || 0) + +r[1].replace(/,/g, '');
      else if ((r = m.match(/collected (\d[\d,]*) from pot/))) h.won[who] = (h.won[who] || 0) + +r[1].replace(/,/g, '');
      else if ((r = m.match(/^Uncalled bet of (\d[\d,]*) returned to/))) h.won[who] = (h.won[who] || 0) + +r[1].replace(/,/g, '');
      if (h.st > 0) h.acts.push({ who, type: /" bets /.test(m) ? 'bet' : /" raises /.test(m) ? 'raise' : /" calls /.test(m) ? 'call' : /" folds/.test(m) ? 'fold' : /" checks/.test(m) ? 'check' : '', st: h.st });
    }
    // chips that moved between two hands without being won or lost
    for (let i = 1; i < hands.length; i++) {
      const a = hands[i - 1], b = hands[i]; if (!a.done) continue;
      for (const k of Object.keys(b.stacks)) {
        if (!(k in a.stacks)) continue;
        const want = a.stacks[k] - (a.put[k] || 0) + (a.won[k] || 0), got = b.stacks[k], key = b.n + k;
        if (Math.abs(got - want) < 1 || LOG.told.has(key)) continue;
        LOG.told.add(key);
        const why = b.gap.map((m) => m.replace(/ @ [\w-]+/g, '')).filter((m) => /admin|stack|quits|joined|approved/i.test(m)).slice(0, 2).join(' · ');
        if (/admin/i.test(why) && /stack|chips/i.test(why) && !/approved|participation/i.test(why)) continue;   // already told, in the admin's own words
        const fmt = (v) => Math.round(v).toLocaleString('en-US');
        note(`${/approved|joined/i.test(why) ? 'ℹ️' : '⚠️'} יד #${b.n}: הצ'יפים של ${k} השתנו בלי יד, ${fmt(want)} → ${fmt(got)} (${got > want ? '+' : ''}${fmt(got - want)})${why ? ' — ' + why : ''}`);
      }
    }
    // habits: each time an opponent faced a bet after the flop, did he fold?
    const me = (seats().find((x) => x.me) || {}).name, sess = {};
    for (const x of hands) {
      let facing = { 1: false, 2: false, 3: false };
      for (const a of x.acts) {
        if (a.type === 'bet' || a.type === 'raise') { facing[a.st] = true; continue; }
        if (!facing[a.st] || a.who === me || !['fold', 'call'].includes(a.type)) continue;
        const o = (sess[a.who] ||= { fold: 0, seen: 0 }); o.seen++; if (a.type === 'fold') o.fold++;
      }
    }
    for (const [n, o] of Object.entries(sess)) {
      const p = LOG.prior[n] || { fold: 0, seen: 0 };
      CFG.opp[n] = { fold: p.fold + o.fold, seen: p.seen + o.seen };
    }
    const others = seats().filter((x) => !x.me).map((x) => x.name);
    if (others.length === 1 && CFG.opp[others[0]]) CFG.lastOpp = CFG.opp[others[0]];
    save();
  }
  // this hand, from the log: what the one opponent did on each street after the flop, turned into limits on how his hand
  // ranks on that street's board (tested against a bot that plays like Yahav: about +200 big blinds per 100 hands)
  const READ = { S: 0.55, B: 0.75, R: 0.85, C: 0.3, K: 0.8 };
  // the reading tunes itself on each opponent's showdowns: for every street of a hand he showed, where his hand ranked
  // on that board after a small bet, a big bet, a raise, a call or a check. Thresholds = the low end (the high end for a
  // check) of what he really held, blended with the defaults until there are enough hands
  CFG.read ||= {};
  CFG.pat ||= {};     // multi-street similar-hand memory: CFG.pat[who]['k>k>b200'] = [rel, ...]
  CFG.time ||= {};    // timing-tell psychology: CFG.time[who]['k'|'b200'|'bPot'|'c'|'r'] = [[dtMs, rel], ...]
  CFG.calDone ||= [];
  if (!Object.keys(CFG.pat).length && CFG.calDone.length) CFG.calDone = [];
  const CAL = { done: new Set(CFG.calDone) };   // hands already counted, kept across reloads
  const suitOf = { '♠': 's', '♥': 'h', '♦': 'd', '♣': 'c' };
  const logCards = (s2) => s2.split(',').map((c) => c.trim().replace(/\.$/, '')).filter(Boolean).map((c) => P.parse(c.slice(0, -1).replace('10', 'T') + suitOf[c.slice(-1)]));
  const actTag = (a) => (a.type === 'raise' ? 'r' : a.type === 'bet' ? (a.frac <= 0.15 ? 'b200' : a.frac <= 0.35 ? 'bS' : 'bPot') : a.type === 'call' ? 'c' : a.type === 'check' ? 'k' : null);
  function rankOn(board, dead, hc) {
    const out = new Set([...board, ...dead]), deck = []; for (let c = 0; c < 52; c++) if (!out.has(c)) deck.push(c);
    const xs = [];
    for (let k = 0; k < 200; k++) { for (let i = 0; i < hc; i++) { const j = i + Math.floor(Math.random() * (deck.length - i)); const x = deck[i]; deck[i] = deck[j]; deck[j] = x; } xs.push(P.value(deck.slice(0, hc), board)); }
    xs.sort((a, b) => a - b);
    return (v) => { let lo = 0, hi = xs.length; while (lo < hi) { const m = (lo + hi) >> 1; if (xs[m] < v) lo = m + 1; else hi = m; } let up = lo; while (up < xs.length && xs[up] === v) up++; return (lo + up) / 2 / xs.length; };
  }
  function calibrate() {
    const L = LOG.lines; let h = null;
    const num = (v) => +String(v).replace(/,/g, ''), sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
    for (const { msg: m, created_at: at } of L) {
      const ts = Date.parse(at) || 0;
      if (/^-- starting hand #/.test(m)) { h = { key: at + m.slice(0, 30), board: [], n: 0, lvl: {}, before: 0, acts: [], shows: {}, mine: null, lastTs: ts }; continue; }
      if (!h) continue;
      if (/^-- ending hand/.test(m)) {
        if (!CAL.done.has(h.key) && h.board.length === 5 && Object.keys(h.shows).length) {
          CAL.done.add(h.key); CFG.calDone.push(h.key); if (CFG.calDone.length > 400) CFG.calDone.splice(0, CFG.calDone.length - 400);
          for (const [who, cards] of Object.entries(h.shows)) {
            const R = (CFG.read[who] ||= { S: [], B: [], R: [], C: [], K: [] });
            const PT = (CFG.pat[who] ||= {});
            const TM = (CFG.time[who] ||= {});
            const seq = [];
            for (const k of [3, 4, 5]) {
              const a = h.acts.filter((x) => x.who === who && x.n === k); if (!a.length) continue;
              const bet = a.find((x) => x.type === 'bet');
              const type = a.some((x) => x.type === 'raise') ? 'R' : bet ? (bet.frac <= 0.35 ? 'S' : 'B') : a.some((x) => x.type === 'call') ? 'C' : a.some((x) => x.type === 'check') ? 'K' : null;
              if (!type) continue;
              const b = h.board.slice(0, k), rel = +rankOn(b, cards.concat(h.mine || []), cards.length)(P.value(cards, b)).toFixed(3);
              R[type].push(rel); if (R[type].length > 40) R[type].shift();
              // record multi-street pattern memory & timing tells
              for (const x of a) {
                const tg = actTag(x); if (!tg) continue;
                seq.push(tg);
                if (x.dt > 0 && x.dt < 30000) { const arr = (TM[tg] ||= []); arr.push([x.dt, rel]); if (arr.length > 45) arr.shift(); }
              }
              if (seq.length >= 2) { const key = seq.slice(-3).join('>'); const pa = (PT[key] ||= []); pa.push(rel); if (pa.length > 30) pa.shift(); }
            }
          }
          save();
        }
        h = null; continue;
      }
      if (/^Your hand is /.test(m)) { h.mine = logCards(m.replace('Your hand is ', '')); continue; }
      if (/^(Flop|Turn|River)/.test(m)) {
        if (/second run/i.test(m)) continue;
        h.before += sum(h.lvl); h.lvl = {}; h.n = /^Flop/.test(m) ? 3 : /^Turn/.test(m) ? 4 : 5; h.lastTs = ts;
        const all = (m.match(/\[([^\]]+)\]/g) || []).map((x) => x.slice(1, -1)).join(',');
        h.board = /^Flop/.test(m) ? logCards(all) : h.board.concat(logCards(all));
        continue;
      }
      const who = nameIn(m); if (!who) continue;
      let r, type = null, amt = 0;
      if ((r = m.match(/" shows a (.+)$/))) { h.shows[who] = logCards(r[1]); continue; }
      const dt = ts && h.lastTs ? Math.max(0, ts - h.lastTs) : 0; h.lastTs = ts;
      if ((r = m.match(/posts an? .*? of (\d[\d,]*)/))) { h.lvl[who] = Math.max(h.lvl[who] || 0, num(r[1])); continue; }
      if ((r = m.match(/" bets (\d[\d,]*)/))) { type = 'bet'; amt = num(r[1]); }
      else if ((r = m.match(/" raises to (\d[\d,]*)/))) { type = 'raise'; amt = num(r[1]); }
      else if ((r = m.match(/" calls (\d[\d,]*)/))) { type = 'call'; amt = num(r[1]); }
      else if (/" checks/.test(m)) type = 'check';
      else continue;
      if (h.n >= 3) h.acts.push({ who, n: h.n, type, frac: type === 'bet' ? amt / Math.max(1, h.before + sum(h.lvl)) : 0, dt });
      if (amt) h.lvl[who] = Math.max(h.lvl[who] || 0, amt);
    }
  }
  function readFor(opp) {
    const R = CFG.read[opp], out = { ...READ };
    if (!R) return out;
    const q = (xs, p) => { const a = xs.slice().sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.max(0, Math.floor(p * a.length)))]; };
    for (const k of ['S', 'B', 'R', 'C']) if (R[k] && R[k].length) { const n = R[k].length; out[k] = Math.max(0.05, Math.min(0.97, (n * q(R[k], 0.15) + 4 * READ[k]) / (n + 4))); }
    if (R.K && R.K.length) { const n = R.K.length; out.K = Math.max(0.3, Math.min(1, (n * q(R.K, 0.85) + 4 * READ.K) / (n + 4))); }
    // showdowns only show the hands that were called down, never the bluffs that took the pot: don't let them make every bet look strong
    out.S = Math.min(out.S, READ.S); out.B = Math.min(out.B, 0.8); out.C = Math.min(out.C, 0.45);
    return out;
  }
  function handLine(opp, hole) {
    const RD = readFor(opp);
    const L = LOG.lines; let i = L.length - 1;
    while (i >= 0 && !/^-- starting hand #/.test(L[i].msg)) i--;
    if (i < 0) return null;
    const mine = L.slice(i).find((x) => /^Your hand is /.test(x.msg));
    const want = hole.map(P.cardText).sort().join(), got = mine ? mine.msg.replace('Your hand is ', '').split(',').map((c) => { c = c.trim(); return P.cardText(P.parse(c.slice(0, -1).replace('10', 'T') + { '♠': 's', '♥': 'h', '♦': 'd', '♣': 'c' }[c.slice(-1)])); }).sort().join() : '';
    if (want !== got) return null;   // the log has not caught up with this hand yet
    const num = (v) => +String(v).replace(/,/g, ''), sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
    const acts = []; let n = 0, lvl = {}, before = 0, lastTs = Date.parse(L[i].created_at) || 0;
    for (const { msg: m, created_at: at } of L.slice(i)) {
      const ts = Date.parse(at) || 0;
      if (/^(Flop|Turn|River)/.test(m)) { if (/second run/i.test(m)) continue; before += sum(lvl); lvl = {}; n = /^Flop/.test(m) ? 3 : /^Turn/.test(m) ? 4 : 5; lastTs = ts; continue; }
      const who = nameIn(m); if (!who) continue;
      const dt = ts && lastTs ? Math.max(0, ts - lastTs) : 0; lastTs = ts;
      let r, type = null, amt = 0;
      if ((r = m.match(/posts an? .*? of (\d[\d,]*)/))) { lvl[who] = Math.max(lvl[who] || 0, num(r[1])); continue; }
      if ((r = m.match(/" bets (\d[\d,]*)/))) { type = 'bet'; amt = num(r[1]); }
      else if ((r = m.match(/" raises to (\d[\d,]*)/))) { type = 'raise'; amt = num(r[1]); }
      else if ((r = m.match(/" calls (\d[\d,]*)/))) { type = 'call'; amt = num(r[1]); }
      else if (/" checks/.test(m)) type = 'check';
      else continue;
      const potNow = before + sum(lvl), toCall = type === 'call' ? Math.max(0, amt - (lvl[who] || 0)) : 0;
      if (n >= 3 && who === opp) acts.push({ n, type, frac: type === 'bet' ? amt / Math.max(1, potNow) : type === 'call' ? toCall / Math.max(1, potNow - toCall) : 0, dt });
      if (amt) lvl[who] = Math.max(lvl[who] || 0, amt);
    }
    const line = [];
    for (const k of [3, 4, 5]) {
      const a = acts.filter((x) => x.n === k); if (!a.length) continue;
      const c = { n: k }, bet = a.find((x) => x.type === 'bet'), call = a.find((x) => x.type === 'call');
      if (a.some((x) => x.type === 'raise')) c.min = RD.R;
      else if (bet) c.min = bet.frac <= 0.15 ? RD.C : bet.frac <= 0.35 ? RD.S : RD.B;   // a 1-big-blind poke into a big pot proves nothing
      else if (call) c.min = call.frac >= 0.7 ? Math.max(RD.C, 0.52) : RD.C;             // calling a pot-sized bet means a real hand, not any bottom pair
      if (a.some((x) => x.type === 'check') && !a.some((x) => x.type === 'bet' || x.type === 'raise')) c.max = RD.K;
      if (c.min != null || c.max != null) line.push(c);
    }
    // Smart psychology: apply learned multi-street pattern memory & timing tells to the latest street
    if (line.length && acts.length) {
      const lastC = line[line.length - 1], seq = acts.map(actTag).filter(Boolean);
      const patKey = seq.length >= 2 ? seq.slice(-3).join('>') : null;
      const hist = patKey && CFG.pat[opp] && CFG.pat[opp][patKey];
      if (hist && hist.length >= 3) {
        const s = hist.slice().sort((u, v) => u - v);
        const p15 = s[Math.floor(0.15 * s.length)], p85 = s[Math.min(s.length - 1, Math.floor(0.85 * s.length))];
        const w = Math.min(0.7, hist.length / (hist.length + 4));
        if (lastC.min != null) lastC.min = Math.max(0.05, Math.min(0.95, lastC.min * (1 - w) + p15 * w));
        lastC.max = lastC.max != null ? Math.max(0.25, Math.min(1, lastC.max * (1 - w) + p85 * w)) : (p85 < 0.75 ? p85 + 0.08 : undefined);
      }
      const lastAct = acts[acts.length - 1], tg = actTag(lastAct);
      const tArr = tg && CFG.time[opp] && CFG.time[opp][tg];
      if (tArr && tArr.length >= 6 && lastAct.dt > 0 && lastAct.dt < 30000) {
        const dts = tArr.map((x) => x[0]).sort((u, v) => u - v), med = dts[Math.floor(dts.length / 2)];
        const fast = tArr.filter((x) => x[0] < med), slow = tArr.filter((x) => x[0] >= med);
        if (fast.length >= 2 && slow.length >= 2) {
          const fAvg = fast.reduce((u, x) => u + x[1], 0) / fast.length, sAvg = slow.reduce((u, x) => u + x[1], 0) / slow.length;
          const shift = Math.max(-0.14, Math.min(0.14, (lastAct.dt < med ? fAvg - sAvg : sAvg - fAvg) * 0.6));
          if (lastC.min != null) lastC.min = Math.max(0.05, Math.min(0.95, lastC.min + shift));
          if (lastC.max != null) lastC.max = Math.max(0.25, Math.min(1, lastC.max + shift));
        }
      }
      if (lastC.min != null && lastC.max != null && lastC.min > lastC.max - 0.1) lastC.min = Math.max(0.05, lastC.max - 0.1);
    }
    return line.length ? line : null;
  }
  // at the end of a hand PokerNow offers to show the cards; with the switch on, the bot always does (once a hand)
  function showCards(ss) {
    const me = ss.find((x) => x.me); if (!me) return;
    const key = cardsIn($('.table-player-cards', me.el)).join(','); if (!key || S.shown === key) return;
    // PokerNow: "SHOW ALL CARDS" (.show-hand-buttons .all-cards-button), beside one button per card
    const b = $$('.show-hand-buttons .all-cards-button').find(vis) || $$('button, input[type=button]').filter((x) => vis(x) && !bar.contains(x)).find((x) => /^show( all)?( (my )?(cards|hand))?$/i.test((x.innerText || x.value || '').trim().split('\n')[0]));
    if (b) { b.click(); S.shown = key; moved('show cards'); }
  }
  // how often the opponents fold when bet into after the flop (undefined until there are enough hands)
  function foldRate(names) {
    let f = 0, n = 0;
    for (const x of names) { const o = CFG.opp[x]; if (o) { f += o.fold; n += o.seen; } }
    return n >= 10 ? f / n : undefined;
  }
  // bluffing into someone who never folds only pays him; the bot bluffs as often as the opponents give it a reason to
  function oppBluff(names) {
    let f = 0, n = 0;
    for (const x of names) { const o = CFG.opp[x]; if (o) { f += o.fold; n += o.seen; } }
    if (n < 10 && CFG.lastOpp && names.length === 1) { f += CFG.lastOpp.fold; n += CFG.lastOpp.seen; }
    if (n < 10) return 1;
    return Math.max(0.15, Math.min(1.3, Math.pow(Math.max(0, f / n - 0.1) / 0.35, 1.5)));
  }

  /* ---------- the strip at the bottom and the red edges ---------- */
  const css = document.createElement('style');
  css.textContent = `
#blg{position:fixed;left:50%;top:8px;transform:translateX(-50%);touch-action:none;z-index:99998;display:grid;grid-template-columns:auto auto auto minmax(0,1fr) auto;align-items:center;gap:4px 8px;width:min(92vw,400px);padding:7px 12px;border-radius:18px;background:rgba(18,27,30,.92);border:1px solid rgba(241,198,107,.45);color:#f3efe4;font:13px/1.3 system-ui,"Segoe UI",Arial,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.45);direction:rtl}
#blg.hide{display:none}
#blg .bsw{flex:none;width:44px;height:26px;border:0;padding:0;border-radius:999px;background:rgba(255,255,255,.14);position:relative;transition:background .2s;cursor:pointer}
#blg .bsw i{position:absolute;top:3px;right:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.4)}
#blg .bsw.on{background:#3ddc97}#blg .bsw.on i{transform:translateX(-18px)}
#blg .bsw.sm{width:34px;height:20px}#blg .bsw.sm i{width:14px;height:14px}#blg .bsw.sm.on i{transform:translateX(-14px)}
#blg .bl{font-size:16px;white-space:nowrap;cursor:grab}#blg.drag,#blg.drag .bl{cursor:grabbing}#blg .bk2{font-size:11.5px;color:#a9b4ad;white-space:nowrap}
#blg .bsp{display:flex;align-items:center;gap:6px;min-width:0}#blg .bsp small{font-size:11px;color:#a9b4ad;white-space:nowrap}
#blg input[type=range]{flex:1;min-width:60px;accent-color:#f1c66b;height:24px;margin:0}
#blg .bv{font-size:12px;white-space:nowrap;color:#f1c66b;min-width:70px;text-align:center;font-weight:600}
#blg .bpre{grid-column:span 3;display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;font-size:12px;cursor:pointer}
#blg.smart .bopt{opacity:.35;pointer-events:none}
#blg .bsw.sm.smart.on{background:#f1c66b}
#blg .bnotes{grid-column:1/-1;display:flex;flex-direction:column;gap:4px;margin-top:2px}#blg .bnotes:empty{display:none}
#blg .bnote{display:flex;gap:6px;align-items:flex-start;background:rgba(255,120,60,.16);border:1px solid rgba(255,140,80,.5);border-radius:10px;padding:5px 8px;font-size:12px;line-height:1.35}
#blg .bnote small{color:#a9b4ad;white-space:nowrap}#blg .bnote span{flex:1}#blg .bnote button{border:0;background:none;color:#f3efe4;cursor:pointer;font-size:14px;padding:0 2px}
body.blg-alarm::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:99999;box-shadow:inset 0 0 0 5px rgba(255,45,45,.95),inset 0 0 46px 6px rgba(255,0,0,.55);animation:blgalarm .8s ease-in-out infinite alternate}
@keyframes blgalarm{from{opacity:.15}to{opacity:1}}
@media (prefers-reduced-motion:reduce){body.blg-alarm::after{animation:none;opacity:.8}}`;
  document.head.appendChild(css);
  const X = 3;   // the sliders go from 3× one way to 3× the other
  const fx = (v) => (Math.round(Math.pow(X, Math.abs(v)) * 10) / 10).toString();
  const speedTxt = (v) => (Math.abs(v) < 0.01 ? 'רגיל' : `${fx(v)}× ${v > 0 ? 'מהיר' : 'איטי'} יותר`);
  const sizeTxt = (v) => (Math.abs(v) < 0.01 ? 'רגיל' : `${fx(v)}× ${v > 0 ? 'גדול' : 'קטן'} יותר`);
  const bluffTxt = (v) => (Math.abs(v) < 0.01 ? 'רגיל' : `${fx(v)}× ${v > 0 ? 'יותר' : 'פחות'}`);
  const bar = document.createElement('div');
  bar.id = 'blg'; bar.className = 'hide';
  const row = (k, lo, hi, txt, lab, cls = '') => `<span class="bk2 ${cls}">${lab}</span><span class="bsp ${cls}" dir="ltr"><small>${lo}</small><input type="range" data-k="${k}" min="-1" max="1" step="0.125" value="${CFG[k] || 0}" aria-label="${lab}"><small>${hi}</small></span><b class="bv ${cls}" data-v="${k}">${txt(CFG[k] || 0)}</b>`;
  bar.innerHTML = `<button type="button" class="bsw" role="switch" data-on aria-label="הבוט האגדי"><i></i></button>
    <span class="bl" title="הבוט האגדי · אפשר לגרור">🤖</span>${row('speed', 'איטי', 'מהיר', speedTxt, 'מהירות')}
    <span></span><span></span><div class="bpre"><button type="button" class="bsw sm smart" role="switch" data-smart aria-label="מצב חכם"><i></i></button><b style="color:#f1c66b">🧠 מצב חכם</b><button type="button" class="bsw sm" role="switch" data-pre aria-label="רייזים לפני הפלופ" style="margin-inline-start:6px"><i></i></button>לפני פלופ<button type="button" class="bsw sm" role="switch" data-show aria-label="להראות קלפים בסוף יד" style="margin-inline-start:6px"><i></i></button>קלפים</div>
    <span></span><span></span>${row('size', 'קטן', 'גדול', sizeTxt, 'גודל הימור', 'bopt')}
    <span></span><span></span>${row('bluff', 'פחות', 'יותר', bluffTxt, 'בלופים', 'bopt')}
    <div class="bnotes" aria-live="polite"></div>`;
  document.body.appendChild(bar);
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function drawNotes() {
    const box = $('.bnotes', bar);
    box.innerHTML = CFG.notes.slice(-5).map((x, i, all) => `<div class="bnote"><span dir="auto">${esc(x.t)}</span><small>${esc(x.at)}</small><button type="button" data-x="${CFG.notes.length - all.length + i}" aria-label="סגור">×</button></div>`).join('');
    $$('[data-x]', box).forEach((b) => { b.onclick = () => { CFG.notes.splice(+b.dataset.x, 1); save(); drawNotes(); }; });
  }
  function note(t) {
    if (CFG.notes.some((x) => x.t === t)) return;
    CFG.notes.push({ t, at: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) });
    CFG.notes = CFG.notes.slice(-10); save(); drawNotes();
  }
  drawNotes();
  const paint = () => {
    const a = $('[data-on]', bar), b = $('[data-pre]', bar), c = $('[data-show]', bar), sm = $('[data-smart]', bar);
    c.classList.toggle('on', !!CFG.show); c.setAttribute('aria-checked', String(!!CFG.show));
    a.classList.toggle('on', CFG.on); a.setAttribute('aria-checked', String(CFG.on));
    b.classList.toggle('on', CFG.pre !== false); b.setAttribute('aria-checked', String(CFG.pre !== false));
    sm.classList.toggle('on', !!CFG.smart); sm.setAttribute('aria-checked', String(!!CFG.smart));
    bar.classList.toggle('smart', !!CFG.smart);
    $('[data-v=size]', bar).textContent = CFG.smart ? 'אוטומטי' : sizeTxt(CFG.size || 0);
    $('[data-v=bluff]', bar).textContent = CFG.smart ? 'אוטומטי' : bluffTxt(CFG.bluff || 0);
  };
  $('[data-on]', bar).onclick = () => { CFG.on = !CFG.on; save(); paint(); S.sig = ''; };
  $('[data-smart]', bar).onclick = (e) => { e.preventDefault(); CFG.smart = !CFG.smart; save(); paint(); };
  $('[data-pre]', bar).onclick = (e) => { e.preventDefault(); CFG.pre = CFG.pre === false; save(); paint(); };
  $('[data-show]', bar).onclick = (e) => { e.preventDefault(); CFG.show = !CFG.show; save(); paint(); };
  $$('input[type=range]', bar).forEach((rg) => {
    const k = rg.dataset.k, out = $(`[data-v=${k}]`, bar), txt = k === 'speed' ? speedTxt : k === 'size' ? sizeTxt : bluffTxt;
    rg.oninput = () => { out.textContent = txt(+rg.value); };
    rg.onchange = () => { CFG[k] = +rg.value; save(); };
  });
  paint();
  // PokerNow's bottom is full (chat, the action buttons), so the strip starts at the top; drag it by its empty parts or the 🤖
  const place = () => {
    if (!CFG.pos) { bar.style.left = '50%'; bar.style.top = '8px'; bar.style.transform = 'translateX(-50%)'; return; }
    const w = bar.offsetWidth || 400, h = bar.offsetHeight || 90;
    bar.style.transform = 'none';
    bar.style.left = Math.max(0, Math.min(innerWidth - w, CFG.pos.x)) + 'px';
    bar.style.top = Math.max(0, Math.min(innerHeight - h, CFG.pos.y)) + 'px';
  };
  bar.addEventListener('pointerdown', (e) => {
    if (e.target.closest('input, button, label')) return;
    const r = bar.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
    bar.setPointerCapture(e.pointerId); bar.classList.add('drag');
    const mv = (ev) => { CFG.pos = { x: ev.clientX - dx, y: ev.clientY - dy }; place(); };
    const up = () => { bar.classList.remove('drag'); bar.removeEventListener('pointermove', mv); bar.removeEventListener('pointerup', up); save(); };
    bar.addEventListener('pointermove', mv); bar.addEventListener('pointerup', up);
  });
  bar.addEventListener('dblclick', (e) => { if (!e.target.closest('input, button, label')) { delete CFG.pos; save(); place(); } });
  addEventListener('resize', place);
  const status = (t) => { const el = $('.bl', bar); if (el.title !== t) el.title = t; };

  /* ---------- the loop ---------- */
  const S = { busy: false, sig: '', at: 0, log: [] };
  const moved = (t) => { S.log.push(new Date().toLocaleTimeString() + ' ' + t); S.log = S.log.slice(-60); };
  function alarm(ss) {
    // as on barusik.com: a pot over 10 × players × small blind makes the edges of the screen blink red
    const dealt = ss.filter((s) => s.inHand || s.folded).length, b = blinds();
    const on = dealt >= 2 && ss.some((s) => s.me && s.inHand) && potTotal(ss) > 10 * dealt * b.sb;
    if (document.body.classList.contains('blg-alarm') !== on) document.body.classList.toggle('blg-alarm', on);
  }
  async function tick() {
    const table = !!$('.table-player');
    if (bar.classList.contains('hide') === table) { bar.classList.toggle('hide', !table); if (table) place(); }
    if (!table) return;
    const ss = seats();
    alarm(ss);
    pullLog();
    if (CFG.show) showCards(ss);
    try { watch(); } catch {}
    if (!CFG.on || S.busy || S.dead) return;
    const bt = buttons();
    if ((!bt.fold && !bt.check && !bt.call && !bt.raise) || !myTurn(ss, bt)) { status('הבוט האגדי · מחכה לתור'); return; }
    const sp = snapshot();
    if (!sp.t) { status('הבוט האגדי · לא מצליח לקרוא: ' + sp.why); return; }
    const sig = [sp.hole, sp.board, sp.pot, sp.t.currentBet].join('|');
    if (sig === S.sig && Date.now() - S.at < 8000) return;   // same spot: try again only if the click did not land
    S.busy = true; S.sig = sig; S.at = Date.now();
    try {
      status(`הבוט האגדי · ${sp.hole.map(P.cardText).join(' ')} | ${sp.board.map(P.cardText).join(' ') || '—'}`);
      // think, but move at once if PokerNow already switched on the extra time (and remember how long the clock is)
      const lateAlready = extraTime();
      const wait = thinkMs(sp.t, sp.seat, Math.pow(X, -(CFG.speed || 0))), until = Date.now() + wait;
      let line = null;
      if (sp.board.length >= 3 && sp.names.length === 1) { await pullLog(S.at); try { line = handLine(sp.names[0], sp.hole); } catch (_e) { line = null; } }
      S.line = line;
      // decide during the pause: the longer the pause, the more deals it runs (Omaha with 5 cards needs them); smart mode uses extra CPU and ignores size/bluff sliders
      const smart = !!CFG.smart;
      const budget = smart ? Math.max(700, Math.min(3500, wait * 0.78)) : Math.max(250, Math.min(2500, wait * 0.6));
      const move = P.legend(sp.t, sp.seat, budget, smart ? 1 : Math.pow(X, CFG.size || 0), { ...tableStyle(sp.names), noPre: CFG.pre === false, bluff: smart ? 1 : Math.pow(X, CFG.bluff || 0) * oppBluff(sp.names), fold: foldRate(sp.names), smart, line });
      while (Date.now() < until && CFG.on) {
        if (!lateAlready && extraTime()) { const took = Date.now() - S.at; if (took > 3000 && took < (CFG.turnMs || 15000)) { CFG.turnMs = took; save(); } break; }
        await sleep(200);
      }
      if (!CFG.on || S.dead) return;
      const again = snapshot();
      if (!again.t || [again.hole, again.board, again.pot, again.t.currentBet].join('|') !== sig) return;
      moved(await play(move, again.t.options(again.seat)));
    } catch (e) { moved('error: ' + (e && e.message)); }
    finally { setTimeout(() => { S.busy = false; }, 1500); }
  }
  const iv = setInterval(tick, 500);
  // a tab in the background gets its timers slowed to once a minute; changes on the table still wake the bot up
  let woke = 0;
  const mo = new MutationObserver((list) => {
    if (list.every((m) => bar.contains(m.target) || m.target === document.body)) return;
    const n = Date.now(); if (n - woke > 300) { woke = n; tick(); }
  });
  mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  const walk = (el, d = 0) => (!el || d > 7 ? '' : `${' '.repeat(d)}${el.tagName.toLowerCase()}.${(typeof el.className === 'string' ? el.className : '').trim().replace(/\s+/g, '.')}${el.children.length ? '' : ' «' + (el.textContent || '').trim().slice(0, 24) + '»'}\n` + [...el.children].map((c) => walk(c, d + 1)).join(''));
  const dump = () => ['.you-player', '.table-cards', '.table-pot-size', '.game-decisions-ctn', '.action-buttons', '.raise-controller-form'].map((q) => q + '\n' + walk($(q))).join('\n');
  window.__legend = { S, CFG, LOG, oppBluff, note, readFor, calibrate, dump, snapshot, seats, buttons, blinds, stop() { S.dead = true; clearInterval(iv); mo.disconnect(); bar.remove(); css.remove(); document.body.classList.remove('blg-alarm'); delete window.__legend; } };
  tick();
})();
