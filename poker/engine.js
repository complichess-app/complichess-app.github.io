/* Barusik Poker · the rules. No-limit Texas Hold'em: dealing, betting, side pots, showdown, and the bots' heads.
   Nothing here touches the page, so the same file runs in the browser and under node for the tests.
   © 2026 Bar Lvovski. All rights reserved. */
(function (root) {
  'use strict';

  /* ---------- cards ---------- */
  // a card is a number 0..51: rank = 2 + (c >> 2) (2..14), suit = c & 3 (0 ♠, 1 ♥, 2 ♦, 3 ♣)
  const rankOf = (c) => 2 + (c >> 2);
  const suitOf = (c) => c & 3;
  const RANK_CH = { 10: 'T', 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
  const SUIT_CH = ['♠', '♥', '♦', '♣'];
  const cardText = (c) => (RANK_CH[rankOf(c)] || String(rankOf(c))) + SUIT_CH[suitOf(c)];
  const parse = (s) => {
    const r = { T: 10, J: 11, Q: 12, K: 13, A: 14 }[s[0]] || +s[0];
    const su = { s: 0, h: 1, d: 2, c: 3, '♠': 0, '♥': 1, '♦': 2, '♣': 3 }[s[1]];
    return (r - 2) * 4 + su;
  };

  function rng() {
    if (root.crypto && root.crypto.getRandomValues) {
      const a = new Uint32Array(1);
      return () => { root.crypto.getRandomValues(a); return a[0] / 4294967296; };
    }
    return Math.random;
  }
  const rand = rng();

  function shuffled() {
    const d = Array.from({ length: 52 }, (_, i) => i);
    for (let i = 51; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); const t = d[i]; d[i] = d[j]; d[j] = t; }
    return d;
  }

  /* ---------- hand value ---------- */
  // score = category * 16^5 + up to five tie-break ranks; bigger wins. Categories 0 high card .. 8 straight flush.
  const B = [1048576, 65536, 4096, 256, 16, 1];
  const pack = (cat, ks) => { let v = cat * B[0]; for (let i = 0; i < ks.length && i < 5; i++) v += ks[i] * B[i + 1]; return v; };

  function straightHigh(mask) {
    if (mask & (1 << 14)) mask |= 2; // the ace plays low too
    for (let h = 14; h >= 5; h--) {
      const need = 0b11111 << (h - 4);
      if ((mask & need) === need) return h;
    }
    return 0;
  }

  function evaluate(cards) {
    const cnt = new Array(15).fill(0);
    const bySuit = [0, 0, 0, 0], suitMask = [0, 0, 0, 0];
    let mask = 0;
    for (const c of cards) {
      const r = rankOf(c), s = suitOf(c);
      cnt[r]++; bySuit[s]++; suitMask[s] |= 1 << r; mask |= 1 << r;
    }
    let flushSuit = -1;
    for (let s = 0; s < 4; s++) if (bySuit[s] >= 5) flushSuit = s;
    if (flushSuit >= 0) {
      const sh = straightHigh(suitMask[flushSuit]);
      if (sh) return pack(8, [sh]);
    }
    const quads = [], trips = [], pairs = [], singles = [];
    for (let r = 14; r >= 2; r--) {
      if (cnt[r] === 4) quads.push(r); else if (cnt[r] === 3) trips.push(r);
      else if (cnt[r] === 2) pairs.push(r); else if (cnt[r] === 1) singles.push(r);
    }
    const highest = (skip) => { for (let r = 14; r >= 2; r--) if (cnt[r] && !skip.includes(r)) return r; return 0; };
    if (quads.length) return pack(7, [quads[0], highest([quads[0]])]);
    if (trips.length && (trips.length > 1 || pairs.length)) {
      const t = trips[0];
      const p = Math.max(trips[1] || 0, pairs[0] || 0);
      return pack(6, [t, p]);
    }
    if (flushSuit >= 0) {
      const ks = [];
      for (let r = 14; r >= 2 && ks.length < 5; r--) if (suitMask[flushSuit] & (1 << r)) ks.push(r);
      return pack(5, ks);
    }
    const sh = straightHigh(mask);
    if (sh) return pack(4, [sh]);
    const rest = (skip, n) => { const ks = []; for (let r = 14; r >= 2 && ks.length < n; r--) if (cnt[r] && !skip.includes(r)) ks.push(r); return ks; };
    if (trips.length) return pack(3, [trips[0], ...rest([trips[0]], 2)]);
    if (pairs.length >= 2) return pack(2, [pairs[0], pairs[1], ...rest([pairs[0], pairs[1]], 1)]);
    if (pairs.length) return pack(1, [pairs[0], ...rest([pairs[0]], 3)]);
    return pack(0, rest([], 5));
  }
  const category = (score) => Math.floor(score / B[0]);

  /* a player's hand: Hold'em takes the best five of all seven, Omaha exactly two from the hand and three from the board */
  function value(hole, board) {
    if (hole.length < 4) return evaluate(hole.concat(board));
    if (board.length < 3) return evaluate(hole.slice(0, 2).concat(board));
    let best = -1;
    for (let a = 0; a < hole.length; a++) for (let b = a + 1; b < hole.length; b++)
      for (let i = 0; i < board.length; i++) for (let j = i + 1; j < board.length; j++) for (let k = j + 1; k < board.length; k++) {
        const v = evaluate([hole[a], hole[b], board[i], board[j], board[k]]);
        if (v > best) best = v;
      }
    return best;
  }

  /* Omaha Hi/Lo: the best low of five different ranks 8 or under (ace low), exactly two from the hand.
     Bigger is better, 0 means no low qualifies. */
  const lowRank = (c) => { const r = rankOf(c); return r === 14 ? 1 : r; };
  function lowValue(hole, board) {
    if (!board || board.length < 3) return 0;
    let best = 0;
    for (let a = 0; a < hole.length; a++) for (let b = a + 1; b < hole.length; b++)
      for (let i = 0; i < board.length; i++) for (let j = i + 1; j < board.length; j++) for (let k = j + 1; k < board.length; k++) {
        const rs = [hole[a], hole[b], board[i], board[j], board[k]].map(lowRank);
        if (rs.some((r) => r > 8) || new Set(rs).size < 5) continue;
        rs.sort((x, y) => y - x);
        let v = 0; for (const r of rs) v = v * 16 + (9 - r); // the lower the top card, the better
        if (v > best) best = v;
      }
    return best;
  }
  // PokerNow's games: hold'em (no limit, pot limit), and pot-limit Omaha with 4, 5 or 6 cards, high or hi/lo
  const HOLES = { nlh: 2, plh: 2, plo: 4, plo8: 4, plo5: 5, plo58: 5, plo6: 6, plo68: 6 };
  const HILO = { plo8: 1, plo58: 1, plo68: 1 };
  const holesOf = (game) => HOLES[game] || 2;
  const hiLo = (game) => !!HILO[game];
  // with burns skipped when short, the deck holds everyone's cards plus one board
  const maxPlayers = (game) => Math.min(9, Math.floor(47 / holesOf(game)));

  /* the five cards that make the hand, for highlighting on the table: bestFive(hole, board) */
  function bestFive(hole, board) {
    if (board === undefined) return bestOf(hole);
    if (hole.length < 4) return bestOf(hole.concat(board));
    let best = -1, pick = null;
    for (let a = 0; a < hole.length; a++) for (let b = a + 1; b < hole.length; b++)
      for (let i = 0; i < board.length; i++) for (let j = i + 1; j < board.length; j++) for (let k = j + 1; k < board.length; k++) {
        const five = [hole[a], hole[b], board[i], board[j], board[k]]; const v = evaluate(five);
        if (v > best) { best = v; pick = five; }
      }
    return pick;
  }
  function bestOf(cards) {
    let best = -1, pick = null;
    const n = cards.length;
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
      const five = cards.filter((_, i) => i !== a && i !== b);
      if (n === 7) { const v = evaluate(five); if (v > best) { best = v; pick = five; } }
    }
    if (n <= 5) return cards.slice();
    if (n === 6) {
      for (let a = 0; a < 6; a++) { const five = cards.filter((_, i) => i !== a); const v = evaluate(five); if (v > best) { best = v; pick = five; } }
    }
    return pick;
  }

  /* ---------- equity, by dealing it out many times ---------- */
  function equity(hole, board, opponents, iters) {
    if (opponents < 1) return 1;
    const used = new Set([...hole, ...board]);
    const deck = [];
    for (let c = 0; c < 52; c++) if (!used.has(c)) deck.push(c);
    let score = 0;
    const need = 5 - board.length;
    for (let it = 0; it < iters; it++) {
      // partial shuffle: only the cards we draw
      const hc = hole.length, draw = need + opponents * hc;
      for (let i = 0; i < draw; i++) { const j = i + Math.floor(rand() * (deck.length - i)); const t = deck[i]; deck[i] = deck[j]; deck[j] = t; }
      const full = board.concat(deck.slice(0, need));
      const mine = value(hole, full);
      let best = 0, ties = 0, lost = false;
      for (let o = 0; o < opponents; o++) {
        const v = value(deck.slice(need + o * hc, need + o * hc + hc), full);
        if (v > mine) { lost = true; break; }
        if (v === mine) ties++;
        if (v > best) best = v;
      }
      if (!lost) score += ties ? 1 / (ties + 1) : 1;
    }
    return score / iters;
  }

  /* everyone's chance to win when all the hole cards are known (the admin's view). holes: [[c,c], ...] */
  function odds(holes, board, iters) {
    const used = new Set(board);
    for (const h of holes) for (const c of h) used.add(c);
    const deck = [];
    for (let c = 0; c < 52; c++) if (!used.has(c)) deck.push(c);
    const need = 5 - board.length;
    const win = holes.map(() => 0), tie = holes.map(() => 0);
    const runs = need === 0 ? 1 : iters;
    for (let it = 0; it < runs; it++) {
      for (let i = 0; i < need; i++) { const j = i + Math.floor(rand() * (deck.length - i)); const t = deck[i]; deck[i] = deck[j]; deck[j] = t; }
      const full = board.concat(deck.slice(0, need));
      const v = holes.map((h) => value(h, full));
      const best = Math.max(...v);
      const w = v.filter((x) => x === best).length;
      v.forEach((x, i) => { if (x === best) { if (w === 1) win[i]++; else tie[i] += 1 / w; } });
    }
    return holes.map((_, i) => ({ win: win[i] / runs, tie: tie[i] / runs }));
  }

  /* ---------- the table ---------- */
  // events go out through table.on(type, data) so the page can animate and the log can speak
  function Table(opts) {
    this.sb = opts.sb; this.bb = opts.bb;
    this.game = HOLES[opts.game] ? opts.game : 'nlh';     // nlh no-limit hold'em, plh pot-limit hold'em, plo / plo8 (hi-lo) / plo5 pot-limit omaha
    this.double = !!opts.double;                           // double board: two boards every hand, each wins half the pot
    this.minOpen = Math.max(1, opts.minRaise || opts.bb);
    this.ante = Math.max(0, opts.ante || 0);               // dead money from everyone before the cards
    this.runTwice = opts.runTwice === 'ask' ? 'ask' : opts.runTwice === true || opts.runTwice === 'yes' ? 'yes' : 'no'; // all-in before the river: two boards (yes), one (no), or the players choose (ask)
    this.bonus72 = Math.max(0, opts.bonus72 || 0);         // win a hand holding 7-2 and everyone dealt in pays you this  // the smallest bet, and the smallest raise until someone raises more
    this.seats = opts.players.map((p, i) => ({
      seat: i, id: p.id, name: p.name, human: !!p.human, style: p.style || null,
      chips: p.chips, cards: [], bet: 0, total: 0, folded: false, allIn: false, acted: false, canRaise: true, out: p.chips <= 0,
    }));
    this.button = opts.button != null ? opts.button : Math.floor(rand() * this.seats.length);
    this.on = opts.on || (() => {});
    this.hand = 0;
    this.stage = 'idle';
  }

  Table.prototype.live = function () { return this.seats.filter((p) => !p.out); };
  Table.prototype.next = function (from, ok) {
    const n = this.seats.length;
    for (let k = 1; k <= n; k++) { const p = this.seats[(from + k) % n]; if (ok(p)) return p.seat; }
    return -1;
  };
  Table.prototype.inHand = function () { return this.seats.filter((p) => !p.out && !p.folded); };
  Table.prototype.pot = function () { return this.seats.reduce((s, p) => s + p.total, 0); };
  Table.prototype.canAct = (p) => !p.out && !p.folded && !p.allIn;

  // extra: { bomb: amount everyone puts in before a hand that starts on the flop, straddle: seat index or -1 }
  Table.prototype.startHand = function (extra = {}) {
    for (const p of this.seats) { p.out = p.chips <= 0; p.cards = []; p.bet = 0; p.total = 0; p.folded = false; p.allIn = false; p.acted = false; p.canRaise = true; p.shown = false; p.showMine = false; }
    this.bombed = false; this.ask = null; this.twiceNow = false;
    // a deck can't deal six-card Omaha to more than seven: the last ones to sit wait
    { const cap = maxPlayers(this.game); this.live().slice(cap).forEach((p) => (p.out = true)); }
    if (this.live().length < 2) { this.stage = 'idle'; return false; }
    this.hand++;
    this.deck = shuffled();
    // a second board only when the deck has the cards for it (five-card Omaha at a full table doesn't)
    this.board2 = this.double && this.live().length * holesOf(this.game) + 10 <= 52 ? [] : null;
    this.board = [];
    this.button = this.next(this.button, (p) => !p.out);
    const heads = this.live().length === 2;
    const sbSeat = heads ? this.button : this.next(this.button, (p) => !p.out);
    const bbSeat = this.next(sbSeat, (p) => !p.out);
    this.sbSeat = sbSeat; this.bbSeat = bbSeat;
    this.on('hand', { hand: this.hand, button: this.button, sb: sbSeat, bb: bbSeat });
    if (this.ante) for (const p of this.live()) {
      const a = Math.min(this.ante, p.chips);
      p.chips -= a; p.total += a; if (p.chips === 0) p.allIn = true;
      this.on('blind', { seat: p.seat, amount: a, kind: 'ante' });
    }
    const bomb = Math.max(0, extra.bomb || 0);
    if (bomb) {
      this.bombed = true;
      for (const p of this.live()) {
        const a = Math.min(bomb, p.chips);
        p.chips -= a; p.total += a; if (p.chips === 0) p.allIn = true;
        this.on('blind', { seat: p.seat, amount: a, kind: 'bomb' });
      }
    } else {
      this.post(sbSeat, this.sb, 'sb');
      this.post(bbSeat, this.bb, 'bb');
    }
    // a straddle: the player after the big blind puts in twice the big blind and acts last before the flop
    let strad = -1;
    if (!bomb && !heads && extra.straddle != null) {
      const utg = this.next(bbSeat, (p) => !p.out);
      const willing = Array.isArray(extra.straddle) ? extra.straddle : [extra.straddle];
      if (willing.includes(utg) && utg !== this.button && this.seats[utg].chips > this.bb * 2) { strad = utg; this.post(utg, this.bb * 2, 'straddle'); }
    }
    // two cards each, one at a time starting left of the button
    let s = this.button;
    for (let round = 0; round < holesOf(this.game); round++) {
      for (let k = 0; k < this.live().length; k++) {
        s = this.next(s, (p) => !p.out);
        this.seats[s].cards.push(this.deck.pop());
      }
    }
    this.on('deal', {});
    this.stage = 'preflop';
    if (bomb) { this.currentBet = 0; this.minRaise = this.minOpen; this.nextStreet(); return true; }
    this.currentBet = strad >= 0 ? this.bb * 2 : this.bb;
    this.minRaise = Math.max(this.currentBet, this.minOpen);
    this.toAct = this.next(strad >= 0 ? strad : bbSeat, this.canAct);
    this.settleOrContinue(true);
    return true;
  };

  // the burn card, unless the deck is too short for it and the cards still to come
  Table.prototype.burn = function () {
    const need = (5 - this.board.length) + (this.board2 ? 5 - this.board2.length : 0);
    if (this.deck.length > need) this.deck.pop();
  };

  Table.prototype.post = function (seat, amount, kind) {
    const p = this.seats[seat];
    const a = Math.min(amount, p.chips);
    p.chips -= a; p.bet += a; p.total += a;
    if (p.chips === 0) p.allIn = true;
    this.on('blind', { seat, amount: a, kind });
  };

  /* what the player whose turn it is may do */
  Table.prototype.options = function (seat) {
    const p = this.seats[seat];
    const toCall = Math.max(0, this.currentBet - p.bet);
    const callAmt = Math.min(toCall, p.chips);
    let maxTo = p.bet + p.chips;
    // pot limit: call, then raise by the size of the pot after the call
    if (this.game !== 'nlh') maxTo = Math.min(maxTo, this.currentBet + this.pot() + toCall);
    // allTo: everything she has; when maxTo is less, the biggest raise is the pot, not all in
    const o = { toCall, call: callAmt, check: toCall === 0, fold: toCall > 0, raise: false, minTo: 0, maxTo, allTo: p.bet + p.chips, bet: this.currentBet === 0 };
    if (p.canRaise && p.chips > toCall && maxTo > this.currentBet) {
      const minTo = this.currentBet === 0 ? Math.min(this.minOpen, maxTo) : this.currentBet + this.minRaise;
      o.raise = true; o.minTo = Math.min(minTo, maxTo);
    }
    return o;
  };

  // action: {type:'fold'|'check'|'call'|'raise', to}
  Table.prototype.act = function (seat, action) {
    if (seat !== this.toAct || this.stage === 'idle' || this.stage === 'done') return false;
    const p = this.seats[seat];
    const o = this.options(seat);
    let type = action.type;
    if (type === 'check' && !o.check) type = 'call';
    if (type === 'call' && o.check) type = 'check';
    // folding is allowed at any point, even when a check is free (timeouts and CHECK/FOLD still check)
    if (type === 'raise' && !o.raise) type = o.check ? 'check' : 'call';

    if (type === 'fold') {
      p.folded = true;
      this.on('act', { seat, type: 'fold' });
    } else if (type === 'check') {
      this.on('act', { seat, type: 'check' });
    } else if (type === 'call') {
      const a = o.call;
      p.chips -= a; p.bet += a; p.total += a;
      if (p.chips === 0) p.allIn = true;
      this.on('act', { seat, type: 'call', amount: a, allIn: p.allIn });
    } else {
      let to = Math.round(action.to || o.minTo);
      to = Math.max(o.minTo, Math.min(o.maxTo, to));
      const add = to - p.bet;
      const raiseBy = to - this.currentBet;
      p.chips -= add; p.bet = to; p.total += add;
      if (p.chips === 0) p.allIn = true;
      const full = raiseBy >= this.minRaise;
      const wasBet = this.currentBet === 0;
      if (full) this.minRaise = raiseBy;
      this.currentBet = to;
      for (const q of this.seats) {
        if (q === p || !this.canAct(q)) continue;
        if (full) { q.acted = false; q.canRaise = true; }
        else if (q.acted) { q.acted = false; q.canRaise = false; } // a short all-in reopens nothing
      }
      this.on('act', { seat, type: wasBet ? 'bet' : 'raise', to, allIn: p.allIn });
    }
    p.acted = true;
    this.settleOrContinue(false);
    return true;
  };

  Table.prototype.settleOrContinue = function (fresh) {
    const left = this.inHand();
    if (left.length === 1) return this.finish();
    const pending = this.seats.filter((q) => this.canAct(q) && (!q.acted || q.bet < this.currentBet));
    if (pending.length) {
      if (!fresh) this.toAct = this.next(this.toAct, (q) => this.canAct(q) && (!q.acted || q.bet < this.currentBet));
      else if (!pending.includes(this.seats[this.toAct])) this.toAct = this.next(this.toAct, (q) => pending.includes(q));
      // one player left with chips, everyone else all-in and matched: nothing to decide
      const able = this.seats.filter(this.canAct);
      if (able.length === 1 && able[0].bet >= this.currentBet) return this.nextStreet();
      this.on('turn', { seat: this.toAct, options: this.options(this.toAct) });
      return;
    }
    this.nextStreet();
  };

  Table.prototype.returnUncalled = function () {
    // the part of the top bet nobody matched goes back
    const bets = this.seats.filter((p) => !p.out).map((p) => p.bet).sort((a, b) => b - a);
    if (bets.length < 2 || bets[0] === bets[1]) return;
    const top = this.seats.find((p) => !p.out && p.bet === bets[0]);
    const back = bets[0] - bets[1];
    top.bet -= back; top.total -= back; top.chips += back;
    if (top.chips > 0) top.allIn = false;
    this.on('uncalled', { seat: top.seat, amount: back });
  };

  Table.prototype.nextStreet = function () {
    this.returnUncalled();
    this.on('collect', { pot: this.pot() });
    for (const p of this.seats) { p.bet = 0; p.acted = false; p.canRaise = true; }
    this.currentBet = 0; this.minRaise = this.minOpen;
    const order = ['preflop', 'flop', 'turn', 'river'];
    const i = order.indexOf(this.stage);
    if (i === 3) return this.finish();
    // nobody can bet any more: run the rest out (once, twice, or ask the players first)
    if (this.inHand().length > 1 && this.seats.filter(this.canAct).length < 2 && this.board.length < 5) return this.runOut();
    this.stage = order[i + 1];
    this.burn();
    const n = this.stage === 'flop' ? 3 : 1;
    for (let k = 0; k < n; k++) this.board.push(this.deck.pop());
    if (this.board2) { this.burn(); for (let k = 0; k < n; k++) this.board2.push(this.deck.pop()); }
    this.on('board', { stage: this.stage, board: this.board.slice(), board2: this.board2 ? this.board2.slice() : undefined });
    const able = this.seats.filter(this.canAct);
    if (able.length < 2) return this.nextStreet(); // run it out
    this.toAct = this.next(this.button, this.canAct);
    this.on('turn', { seat: this.toAct, options: this.options(this.toAct) });
  };

  Table.prototype.pots = function () {
    const contrib = this.seats.filter((p) => p.total > 0);
    const levels = [...new Set(contrib.map((p) => p.total))].sort((a, b) => a - b);
    const pots = []; let prev = 0;
    for (const lv of levels) {
      let amount = 0;
      for (const p of contrib) amount += Math.max(0, Math.min(p.total, lv) - prev);
      const eligible = contrib.filter((p) => !p.folded && p.total >= lv).map((p) => p.seat);
      if (amount > 0) {
        // a layer nobody still in can win folds into the one below it
        if (!eligible.length && pots.length) pots[pots.length - 1].amount += amount;
        else if (pots.length && sameSet(pots[pots.length - 1].eligible, eligible)) pots[pots.length - 1].amount += amount;
        else pots.push({ amount, eligible });
      }
      prev = lv;
    }
    return pots;
  };
  const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

  Table.prototype.finish = function () {
    this.returnUncalled();
    const left = this.inHand();
    const results = [];
    const hilo = hiLo(this.game);
    const deal = (b, more = 0) => { while (b.length < 5) { if (this.deck.length > 5 - b.length + more) this.deck.pop(); const n = b.length === 0 ? 3 : 1; for (let k = 0; k < n; k++) b.push(this.deck.pop()); } return b; };
    const twice = !!this.twiceNow && !this.board2 && this.board.length < 5 && this.deck.length >= 2 * (5 - this.board.length);
    const scoresOn = (board) => { const hi = {}, lo = {}; for (const p of left) { hi[p.seat] = value(p.cards, board); if (hilo) lo[p.seat] = lowValue(p.cards, board); p.shown = true; } return { hi, lo }; };
    if (left.length === 1) {
      const w = left[0];
      const amount = this.pot();
      w.chips += amount;
      results.push({ seats: [w.seat], amount, share: { [w.seat]: amount }, score: null, uncontested: true });
    } else if (this.board2 || twice) {
      // two boards: double board deals both all hand long; run it twice deals the second from where the first stood
      let A, Bd;
      if (this.board2) {
        // double board: street by street, both boards each street, exactly as nextStreet would have dealt them
        const before = this.board.length;
        while (this.board.length < 5 && this.deck.length) {
          const n = this.board.length === 0 ? 3 : 1;
          this.burn(); for (let k = 0; k < n; k++) this.board.push(this.deck.pop());
          this.burn(); for (let k = 0; k < n; k++) this.board2.push(this.deck.pop());
        }
        A = this.board; Bd = this.board2;
        if (A.length > before) this.on('board', { stage: 'river', board: A.slice(), board2: Bd.slice(), runout: true });
      } else {
        const base = this.board.slice();
        A = deal(base.slice(), 5 - base.length); Bd = deal(base.slice());
        this.board = A; this.board2 = Bd;
        this.on('board', { stage: 'river', board: A.slice(), runout: true });
        this.on('board2', { board: Bd.slice() });
      }
      const sA = scoresOn(A), sB = scoresOn(Bd);
      this.on('showdown', { scores: sA.hi, scores2: sB.hi });
      for (const pot of this.pots()) {
        const half = Math.floor(pot.amount / 2) + (pot.amount % 2);
        results.push(...this.split(pot, half, sA, 1), ...this.split(pot, pot.amount - half, sB, 2));
      }
    } else {
      // run out whatever is missing (all-in before the river)
      while (this.board.length < 5) {
        if (this.deck.length > 5 - this.board.length) this.deck.pop();
        const n = this.board.length === 0 ? 3 : 1;
        for (let k = 0; k < n; k++) this.board.push(this.deck.pop());
        this.on('board', { stage: this.board.length === 3 ? 'flop' : this.board.length === 4 ? 'turn' : 'river', board: this.board.slice(), runout: true });
      }
      const sc = scoresOn(this.board);
      this.on('showdown', { scores: sc.hi });
      for (const pot of this.pots()) results.push(...this.split(pot, pot.amount, sc, 0));
    }
    // the 7-2: whoever wins a pot holding seven-deuce collects from everyone who was dealt in
    const bonus = [];
    if (this.bonus72 && holesOf(this.game) === 2) {
      const won = new Set(); results.forEach((r) => r.seats.forEach((x) => won.add(x)));
      for (const w of won) {
        const p = this.seats[w], rk = p.cards.map(rankOf).sort((a, b) => a - b);
        if (rk.length !== 2 || rk[0] !== 2 || rk[1] !== 7) continue;
        p.shown = true;
        for (const q of this.seats) {
          if (q === p || q.out || !q.cards.length) continue;
          const a = Math.min(this.bonus72, q.chips);
          if (a > 0) { q.chips -= a; p.chips += a; bonus.push({ from: q.seat, to: w, amount: a }); }
        }
        this.on('bonus72', { seat: w, total: bonus.filter((b) => b.to === w).reduce((t, b) => t + b.amount, 0) });
      }
    }
    for (const p of this.seats) { p.bet = 0; p.total = 0; }
    this.stage = 'done';
    this.on('result', { results, board: this.board.slice(), board2: this.board2 ? this.board2.slice() : null, bonus });
  };

  // all in and nothing left to bet: cards face up, then once or twice. "ask": every player in the pot chooses,
  // and it runs twice only if they all say yes (one "once" settles it), like PokerNow.
  Table.prototype.runOut = function () {
    const mode = this.runTwice === 'ask' ? 'ask' : this.runTwice === true || this.runTwice === 'yes' ? 'yes' : 'no';
    for (const p of this.inHand()) p.shown = true;
    if (mode === 'ask' && !this.board2 && this.deck.length >= 2 * (5 - this.board.length)) {
      const seats = this.inHand().map((p) => p.seat);
      this.ask = { seats, votes: {} }; this.toAct = -1;
      this.on('ask', { seats });
      return;
    }
    this.twiceNow = mode === 'yes';
    return this.finish();
  };
  Table.prototype.vote = function (seat, yes) {
    if (!this.ask || !this.ask.seats.includes(seat) || seat in this.ask.votes) return false;
    this.ask.votes[seat] = !!yes;
    const all = this.ask.seats.every((s) => s in this.ask.votes);
    if (!yes) this.resolveAsk(false);
    else if (all) this.resolveAsk(this.ask.seats.every((s) => this.ask.votes[s]));
    return true;
  };
  Table.prototype.resolveAsk = function (twice) {
    if (!this.ask) return;
    this.ask = null; this.twiceNow = !!twice;
    this.on('asked', { twice: !!twice });
    this.finish();
  };

  // a pot (or the half of it that one board plays for): high hand, and in hi-lo half to the best qualifying low
  Table.prototype.split = function (pot, amount, sc, run) {
    if (!hiLo(this.game)) return [this.award(pot, amount, sc.hi, run)];
    const lows = {}; for (const s of pot.eligible) if (sc.lo[s]) lows[s] = sc.lo[s];
    if (!Object.keys(lows).length) return [this.award(pot, amount, sc.hi, run)];
    const hiPart = Math.floor(amount / 2) + (amount % 2);
    const lo = this.award(pot, amount - hiPart, lows, run); lo.low = true;
    return [this.award(pot, hiPart, sc.hi, run), lo];
  };

  // split one pot (or half of one, when running it twice) between the best hands
  Table.prototype.award = function (pot, amount, scores, run) {
    const elig = pot.eligible.filter((s) => scores[s] != null);
    let best = -1;
    for (const s of elig) best = Math.max(best, scores[s]);
    const winners = elig.filter((s) => scores[s] === best);
    // odd chips go to the first winner left of the button
    const ordered = [];
    let s = this.button;
    for (let k = 0; k < this.seats.length; k++) { s = (s + 1) % this.seats.length; if (winners.includes(s)) ordered.push(s); }
    const each = Math.floor(amount / ordered.length);
    let odd = amount - each * ordered.length;
    const share = {};
    for (const w of ordered) { const a = each + (odd > 0 ? 1 : 0); if (odd > 0) odd--; this.seats[w].chips += a; share[w] = a; }
    return { seats: ordered, amount, share, score: best, uncontested: false, run };
  };

  /* ---------- the bots ---------- */
  const STYLES = {
    rock:    { loose: -0.06, aggr: 0.35, bluff: 0.03, call: 0.02 },
    shark:   { loose: 0.0,  aggr: 0.75, bluff: 0.10, call: 0.0 },
    station: { loose: 0.06, aggr: 0.20, bluff: 0.02, call: 0.12 },
    maniac:  { loose: 0.12, aggr: 0.95, bluff: 0.22, call: 0.04 },
    solid:   { loose: 0.02, aggr: 0.55, bluff: 0.06, call: 0.03 },
  };

  function decide(t, seat) {
    const p = t.seats[seat];
    const st = STYLES[p.style] || STYLES.solid;
    const o = t.options(seat);
    const opp = t.inHand().length - 1;
    const pot = t.pot();
    const iters = p.cards.length > 2 ? (t.board.length ? 140 : 90) : t.board.length ? 420 : 300;
    let eq = equity(p.cards, t.board, opp, iters);
    // equity against random hands flatters us when someone has shown strength
    const pressure = o.toCall / Math.max(1, pot);
    eq = eq - Math.min(0.14, pressure * 0.12) + st.loose;
    const fair = 1 / (opp + 1);
    const strength = eq / fair;           // >1 means better than an average hand at this table
    const odds = o.toCall / (pot + o.toCall || 1);
    const r = rand();
    const sizeTo = (frac) => {
      const want = t.currentBet + Math.max(t.bb, Math.round((pot + o.toCall) * frac));
      return Math.max(o.minTo, Math.min(o.maxTo, roundChips(want, t.bb)));
    };

    if (o.raise) {
      if (strength > 2.1 || eq > 0.82) {
        const frac = eq > 0.9 && r < 0.3 ? 1.2 : 0.6 + st.aggr * 0.5;
        if (r < 0.15 + st.aggr * 0.75) return { type: 'raise', to: p.chips + p.bet < pot ? o.maxTo : sizeTo(frac) };
      }
      if (strength > 1.45 && r < st.aggr * 0.55) return { type: 'raise', to: sizeTo(0.5 + r * 0.4) };
      if (o.check && r < st.bluff && t.board.length) return { type: 'raise', to: sizeTo(0.45) };
      if (!o.check && r < st.bluff * 0.5 && pressure < 0.6) return { type: 'raise', to: sizeTo(0.7) };
    }
    if (o.check) return { type: 'check' };
    if (eq + st.call > odds + 0.03) return { type: 'call' };
    if (o.toCall <= t.bb && strength > 0.7) return { type: 'call' };
    return { type: 'fold' };
  }
  const roundChips = (v, bb) => { const u = bb >= 100 ? bb / 4 : bb / 2; return Math.max(u, Math.round(v / u) * u); };

  const api = { Table, evaluate, value, lowValue, holesOf, hiLo, maxPlayers, HOLES, category, bestFive, equity, odds, decide, cardText, parse, rankOf, suitOf, shuffled, STYLES, roundChips };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Poker = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
