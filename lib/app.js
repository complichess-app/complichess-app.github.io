/* Shared by the Barusik web apps: <script src="/lib/app.js" data-app="pk" defer></script>
   - closed for maintenance when /admin/ locks the app (Bar still gets in, with a banner)
   - picks up new versions by itself: when the app comes back to the screen or sits idle
   - the real install button: ?install=1 opens the browser's own install dialog where there is one,
     and the Add to Home Screen steps on iPhone */
(() => {
  const me = document.currentScript;
  const APP = me && me.dataset.app;
  if (!APP) return;
  const SB = 'https://iktmyrfbejtjsiehcrar.supabase.co', KEY = 'sb_publishable_vEUqQPQSE0EG7YRnwNeAbg_PzViDO1a';
  const NAME = { pk: 'Platformika', tr: 'Bar Lvovski Travel', cr: 'Barusik Crypto', pn: 'What Penina thinks', lr: 'LearnLume', cx: 'Complichess' }[APP] || 'Barusik';

  const T = {
    he: { lockT: 'אנחנו בשיפוצים', lockB: 'האפליקציה סגורה לכמה דקות בזמן שאנחנו משפרים אותה. היא תחזור לבד, אין צורך לעשות כלום.', back: 'לאתר הראשי', admin: 'נעול ללקוחות. אתה רואה את זה כי אתה המנהל.', upd: 'יש גרסה חדשה, מתעדכן…', inT: 'התקנת ', inGo: 'התקנה', inDone: 'האפליקציה מותקנת', inIos: ['לחצו על כפתור השיתוף', 'גללו ובחרו "הוסף למסך הבית"', 'לחצו "הוסף"'], inOther: ['פתחו את התפריט של הדפדפן (⋮ או ⋯)', 'בחרו "התקנת האפליקציה" או "הוסף למסך הבית"'], close: 'סגירה', auto: 'עדכונים מגיעים לבד.' },
    en: { lockT: "We're making improvements", lockB: "The app is closed for a few minutes while we work on it. It will come back by itself, you don't need to do anything.", back: 'Main site', admin: "Locked for customers. You can see it because you're the admin.", upd: 'New version, updating…', inT: 'Install ', inGo: 'Install', inDone: 'The app is installed', inIos: ['Tap the Share button', 'Scroll and choose "Add to Home Screen"', 'Tap "Add"'], inOther: ['Open the browser menu (⋮ or ⋯)', 'Choose "Install app" or "Add to Home screen"'], close: 'Close', auto: 'Updates arrive on their own.' },
    ar: { lockT: 'نعمل على تحسينات', lockB: 'التطبيق مغلق لبضع دقائق أثناء تحسينه. سيعود تلقائيًا، لا حاجة لفعل شيء.', back: 'الموقع الرئيسي', admin: 'مغلق أمام العملاء. تراه لأنك المدير.', upd: 'إصدار جديد، جارٍ التحديث…', inT: 'تثبيت ', inGo: 'تثبيت', inDone: 'التطبيق مثبّت', inIos: ['اضغط زر المشاركة', 'مرّر واختر "إضافة إلى الشاشة الرئيسية"', 'اضغط "إضافة"'], inOther: ['افتح قائمة المتصفح (⋮ أو ⋯)', 'اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"'], close: 'إغلاق', auto: 'تصل التحديثات تلقائيًا.' },
    ru: { lockT: 'Идут улучшения', lockB: 'Приложение закрыто на несколько минут, пока мы его улучшаем. Оно вернётся само, ничего делать не нужно.', back: 'Главный сайт', admin: 'Закрыто для клиентов. Вы видите это, потому что вы администратор.', upd: 'Новая версия, обновляем…', inT: 'Установить ', inGo: 'Установить', inDone: 'Приложение установлено', inIos: ['Нажмите «Поделиться»', 'Прокрутите и выберите «На экран Домой»', 'Нажмите «Добавить»'], inOther: ['Откройте меню браузера (⋮ или ⋯)', 'Выберите «Установить приложение» или «Добавить на главный экран»'], close: 'Закрыть', auto: 'Обновления приходят сами.' },
    es: { lockT: 'Estamos haciendo mejoras', lockB: 'La app está cerrada unos minutos mientras la mejoramos. Volverá sola, no hace falta hacer nada.', back: 'Sitio principal', admin: 'Cerrada para clientes. La ves porque eres el administrador.', upd: 'Nueva versión, actualizando…', inT: 'Instalar ', inGo: 'Instalar', inDone: 'La app está instalada', inIos: ['Toca el botón Compartir', 'Desliza y elige "Añadir a pantalla de inicio"', 'Toca "Añadir"'], inOther: ['Abre el menú del navegador (⋮ o ⋯)', 'Elige "Instalar app" o "Añadir a pantalla de inicio"'], close: 'Cerrar', auto: 'Las actualizaciones llegan solas.' },
    fr: { lockT: 'Nous faisons des améliorations', lockB: "L'app est fermée quelques minutes pendant que nous l'améliorons. Elle reviendra d'elle-même, rien à faire.", back: 'Site principal', admin: "Fermée aux clients. Vous la voyez parce que vous êtes l'administrateur.", upd: 'Nouvelle version, mise à jour…', inT: 'Installer ', inGo: 'Installer', inDone: "L'app est installée", inIos: ['Touchez le bouton Partager', 'Faites défiler et choisissez « Sur l’écran d’accueil »', 'Touchez « Ajouter »'], inOther: ['Ouvrez le menu du navigateur (⋮ ou ⋯)', 'Choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil »'], close: 'Fermer', auto: 'Les mises à jour arrivent seules.' },
  };
  const qs = new URLSearchParams(location.search);
  const pick = () => { let l = qs.get('lang'); try { l = l || localStorage.getItem('barusik.lang'); } catch {} l = l || document.documentElement.lang || 'he'; l = l.slice(0, 2); return T[l] ? l : 'he'; };
  const L = pick(), t = T[L], rtl = L === 'he' || L === 'ar';
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const css = document.createElement('style');
  css.textContent = `.bz-layer{position:fixed;inset:0;z-index:2147483600;display:grid;place-items:center;padding:24px;background:rgba(9,11,31,.94);color:#EEEAF8;font:16px/1.6 system-ui,-apple-system,Segoe UI,Rubik,sans-serif;backdrop-filter:blur(6px)}
.bz-card{max-width:420px;width:100%;background:#12163A;border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:28px;text-align:center;box-shadow:0 30px 80px -20px #000}
.bz-card h2{margin:10px 0 8px;font-size:22px;font-weight:800}.bz-card p{margin:0;color:#B9BBDD}.bz-card ol{text-align:start;margin:16px 0 0;padding-inline-start:22px;color:#EEEAF8}.bz-card li{margin:6px 0}
.bz-btn{display:inline-flex;align-items:center;justify-content:center;margin-top:20px;min-height:48px;padding:0 26px;border:0;border-radius:999px;background:#6A63FF;color:#fff;font:inherit;font-weight:800;text-decoration:none;cursor:pointer}
.bz-btn.g{background:transparent;border:1px solid rgba(255,255,255,.18);color:#EEEAF8;margin-inline-start:8px}
.bz-ic{font-size:44px;line-height:1}.bz-bar{position:fixed;inset-inline:0;top:0;z-index:2147483600;background:#F5B45B;color:#2B1B00;font:600 13.5px/1.4 system-ui,sans-serif;padding:6px 12px;text-align:center}
.bz-toast{position:fixed;inset-inline:0;bottom:max(18px,env(safe-area-inset-bottom));margin:auto;width:max-content;max-width:90vw;z-index:2147483601;background:#12163A;color:#EEEAF8;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:10px 18px;font:600 14px system-ui,sans-serif}`;
  document.head.appendChild(css);
  const layer = (html, id) => { document.getElementById(id)?.remove(); const el = document.createElement('div'); el.id = id; el.className = 'bz-layer'; el.dir = rtl ? 'rtl' : 'ltr'; el.lang = L; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.innerHTML = `<div class="bz-card">${html}</div>`; document.body.appendChild(el); return el; };
  const toast = (s) => { const el = document.createElement('div'); el.className = 'bz-toast'; el.setAttribute('role', 'status'); el.textContent = s; document.body.appendChild(el); setTimeout(() => el.remove(), 4000); };

  /* ---------- maintenance ---------- */
  const token = () => { try { const s = JSON.parse(localStorage.getItem('complichess-auth') || 'null'); return s && s.access_token; } catch { return null; } };
  let isAdmin = null;
  const checkAdmin = async () => {
    if (isAdmin !== null) return isAdmin;
    const tk = token(); if (!tk) return (isAdmin = false);
    try { const r = await fetch(`${SB}/rest/v1/rpc/is_admin`, { method: 'POST', headers: { apikey: KEY, Authorization: `Bearer ${tk}`, 'Content-Type': 'application/json' }, body: '{}' }); isAdmin = r.ok && (await r.json()) === true; } catch { isAdmin = false; }
    return isAdmin;
  };
  let locked = false;
  const status = async () => {
    try {
      const r = await fetch(`${SB}/rest/v1/app_status?id=eq.${APP}&select=locked,message`, { headers: { apikey: KEY, Accept: 'application/json' }, cache: 'no-store' });
      if (!r.ok) return;
      const row = (await r.json())[0];
      const now = !!(row && row.locked);
      if (now === locked) return;
      locked = now;
      if (!locked) { document.getElementById('bz-lock')?.remove(); document.getElementById('bz-bar')?.remove(); return; }
      if (await checkAdmin()) { if (!document.getElementById('bz-bar')) { const b = document.createElement('div'); b.id = 'bz-bar'; b.className = 'bz-bar'; b.textContent = '🔧 ' + t.admin; document.body.appendChild(b); } return; }
      layer(`<div class="bz-ic" aria-hidden="true">🔧</div><h2>${esc(t.lockT)}</h2><p>${esc(row.message || t.lockB)}</p><a class="bz-btn" href="/">${esc(t.back)}</a>`, 'bz-lock');
    } catch {}
  };

  /* ---------- updates ---------- */
  let mine = null, fresh = false, lastInput = Date.now();
  const busy = () => { const a = document.activeElement; return a && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) && String(a.value || a.textContent || '').length > 0; };
  const version = async () => {
    try {
      const r = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' }); if (!r.ok) return;
      const v = (await r.json())[APP]; if (!v) return;
      if (mine === null) { mine = v; return; }
      if (v !== mine) fresh = true;
    } catch {}
  };
  const apply = (why) => {
    if (!fresh || locked) return;
    if (why === 'idle' && (busy() || Date.now() - lastInput < 120000)) return;
    fresh = false;
    if (why === 'idle') toast(t.upd);
    setTimeout(() => location.reload(), why === 'idle' ? 1200 : 0);
  };
  ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach((e) => addEventListener(e, () => (lastInput = Date.now()), { passive: true }));
  document.addEventListener('visibilitychange', async () => {
    if (document.hidden) return;
    await Promise.all([version(), status()]);
    apply('back');
  });
  setInterval(async () => { if (document.hidden) return; await version(); apply('idle'); }, 5 * 60 * 1000);
  setInterval(() => { if (!document.hidden) status(); }, 60 * 1000);

  /* ---------- install ---------- */
  let deferred = null;
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; if (wantInstall) installCard(); });
  addEventListener('appinstalled', () => { deferred = null; document.getElementById('bz-in')?.remove(); toast('✓ ' + t.inDone); });
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ua = navigator.userAgent;
  const ios = /iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const wantInstall = qs.get('install') === '1';
  let shown = false;
  function installCard() {
    if (locked) return;
    if (standalone()) { toast('✓ ' + t.inDone); return; }
    const head = `<div class="bz-ic" aria-hidden="true">⬇️</div><h2>${esc(t.inT + NAME)}</h2>`;
    const close = `<button type="button" class="bz-btn g" data-x>${esc(t.close)}</button>`;
    let el;
    if (deferred) {
      el = layer(`${head}<p>${esc(t.auto)}</p><button type="button" class="bz-btn" data-go>${esc(t.inGo)}</button>${close}`, 'bz-in');
      el.querySelector('[data-go]').onclick = async () => { const d = deferred; deferred = null; el.remove(); try { await d.prompt(); const c = await d.userChoice; if (c && c.outcome === 'accepted') toast('✓ ' + t.inDone); } catch {} };
    } else {
      const steps = ios ? t.inIos : t.inOther;
      el = layer(`${head}<ol>${steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>${close}`, 'bz-in');
    }
    el.querySelector('[data-x]').onclick = () => el.remove();
    el.querySelector('button')?.focus();
    shown = true;
  }
  const clean = () => { if (!wantInstall) return; qs.delete('install'); const s = qs.toString(); history.replaceState(history.state, '', location.pathname + (s ? '?' + s : '') + location.hash); };

  const start = () => {
    status(); version();
    if (wantInstall) {
      clean();
      // Chrome, Edge and Samsung hand over their install prompt a moment after load; iPhone never does
      if (ios || standalone()) installCard(); else setTimeout(() => { if (!shown) installCard(); }, deferred ? 0 : 2500);
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.barusikInstall = installCard;
})();
