/* Thinking Farm · © 2026 Bar Lvovski. All rights reserved.
   The game screen. Scoring happens on the server (tf_* functions in Supabase); the portal is a separate module
   (portal.js) that only listens to what happens here, so the game works the same without it. */
(() => {
  'use strict';
  const VV = '1';                       // version of the word lists in v/
  let SB = 'https://iktmyrfbejtjsiehcrar.supabase.co', KEY = 'sb_publishable_vEUqQPQSE0EG7YRnwNeAbg_PzViDO1a';
  const qs = new URLSearchParams(location.search);
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && qs.get('sb')) { SB = qs.get('sb'); KEY = qs.get('key') || KEY; }

  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const app = $('#app'), live = $('#live'), alertEl = $('#alert');
  const say = (s) => { live.textContent = ''; setTimeout(() => { live.textContent = s; }, 30); };
  const shout = (s) => { alertEl.textContent = ''; setTimeout(() => { alertEl.textContent = s; }, 30); };
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };

  /* ---------------------------------------------------------------- Hebrew words */
  const FIN = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
  const TOF = { 'כ': 'ך', 'מ': 'ם', 'נ': 'ן', 'פ': 'ף', 'צ': 'ץ' };
  const isHeb = (c) => c >= 'א' && c <= 'ת';
  function norm(s) {
    s = String(s || '').replace(/[֑-ׇ]/g, '').replace(/׳/g, "'").replace(/״/g, '"').replace(/`/g, "'").replace(/\s+/g, ' ').trim();
    let o = '';
    for (let i = 0; i < s.length; i++) {
      let ch = s[i]; const nx = s[i + 1];
      const last = nx === undefined || !(isHeb(nx) || nx === '"' || nx === "'");
      if (!last && FIN[ch]) ch = FIN[ch]; else if (last && TOF[ch]) ch = TOF[ch];
      o += ch;
    }
    return o;
  }
  const validShape = (w) => /^[א-ת]+(["'][א-ת]+)*'?( [א-ת]+(["'][א-ת]+)*'?)*$/.test(w) && w.length >= 2 && w.length <= 40;
  const keyOf = (w) => w[0] + w.slice(1).replace(/[וי]/g, '');
  const letters = (w) => [...w].filter(isHeb).map((c) => FIN[c] || c).join('');
  const shardOf = (w) => { const a = letters(w).slice(0, 2); return a.length === 2 ? a : (a + 'א').slice(0, 2); };
  const PREFIXES = ['וכשה', 'ושה', 'וכש', 'לכש', 'כשה', 'שה', 'שב', 'של', 'שמ', 'שכ', 'וה', 'וב', 'ול', 'ומ', 'וש', 'וכ', 'מה', 'כש', 'ה', 'ו', 'ב', 'ל', 'מ', 'ש', 'כ'];

  const shards = new Map(), keyIdx = new Map();
  let extra = new Set();
  const loadShard = (k) => {
    if (!shards.has(k)) shards.set(k, fetch(`v/${encodeURIComponent(k)}.txt?v=${VV}`).then((r) => (r.ok ? r.text() : '')).then((t) => new Set(t ? t.split('\n') : [])).catch(() => { shards.delete(k); return new Set(); }));
    return shards.get(k);
  };
  const loadKeys = (k) => {
    if (!keyIdx.has(k)) keyIdx.set(k, loadShard(k).then((set) => { const m = new Map(); for (const w of set) if (w.length >= 4) { const kk = keyOf(w); m.set(kk, m.has(kk) ? null : w); } return m; }));
    return keyIdx.get(k);
  };
  async function has(w) { return extra.has(w) || (await loadShard(shardOf(w))).has(w); }
  // a word the game accepts: in the list, or in the list after a prefix (וה, ש, ב…), or written with/without ו/י
  async function known(w) {
    if (await has(w)) return w;
    for (const p of PREFIXES) {
      if (w.startsWith(p) && w.length - p.length >= 2) { const r = norm(w.slice(p.length)); if (await has(r)) return r; }
    }
    if (w.length >= 4) {
      const k = keyOf(w), cands = new Set([shardOf(w), shardOf(w[0] + 'ו'), shardOf(w[0] + 'י')]);
      for (const s of cands) { const m = await loadKeys(s); const hit = m.get(k); if (hit) return hit; }
    }
    return null;
  }

  /* ---------------------------------------------------------------- account */
  const mk = (key) => window.supabase.createClient(SB, KEY, { auth: { persistSession: true, autoRefreshToken: true, storageKey: key } });
  const mainSession = () => { try { const s = JSON.parse(localStorage.getItem('complichess-auth') || 'null'); return !!(s && s.access_token && s.user && !s.user.is_anonymous); } catch { return false; } };
  const MODE = mainSession() ? 'main' : 'guest';
  const sb = window.supabase ? mk(MODE === 'main' ? 'complichess-auth' : 'barusik-tf-guest') : null;
  let USER = null;
  async function ensureUser() {
    if (USER) return USER;
    const { data } = await sb.auth.getSession();
    if (data.session) return (USER = data.session.user);
    if (MODE === 'main') return null;
    const r = await sb.auth.signInAnonymously({ options: { data: { app: 'thinking-farm' } } });
    if (r.error) throw r.error;
    return (USER = r.data.user);
  }
  const ERR = {
    login: 'צריך להתחבר כדי לשחק. נסו לרענן את הדף.', new_day: 'התחיל יום חדש, טוען את המשחק של היום…', done: 'השאלה הזאת כבר סגורה.',
    not_word: 'זה לא נראה כמו מילה בעברית.', too_many: 'הגעתם למספר הניחושים המרבי לשאלה הזאת.', no_more: 'השתמשתם בכל הרמזים לשאלה הזאת.',
    no_game: 'המשחק של היום עוד לא מוכן.', bad_word: 'המילה ארוכה מדי.', net: 'אין חיבור לשרת כרגע. נסו שוב בעוד רגע.',
  };
  async function rpc(fn, args = {}) {
    const r = await sb.rpc(fn, args);
    if (r.error) { console.warn(fn, r.error); throw Object.assign(new Error(r.error.message), { code: 'net' }); }
    if (r.data && r.data.error) throw Object.assign(new Error(r.data.error), { code: r.data.error, data: r.data });
    return r.data;
  }

  /* ---------------------------------------------------------------- state */
  let S = null;            // tf_state()
  let cur = 0;             // index of the question on screen
  let lastWord = null;     // the guess to pin on top
  let busy = false;
  const LEVEL = { easy: 'קלה', medium: 'בינונית', hard: 'קשה', niche: 'נישתית' };
  const Q = () => S.questions[cur];
  const firstOpen = () => { const i = S.questions.findIndex((q) => q.status === 'open'); return i < 0 ? 0 : i; };

  const color = (s) => {
    if (s == null) return '#4b4672';
    const stops = [[0, [61, 107, 255]], [30, [63, 224, 255]], [50, [124, 255, 178]], [68, [255, 200, 87]], [82, [255, 90, 60]], [100, [255, 46, 136]]];
    for (let i = 1; i < stops.length; i++) if (s <= stops[i][0]) {
      const [a, ca] = stops[i - 1], [b, cb] = stops[i], t = (s - a) / (b - a);
      return `rgb(${ca.map((v, j) => Math.round(v + (cb[j] - v) * t)).join(',')})`;
    }
    return 'rgb(255,46,136)';
  };
  const tier = (s) => (s == null ? 'לא ברשימה' : s >= 80 ? 'אגדי' : s >= 55 ? 'נדיר' : s >= 30 ? 'לא שגרתי' : 'נפוץ');
  const isList = (q) => q.kind === 'list';
  const timed = (q) => isList(q) && q.secs != null;          // topic questions against the clock (older servers: 3 answers)
  const heatOf = (q) => (isList(q) ? Math.min(1, (q.best || 0) / (timed(q) ? 99 : 150)) : (q.status === 'solved' ? 1 : (q.best || 0) / 100));
  const label = (s) => (s == null ? 'רחוק' : s >= 100 ? 'מצאת!' : s >= 90 ? 'בוער' : s >= 75 ? 'חם מאוד' : s >= 55 ? 'חם' : s >= 35 ? 'פושר' : 'קריר');

  /* ---------------------------------------------------------------- portal (optional, loaded later) */
  let portal = null;
  const motionPref = () => store.get('tf.motion', 'auto');
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SND = (n, a) => { try { window.TFS && window.TFS.play(n, a); } catch {} };
  const P = {
    heat(h) { try { window.TFS && window.TFS.heat(h); portal && portal.setHeat(h); } catch {} },
    question(i, h) { try { window.TFS && window.TFS.heat(h); portal && portal.setQuestion(i, h); } catch {} },
    solve() { try { portal && portal.solve(); } catch {} },
    fail() { try { portal && portal.fail(); } catch {} },
    finale(n) { try { portal && portal.finale(n); } catch {} },
  };
  function liteDevice() {
    const c = navigator.connection;
    return (c && (c.saveData || /2g/.test(c.effectiveType || ''))) || (navigator.deviceMemory && navigator.deviceMemory <= 3) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  }
  async function loadPortal() {
    const m = motionPref();
    document.body.classList.toggle('less', m === 'off');
    if (m === 'off' || (m === 'auto' && reduced())) { document.body.classList.add('still'); return; }
    document.body.classList.remove('still');
    const tier = m === 'full' ? 'full' : m === 'lite' ? 'lite' : liteDevice() ? 'lite' : 'full';
    try {
      const mod = await import('./portal.js?v=1');
      let cv = $('#portal');
      if (cv.dataset.used) { const fresh = cv.cloneNode(false); cv.replaceWith(fresh); cv = fresh; }
      cv.dataset.used = '1';
      portal = await mod.createPortal(cv, { recipe: S && S.portal, tier, auto: m === 'auto' });
      if (S && S.ready) P.question(cur, heatOf(Q()));
    } catch (e) { console.warn('portal', e); document.body.classList.add('still'); }
  }
  const idle = (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 400));

  /* ---------------------------------------------------------------- drawing */
  function draw() {
    if (!S) return;
    document.body.classList.toggle('play', !!(S.ready && !S.finished));
    if (!S.ready) return drawNotReady();
    if (S.finished) return drawDone();
    const q = Q();
    $('#dayLabel').textContent = (S.practice ? 'אימון · ' : '') + dayText(S.day);
    const best = q.best || 0;
    if (isList(q)) return drawList(q);
    app.innerHTML = `
      <section class="stage" aria-label="המצב בשאלה">
        <div class="qnum">${S.practice ? 'אימון · ' : ''}שאלה <b>${cur + 1}</b> מתוך ${S.questions.length}</div>
        ${q.status === 'solved' ? `<div class="solvedword">${esc(q.word)}</div><div class="heatlab">מצאת!</div>`
          : q.status === 'gave' ? `<div class="solvedword" style="color:var(--mute);text-shadow:none">${esc(q.word)}</div><div class="heatlab">ויתרת על המילה הזאת</div>`
          : `<div class="heat" style="color:${color(best || null)}">${best ? best : '·'}</div><div class="heatlab">${best ? 'הכי קרוב עד עכשיו: ' + label(best) : 'עוד לא ניחשת'}</div>`}
      </section>
      ${pathHTML()}
      <section class="card" aria-labelledby="qh">
        <div class="qhead">
          <span class="lvl ${q.level}" id="qh">מילה ${LEVEL[q.level] || ''}</span>
          ${q.category ? `<span class="cat">תחום: <b>${esc(q.category)}</b></span>` : ''}
          <span class="qact">
            ${q.status === 'open' ? `<button class="btn" type="button" id="hintBtn" ${q.hints >= 3 ? 'disabled' : ''} aria-label="רמז, נשארו ${3 - q.hints}">💡 רמז <small>(${3 - q.hints})</small></button>
            <button class="btn ghost" type="button" id="giveBtn">ויתור</button>` : nextBtn()}
          </span>
        </div>
        ${guessList(q)}
      </section>
      ${complainLink()}
      <p class="acct">${MODE === 'main' ? 'משחקים עם החשבון שלך בברוסיק' : 'משחקים כאורח מהמכשיר הזה · <a href="/he/#account">התחברות לחשבון ברוסיק</a>'}</p>
      <p class="foot-note">המשחק נכתב מחדש בכל ערב · משחק חדש בחצות שעון ישראל</p>`;
    wireCard(q);
  }
  function pathHTML() {
    return `<nav class="path" aria-label="עשר השאלות של היום">
        ${S.questions.map((x, i) => `<button type="button" class="stop ${x.status} ${i === cur ? 'cur' : ''} ${isList(x) ? 'lst' : ''}" data-q="${i}" style="--p:${heatOf(x)}"
          aria-label="שאלה ${i + 1}, ${isList(x) ? (x.status === 'solved' ? 'הסתיימה, ' + (x.best || 0) + ' נקודות' : 'שאלת רשימה') : x.status === 'solved' ? 'נמצאה' : x.status === 'gave' ? 'ויתרת' : x.best ? 'הכי קרוב ' + x.best : 'פתוחה'}" ${i === cur ? 'aria-current="step"' : ''}>${i + 1}</button>`).join('')}
      </nav>`;
  }
  // a topic question: name things that belong; each right answer adds its points, rarer is worth more
  function drawList(q) {
    if (timed(q)) return drawTimed(q);
    const left = q.left ?? 3, done = q.status !== 'open';
    app.innerHTML = `
      <section class="stage" aria-label="המצב בשאלה">
        <div class="qnum">${S.practice ? 'אימון · ' : ''}שאלה <b>${cur + 1}</b> מתוך ${S.questions.length}</div>
        <div class="heat" style="color:${color(Math.min(99, (q.best || 0) / 1.5) || null)}">${q.best ? `<bdi dir="ltr">+${q.best}</bdi>` : '·'}</div>
        <div class="heatlab">${done ? 'סיימת את השאלה הזאת' : q.best ? 'נקודות בשאלה הזאת' : 'תשובה נדירה שווה יותר'}</div>
      </section>
      ${pathHTML()}
      <section class="card" aria-labelledby="qh">
        <div class="qhead"><span class="lvl ${q.level}">שאלת רשימה · ${LEVEL[q.level] || ''}</span>
          <span class="qact">${done ? nextBtn() : `<button class="btn ghost" type="button" id="giveBtn">סיימתי</button>`}</span></div>
        <h2 class="prompt" id="qh">${esc(q.prompt)}</h2>
        ${q.examples && q.examples.length ? `<p class="cat">למשל: <b>${q.examples.map(esc).join(', ')}</b></p>` : ''}
        ${q.complete ? `<p class="cat">✓ רשימה מלאה: כל תשובה נכונה מתקבלת.</p>` : ''}
        <p class="cat">${done ? `קיבלת <b>${q.best || 0}</b> נקודות` : `נשארו <b>${left}</b> ${left === 1 ? 'תשובה' : 'תשובות'}. כל תשובה נכונה מוסיפה נקודות, ותשובה נדירה שווה הרבה יותר.`}</p>
        ${(q.guesses || []).length ? `<ul class="list" aria-label="התשובות שלך">${q.guesses.map((g) => `<li class="g ${g.s == null ? 'far' : ''} ${g.w === lastWord ? 'last' : ''}">
          <span class="w">${esc(g.w)}${g.s != null ? `<small>${tier(g.s)}</small>` : ''}</span>
          <span class="s" style="color:${color(g.s)}">${g.s == null ? 'לא ברשימה' : `<bdi dir="ltr">+${g.s}</bdi>`}</span>
          <span class="bar" aria-hidden="true"><i style="--w:${g.s == null ? 2 : g.s}%;--c:${color(g.s)}"></i></span></li>`).join('')}</ul>` : `<p class="empty">כתבו תשובה אחת. אפשר גם כמה מילים.</p>`}
      </section>
      ${complainLink()}
      <p class="foot-note">המשחק נכתב מחדש בכל ערב · משחק חדש בחצות שעון ישראל</p>`;
    wireCard(q);
  }
  // Wazari style: start the clock, then as many answers as you can; a rarer answer is worth more
  const secsLeft = (i) => { const end = clocks.get(i); return end == null ? null : Math.max(0, Math.ceil((end - Date.now()) / 1000)); };
  function listRows(q, newestFirst) {
    const gs = newestFirst ? [...(q.guesses || [])].reverse() : (q.guesses || []);
    return `<ul class="list" aria-label="התשובות שלך">${gs.map((g) => `<li class="g ${g.pending ? 'pend' : g.s == null ? 'far' : ''} ${g.w === lastWord ? 'last' : ''}">
      <span class="w">${esc(g.w)}${g.f ? `<small>התכוונת ל${esc(g.f)}</small>` : ''}${g.s != null ? `<small>${tier(g.s)}</small>` : ''}</span>
      <span class="s" style="color:${color(g.s)}">${g.pending ? '…' : g.s == null ? 'לא ברשימה' : `<bdi dir="ltr">+${g.s}</bdi>`}</span>
      <span class="bar" aria-hidden="true"><i style="--w:${g.s == null ? 2 : g.s}%;--c:${color(g.s)}"></i></span></li>`).join('')}</ul>`;
  }
  function drawTimed(q) {
    const done = q.status !== 'open', running = !done && q.started, left = secsLeft(cur) ?? q.secs;
    const right = (q.guesses || []).filter((g) => g.s != null).length;
    app.innerHTML = `
      <section class="stage" aria-label="המצב בשאלה">
        <div class="qnum">${S.practice ? 'אימון · ' : ''}שאלה <b>${cur + 1}</b> מתוך ${S.questions.length}</div>
        ${running ? `<div class="heat clock ${left <= 10 ? 'low' : ''}" id="clock" role="timer" aria-label="שניות שנותרו">${left}</div>
          <div class="tbar" aria-hidden="true"><i id="tbar" style="--w:${(100 * left) / q.secs}%"></i></div>
          <div class="heatlab">תשובה אחת · נדירה שווה יותר</div>`
        : done ? `<div class="heat" style="color:${color(Math.min(99, (q.best || 0) / 3) || null)}">${q.best ? `<bdi dir="ltr">+${q.best}</bdi>` : '0'}</div><div class="heatlab">${(q.guesses || []).length ? (right ? tier((q.guesses.find((g) => g.s != null) || {}).s) : 'לא ברשימה') : 'הזמן נגמר'}</div>`
        : `<div class="heat" style="color:var(--cy)">⏱ ${q.secs}</div><div class="heatlab">שניות לשאלה הזאת</div>`}
      </section>
      ${pathHTML()}
      <section class="card" aria-labelledby="qh">
        <div class="qhead"><span class="lvl ${q.level}">שאלת נושא · ${LEVEL[q.level] || ''}</span>
          <span class="qact">${done ? nextBtn() : ''}</span></div>
        ${!done && !running ? `<h2 id="qh">מוכנים?</h2>
          <p class="cat">כשתתחילו יופיע נושא, ויהיו לכם <b>${q.secs} שניות</b> לתשובה <b>אחת</b>. תשובה נכונה ונדירה שווה הרבה יותר מתשובה שכולם חושבים עליה. שגיאת כתיב קטנה נסלחת.</p>
          <div class="row"><button class="btn main big" type="button" id="startBtn">▶ מתחילים</button></div>`
        : `<h2 class="prompt" id="qh">${esc(q.prompt || '')}</h2>
          ${q.examples && q.examples.length ? `<p class="cat">למשל: <b>${q.examples.map(esc).join(', ')}</b></p>` : ''}
          ${q.complete ? `<p class="cat">✓ רשימה מלאה: כל תשובה נכונה מתקבלת.</p>` : ''}
          ${(q.guesses || []).length ? listRows(q, running) : `<p class="empty">${running ? 'תשובה אחת בלבד. כתבו ולחצו שלח!' : 'לא נכתבה תשובה בזמן.'}</p>`}
          ${done && !S.practice && (q.guesses || []).length && q.guesses[0].s == null ? `<p class="acct"><button type="button" class="linkish" id="repLate">חושבים ש"${esc(q.guesses[0].w)}" נכונה? דווחו לנו</button></p>` : ''}`}
      </section>
      ${complainLink()}
      <p class="foot-note">המשחק נכתב מחדש בכל ערב · משחק חדש בחצות שעון ישראל</p>`;
    wireCard(q);
    $('#startBtn')?.addEventListener('click', startList);
    $('#repLate')?.addEventListener('click', () => { rejected = { raw: q.guesses[0].w, w: q.guesses[0].w, q: cur + 1 }; openReport(); });
  }

  /* ---------------------------------------------------------------- the clock of topic questions */
  const clocks = new Map();      // question index -> when its clock ends (ms, this device's time)
  let clockTimer = 0, chain = Promise.resolve();
  function setClock(i, endsIn) { clocks.set(i, Date.now() + Math.max(0, endsIn) * 1000); runClock(); }
  function runClock() {
    if (clockTimer) return;
    clockTimer = setInterval(() => {
      if (!S || !S.questions) return;
      for (const [i, end] of [...clocks]) {
        const q = S.questions[i];
        if (!q || q.status !== 'open') { clocks.delete(i); continue; }
        const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
        if (i === cur) {
          const c = $('#clock'), b = $('#tbar');
          if (c && c.textContent !== String(left)) { c.textContent = left; c.classList.toggle('low', left <= 10); if (left <= 10 && left > 0) SND('tick', left); }
          if (b) b.style.setProperty('--w', (100 * Math.max(0, end - Date.now())) / (q.secs * 1000) + '%');
        }
        if (end <= Date.now()) { clocks.delete(i); chain = chain.then(() => timeUp(i)); }
      }
      const l = secsLeft(cur);
      try { window.TFS && window.TFS.clock(l != null && S.questions[cur].status === 'open', l ?? 99); } catch {}
      if (!clocks.size) { clearInterval(clockTimer); clockTimer = 0; try { window.TFS && window.TFS.clock(false); } catch {} }
    }, 200);
  }
  async function timeUp(i) {
    if (S.practice) { closeList(i, S.questions[i].best, null, true); return; }
    try {
      const r = await rpc('tf_timeup', { p_day: S.day, p_q: i + 1 });
      if (!r.done) { setClock(i, r.ends_in || 1); return; }
      closeList(i, r.total, r.result, true);
    } catch (e) { onErr(e); }
  }
  function closeList(i, total, result, byClock) {
    const q = S.questions[i]; if (!q) return;
    clocks.delete(i);
    q.status = 'solved'; if (total != null) q.best = total; if (result) S.result = result;
    if (byClock) SND('timeup');
    if (i === cur && !S.finished) { draw(); if (byClock) { msg(`<div class="info">נגמר הזמן!</div>`); shout('נגמר הזמן'); } }
    else if (byClock) toast(`נגמר הזמן בשאלה ${i + 1}`);
    if (result) setTimeout(finish, 2400);
    if (S.practice && S.questions.every((x) => x.status !== 'open')) setTimeout(practiceDone, 2200);
  }
  async function startList() {
    if (busy) return;
    const q = Q(), i = cur;
    q._starting = true; drawDock(q); $('#guess')?.focus({ preventScroll: true });   // inside the tap, so phones open the keyboard
    busy = true;
    try {
      const r = S.practice ? { ...q, ends_in: q.secs } : await rpc('tf_open', { p_day: S.day, p_q: i + 1 });
      Object.assign(q, { prompt: r.prompt, examples: r.examples || [], complete: r.complete, started: true });
      SND('start'); setClock(i, r.ends_in);
      if (i === cur) { draw(); $('#guess')?.focus({ preventScroll: true }); }
    } catch (e) { q._starting = false; onErr(e); draw(); } finally { busy = false; }
  }
  function listAnswer(q, raw, w, input) {
    const i = cur;
    if (q.guesses.length) return;                 // one answer per question
    input.value = '';
    const g = { w, s: null, pending: true, n: q.guesses.length + 1 };
    q.guesses.push(g); lastWord = w; draw(); input.focus({ preventScroll: true });
    chain = chain.then(async () => {
      try {
        let r;
        if (S.practice) {           // a past game: scored on the server, kept only on this screen
          r = await rpc('tf_practice_guess', { p_day: S.day, p_q: q.q, p_word: w });
          q._hits = q._hits || new Set();
          if (r.hit && q._hits.has(r.hit)) r = { dup: true, same: true, fix: r.hit };
          else { if (r.hit) q._hits.add(r.hit); r.n = q.guesses.length; r.total = r.s || 0; }
        } else r = await rpc('tf_guess', { p_day: S.day, p_q: i + 1, p_word: w });
        if (r.dup) {
          q.guesses.splice(q.guesses.indexOf(g), 1); SND('dup');
          if (i === cur) { draw(); msg(`<div class="info">${r.same ? `"${esc(w)}" זו אותה תשובה כמו ${r.fix ? `"${esc(r.fix)}"` : 'קודם'}.` : `כבר כתבת "${esc(w)}".`}</div>`); }
          return;
        }
        Object.assign(g, { w: r.w, s: r.s, r: r.r, n: r.n, f: r.fix || null, pending: false });
        q.best = r.s || 0;
        if (r.ends_in != null) { const end = Date.now() + r.ends_in * 1000, mine = clocks.get(i); if (mine != null && Math.abs(mine - end) > 1500) clocks.set(i, end); }
        if (r.s != null) { SND(r.fix ? 'fix' : 'good', r.s); P.heat(heatOf(q)); if (r.s >= 55) { P.solve(); flash(); } } else SND('bad');
        if (i === cur && q.status === 'open') {
          draw();
          if (r.s == null) {
            rejected = { raw: raw.trim(), w, q: i + 1 };
            msg(`<div class="bad"><span>"${esc(w)}" לא ברשימה.</span><button type="button" id="repBtn">זו תשובה נכונה? דווחו</button></div>`);
            $('#repBtn')?.addEventListener('click', openReport);
          } else msg(`<div class="info"><bdi dir="ltr">+${r.s}</bdi> · ${tier(r.s)}${r.fix ? ` · התכוונת ל"${esc(r.fix)}"? נחשב` : ''}</div>`);
        }
        say(r.s == null ? `${w}: לא ברשימה` : `${w}: פלוס ${r.s}, ${tier(r.s)}`);
        const msgNow = $('#msg') ? $('#msg').innerHTML : '';
        closeList(i, q.best, r.result || null, false);
        if (i === cur && msgNow) msg(msgNow);
      } catch (e) {
        const k = q.guesses.indexOf(g); if (k >= 0 && g.pending) q.guesses.splice(k, 1);
        if (e.code === 'time_up') closeList(i, e.data && e.data.total, e.data && e.data.result, true);
        else { if (i === cur) draw(); onErr(e); }
      }
    });
  }

  function wireCard(q) {
    drawDock(q);
    app.querySelectorAll('.stop').forEach((b) => b.addEventListener('click', () => go(+b.dataset.q)));
    $('#hintBtn')?.addEventListener('click', hint);
    $('#cmpBtn')?.addEventListener('click', openComplaint);
    $('#giveBtn')?.addEventListener('click', giveUp);
    $('#nextBtn')?.addEventListener('click', () => go(nextIndex()));
  }
  const nextIndex = () => { const N = S.questions.length; for (let k = 1; k <= N; k++) { const i = (cur + k) % N; if (S.questions[i].status === 'open') return i; } return cur; };
  const nextBtn = () => (S.questions.some((x) => x.status === 'open') ? '<button class="btn main" type="button" id="nextBtn">לשאלה הבאה ←</button>' : '');

  function guessList(q) {
    const gs = q.guesses || [];
    if (!gs.length) return `<p class="empty">כתבו מילה כלשהי בעברית. נגיד לכם כמה היא קרובה במשמעות למילה הסודית.</p>`;
    const sorted = [...gs].sort((a, b) => (b.s ?? -1) - (a.s ?? -1) || a.n - b.n);
    const last = gs.find((g) => g.w === lastWord) || null;
    const row = (g, isLast) => {
      const s = g.s, win = s === 100;
      return `<li class="g ${s == null ? 'far' : ''} ${isLast ? 'last' : ''} ${g.h ? 'hint' : ''} ${win ? 'win' : ''}">
        <span class="w">${esc(g.w)}${g.r ? `<small>#${g.r}</small>` : ''}</span>
        <span class="s" style="color:${color(s)}">${s == null ? 'רחוק' : win ? '🌀' : s}</span>
        <span class="bar" aria-hidden="true"><i style="--w:${s == null ? 2 : s}%;--c:${color(s)}"></i></span>
        <span class="sr">${esc(g.w)}: ${s == null ? 'רחוק' : win ? 'זו המילה' : 'קרבה ' + s + ', ' + label(s) + (g.r ? ', מקום ' + g.r : '')}</span></li>`;
    };
    return `${last && q.status === 'open' ? `<ul class="list" aria-label="הניחוש האחרון">${row(last, true)}</ul><div class="sep">כל הניחושים (${gs.length})</div>` : ''}
      <ul class="list" aria-label="הניחושים, מהקרוב לרחוק">${sorted.map((g) => row(g, false)).join('')}</ul>`;
  }

  function drawDock(q) {
    let dock = $('#dock');
    if (!dock) { dock = document.createElement('div'); dock.id = 'dock'; dock.className = 'dock'; document.body.appendChild(dock); }
    if (!S.ready || S.finished || q.status !== 'open' || (timed(q) && ((!q.started && !q._starting) || q.guesses.length))) { dock.innerHTML = ''; dock.hidden = true; return; }
    dock.hidden = false;
    if (!$('#guessForm')) {
      dock.innerHTML = `<div class="msg" id="msg" role="status"></div>
        <form id="guessForm" autocomplete="off">
          <label class="sr" for="guess">הניחוש שלך</label>
          <input id="guess" name="guess" dir="rtl" lang="he" inputmode="text" enterkeyhint="send" autocapitalize="off" spellcheck="false" maxlength="40" placeholder="${isList(q) ? 'כתבו תשובה…' : 'נחשו מילה…'}" required>
          <button class="btn main" type="submit">${isList(q) ? 'שלח' : 'נחש'}</button>
        </form>`;
      $('#guessForm').addEventListener('submit', (e) => { e.preventDefault(); guess(); });
      // phones scroll the page to show the input; the play screen never scrolls
      $('#guess').addEventListener('focus', () => { setTimeout(() => window.scrollTo(0, 0), 60); setTimeout(() => window.scrollTo(0, 0), 350); });
    } else {
      $('#guess').placeholder = isList(q) ? 'כתבו תשובה…' : 'נחשו מילה…';
      $('#guessForm .btn').textContent = isList(q) ? 'שלח' : 'נחש';
    }
  }
  const msg = (html) => { const m = $('#msg'); if (m) m.innerHTML = html; };

  function drawNotReady() {
    document.getElementById('dock')?.remove();
    app.innerHTML = `<section class="stage"><div class="heat" style="color:var(--cy)">⌛</div></section>
      <section class="card"><h2>המשחק של היום בדרך</h2><p class="cat">הפורטל עוד נטען. בדרך כלל זה לוקח כמה דקות אחרי חצות. נבדוק שוב לבד.</p></section>`;
    setTimeout(boot, 60000);
  }

  let countdownTimer = 0;
  function drawDone() {
    document.getElementById('dock')?.remove(); document.body.classList.remove('play');
    const r = S.result || {}, grid = r.grid || [];
    $('#dayLabel').textContent = (S.practice ? 'אימון · ' : '') + dayText(S.day);
    app.innerHTML = `
      <section class="stage"><div class="solvedword">${r.points || 0} נקודות</div><div class="heatlab">סיימת את המשחק של היום</div></section>
      <section class="card done">
        <h2>הפורטל של היום</h2>
        <div class="kv"><div><b>${S.questions.filter((q) => !isList(q) && q.status === 'solved').length}/${S.questions.filter((q) => !isList(q)).length}</b><small>מילים סודיות שמצאת</small></div><div><b>${r.guesses ?? 0}</b><small>ניחושים</small></div><div><b>${r.points ?? 0}</b><small>נקודות</small></div></div>
        <div class="grid10">${S.questions.map((q, i) => `<button type="button" class="cell ${q.status}" data-q="${i}"><b>${isList(q) ? `<bdi dir="ltr">+${q.best || 0}</bdi>` : esc(q.word || '?')}</b><small>${isList(q) ? esc(shortPrompt(q.prompt)) : q.status === 'solved' ? guessesText(grid[i]?.guesses) : 'ויתרת'}</small></button>`).join('')}</div>
        <div class="row"><button class="btn main" type="button" id="shareBtn">שיתוף התוצאה</button><button class="btn" type="button" id="archBtn">משחקים קודמים</button><span id="stats" class="cat"></span></div>
      </section>
      <section class="card"><h2>המשחק הבא בעוד</h2><div class="count" id="count">--:--:--</div><p class="cat">בחצות שעון ישראל נפתח משחק חדש, עם עשר מילים חדשות ופורטל חדש.</p></section>
      <p class="foot-note">התוצאות נשמרות בחשבון. בקרוב הן יעזרו גם בחווה.</p>`;
    app.querySelectorAll('.cell').forEach((b) => b.addEventListener('click', () => review(+b.dataset.q)));
    $('#shareBtn').addEventListener('click', share);
    $('#archBtn').addEventListener('click', openArchive);
    rpc('tf_stats').then((s) => { if (s && s.finished > 1 && $('#stats')) $('#stats').textContent = `היום סיימו ${s.finished} שחקנים.`; }).catch(() => {});
    tick();
  }
  /* ---------------------------------------------------------------- past games, again and again (like Wazari) */
  let TODAY = null;              // today's state while a past game is played
  async function openArchive() {
    let days = [];
    try { days = await rpc('tf_archive'); } catch (e) { toast(ERR.net); return; }
    const best = store.get('tf.practice', {});
    dialog(`<h2>משחקים קודמים</h2>
      <p>שחקו שוב בכל משחק מהימים הקודמים, כמה פעמים שרוצים. זה אימון: הנקודות לא נספרות. המשחק היומי נשאר פעם אחת ביום.</p>
      ${days.length ? `<div class="days">${days.map((d) => `<button type="button" class="btn dayb" data-day="${d.day}"><b>${dayText(d.day).replace('המשחק של ', '')}</b>${d.title ? `<small>${esc(d.title)}</small>` : ''}<small>${best[d.day] ? `השיא שלך: ${best[d.day]}` : `${d.n} שאלות`}</small></button>`).join('')}</div>` : '<p>עוד אין משחקים קודמים. מחר כבר יהיה.</p>'}
      <div class="foot"><button class="btn ghost" value="cancel">סגירה</button></div>`, (d) => {
      d.querySelectorAll('.dayb').forEach((b) => b.addEventListener('click', () => { d.close(); startPractice(b.dataset.day); }));
    });
  }
  async function startPractice(day) {
    try {
      const g = await rpc('tf_practice_open', { p_day: day });
      if (!TODAY) TODAY = { S, cur };
      clocks.clear(); chain = Promise.resolve();
      S = { practice: true, ready: true, finished: false, day: g.day, title: g.title, portal: g.portal,
        questions: (g.questions || []).map((x) => ({ ...x, status: 'open', started: false, best: 0, hints: 0, guesses: [] })) };
      if (!S.questions.length) { toast('אין במשחק הזה שאלות נושא'); return backToToday(); }
      cur = 0; lastWord = null; draw(); P.question(0, 0);
      $('#dayLabel').textContent = 'אימון · ' + dayText(g.day).replace('המשחק של ', '');
    } catch (e) { onErr(e); }
  }
  function practiceDone() {
    if (!S.practice) return;
    const total = S.questions.reduce((a, q) => a + (q.best || 0), 0), best = store.get('tf.practice', {});
    const record = total > (best[S.day] || 0); if (record) { best[S.day] = total; store.set('tf.practice', best); }
    clocks.clear(); document.getElementById('dock')?.remove(); document.body.classList.remove('play');
    SND('finale', 3); P.finale(3);
    app.innerHTML = `<section class="stage"><div class="solvedword">${total} נקודות</div><div class="heatlab">${record ? 'שיא חדש למשחק הזה!' : `השיא שלך במשחק הזה: ${best[S.day]}`}</div></section>
      <section class="card done"><h2>סיימת את המשחק של ${dayText(S.day).replace('המשחק של ', '')}</h2>
        <div class="grid10">${S.questions.map((q) => `<div class="cell solved"><b><bdi dir="ltr">+${q.best || 0}</bdi></b><small>${esc(shortPrompt(q.prompt))}</small></div>`).join('')}</div>
        <div class="row"><button class="btn main" type="button" id="againBtn">שוב!</button><button class="btn" type="button" id="archBtn">משחק אחר</button><button class="btn ghost" type="button" id="todayBtn">למשחק היומי</button></div></section>`;
    $('#againBtn').addEventListener('click', () => startPractice(S.day));
    $('#archBtn').addEventListener('click', openArchive);
    $('#todayBtn').addEventListener('click', backToToday);
  }
  function backToToday() {
    clocks.clear(); chain = Promise.resolve();
    if (TODAY) { S = TODAY.S; cur = TODAY.cur; TODAY = null; } else S = null;
    boot();
  }

  function review(i) {
    cur = i; S.finished = false; draw(); S.finished = true;
    $('#nextBtn')?.remove();
    const back = document.createElement('button'); back.className = 'btn'; back.type = 'button'; back.textContent = 'חזרה לסיכום';
    back.addEventListener('click', drawDone); $('.qact')?.replaceChildren(back);
    P.question(cur, heatOf(Q()));
  }
  function tick() {
    clearInterval(countdownTimer);
    const end = new Date(S.next).getTime();
    const f = () => {
      const ms = end - Date.now(), el = $('#count');
      if (ms <= 0) { clearInterval(countdownTimer); boot(); return; }
      if (el) { const s = Math.floor(ms / 1000); el.textContent = [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n) => String(n).padStart(2, '0')).join(':'); }
    };
    f(); countdownTimer = setInterval(f, 1000);
  }
  const shortPrompt = (p) => { const t = String(p || '').replace(/\s*\(.*\)\s*$/, ''); return t.length > 34 ? t.slice(0, 32) + '…' : t; };
  const guessesText = (n) => (n === 1 ? 'ניחוש אחד' : `${n ?? 0} ניחושים`);
  const dayText = (d) => { const [y, m, dd] = d.split('-'); return `המשחק של ${+dd}.${+m}.${y}`; };

  /* ---------------------------------------------------------------- actions */
  function go(i) {
    cur = Math.max(0, Math.min(S.questions.length - 1, i)); lastWord = null; draw(); SND('nav');
    const q = Q(); P.question(cur, heatOf(q));
    if (q.status === 'open') $('#guess')?.focus({ preventScroll: true });
  }

  let rejected = null;
  async function guess() {
    if (busy) return;
    const input = $('#guess'), raw = input.value, w = norm(raw), q = Q();
    if (!w) return;
    if (!validShape(w)) { msg('<div class="bad">רק אותיות בעברית, בלי מספרים או סימנים.</div>'); shake(); SND('bad'); return; }
    if (timed(q)) { if (q.started && q.status === 'open') listAnswer(q, raw, w, input); return; }
    if (q.guesses.some((g) => g.w === w)) { lastWord = w; draw(); msg(`<div class="info">כבר ניחשת "${esc(w)}".</div>`); input.value = ''; input.focus(); return; }
    busy = true;
    if (isList(q)) {
      try {
        const r = await rpc('tf_guess', { p_day: S.day, p_q: cur + 1, p_word: w });
        if (r.dup) { msg(`<div class="info">${r.same ? 'זו אותה תשובה כמו קודם, בצורה אחרת.' : `כבר ענית "${esc(w)}".`}</div>`); return; }
        input.value = '';
        q.guesses.push({ w: r.w, s: r.s, r: r.r, h: false, n: r.n }); lastWord = r.w;
        q.best = r.total; q.left = r.left;
        if (r.done) { q.status = 'solved'; if (r.result) S.result = r.result; }
        if (r.s != null) { SND('good', r.s); P.heat(heatOf(q)); if (r.s >= 55) { P.solve(); flash(); } } else SND('bad');
        draw();
        if (r.s == null) {
          rejected = { raw: raw.trim(), w, q: cur + 1 };
          msg(`<div class="bad"><span>"${esc(w)}" לא ברשימת התשובות.</span><button type="button" id="repBtn">חושבים שזו תשובה נכונה? דווחו לנו</button></div>`);
          $('#repBtn')?.addEventListener('click', openReport);
        } else msg(`<div class="info"><bdi dir="ltr">+${r.s}</bdi> · ${tier(r.s)}</div>`);
        say(r.s == null ? `${w}: לא ברשימה` : `${w}: פלוס ${r.s}, ${tier(r.s)}`);
        if (r.result) setTimeout(finish, 2400);
        else $('#guess')?.focus({ preventScroll: true });
      } catch (e) { onErr(e); } finally { busy = false; }
      return;
    }
    try {
      const ok = await known(w);
      if (!ok) {
        rejected = { raw: raw.trim(), w, q: cur + 1 };
        const done = store.get('tf.reported', []).includes(w);
        msg(`<div class="bad"><span>המילה "${esc(w)}" אינה ברשימה.</span>${done ? '<span class="cat">כבר דיווחת עליה, תודה.</span>' : '<button type="button" id="repBtn">סליחה, המילה הזאת כן קיימת? דווח לנו</button>'}</div>`);
        $('#repBtn')?.addEventListener('click', openReport);
        shout(`המילה ${w} אינה ברשימה`); shake(); SND('bad'); return;
      }
      const r = await rpc('tf_guess', { p_day: S.day, p_q: cur + 1, p_word: w });
      input.value = '';
      if (r.dup) { lastWord = r.w; draw(); msg(`<div class="info">כבר ניחשת "${esc(r.w)}".</div>`); return; }
      q.guesses.push({ w: r.w, s: r.s, r: r.r, h: false, n: r.n });
      lastWord = r.w;
      if (r.solved) {
        q.status = 'solved'; q.word = r.word; q.category = r.category; q.best = 100;
        if (r.result) { S.result = r.result; }
        P.solve(); flash(); SND('solve'); shout(`מצאת! המילה היא ${r.word}`);
        draw();
        if (r.result) setTimeout(finish, 2600);
        return;
      }
      q.best = Math.max(q.best || 0, r.s || 0);
      P.heat(q.best / 100); SND('near', r.s);
      draw(); say(`${r.w}: ${r.s == null ? 'רחוק' : 'קרבה ' + r.s + ', ' + label(r.s)}`);
      $('#guess')?.focus({ preventScroll: true });
    } catch (e) { onErr(e); } finally { busy = false; }
  }
  async function hint() {
    if (busy) return; busy = true;
    try {
      const q = Q(), r = await rpc('tf_hint', { p_day: S.day, p_q: cur + 1 });
      q.hints = r.hints; SND('hint');
      if (r.kind === 'category') { q.category = r.category; draw(); msg(`<div class="info">רמז: התחום הוא <b>${esc(r.category)}</b></div>`); say('רמז: התחום הוא ' + r.category); }
      else if (r.kind === 'word') { q.guesses.push({ w: r.w, s: r.s, r: r.r, h: true, n: r.n }); q.best = Math.max(q.best || 0, r.s || 0); lastWord = r.w; P.heat(q.best / 100); draw(); msg(`<div class="info">רמז: "${esc(r.w)}" קרובה ${r.s}</div>`); say(`רמז: ${r.w}, קרבה ${r.s}`); }
      else { draw(); }
    } catch (e) { onErr(e); } finally { busy = false; }
  }
  async function giveUp() {
    if (busy) return;
    if (S.practice) { if (!confirmBox('לסיים את השאלה הזאת עכשיו?')) return; closeList(cur, Q().best, null, false); return; }
    if (isList(Q())) { if (!confirmBox(timed(Q()) ? 'לסיים עכשיו, לפני שהזמן נגמר? הנקודות שצברת נשמרות.' : 'לסיים את השאלה הזאת? הנקודות שצברת נשמרות.')) return; }
    else if (!confirmBox('לוותר על המילה הזאת? המילה תיחשף ולא תוכלו לחזור אליה.')) return;
    busy = true;
    try {
      const q = Q(), r = await rpc('tf_giveup', { p_day: S.day, p_q: cur + 1 });
      if (r.list) { clocks.delete(cur); q.status = 'solved'; q.best = r.total ?? q.best; if (r.result) S.result = r.result; draw(); say('השאלה נסגרה'); if (r.result) setTimeout(finish, 1500); return; }
      q.status = 'gave'; q.word = r.word; q.category = r.category;
      if (r.result) S.result = r.result;
      P.fail(); SND('give'); draw(); shout('המילה הייתה ' + r.word);
      if (r.result) setTimeout(finish, 2200);
    } catch (e) { onErr(e); } finally { busy = false; }
  }
  const confirmBox = (t) => window.confirm(t);
  function finish() { if (S.finished) return; S.finished = true; P.finale((S.result && S.result.solved) || 0); SND('finale', (S.result && S.result.solved) || 0); draw(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function onErr(e) {
    if (e.code === 'new_day') { toast(ERR.new_day); boot(); return; }
    if (e.code === 'done') { boot(); return; }
    msg(`<div class="bad">${esc(ERR[e.code] || ERR.net)}</div>`);
  }
  function shake() { const f = $('#guessForm'); if (!f || document.body.classList.contains('less')) return; f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); }
  function flash() { if (document.body.classList.contains('less') || reduced()) return; const f = document.createElement('div'); f.className = 'flash'; document.body.appendChild(f); setTimeout(() => f.remove(), 1200); }
  function toast(t) { const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = t; document.body.appendChild(el); setTimeout(() => el.remove(), 3600); }

  async function share() {
    const r = S.result || {};
    const [y, m, d] = S.day.split('-');
    const line = S.questions.map((q) => (isList(q) ? ((q.best || 0) >= (timed(q) ? 55 : 120) ? '🟪' : (q.best || 0) > 0 ? '🟦' : '⬛') : q.status === 'solved' ? '🟨' : '⬛')).join('');
    const text = `חוות חשיבה · ${+d}.${+m}\n🌀 ${r.points} נקודות\n${line}\nbarusik.com/thinking-farm`;
    try { if (navigator.share) { await navigator.share({ text }); return; } } catch { return; }
    try { await navigator.clipboard.writeText(text); toast('התוצאה הועתקה'); } catch { toast(text); }
  }

  /* ---------------------------------------------------------------- report a refused word */
  const CATS = ['מילה עברית תקנית', 'מילה מקצועית או מדעית', 'מילה נישתית', 'סלנג מוכר', 'צורת נטייה תקינה', 'וריאציה תקינה של כתיב', 'מונח לועזי שמשמש בעברית', 'אחר'];
  function dialog(html, onReady) {
    const d = document.createElement('dialog');
    d.innerHTML = `<form method="dialog" class="dlg">${html}</form>`;
    document.body.appendChild(d);
    d.addEventListener('close', () => d.remove());
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
    d.showModal();
    onReady && onReady(d);
    return d;
  }
  function openReport() {
    if (!rejected) return;
    const { raw, w, q } = rejected;
    dialog(`<h2>דיווח על מילה שנדחתה</h2>
      <p>המילה נשמרה כמו שכתבת אותה. ספרו לנו למה היא תקינה, ואם נאשר אותה היא תיכנס למשחקים הבאים.</p>
      <div><span class="word-pill" dir="rtl">${esc(raw)}</span></div>
      <fieldset class="cats"><legend>מה סוג המילה?</legend>${CATS.map((c, i) => `<label><input type="radio" name="cat" value="${i + 1}" ${i === 0 ? 'checked' : ''}> ${c}</label>`).join('')}</fieldset>
      <label>למה היא תקינה? <textarea name="reason" maxlength="600" placeholder="למשל: מונח מוכר ברפואה, צורת רבים של…"></textarea></label>
      <label>מקור מילוני (לא חובה) <input name="source" maxlength="300" placeholder="מילון אבן-שושן, ויקימילון, האקדמיה ללשון…"></label>
      <label>הערה חופשית (לא חובה) <textarea name="note" maxlength="600"></textarea></label>
      <p id="repErr" role="alert" style="color:var(--bad)"></p>
      <div class="foot"><button class="btn main" value="send" id="repSend">שליחת הדיווח</button><button class="btn ghost" value="cancel" formnovalidate>ביטול</button></div>`, (d) => {
      d.querySelector('#repSend').addEventListener('click', async (e) => {
        e.preventDefault();
        const f = d.querySelector('form'), btn = e.currentTarget; btn.disabled = true;
        try {
          const r = await rpc('tf_report', { p_word: raw, p_category: +f.cat.value, p_reason: f.reason.value, p_source: f.source.value, p_note: f.note.value, p_q: q });
          const list = store.get('tf.reported', []); list.push(w); store.set('tf.reported', list.slice(-300));
          d.close(); msg(`<div class="info">${r.dup ? 'כבר דיווחת על המילה הזאת. תודה!' : r.count > 1 ? `תודה! ${r.count} שחקנים כבר דיווחו על "${esc(w)}". נבדוק בקרוב.` : `תודה! נבדוק את "${esc(w)}" בקרוב.`}</div>`);
        } catch (err) { btn.disabled = false; d.querySelector('#repErr').textContent = ERR[err.code] || ERR.net; }
      });
    });
  }

  /* ---------------------------------------------------------------- a complaint about the question on screen */
  const complainLink = () => S && S.practice ? '' : `<p class="acct"><button type="button" class="linkish" id="cmpBtn">משהו לא בסדר בשאלה הזאת? כתבו לנו</button></p>`;
  const KINDS = [['answer', 'תשובה נכונה שלא התקבלה'], ['score', 'הניקוד לא הוגן'], ['unclear', 'השאלה לא ברורה'], ['other', 'אחר']];
  function openComplaint() {
    const n = cur + 1, last = (Q().guesses || []).slice(-1)[0];
    dialog(`<h2>תלונה על שאלה ${n}</h2>
      <p>אנחנו קוראים כל תלונה. אם צדקתם, נתקן את השאלה.</p>
      <fieldset class="cats"><legend>על מה?</legend>${KINDS.map(([k, t], i) => `<label><input type="radio" name="kind" value="${k}" ${i === 0 ? 'checked' : ''}> ${t}</label>`).join('')}</fieldset>
      <label>התשובה או המילה (אם יש) <input name="word" maxlength="80" value="${esc(last && last.s == null ? last.w : '')}"></label>
      <label>מה קרה? <textarea name="message" maxlength="800"></textarea></label>
      <p id="cmpErr" role="alert" style="color:var(--bad)"></p>
      <div class="foot"><button class="btn main" value="send" id="cmpSend">שליחה</button><button class="btn ghost" value="cancel" formnovalidate>ביטול</button></div>`, (d) => {
      d.querySelector('#cmpSend').addEventListener('click', async (e) => {
        e.preventDefault();
        const f = d.querySelector('form'), btn = e.currentTarget; btn.disabled = true;
        try {
          const r = await rpc('tf_complain', { p_q: n, p_kind: f.kind.value, p_word: f.word.value, p_message: f.message.value });
          d.close(); toast(r.dup ? 'כבר שלחת את זה, תודה!' : 'תודה! קיבלנו.');
        } catch (err) { btn.disabled = false; d.querySelector('#cmpErr').textContent = err.code === 'empty' ? 'כתבו מילה או כמה מילים על מה שקרה.' : ERR[err.code] || ERR.net; }
      });
    });
  }

  /* ---------------------------------------------------------------- help and settings */
  function openHelp() {
    dialog(`<div class="help"><h2>איך משחקים</h2>
      <ol><li>בכל יום יש <b>עשר שאלות</b>, אותן שאלות לכל השחקנים.</li>
      <li><b>שאלת נושא</b>: לוחצים "מתחילים", מופיע נושא, ויש <b>כמה שניות</b> לתשובה <b>אחת</b>. ככל שהתשובה <b>נדירה</b> יותר, היא שווה יותר. שגיאת כתיב קטנה או מילה שלא נגמרה נחשבות.</li>
      <li><b>מילה סודית</b>: כתבו מילה אחת בעברית ונגיד כמה היא <b>קרובה במשמעות</b> למילה הסודית, לא באותיות. ככל שמתקרבים, הפורטל נפתח. יש עד 3 רמזים, ואפשר לוותר.</li>
      <li>אפשר לעבור בין השאלות בכל רגע.</li>
      <li>משחקים פעם אחת ביום. בחצות שעון ישראל מחכה משחק חדש.</li></ol></div>
      <p>במילה הסודית, הקרבה נמדדת כך:</p>
      <div class="scale"><span><b style="color:${color(95)}">90–99</b> בוער: כמעט אותו דבר</span><span><b style="color:${color(80)}">75–89</b> חם מאוד: קשר חזק</span><span><b style="color:${color(60)}">55–74</b> חם: קשר ברור</span><span><b style="color:${color(40)}">35–54</b> פושר: אותו עולם</span><span><b style="color:${color(15)}">1–34</b> קריר: קשר רחוק</span><span><b style="color:${color(null)}">רחוק</b> אין קשר שנמצא</span></div>
      <p>המספר שליד המילה (#12) הוא המקום שלה ברשימת המילים הקרובות.</p>
      <p>כל משחק נכתב מחדש בכל ערב, יחד עם הפורטל שלו.</p>
      <div class="foot"><button class="btn main" value="ok">יאללה, משחקים</button></div>`);
    store.set('tf.seenHelp', true);
  }
  function openSettings() {
    const m = motionPref();
    dialog(`<h2>הגדרות</h2>
      <div><p style="margin-bottom:8px">אנימציית הפורטל</p>
      <div class="seg" id="mot">${[['auto', 'אוטומטי'], ['full', 'מלאה'], ['lite', 'קלה'], ['off', 'כבויה']].map(([k, t]) => `<button type="button" data-m="${k}" aria-pressed="${m === k}">${t}</button>`).join('')}</div>
      <p style="margin-top:8px;font-size:13.5px">"אוטומטי" בוחר גרסה קלה במכשירים חלשים ועוצר כשהמכשיר מבקש פחות תנועה.</p></div>
      <div><p style="margin-bottom:8px">מוזיקה</p><div class="seg" id="mus">${[[true, 'פועלת'], [false, 'כבויה']].map(([k, t]) => `<button type="button" data-v="${k}" aria-pressed="${!!(window.TFS && window.TFS.music) === k}">${t}</button>`).join('')}</div></div>
      <div><p style="margin-bottom:8px">צלילים</p><div class="seg" id="sfx">${[[true, 'פועלים'], [false, 'כבויים']].map(([k, t]) => `<button type="button" data-v="${k}" aria-pressed="${!!(window.TFS && window.TFS.sfx) === k}">${t}</button>`).join('')}</div></div>
      <div class="foot"><button class="btn main" value="ok">סגירה</button></div>`, (d) => {
      d.querySelectorAll('#mot button').forEach((b) => b.addEventListener('click', () => {
        store.set('tf.motion', b.dataset.m);
        d.querySelectorAll('#mot button').forEach((x) => x.setAttribute('aria-pressed', x === b));
        try { portal && portal.destroy(); } catch {} portal = null; loadPortal();
      }));
      for (const id of ['mus', 'sfx']) d.querySelectorAll(`#${id} button`).forEach((b) => b.addEventListener('click', () => {
        if (window.TFS) window.TFS[id === 'mus' ? 'music' : 'sfx'] = b.dataset.v === 'true';
        d.querySelectorAll(`#${id} button`).forEach((x) => x.setAttribute('aria-pressed', x === b));
        sndIcon();
      }));
    });
  }
  // the speaker in the header: everything on or everything off
  const sndBtn = $('#sndBtn');
  function sndIcon() {
    if (!sndBtn) return;
    const on = !!(window.TFS && window.TFS.any);
    sndBtn.setAttribute('aria-pressed', on); sndBtn.setAttribute('aria-label', on ? 'השתקת המוזיקה והצלילים' : 'הפעלת מוזיקה וצלילים');
    sndBtn.textContent = on ? '🔊' : '🔇';
  }
  sndBtn?.addEventListener('click', () => { if (!window.TFS) return; const on = !window.TFS.any; window.TFS.music = on; window.TFS.sfx = on; sndIcon(); });
  sndIcon();
  $('#helpBtn').addEventListener('click', openHelp);
  $('#archTop')?.addEventListener('click', () => (S && S.practice ? backToToday() : openArchive()));
  $('#setBtn').addEventListener('click', openSettings);

  /* ---------------------------------------------------------------- start */
  async function boot() {
    if (S && S.practice) return;
    if (!sb) { app.innerHTML = '<section class="card"><h2>לא הצלחנו להתחבר</h2><p class="cat">נסו לרענן את הדף.</p></section>'; return; }
    try {
      await ensureUser();
      const [st, ex] = await Promise.all([rpc('tf_state'), rpc('tf_extra').catch(() => [])]);
      extra = new Set((ex || []).map((x) => (typeof x === 'string' ? x : x.tf_extra)));
      const first = !S;
      S = st;
      if (S.ready) {
        cur = S.finished ? cur : firstOpen();
        clocks.clear();
        S.questions.forEach((q, i) => { if (timed(q) && q.started && q.status === 'open') setClock(i, q.ends_in ?? 0); });
      }
      draw();
      if (S.ready && !S.finished && S.questions.every((q) => q.status !== 'open')) {
        const i = S.questions.findIndex(timed);
        if (i >= 0) rpc('tf_timeup', { p_day: S.day, p_q: i + 1 }).then((r) => { if (r && r.result) { S.result = r.result; finish(); } }).catch(() => {});
      }
      if (first) { idle(loadPortal); if (!store.get('tf.seenHelp', false) && S.ready && !S.finished) setTimeout(openHelp, 700); }
      else if (portal && S.ready) P.question(cur, heatOf(Q()));
    } catch (e) {
      console.warn(e);
      app.innerHTML = `<section class="stage"><div class="heat" style="color:var(--bad)">⚠</div></section><section class="card"><h2>הפורטל לא נענה</h2><p class="cat">${esc(ERR.net)}</p><button class="btn main" type="button" id="retry">ניסיון נוסף</button></section>`;
      $('#retry').addEventListener('click', boot);
    }
  }
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', () => { if (motionPref() === 'auto') { try { portal && portal.destroy(); } catch {} portal = null; loadPortal(); } });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && S && S.ready && S.day !== new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(new Date())) boot(); });
  boot();
})();
