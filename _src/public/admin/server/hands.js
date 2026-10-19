/* Bar Lvovski Travel — runs inside Bar's own BeAgent tab (started by the ⚡ bookmark).
   It does the searches in hidden frames of BeAgent itself and answers Barusik's server page. Nothing is installed:
   closing or reloading the BeAgent tab stops it. Jobs are accepted only from https://barusik.com, and every job is
   checked and turned into a BeAgent results address here, so it can never open anything else. */
(() => {
  'use strict';
  if (!/(^|\.)beagent\.online$/.test(location.hostname)) { location.href = 'https://travel.beagent.online/he'; return; }
  if (window.__btHands) { window.__btHands.reconnect(); return; }
  const SERVER = 'https://barusik.com';
  const MARKUP = 1.12;
  const API = 'https://book-api.travelor.com/api';
  const VERSION = 1;

  // ---- timers that keep running even when this tab is in the background ----
  const tick = (() => {
    try {
      const w = new Worker(URL.createObjectURL(new Blob(['onmessage=e=>setTimeout(()=>postMessage(e.data),e.data.ms)'], { type: 'text/javascript' })));
      const cb = new Map(); let n = 0;
      w.onmessage = (e) => { const f = cb.get(e.data.id); cb.delete(e.data.id); f && f(); };
      return (ms) => new Promise((r) => { const id = ++n; cb.set(id, r); w.postMessage({ id, ms }); });
    } catch { return (ms) => new Promise((r) => setTimeout(r, ms)); }
  })();

  // ---- small badge so Bar sees it's on ----
  const badge = document.createElement('div');
  badge.setAttribute('role', 'status');
  badge.style.cssText = 'position:fixed;z-index:2147483647;bottom:14px;left:14px;font:600 14px/1.3 system-ui,Arial;background:#0B1B33;color:#fff;border-radius:999px;padding:9px 16px 9px 12px;box-shadow:0 8px 30px rgba(0,0,0,.35);direction:rtl;display:flex;gap:8px;align-items:center;cursor:pointer';
  const setBadge = (color, text) => { badge.innerHTML = `<span style="width:11px;height:11px;border-radius:50%;background:${color};box-shadow:0 0 8px ${color}"></span>${text}`; };
  setBadge('#F59E0B', 'שרת ברוסיק: מתחבר…');
  badge.title = 'לחיצה פותחת את חלון השרת';
  document.body.appendChild(badge);

  // ---- talking to the server page ----
  let server = null, acked = false;
  const post = (m) => { try { server && server.postMessage({ src: 'bt-hands', ...m }, SERVER); } catch {} };
  function openServer() {
    try { if (window.opener && !window.opener.closed) server = window.opener; } catch {}
    if (!server || server.closed) server = window.open(SERVER + '/admin/server/', 'bt-server', 'popup,width=560,height=760');
  }
  badge.onclick = () => { server = window.open(SERVER + '/admin/server/', 'bt-server', 'popup,width=560,height=760'); acked = false; hello(); };
  async function hello() { for (let i = 0; i < 60 && !acked; i++) { post({ type: 'hello', version: VERSION }); await tick(1000); } }
  (async () => { for (;;) { await tick(10000); if (acked) post({ type: 'alive' }); } })();

  addEventListener('message', (e) => {
    if (e.origin !== SERVER || !e.data || e.data.src !== 'bt-page') return;
    server = e.source;
    if (e.data.type === 'ack') { acked = true; setBadge('#22C55E', 'שרת ברוסיק פעיל — השאר את הלשונית פתוחה'); return; }
    if (e.data.type === 'stop') { acked = false; setBadge('#EF4444', 'שרת ברוסיק כבוי (לחץ להפעלה)'); return; }
    if (e.data.type !== 'job' || !e.data.id) return;
    const { id, job } = e.data;
    run(job || {}).then((data) => post({ type: 'result', id, ok: true, data }), (err) => post({ type: 'result', id, ok: false, error: String((err && err.message) || err).slice(0, 200) }));
  });

  // ---- BeAgent API (uses this tab's own login) ----
  function token() {
    for (let i = 0; i < localStorage.length; i++) {
      const m = (localStorage.getItem(localStorage.key(i)) || '').match(/eyJ[\w-]+\.[\w-]+\.[\w-]+/);
      if (m) return m[0];
    }
    return null;
  }
  const loggedIn = () => !/(login|sign-?in|auth|register)/i.test(location.pathname) && !!token();
  async function api(method, path, body) {
    const t = token(); if (!t) throw new Error('no-login');
    const h = { Authorization: 'Bearer ' + t, accept: 'application/json, text/plain, */*' };
    if (body) h['content-type'] = 'application/json';
    const r = await fetch(API + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
    if (r.status === 401) throw new Error('no-login');
    if (!r.ok) throw new Error('api-' + r.status);
    return r.json();
  }
  const meta = () => ({ PageUrl: location.origin + '/he', Langunge: 'he', Device: 2, Currency: 5, TimeStamp: new Date().toISOString(), NewSite: true, DeviceIP: null });

  async function suggest(q) {
    const text = String(q.q || '').trim().slice(0, 60);
    const map = (j) => (j.data || []).slice(0, 12).map((x) => ({ title: x.title, value: x.value, sub: x.subTitle || '' }));
    const geo = async (type) => {
      if (text.length < 2) return type === 'packages' ? map(await api('GET', '/geo/packages/recommended?lang=he')) : [];
      return map(await api('GET', `/geo/${type}/autocomplete?query=${encodeURIComponent(text)}&lang=he`));
    };
    if (q.kind === 'flights') return geo('flights');
    if (q.kind === 'packages' || q.kind === 'tours') return geo('packages');
    if (q.kind === 'tickets') return geo('tickets');
    if (/^cars-(country|city|station)$/.test(q.kind)) {
      const t = q.kind === 'cars-country' ? 1 : q.kind === 'cars-city' ? 2 : 3;
      const dr = { requestType: t };
      if (t >= 2) { if (!q.country) return []; dr.pickUpCountry = { name: String(q.country).slice(0, 60) }; }
      if (t === 3) { if (!q.city) return []; dr.pickUpCity = { name: String(q.city).slice(0, 60) }; }
      const j = await api('POST', '/cars/Destinations', { destinationRequest: dr, ...meta(), driverNationality: 'IL' });
      const d = (j && j.destinationResponse) || {};
      const nm = (s) => String(s || '').replace(/ /g, ' ');
      if (t === 1) return (d.countries || []).filter((x) => x.name).map((x) => ({ title: nm(x.name), value: x.name }));
      if (t === 2) return (d.cities || []).filter((x) => x.name).map((x) => ({ title: nm(x.name), value: x.name }));
      return (d.stations || []).filter((x) => x.name).map((x) => ({ title: nm(x.name), value: String(x.stationId) }));
    }
    throw new Error('bad-request');
  }

  const DATE = /^\d{4}-\d{2}-\d{2}$/;
  async function packageDates(q) {
    const code = String(q.code || '').toUpperCase();
    if (!/^[A-Z]{3}$/.test(code)) throw new Error('bad-request');
    const dep = q.dep && DATE.test(q.dep) ? q.dep : null;
    const j = await api('POST', '/Packages/Calendar', { CalendarRequest: { SelectedDeparture: dep, DestinationCode: code, PackageFeature: null }, FromDate: null, ToDate: null, ...meta() });
    const deps = (j && j.calendarResponse && j.calendarResponse.departureDates) || [];
    const fix = (d) => ({ date: String(d.date || d).slice(0, 10), price: d.minPrice ? Math.round(d.minPrice * MARKUP) : null });
    const out = dep ? ((deps.find((d) => String(d.date).slice(0, 10) === dep) || deps[0] || {}).returnDates || []).map(fix) : deps.map(fix);
    const today = new Date().toISOString().slice(0, 10);
    return out.filter((d) => DATE.test(d.date) && d.date >= today);
  }

  // ---- searches ----
  function okDate(s) {
    if (!DATE.test(s || '')) return false;
    const t = Date.parse(s + 'T12:00:00Z'), now = Date.now();
    return t > now - 86400000 && t < now + 400 * 86400000;
  }
  const int = (v, lo, hi) => { const n = parseInt(v, 10); return Number.isFinite(n) && n >= lo && n <= hi ? n : null; };
  const clean = (s, n = 60) => String(s || '').replace(/[<>"]/g, '').trim().slice(0, n);
  function buildUrl(q) {
    const U = (p, params) => { const u = new URL(location.origin + p); for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v); return u.toString(); };
    if (q.kind === 'flights') {
      const from = String(q.from || '').toUpperCase(), to = String(q.to || '').toUpperCase();
      if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to) || from === to || !okDate(q.dep)) return null;
      const adults = int(q.adults, 1, 9); if (!adults) return null;
      const p = { departureCodes: from, arrivalCodes: to, departureDates: q.dep };
      if (q.ret) { if (!okDate(q.ret) || q.ret < q.dep) return null; p.arrivalDates = q.ret; p.routeType = '2'; } else p.routeType = '1';
      p.pax = '1_' + adults; p.flightClass = String(int(q.cls || 1, 1, 4) || 1);
      return { url: U('/he/flights/results', p), cta: 'בחירת כרטיסים' };
    }
    if (q.kind === 'hotels') {
      const lat = Number(q.lat), lng = Number(q.lng);
      if (!(Math.abs(lat) <= 90 && Math.abs(lng) <= 180) || !okDate(q.in) || !okDate(q.out) || q.out <= q.in) return null;
      const adults = int(q.adults, 1, 6); if (!adults) return null;
      return { url: U('/he/hotels/place/x/results', { check_in: q.in, check_out: q.out, guests: Array(adults).fill('a').join(','), country: 'IL', currency: 'ILS',
        radius: String(int(q.radius, 500, 20000) || 3000), latitude: lat.toFixed(6), longitude: lng.toFixed(6), take: '48', sort_by: 'popular', sort: 'desc' }), cta: 'הצג חדרים' };
    }
    if (q.kind === 'cars') {
      const country = clean(q.country), city = clean(q.city), station = String(q.station || '');
      if (!country || !city || !/^\d{1,12}$/.test(station) || !okDate(q.from) || !okDate(q.to) || q.to < q.from) return null;
      const tm = (t) => (/^([01]\d|2[0-3]):(00|30)$/.test(t || '') ? t : '12:00');
      return { url: U('/he/cars/results', { pickUpCountry: country, pickUpCity: city, pickUpStation: station, dropOffCountry: country, dropOffCity: city, dropOffStation: station,
        driverNationality: 'IL', fromDate: q.from, toDate: q.to, fromTime: tm(q.fromTime), toTime: tm(q.toTime), driverAge: String(int(q.age, 18, 99) || 30) }), cta: 'לפרטי השכרה' };
    }
    if (q.kind === 'packages') {
      const code = String(q.code || '').toUpperCase(); const adults = int(q.adults, 1, 6);
      if (!/^[A-Z]{3}$/.test(code) || !okDate(q.from) || !okDate(q.to) || q.to <= q.from || !adults) return null;
      return { url: U('/he/packages/results', { destinationCode: code, fromDate: q.from, toDate: q.to, rooms: '1_' + adults, packageFeature: '0' }), cta: 'בחירת חדרים' };
    }
    if (q.kind === 'tours') {
      const code = String(q.code || '').toUpperCase();
      if (!/^[A-Z]{3}$/.test(code) || !/^\d{4}-\d{2}$/.test(q.month || '')) return null;
      return { url: U('/he/trips/results', { destinationCode: code, fromDate: q.month + '-01', category: '0' }), cta: 'לפרטי טיול' };
    }
    if (q.kind === 'tickets') {
      const target = String(q.target || '');
      if (!/^\d{1,9}_\d{1,3}$/.test(target) || !okDate(q.from) || !okDate(q.to) || q.to < q.from) return null;
      return { url: U('/he/event-tickets/results', { target, fromDate: q.from, toDate: q.to, destinationQuery: '' }), cta: 'בחירה כרטיסים' };
    }
    return null;
  }

  // Anything that could reveal Bar's agent side is dropped from the results.
  const PRIVATE = /עמלה|עמלת|commission|נטו|net price|רווח|profit|סוכן|agent|ארנק|wallet|יתרה|balance|קרדיט|credit/i;
  const SKIP = /^(פירוט המחיר|מידע חשוב|בחירת כרטיסים|בחירה כרטיסים|הצג חדרים|בחירת חדרים|לפרטי השכרה|לפרטי טיול|הצג במפה|מדיניות דלק|שעות טיסה|בסיס אירוח|כבודה|\d|₪)$/;
  const money = (n) => '₪' + Math.round(n).toLocaleString('en-US');
  const markup = (line) => line
    .replace(/₪\s?([\d,]+(?:\.\d+)?)/g, (_, v) => money(parseFloat(v.replace(/,/g, '')) * MARKUP))
    .replace(/([\d,]+(?:\.\d+)?)\s?₪/g, (_, v) => money(parseFloat(v.replace(/,/g, '')) * MARKUP));
  function tidy(lines) {
    const out = [];
    for (let i = 0; i < lines.length; i++) {
      let l = lines[i];
      if (l === '₪' && /^[\d,]+$/.test(lines[i + 1] || '')) { l = '₪' + lines[i + 1]; i++; }
      if (/[:\-]$/.test(l) && lines[i + 1] && !/[:]$/.test(lines[i + 1]) && l.length < 20) { l = l + ' ' + lines[i + 1]; i++; }
      out.push(l.replace(/ /g, ' '));
    }
    return out;
  }
  function extract(doc, cta) {
    const isCta = (b) => (b.innerText || '').trim() === cta;
    const btns = [...doc.querySelectorAll('button,a')].filter((b) => isCta(b) && b.getClientRects().length > 0);
    const src = (i) => i.currentSrc || i.src || '';
    const big = (i) => (i.naturalWidth || i.width) >= 150 && /^https:\/\//.test(src(i));
    const bigImg = (el) => [...el.querySelectorAll('img')].find(big);
    const bigCount = (el) => [...el.querySelectorAll('img')].filter(big).length;
    const lines = (t) => t.split(/[\n\t]/).map((s) => s.trim()).filter(Boolean);
    const heads = new Map(); const out = []; const seen = new Set();
    for (const b of btns) {
      let row = b;
      while (row.parentElement && !(/₪/.test(row.innerText) && row.innerText.length > 40)) row = row.parentElement;
      if (!row || row === doc.body) continue;
      let g = row, group = null;
      for (let k = 0; k < 9 && g && g !== doc.body; k++) {
        if (bigImg(g)) { group = g; break; }
        const p = g.parentElement;
        if (!p || p === doc.body || bigCount(p) > 1) break;
        g = p;
      }
      if (!group) {
        let c = row;
        while (c.parentElement && c.parentElement !== doc.body && btns.filter((x) => c.parentElement.contains(x)).length === 1) c = c.parentElement;
        if (c !== row) group = c;
      }
      let head = [], img = null;
      if (group && group !== row) {
        if (!heads.has(group)) {
          const first = lines(row.innerText)[0] || '';
          const all = group.innerText; const idx = first ? all.indexOf(first) : -1;
          heads.set(group, lines(idx > 0 ? all.slice(0, idx) : ''));
        }
        head = heads.get(group); img = bigImg(group);
      } else if (group === row) img = bigImg(row);
      const rowLines = lines(row.innerText);
      const sig = head.join('|') + '#' + rowLines.join('|');
      if (seen.has(sig)) continue; seen.add(sig);
      const pick = (el) => [...el.querySelectorAll('img')].filter((i) => i !== img && /^https:\/\//.test(src(i))).map(src);
      let logos = pick(row); if (!logos.length && group) logos = pick(group);
      out.push({ head, rows: rowLines, img: img ? src(img) : null, logos: logos.slice(0, 3) });
      if (out.length >= 40) break;
    }
    return out;
  }

  let running = 0; const waiting = [];
  const slot = () => new Promise((res) => { if (running < 2) { running++; res(); } else waiting.push(res); });
  const free = () => { const n = waiting.shift(); if (n) n(); else running--; };

  async function runSearch(q) {
    const target = buildUrl(q);
    if (!target) throw new Error('bad-request');
    await slot();
    const f = document.createElement('iframe');
    f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1;
    f.style.cssText = 'position:fixed;left:-5000px;top:0;width:1400px;height:1000px;border:0;opacity:0;pointer-events:none';
    f.src = target.url;
    document.body.appendChild(f);
    try {
      let last = -1, stable = 0;
      for (let i = 0; i < 60; i++) {
        await tick(1000);
        let d; try { d = f.contentDocument; } catch { continue; }
        if (!d || !d.body) continue;
        let path = ''; try { path = f.contentWindow.location.pathname; } catch {}
        if (/(login|sign-?in|auth)/i.test(path)) throw new Error('no-login');
        const n = [...d.querySelectorAll('button,a')].filter((b) => (b.innerText || '').trim() === target.cta).length;
        const none = /לא מצאנו|לא נמצאו|אין תוצאות|no results/i.test(d.body.innerText || '');
        if (none && n === 0 && i > 5) break;
        if (n > 0 && n === last) { if (++stable >= 4) break; } else stable = 0;
        last = n;
      }
      for (let i = 0; i < 2; i++) { try { f.contentWindow.scrollTo(0, f.contentDocument.body.scrollHeight); } catch {} await tick(1500); }
      const raw = extract(f.contentDocument, target.cta);
      const results = raw.map((r) => {
        const head = tidy(r.head).filter((l) => !SKIP.test(l) && !PRIVATE.test(l) && !/₪|החל מ/.test(l) && !/^[\d,.\s]+$/.test(l) && l.length < 120);
        const rows = tidy(r.rows).filter((l) => !SKIP.test(l) && !PRIVATE.test(l) && l.length < 160).map(markup);
        const tot = rows.findIndex((l) => /סה.?כ/.test(l));
        const pm = (tot >= 0 ? rows.slice(tot).join(' ') : rows.join(' ')).match(/₪[\d,]+/);
        return { head, lines: rows, img: r.img, logos: r.logos, price: pm ? parseInt(pm[0].replace(/\D/g, ''), 10) : null };
      }).filter((r) => r.price);
      return { kind: q.kind, results, link: target.url, at: new Date().toISOString() };
    } finally { f.remove(); free(); }
  }

  async function run(j) {
    if (j.type === 'start') return { loggedIn: loggedIn() };
    if (j.type === 'search') return runSearch(j.params || {});
    if (j.type === 'suggest') return suggest(j.params || {});
    if (j.type === 'pkgdates') return packageDates(j.params || {});
    throw new Error('bad-request');
  }

  window.__btHands = { reconnect: () => { acked = false; openServer(); hello(); } };
  if (!loggedIn()) setBadge('#EF4444', 'צריך להתחבר ל-BeAgent ואז ללחוץ שוב על ⚡');
  openServer(); hello();
})();
