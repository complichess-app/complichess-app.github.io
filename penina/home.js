/* What Penina thinks: the account at the top and the two tabs, my chats and a new chat · © 2026 Bar Lvovski. All rights reserved. */
'use strict';
(function () {
  const X = {
    he: { tabMine: 'הצ׳אטים שלי', tabNew: 'לנתח צ׳אט חדש', signIn: 'התחברות', signOut: 'יציאה', signUp: 'הרשמה', inT: 'מתחברים ורואים את כל הצ׳אטים שלכם', upT: 'פותחים חשבון, זה לוקח חצי דקה', uname: 'שם משתמש', inGo: 'להתחבר', upGo: 'לפתוח חשבון', toUp: 'אין חשבון? הרשמה', toIn: 'יש חשבון? התחברות', forgot: 'שכחתי סיסמה', google: 'כניסה עם Google', or: 'או', later: 'לא עכשיו', agree: 'בהרשמה אתם מסכימים ל{t} ול{p}.', terms: 'תנאי השימוש', priv: 'מדיניות הפרטיות', badMail: 'המייל לא נראה תקין', short: 'סיסמה של 6 תווים לפחות, ושם משתמש של 2 עד 20 תווים', taken: 'השם הזה תפוס, נסו אחר', exists: 'כבר יש חשבון עם המייל הזה. התחברו במקום.', check: 'שלחנו לכם מייל. לחצו על הקישור שבו ואז התחברו כאן.', sent: 'שלחנו מייל לאיפוס הסיסמה.', needIn: 'קודם מתחברים, כאן למעלה.', hi: 'שלום, {n}', mineEmpty: 'עוד אין כאן צ׳אטים. מעלים צ׳אט מוואטסאפ ופנינה כבר תגיד מה היא חושבת.', onDevice: 'שמור במכשיר הזה', cont: 'להמשיך', upload: 'להעלות את הצ׳אט', reqFrom: 'בקשה מ־{d}', stLocal: 'עוד לא נשלח לפנינה', stPending: 'מחכה לאישור', stApproved: 'אושר, אפשר לקבל את הדוח', stApprovedUp: 'אושר. מעלים את הצ׳אט ומקבלים את הדוח', stDeclined: 'לא אושר', stWriting: 'פנינה באמצע לכתוב' },
    en: { tabMine: 'My chats', tabNew: 'Analyse a new chat', signIn: 'Sign in', signOut: 'Sign out', signUp: 'Sign up', inT: 'Sign in to see all your chats', upT: 'Open an account, it takes half a minute', uname: 'Username', inGo: 'Sign in', upGo: 'Create account', toUp: 'No account? Sign up', toIn: 'Have an account? Sign in', forgot: 'Forgot password', google: 'Continue with Google', or: 'or', later: 'Not now', agree: 'By signing up you agree to the {t} and the {p}.', terms: 'terms of use', priv: 'privacy policy', badMail: 'That e-mail doesn’t look right', short: 'A password of at least 6 characters and a username of 2 to 20', taken: 'That name is taken, try another', exists: 'There’s already an account with this e-mail. Sign in instead.', check: 'We sent you an e-mail. Tap the link in it, then sign in here.', sent: 'We sent a password reset e-mail.', needIn: 'Sign in first, up here.', hi: 'Hi, {n}', mineEmpty: 'No chats here yet. Upload a WhatsApp chat and Penina will tell you what she thinks.', onDevice: 'Saved on this device', cont: 'Continue', upload: 'Upload the chat', reqFrom: 'Request from {d}', stLocal: 'Not sent to Penina yet', stPending: 'Waiting for approval', stApproved: 'Approved, get the report', stApprovedUp: 'Approved. Upload the chat to get the report', stDeclined: 'Not approved', stWriting: 'Penina is writing' },
    ar: { tabMine: 'محادثاتي', tabNew: 'تحليل محادثة جديدة', signIn: 'الدخول', signOut: 'خروج', signUp: 'التسجيل', inT: 'سجّلوا الدخول لرؤية كل محادثاتكم', upT: 'افتحوا حسابًا، يستغرق نصف دقيقة', uname: 'اسم المستخدم', inGo: 'الدخول', upGo: 'فتح حساب', toUp: 'لا حساب؟ التسجيل', toIn: 'لديكم حساب؟ الدخول', forgot: 'نسيت كلمة المرور', google: 'الدخول عبر Google', or: 'أو', later: 'ليس الآن', agree: 'بالتسجيل توافقون على {t} و{p}.', terms: 'شروط الاستخدام', priv: 'سياسة الخصوصية', badMail: 'البريد لا يبدو صحيحًا', short: 'كلمة مرور من 6 أحرف على الأقل واسم مستخدم من 2 إلى 20', taken: 'الاسم محجوز، جرّبوا غيره', exists: 'يوجد حساب بهذا البريد. سجّلوا الدخول بدلًا من ذلك.', check: 'أرسلنا لكم بريدًا. اضغطوا على الرابط ثم سجّلوا الدخول هنا.', sent: 'أرسلنا بريدًا لإعادة تعيين كلمة المرور.', needIn: 'سجّلوا الدخول أولًا، هنا في الأعلى.', hi: 'مرحبًا، {n}', mineEmpty: 'لا محادثات هنا بعد. ارفعوا محادثة واتساب وستقول لكم بنينا رأيها.', onDevice: 'محفوظة على هذا الجهاز', cont: 'متابعة', upload: 'رفع المحادثة', reqFrom: 'طلب من {d}', stLocal: 'لم تُرسل إلى بنينا بعد', stPending: 'بانتظار الموافقة', stApproved: 'تمت الموافقة، احصلوا على التقرير', stApprovedUp: 'تمت الموافقة. ارفعوا المحادثة واحصلوا على التقرير', stDeclined: 'لم تتم الموافقة', stWriting: 'بنينا تكتب الآن' },
    ru: { tabMine: 'Мои чаты', tabNew: 'Разобрать новый чат', signIn: 'Войти', signOut: 'Выйти', signUp: 'Регистрация', inT: 'Войдите, чтобы видеть все свои чаты', upT: 'Создайте аккаунт, это полминуты', uname: 'Имя пользователя', inGo: 'Войти', upGo: 'Создать аккаунт', toUp: 'Нет аккаунта? Регистрация', toIn: 'Есть аккаунт? Войти', forgot: 'Забыли пароль', google: 'Войти через Google', or: 'или', later: 'Не сейчас', agree: 'Регистрируясь, вы принимаете {t} и {p}.', terms: 'условия использования', priv: 'политику конфиденциальности', badMail: 'Почта выглядит неверно', short: 'Пароль от 6 символов и имя от 2 до 20', taken: 'Имя занято, попробуйте другое', exists: 'С этой почтой уже есть аккаунт. Войдите.', check: 'Мы отправили письмо. Нажмите на ссылку в нём и войдите здесь.', sent: 'Письмо для сброса пароля отправлено.', needIn: 'Сначала войдите, здесь наверху.', hi: 'Привет, {n}', mineEmpty: 'Здесь пока нет чатов. Загрузите чат из WhatsApp, и Пнина скажет, что думает.', onDevice: 'Сохранён на этом устройстве', cont: 'Продолжить', upload: 'Загрузить чат', reqFrom: 'Запрос от {d}', stLocal: 'Ещё не отправлен Пнине', stPending: 'Ждёт одобрения', stApproved: 'Одобрено, получите отчёт', stApprovedUp: 'Одобрено. Загрузите чат и получите отчёт', stDeclined: 'Не одобрено', stWriting: 'Пнина пишет' },
    es: { tabMine: 'Mis chats', tabNew: 'Analizar un chat nuevo', signIn: 'Entrar', signOut: 'Salir', signUp: 'Registrarse', inT: 'Entra para ver todos tus chats', upT: 'Abre una cuenta, tarda medio minuto', uname: 'Nombre de usuario', inGo: 'Entrar', upGo: 'Crear cuenta', toUp: '¿Sin cuenta? Regístrate', toIn: '¿Tienes cuenta? Entra', forgot: 'Olvidé la contraseña', google: 'Entrar con Google', or: 'o', later: 'Ahora no', agree: 'Al registrarte aceptas los {t} y la {p}.', terms: 'términos de uso', priv: 'política de privacidad', badMail: 'El correo no parece correcto', short: 'Contraseña de 6 caracteres como mínimo y nombre de 2 a 20', taken: 'Ese nombre está ocupado, prueba otro', exists: 'Ya hay una cuenta con este correo. Entra en su lugar.', check: 'Te enviamos un correo. Toca el enlace y luego entra aquí.', sent: 'Te enviamos un correo para restablecer la contraseña.', needIn: 'Primero entra, aquí arriba.', hi: 'Hola, {n}', mineEmpty: 'Aún no hay chats. Sube un chat de WhatsApp y Penina te dirá lo que piensa.', onDevice: 'Guardado en este dispositivo', cont: 'Continuar', upload: 'Subir el chat', reqFrom: 'Solicitud del {d}', stLocal: 'Aún no enviado a Penina', stPending: 'Esperando aprobación', stApproved: 'Aprobado, recibe el informe', stApprovedUp: 'Aprobado. Sube el chat y recibe el informe', stDeclined: 'No aprobado', stWriting: 'Penina está escribiendo' },
    fr: { tabMine: 'Mes chats', tabNew: 'Analyser un nouveau chat', signIn: 'Connexion', signOut: 'Déconnexion', signUp: 'Inscription', inT: 'Connectez-vous pour voir tous vos chats', upT: 'Créez un compte, ça prend trente secondes', uname: 'Nom d’utilisateur', inGo: 'Se connecter', upGo: 'Créer le compte', toUp: 'Pas de compte ? Inscription', toIn: 'Déjà un compte ? Connexion', forgot: 'Mot de passe oublié', google: 'Continuer avec Google', or: 'ou', later: 'Plus tard', agree: 'En vous inscrivant, vous acceptez les {t} et la {p}.', terms: 'conditions d’utilisation', priv: 'politique de confidentialité', badMail: 'Cet e-mail ne semble pas valide', short: 'Un mot de passe d’au moins 6 caractères et un nom de 2 à 20', taken: 'Ce nom est pris, essayez-en un autre', exists: 'Un compte existe déjà avec cet e-mail. Connectez-vous.', check: 'Nous vous avons envoyé un e-mail. Touchez le lien puis connectez-vous ici.', sent: 'E-mail de réinitialisation envoyé.', needIn: 'Connectez-vous d’abord, ici en haut.', hi: 'Bonjour, {n}', mineEmpty: 'Pas encore de chats. Envoyez un chat WhatsApp et Penina vous dira ce qu’elle en pense.', onDevice: 'Enregistré sur cet appareil', cont: 'Continuer', upload: 'Envoyer le chat', reqFrom: 'Demande du {d}', stLocal: 'Pas encore envoyé à Penina', stPending: 'En attente d’approbation', stApproved: 'Approuvé, recevez le rapport', stApprovedUp: 'Approuvé. Envoyez le chat pour recevoir le rapport', stDeclined: 'Non approuvé', stWriting: 'Penina est en train d’écrire' },
  };
  for (const l in X) Object.assign(T[l], X[l]);

  const css = document.createElement('style');
  css.textContent = `
  .acct{display:flex;align-items:center;gap:10px;margin-inline-start:auto;margin-inline-end:12px;font-size:15px;min-width:0}
  .acct .me{color:var(--pearl-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:42vw}
  .acct button{height:44px;padding:0 16px;border-radius:999px;border:1px solid rgba(247,239,245,.3);font-weight:800;font-size:15px}
  .acct button.in{background:var(--lip);color:var(--lip-ink);border-color:transparent}
  #loginTop{margin-top:4px;margin-bottom:8px}
  .lbox{background:var(--plum);border-radius:24px;padding:20px;display:flex;flex-direction:column;gap:12px;max-width:520px;margin-inline:auto}
  .lbox h2{margin:0;font-family:var(--fd);font-weight:400;font-size:22px}
  .lbox .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
  .lbox .lk{color:var(--amber);font-weight:700;font-size:15px;padding:8px 0;text-decoration:underline;text-underline-offset:4px}
  .lbox .small{font-size:13px;color:var(--muted);margin:0}
  .lbox .small a{color:var(--pearl-2)}
  .gbtn{height:50px;border-radius:999px;background:#fff;color:#1f1f1f;font-weight:700;font-size:16px;display:flex;align-items:center;justify-content:center;gap:10px}
  .tabs{display:flex;gap:8px;margin-top:6px;margin-bottom:6px}
  .tabs button{flex:1;height:50px;border-radius:999px;border:1px solid var(--line);background:var(--plum);font-weight:800;font-size:16px;color:var(--pearl-2)}
  .tabs button[aria-pressed=true]{background:var(--pearl);color:var(--night);border-color:transparent}
  #mine{padding:10px 0 30px}
  .mhead{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:8px}
  .mhead h2{margin:0}
  .mrow{display:grid;grid-template-columns:44px 1fr auto;gap:6px 14px;align-items:center;padding:16px 0;border-bottom:1px solid var(--line)}
  .mrow.here{background:var(--plum);border-radius:20px;padding:16px;border:0;margin:6px 0 10px}
  .mrow .mtx{display:flex;flex-direction:column;gap:2px;min-width:0}
  .mrow .mtx b{font-size:17px;overflow-wrap:anywhere}
  .mrow .mtx span{color:var(--muted);font-size:14px}
  .mrow .mtx .mtag{font-weight:700;font-size:14px}
  .mrow .mbt{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
  @media (max-width:560px){.mrow{grid-template-columns:44px 1fr}.mrow>button,.mrow .mbt{grid-column:1/-1;justify-content:stretch}.mrow .mbt>*{flex:1}.mrow>button{width:100%}}
  .mempty{text-align:center;padding:30px 0;display:flex;flex-direction:column;align-items:center;gap:16px}
  .mempty .pearl{width:90px;height:90px}
  .mempty p{max-width:380px;color:var(--pearl-2);margin:0}
  @media (display-mode:standalone){header a.home{display:none}}
  `;
  document.head.appendChild(css);

  const E = esc;
  const shared = () => /[?&](r|a)=/.test(location.search);
  let GOOGLE = false, NAME = '', mode = 'in', VIEW = null, FIRST = true;
  fetch(`${SB_URL}/auth/v1/settings`, { headers: { apikey: SB_KEY } }).then((r) => (r.ok ? r.json() : null)).then((j) => { GOOGLE = !!(j && j.external && j.external.google); if (!USER) drawLogin(); }).catch(() => {});

  /* ---------- the account, top of the page ---------- */
  function drawAcct() {
    const a = $('#acct'); if (!a) return;
    if (USER) {
      a.innerHTML = `<span class="me">${E(t('hi', { n: NAME || (USER.email || '').split('@')[0] }))}</span><button type="button" id="outBtn">${E(t('signOut'))}</button>`;
      $('#outBtn').onclick = async () => { try { await sb.auth.signOut(); } catch { /* ignore */ } };
    } else {
      a.innerHTML = `<button type="button" class="in" id="inBtn">${E(t('signIn'))}</button>`;
      $('#inBtn').onclick = () => { const lt = $('#loginTop'); const was = lt.classList.contains('hide'); lt.classList.toggle('hide', !was); if (was) { drawLogin(); $('#lEm')?.focus(); } };
    }
  }
  function drawLogin(msg) {
    const box = $('#loginTop'); if (!box) return;
    if (USER || !sb) { box.classList.add('hide'); box.innerHTML = ''; return; }
    const up = mode === 'up';
    const keep = { e: $('#lEm')?.value || '', u: $('#lUn')?.value || '' };
    const [a1, rest = ''] = t('agree').split('{t}'), [a2, a3 = ''] = rest.split('{p}');
    box.innerHTML = `<form class="lbox" id="lForm" novalidate>
      <h2>${E(up ? t('upT') : t('inT'))}</h2>
      ${GOOGLE ? `<button type="button" class="gbtn" id="lG"><svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>${E(t('google'))}</button><p class="small" style="text-align:center">${E(t('or'))}</p>` : ''}
      ${up ? `<div class="fld"><label for="lUn">${E(t('uname'))}</label><input id="lUn" maxlength="20" autocomplete="username" style="direction:auto"></div>` : ''}
      <div class="fld"><label for="lEm">${E(t('email'))}</label><input id="lEm" type="email" autocomplete="email" inputmode="email"></div>
      <div class="fld"><label for="lPw">${E(t('password'))}</label><input id="lPw" type="password" autocomplete="${up ? 'new-password' : 'current-password'}"></div>
      <p class="msg" id="lMsg" role="status" aria-live="polite">${E(msg || '')}</p>
      <button class="go" type="submit" id="lGo">${E(up ? t('upGo') : t('inGo'))}</button>
      ${up ? `<p class="small">${E(a1)}<a href="/${L}/terms/">${E(t('terms'))}</a>${E(a2)}<a href="/${L}/privacy/">${E(t('priv'))}</a>${E(a3)}</p>` : ''}
      <div class="row" style="justify-content:space-between"><button type="button" class="lk" id="lSw">${E(up ? t('toIn') : t('toUp'))}</button>${up ? '' : `<button type="button" class="lk" id="lFg">${E(t('forgot'))}</button>`}</div>
    </form>`;
    if (keep.e) $('#lEm').value = keep.e; if (keep.u && $('#lUn')) $('#lUn').value = keep.u;
    const m = (s) => { $('#lMsg').textContent = s; };
    $('#lSw').onclick = () => { mode = up ? 'in' : 'up'; const em = $('#lEm').value; drawLogin(); $('#lEm').value = em; $(mode === 'up' ? '#lUn' : '#lEm').focus(); };
    $('#lG')?.addEventListener('click', async () => { const r = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + '/penina/', queryParams: { prompt: 'select_account' } } }); if (r.error) m(t('busy')); });
    $('#lFg')?.addEventListener('click', async () => {
      const em = $('#lEm').value.trim(); if (!/^\S+@\S+\.\S+$/.test(em)) { m(t('badMail')); $('#lEm').focus(); return; }
      const r = await sb.auth.resetPasswordForEmail(em, { redirectTo: `https://barusik.com/${L}/` }); m(r.error ? t('busy') : t('sent'));
    });
    $('#lForm').onsubmit = async (e) => {
      e.preventDefault();
      const em = $('#lEm').value.trim(), pw = $('#lPw').value, un = up ? $('#lUn').value.trim() : '';
      if (!/^\S+@\S+\.\S+$/.test(em)) { m(t('badMail')); $('#lEm').focus(); return; }
      if (pw.length < 6 || (up && (un.length < 2 || un.length > 20))) { m(t('short')); return; }
      const b = $('#lGo'); b.disabled = true; m('');
      try {
        if (up) {
          const free = await sb.rpc('username_available', { p_name: un });
          if (free.data === false) { m(t('taken')); return; }
          const r = await sb.auth.signUp({ email: em, password: pw, options: { data: { username: un }, emailRedirectTo: 'https://barusik.com/penina/' } });
          if (r.error) throw r.error;
          if (r.data.user && Array.isArray(r.data.user.identities) && r.data.user.identities.length === 0) { m(t('exists')); return; }
          if (!r.data.session) { mode = 'in'; drawLogin(t('check')); $('#lEm').value = em; return; }
        } else {
          const r = await sb.auth.signInWithPassword({ email: em, password: pw });
          if (r.error) throw r.error;
        }
      } catch (x) {
        const s = String((x && x.message) || '');
        m(/confirm/i.test(s) ? t('unconfirmed') : /already/i.test(s) ? t('exists') : (x && x.status === 400) || /invalid|credentials/i.test(s) ? t('badLogin') : navigator.onLine === false ? t('offline') : t('busy'));
      } finally { b.disabled = false; }
    };
  }

  /* ---------- the two tabs ---------- */
  function show(v) {
    VIEW = v;
    const tabs = $('#tabs'), on = !!USER && !shared();
    tabs.classList.toggle('hide', !on);
    tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.v === 'mine') === (v === 'mine'))));
    $('#mine').classList.toggle('hide', v !== 'mine' || !on);
    $('#flow').classList.toggle('hide', v === 'mine' && on);
  }
  const local = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); return v && v.stats && v.excerpt && Date.now() - v.at < 14 * 864e5 ? v : null; } catch { return null; } };
  window.PHome = {
    // back to the chat that waits on this device
    flow() {
      const v = local(); PList.cur(null);
      if (v) { STATS = v.stats; EXCERPT = v.excerpt; REPORT = v.report || null; }
      $('#wait').classList.toggle('hide', !RUNNING);
      if (!RUNNING) {
        if (REPORT) { $('#start').classList.add('hide'); $('#local').classList.add('hide'); renderReport(REPORT); }
        else if (STATS) { $('#start').classList.add('hide'); $('#report').classList.add('hide'); $('#local').classList.remove('hide'); renderLocal(); goBtn(); }
        else { $('#local').classList.add('hide'); $('#report').classList.add('hide'); $('#start').classList.remove('hide'); }
      }
      show('flow'); scrollTo(0, 0);
    },
    // a fresh upload; the chat on this device is replaced only once a new file is read
    newChat() {
      if (RUNNING) return PHome.flow();
      $('#local').classList.add('hide'); $('#report').classList.add('hide'); $('#wait').classList.add('hide'); $('#start').classList.remove('hide');
      $('#readMsg').textContent = ''; show('flow'); scrollTo(0, 0);
    },
    mine() { show('mine'); PList.load(); scrollTo(0, 0); },
  };
  $('#tabs').querySelectorAll('button').forEach((b) => b.onclick = () => (b.dataset.v === 'mine' ? PHome.mine() : PHome.newChat()));

  window.PAcct = {
    ask() {
      const lt = $('#loginTop'); lt.classList.remove('hide'); drawLogin(t('needIn'));
      scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => $('#lEm')?.focus({ preventScroll: true }), 300);
    },
  };

  /* ---------- hooks into the page ---------- */
  const rr = window.renderReport;
  window.renderReport = function () { const out = rr.apply(this, arguments); if (VIEW === 'mine') show('flow');
    // "another chat" opens a new upload and leaves the chat list alone
    const ag = $('#againBtn'); if (ag && USER && !shared()) ag.onclick = () => { const v = local(); if (!v || v.report) { try { localStorage.removeItem(KEY); } catch { /* ignore */ } STATS = null; EXCERPT = null; } REPORT = null; PHome.newChat(); };
    return out; };
  const rj = window.runJob;
  window.runJob = function () { show('flow'); return rj.apply(this, arguments); };
  const pt = window.paint;
  window.paint = function () { pt.apply(this, arguments); drawAcct(); if (!USER && !$('#loginTop').classList.contains('hide')) drawLogin(); if (VIEW === 'mine') PList.load(); };
  const ra = window.refreshAsk;
  window.refreshAsk = async function () {
    if (USER) {
      $('#loginTop').classList.add('hide');
      try { const r = await sb.from('profiles').select('username').eq('id', USER.id).maybeSingle(); NAME = (r.data && r.data.username) || (USER.user_metadata && USER.user_metadata.username) || ''; } catch { NAME = ''; }
    } else NAME = '';
    drawAcct();
    await ra.apply(this, arguments);
    if (!USER) { show('flow'); FIRST = true; if (!shared()) { $('#loginTop').classList.remove('hide'); drawLogin(); } drawSaved(); return; }
    if (shared()) { show('flow'); return; }
    // the first time we know who this is: open on their chats, unless a chat or report is already on the screen
    if (FIRST) { FIRST = false; const busy = RUNNING || !$('#local').classList.contains('hide') || !$('#report').classList.contains('hide'); if (busy) show('flow'); else show('mine'); }
    else show(VIEW || 'flow');
    drawSaved();
  };

  /* ---------- reports friends sent, a way back from every report ---------- */
  const S = {
    he: { hmShared: 'שותפו איתי', hmRemove: 'הסרה', hmGone: 'הקישור הזה כבר לא פעיל. מי ששלח אותו ביטל את השיתוף.', hmBack: 'לכל הדוחות', hmTag: 'דוח ששותף איתכם', hmLoading: 'פותחת את הדוח…', hmLast: 'הדוח האחרון שלכם' },
    en: { hmShared: 'Shared with me', hmRemove: 'Remove', hmGone: 'This link is no longer active. The person who sent it turned sharing off.', hmBack: 'All reports', hmTag: 'Shared with you', hmLoading: 'Opening the report…', hmLast: 'Your last report' },
    ar: { hmShared: 'تمت مشاركتها معي', hmRemove: 'إزالة', hmGone: 'هذا الرابط لم يعد فعّالًا. من أرسله أوقف المشاركة.', hmBack: 'كل التقارير', hmTag: 'تمت مشاركته معكم', hmLoading: 'جارٍ فتح التقرير…', hmLast: 'تقريركم الأخير' },
    ru: { hmShared: 'Со мной поделились', hmRemove: 'Убрать', hmGone: 'Эта ссылка больше не работает. Отправитель отключил доступ.', hmBack: 'Все отчёты', hmTag: 'С вами поделились', hmLoading: 'Открываю отчёт…', hmLast: 'Ваш последний отчёт' },
    es: { hmShared: 'Compartidos conmigo', hmRemove: 'Quitar', hmGone: 'Este enlace ya no está activo. Quien lo envió desactivó el uso compartido.', hmBack: 'Todos los informes', hmTag: 'Compartido contigo', hmLoading: 'Abriendo el informe…', hmLast: 'Tu último informe' },
    fr: { hmShared: 'Partagés avec moi', hmRemove: 'Retirer', hmGone: 'Ce lien n’est plus actif. La personne qui l’a envoyé a arrêté le partage.', hmBack: 'Tous les rapports', hmTag: 'Partagé avec vous', hmLoading: 'Ouverture du rapport…', hmLast: 'Votre dernier rapport' },
  };
  for (const l in S) Object.assign(T[l], S[l]);
  const css2 = document.createElement('style');
  css2.textContent = `
  #pnSaved{margin:26px 0 8px}
  #pnSaved:empty{display:none}
  #shSec{margin-top:18px}
  #shSec h2{font-family:var(--fd);font-weight:400;font-size:24px;margin:0 0 4px}
  #shSec .msg{margin:6px 0 0}
  #shSec .msg:empty{display:none}
  .hm-back{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 14px}
  .hm-back a{display:inline-flex;align-items:center;gap:8px;min-height:44px;color:var(--pearl-2);font-weight:800;text-decoration:none}
  .hm-back a:hover{color:var(--pearl)}
  .hm-back .tag{border-radius:999px;padding:4px 12px;background:rgba(255,196,107,.14);color:var(--amber);font-size:14.5px;font-weight:600}
  #hmLoad{text-align:center;padding:90px 0;color:var(--pearl-2);font-size:18px}
  `;
  document.head.appendChild(css2);

  // the links someone sent you and you opened, kept on this device only
  const SKEY = 'penina.shared', TOK = /^[0-9a-f-]{36}$/i;
  const sharedList = () => { try { const a = JSON.parse(localStorage.getItem(SKEY) || '[]'); return Array.isArray(a) ? a.filter((x) => x && TOK.test(x.token || '')) : []; } catch { return []; } };
  const sharedSave = (a) => { try { localStorage.setItem(SKEY, JSON.stringify(a.slice(0, 40))); } catch { /* private mode: the list just isn't kept */ } };
  const sharedAdd = (token, r) => sharedSave([{ token, headline: String((r && r.headline) || '').slice(0, 160), at: Date.now() }, ...sharedList().filter((x) => x.token !== token)]);
  const sharedDrop = (token) => sharedSave(sharedList().filter((x) => x.token !== token));
  const day = (d) => { try { return d ? new Date(d).toLocaleDateString(L, { day: 'numeric', month: 'short', year: 'numeric' }) : ''; } catch { return ''; } };
  const names = (st) => { const p = Array.isArray(st && st.people) ? st.people : []; return p.slice(0, 3).map((x) => x.name).join(', ') + (p.length > 3 ? ' ⁦+' + (p.length - 3) + '⁩' : ''); };
  const dot = (s) => `<span class="dot" style="background:hsl(${hue(s)} 70% 72%)">${E(initial(s))}</span>`;
  const btn = (cls, attr, txt) => `<button class="${cls}" type="button" ${attr} style="height:46px;padding:0 20px;font-size:16px">${E(txt)}</button>`;
  const cleanUrl = () => { try { const u = new URL(location.href); u.searchParams.delete('r'); u.searchParams.delete('a'); history.replaceState(history.state, '', u.pathname + (u.searchParams.toString() ? '?' + u.searchParams : '')); } catch { /* keep the address */ } };

  function sharedSec(msg) {
    const sh = sharedList(); if (!sh.length && !msg) return '';
    return `<section id="shSec"><h2>${E(t('hmShared'))}</h2><p class="msg" role="status" aria-live="polite">${E(msg || '')}</p>${sh.map((x) =>
      `<div class="mrow">${dot(x.headline)}<div class="mtx"><b>${E(x.headline || '—')}</b><span>${E(t('hmTag'))} · ${E(day(x.at))}</span></div><div class="mbt">${btn('go', `data-shopen="${E(x.token)}"`, t('myOpen'))}${btn('btn2', `data-shdrop="${E(x.token)}"`, t('hmRemove'))}</div></div>`).join('')}</section>`;
  }
  function bindShared(root, redraw) {
    root.querySelectorAll('[data-shopen]').forEach((b) => b.onclick = () => openShared(b.dataset.shopen, false, b));
    root.querySelectorAll('[data-shdrop]').forEach((b) => b.onclick = () => { sharedDrop(b.dataset.shdrop); redraw(); });
  }
  // signed in: under "my chats"
  function addShared(msg) {
    const box = $('#mine'); if (!box || !USER) return;
    $('#shSec')?.remove(); box.insertAdjacentHTML('beforeend', sharedSec(msg)); bindShared(box, () => addShared());
  }
  const pl = PList.load;
  PList.load = async function () { await pl.apply(this, arguments); addShared(); };
  // signed out: the chat in progress, the last report on this device and what was shared, under the upload
  function drawSaved(msg) {
    const start = $('#start'); if (!start) return;
    let box = $('#pnSaved'); if (!box) { box = document.createElement('div'); box.id = 'pnSaved'; (start.querySelector('details.how') || start.lastElementChild).before(box); }
    if (USER) { box.innerHTML = ''; return; }
    const v = local(); let h = '';
    if (v && !v.report) h += `<div class="mrow here">${dot(names(v.stats))}<div class="mtx"><b>${E(names(v.stats))}</b><span>${E(t('onDevice'))} · ${Number(v.stats.total || 0).toLocaleString()} ${E(t('msgs'))}</span></div>${btn('go', 'data-here', t('cont'))}</div>`;
    if (v && v.report) h += `<div class="mrow here">${dot(v.report.headline)}<div class="mtx"><b>${E(v.report.headline || '—')}</b><span>${E(t('hmLast'))} · ${E(t('onDevice'))}</span></div>${btn('go', 'data-last', t('myOpen'))}</div>`;
    box.innerHTML = h + sharedSec(msg);
    box.querySelector('[data-here]')?.addEventListener('click', () => PHome.flow());
    box.querySelector('[data-last]')?.addEventListener('click', () => { const w = local(); if (w && w.report) showReport(w.report, { kind: 'local' }); });
    bindShared(box, () => drawSaved());
  }
  const pt2 = window.paint;
  window.paint = function () { pt2.apply(this, arguments); if (!USER) drawSaved(); };

  // the report on screen: how it was opened decides where "back" goes and whether it can be shared on
  let OPEN = null, LAST = null;
  const shown = () => !$('#report').classList.contains('hide');
  function showReport(report, cur, how) {
    OPEN = cur;
    if (window.PShare && PShare.set) PShare.set(cur.kind === 'shared' || cur.kind === 'admin');
    PList.cur(cur.kind === 'mine' ? cur.id : null);
    REPORT = report;
    $('#start').classList.add('hide'); $('#local').classList.add('hide'); $('#wait').classList.add('hide'); $('#loginTop').classList.add('hide');
    show('flow'); renderReport(report);
    // opened from a list: Back returns to the list instead of leaving the site
    let n = 0;
    if (!how) { n = Date.now(); try { history.pushState({ pn: 'report', n }, '', location.pathname + location.search + '#report'); } catch { n = 0; } }
    if (how !== 'again') LAST = { report, cur, n };
    scrollTo(0, 0);
  }
  function goHome() {
    const was = OPEN; OPEN = null; REPORT = null;
    if (window.PShare && PShare.set) PShare.set(false);
    PList.cur(null); cleanUrl();
    $('#report').classList.add('hide'); $('#wait').classList.toggle('hide', !RUNNING);
    if (USER) { PHome.mine(); if (was && was.kind === 'shared') setTimeout(() => $('#shSec')?.scrollIntoView({ block: 'start' }), 600); return; }
    $('#local').classList.add('hide'); $('#start').classList.toggle('hide', RUNNING); show('flow');
    $('#loginTop').classList.remove('hide'); drawLogin(); drawSaved(); scrollTo(0, 0);
  }
  const leave = () => { if (shown() && history.state && history.state.pn === 'report') history.back(); else goHome(); };
  addEventListener('popstate', () => {
    const st = history.state;
    if (st && st.pn === 'report') {
      if (LAST && LAST.n && LAST.n === st.n) { if (!shown()) showReport(LAST.report, LAST.cur, 'again'); return; }
      try { history.replaceState(null, '', location.pathname + location.search); } catch { /* keep the address */ }
    }
    if (shown() && OPEN) goHome();
  });
  // a reload on a report starts on the home page, so the address should not keep "#report"
  if (history.state && history.state.pn === 'report') { try { history.replaceState(null, '', location.pathname + location.search); } catch { /* keep the address */ } }

  // every time a report is drawn (opening it, or a change of language) it gets the way back
  const rr2 = window.renderReport;
  window.renderReport = function () {
    const out = rr2.apply(this, arguments);
    const el = $('#report');
    if (OPEN && el && !el.querySelector('.hm-back')) {
      const bar = document.createElement('div'); bar.className = 'hm-back';
      bar.innerHTML = `<a href="/penina/"><span aria-hidden="true">${RTL[L] ? '→' : '←'}</span>${E(t('hmBack'))}</a>${OPEN.kind === 'shared' ? `<span class="tag">${E(t('hmTag'))}</span>` : ''}`;
      bar.querySelector('a').onclick = (e) => { e.preventDefault(); leave(); };
      el.prepend(bar);
      // someone else's report: "another chat" must not wipe the chat saved on this device
      const ag = el.querySelector('#againBtn'); if (ag && OPEN.kind === 'shared') { ag.textContent = t('hmBack'); ag.onclick = leave; }
    }
    return out;
  };

  async function openShared(token, deep, b) {
    if (!sb || !TOK.test(token)) return false;
    if (b) b.disabled = true;
    let load = null, ok = false, said = '';
    // straight from a link: nothing else shows while the report is on its way
    if (deep) { $('#start').classList.add('hide'); $('#local').classList.add('hide'); load = document.createElement('p'); load.id = 'hmLoad'; load.setAttribute('role', 'status'); load.textContent = t('hmLoading'); $('main.wrap').prepend(load); }
    try {
      const r = await sb.rpc('pn_shared_report', { p_token: token });
      if (!r.error && r.data) { load?.remove(); sharedAdd(token, r.data); showReport(r.data, { kind: 'shared', token }, deep ? 'deep' : ''); ok = true; }
      // nothing behind the token: the owner turned the link off, so it leaves the list
      else if (!r.error || r.error.code === '22P02') { sharedDrop(token); said = t('hmGone'); }
      else said = t('offline');
    } catch { said = t('offline'); }
    load?.remove(); if (b) b.disabled = false;
    if (!ok) {
      if (deep) { cleanUrl(); goHome(); }
      if (USER) { if (!deep) addShared(said); else setTimeout(() => addShared(said), 700); } else drawSaved(said);
      setTimeout(() => $('#shSec')?.scrollIntoView({ block: 'center' }), deep ? 800 : 0);
    }
    return ok;
  }
  async function openMine(id, b) {
    if (b) b.disabled = true;
    try { const q = await sb.from('pn_requests').select('report').eq('id', id).maybeSingle(); if (q.data && q.data.report) showReport(q.data.report, { kind: 'mine', id }); } catch { /* stays on the list */ }
    if (b) b.disabled = false;
  }
  Object.assign(window.PHome, { showReport, openShared, openMine, home: goHome, saved: drawSaved });
  drawAcct();
  drawSaved();
})();
