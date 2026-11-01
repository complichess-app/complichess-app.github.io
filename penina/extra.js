/* What Penina thinks: the long report, the questions before it, and the little games · © 2026 Bar Lvovski. All rights reserved. */
'use strict';
(function () {
  const X = {
    he: { myT:'הדוחות שלי',myOpen:'פתיחה',mySend:'שליחת קישור',img:'תמונה לסטורי',nmT:'מי זה? (לא חובה)',nmS:'אם מישהו לא שמור אצלך או שמור לא טוב, כתבו איך פנינה תקרא לו בדוח.',nmGo:'עדכון שמות',nmMore:'שמות נוספים',nmP:'משתתף',lnk:'קישור לשיתוף עם חברים',lnkOk:'הקישור הועתק. כל מי שיש לו אותו יכול לראות את הדוח.',lnkOff:'לבטל את הקישור',lnkGone:'הקישור בוטל',tips:'טיפים מפנינה',photoHint:'אפשר להעלות תמונה כדי שהיא תופיע במשחק. לא חובה, התמונה נשארת רק אצלכם ולא נספרת ב־MB.',photoOf:'תמונה של {n}',tooBig:'הקובץ גדול מ־5GB. ייצאו את הצ׳אט ללא מדיה.',memBig:'הקובץ גדול מדי לדפדפן. ייצאו את הצ׳אט ללא מדיה.',qLoad: 'פנינה חושבת על שאלות…', qTitle: 'לפני שפנינה כותבת', qSub: 'כמה שאלות קצרות כדי שהדוח יהיה שלכם. אפשר לדלג על כל שאלה.', qGo: 'לכתוב את הדוח', qSkip: 'לדלג ולכתוב', awards: 'פרסים', cases: 'המקרים', jokes: 'בדיחות פנימיות', pairs: 'מי עם מי', eras: 'הצ׳אט לאורך הזמן', games: 'משחקונים', habits: 'הרגלים', sig: 'אמרות כנף', fact: 'עובדה', more: 'עוד {n} מקרים', play: 'לשחק', start: 'התחל', again2: 'עוד פעם', score2: 'ניקוד', hint1: 'גררו אצבע או לחצו על החצים', hint2: 'לחצו מהר על הדמות שקופצת', quizQ: 'מי כתב את זה?', quizRes: 'צדקתם ב־{n} מתוך {t}', win: 'כל הכבוד!', over: 'נגמר' },
    en: { myT:'My reports',myOpen:'Open',mySend:'Send link',img:'Story image',nmT:'Who is this? (optional)',nmS:'If someone isn’t saved in your contacts, or saved badly, write what Penina should call them in the report.',nmGo:'Update names',nmMore:'More names',nmP:'Person',lnk:'Link to share with friends',lnkOk:'Link copied. Anyone who has it can see the report.',lnkOff:'Turn the link off',lnkGone:'Link turned off',tips:'Tips from Penina',photoHint:'You can add a picture to appear in the game. Optional; it stays on your device and is not counted in your MB.',photoOf:'Picture of {n}',tooBig:'The file is over 5 GB. Export the chat without media.',memBig:'The file is too big for the browser. Export the chat without media.',qLoad: 'Penina is thinking of questions…', qTitle: 'Before Penina writes', qSub: 'A few short questions to make the report yours. Skip any you like.', qGo: 'Write the report', qSkip: 'Skip and write', awards: 'Awards', cases: 'The cases', jokes: 'Inside jokes', pairs: 'Who with whom', eras: 'The chat through time', games: 'Little games', habits: 'Habits', sig: 'Signature lines', fact: 'Fact', more: '{n} more cases', play: 'Play', start: 'Start', again2: 'Again', score2: 'Score', hint1: 'Drag your finger or use the arrow keys', hint2: 'Tap the character fast', quizQ: 'Who wrote this?', quizRes: 'You got {n} of {t}', win: 'Well done!', over: 'Game over' },
    ar: { myT:'تقاريري',myOpen:'فتح',mySend:'إرسال الرابط',img:'صورة للستوري',nmT:'من هذا؟ (اختياري)',nmS:'إذا كان أحدهم غير محفوظ عندكم أو محفوظًا بشكل سيئ، اكتبوا بماذا تناديه بنينا في التقرير.',nmGo:'تحديث الأسماء',nmMore:'أسماء أخرى',nmP:'مشارك',lnk:'رابط للمشاركة مع الأصدقاء',lnkOk:'تم نسخ الرابط. كل من لديه الرابط يستطيع رؤية التقرير.',lnkOff:'إلغاء الرابط',lnkGone:'تم إلغاء الرابط',tips:'نصائح من بنينا',photoHint:'يمكنكم إضافة صورة لتظهر في اللعبة. اختياري، تبقى الصورة على جهازكم ولا تُحسب ضمن الميغابايت.',photoOf:'صورة {n}',tooBig:'الملف أكبر من 5 غيغابايت. صدّروا المحادثة بدون وسائط.',memBig:'الملف كبير جدًا للمتصفح. صدّروا المحادثة بدون وسائط.',qLoad: 'بنينا تفكر في أسئلة…', qTitle: 'قبل أن تكتب بنينا', qSub: 'بعض الأسئلة القصيرة لتصبح القراءة لكم. يمكنكم تخطي أي سؤال.', qGo: 'كتابة التقرير', qSkip: 'تخطٍّ والكتابة', awards: 'الجوائز', cases: 'المواقف', jokes: 'نكات داخلية', pairs: 'من مع من', eras: 'المحادثة عبر الزمن', games: 'ألعاب صغيرة', habits: 'العادات', sig: 'عبارات مميزة', fact: 'معلومة', more: '{n} مواقف أخرى', play: 'العب', start: 'ابدأ', again2: 'مرة أخرى', score2: 'النقاط', hint1: 'اسحبوا بإصبعكم أو استخدموا الأسهم', hint2: 'اضغطوا بسرعة على الشخصية', quizQ: 'من كتب هذا؟', quizRes: 'أجبتم صح على {n} من {t}', win: 'أحسنتم!', over: 'انتهت اللعبة' },
    ru: { myT:'Мои отчёты',myOpen:'Открыть',mySend:'Отправить ссылку',img:'Картинка для истории',nmT:'Кто это? (необязательно)',nmS:'Если кто-то не сохранён в контактах или сохранён неудачно, напишите, как Пнина будет его называть в отчёте.',nmGo:'Обновить имена',nmMore:'Другие имена',nmP:'Участник',lnk:'Ссылка для друзей',lnkOk:'Ссылка скопирована. Любой, у кого она есть, увидит отчёт.',lnkOff:'Отключить ссылку',lnkGone:'Ссылка отключена',tips:'Советы от Пнины',photoHint:'Можно добавить картинку для игры. Необязательно, она остаётся у вас и не считается в МБ.',photoOf:'Фото: {n}',tooBig:'Файл больше 5 ГБ. Экспортируйте чат без медиа.',memBig:'Файл слишком большой для браузера. Экспортируйте чат без медиа.',qLoad: 'Пнина придумывает вопросы…', qTitle: 'Перед тем как Пнина напишет', qSub: 'Несколько коротких вопросов, чтобы отчёт был вашим. Любой можно пропустить.', qGo: 'Написать отчёт', qSkip: 'Пропустить и написать', awards: 'Награды', cases: 'Случаи', jokes: 'Внутренние шутки', pairs: 'Кто с кем', eras: 'Чат во времени', games: 'Мини-игры', habits: 'Привычки', sig: 'Коронные фразы', fact: 'Факт', more: 'Ещё {n} случаев', play: 'Играть', start: 'Старт', again2: 'Ещё раз', score2: 'Счёт', hint1: 'Проведите пальцем или используйте стрелки', hint2: 'Быстро жмите на персонажа', quizQ: 'Кто это написал?', quizRes: 'Верно {n} из {t}', win: 'Отлично!', over: 'Игра окончена' },
    es: { myT:'Mis informes',myOpen:'Abrir',mySend:'Enviar enlace',img:'Imagen para stories',nmT:'¿Quién es? (opcional)',nmS:'Si alguien no está guardado en tus contactos, o está mal guardado, escribe cómo lo llamará Penina en el informe.',nmGo:'Actualizar nombres',nmMore:'Más nombres',nmP:'Persona',lnk:'Enlace para compartir con amigos',lnkOk:'Enlace copiado. Quien lo tenga puede ver el informe.',lnkOff:'Desactivar el enlace',lnkGone:'Enlace desactivado',tips:'Consejos de Penina',photoHint:'Puedes añadir una imagen para el juego. Es opcional, se queda en tu dispositivo y no cuenta en tus MB.',photoOf:'Imagen de {n}',tooBig:'El archivo supera 5 GB. Exporta el chat sin archivos.',memBig:'El archivo es demasiado grande para el navegador. Exporta el chat sin archivos.',qLoad: 'Penina está pensando preguntas…', qTitle: 'Antes de que Penina escriba', qSub: 'Unas preguntas cortas para que el informe sea vuestro. Puedes saltarte cualquiera.', qGo: 'Escribir el informe', qSkip: 'Saltar y escribir', awards: 'Premios', cases: 'Los casos', jokes: 'Chistes internos', pairs: 'Quién con quién', eras: 'El chat a lo largo del tiempo', games: 'Minijuegos', habits: 'Hábitos', sig: 'Frases típicas', fact: 'Dato', more: '{n} casos más', play: 'Jugar', start: 'Empezar', again2: 'Otra vez', score2: 'Puntos', hint1: 'Arrastra el dedo o usa las flechas', hint2: 'Toca rápido al personaje', quizQ: '¿Quién escribió esto?', quizRes: 'Acertaste {n} de {t}', win: '¡Bien hecho!', over: 'Fin del juego' },
    fr: { myT:'Mes rapports',myOpen:'Ouvrir',mySend:'Envoyer le lien',img:'Image pour story',nmT:'Qui est-ce ? (facultatif)',nmS:'Si quelqu’un n’est pas enregistré dans vos contacts, ou mal enregistré, écrivez comment Penina l’appellera dans le rapport.',nmGo:'Mettre à jour les noms',nmMore:'Autres noms',nmP:'Personne',lnk:'Lien à partager avec des amis',lnkOk:'Lien copié. Toute personne qui l’a peut voir le rapport.',lnkOff:'Désactiver le lien',lnkGone:'Lien désactivé',tips:'Conseils de Penina',photoHint:'Vous pouvez ajouter une image pour le jeu. Facultatif, elle reste sur votre appareil et n’est pas comptée dans vos Mo.',photoOf:'Image de {n}',tooBig:'Le fichier dépasse 5 Go. Exportez le chat sans médias.',memBig:'Le fichier est trop grand pour le navigateur. Exportez le chat sans médias.',qLoad: 'Penina réfléchit à des questions…', qTitle: 'Avant que Penina écrive', qSub: 'Quelques questions courtes pour que le rapport soit à vous. Vous pouvez en passer.', qGo: 'Écrire le rapport', qSkip: 'Passer et écrire', awards: 'Prix', cases: 'Les cas', jokes: 'Blagues internes', pairs: 'Qui avec qui', eras: 'Le chat à travers le temps', games: 'Mini-jeux', habits: 'Habitudes', sig: 'Phrases cultes', fact: 'Fait', more: '{n} cas de plus', play: 'Jouer', start: 'Démarrer', again2: 'Encore', score2: 'Score', hint1: 'Glissez le doigt ou utilisez les flèches', hint2: 'Touchez vite le personnage', quizQ: 'Qui a écrit ça ?', quizRes: 'Vous avez {n} sur {t}', win: 'Bravo !', over: 'Fin de la partie' },
  };
  for (const l in X) Object.assign(T[l], X[l]);

  const css = document.createElement('style');
  css.textContent = `
  .lead p{margin:0 0 14px}
  .awards{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}
  .award{background:var(--plum);border-radius:20px;padding:16px 16px 14px}
  .award b{display:block;font-family:var(--fd);font-weight:400;font-size:18px;line-height:1.25;margin-bottom:6px}
  .award .wn{color:var(--amber);font-weight:800}
  .award p{margin:6px 0 0;font-size:15px;color:var(--pearl-2)}
  .chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
  .chips span{background:var(--plum-2);border-radius:999px;padding:3px 12px;font-size:14px}
  .sigq{margin:10px 0 0;padding:0;color:var(--pearl-2);font-size:16px}
  .sigq div{padding:2px 0}
  .fact{margin-top:10px;color:var(--amber);font-size:15px}
  .case{padding:20px 0;border-bottom:1px solid var(--line)}
  .case h3{margin:0;font-size:20px}
  .case .who2{color:var(--muted);font-size:14px;margin:2px 0 8px}
  .case q{display:block;font-family:var(--fd);font-size:19px;margin:10px 0 4px;quotes:'״' '״'}
  .case .pl{color:var(--pearl-2);font-style:italic;margin:0}
  .case p{margin:0}
  .morebtn{margin-top:14px;height:46px;padding:0 22px;border-radius:999px;border:1px solid rgba(247,239,245,.3);font-weight:800}
  .jokes .j{padding:12px 0;border-bottom:1px solid var(--line)}
  .jokes b{font-size:18px}
  .jokes p{margin:4px 0 0;color:var(--pearl-2);font-size:16px}
  .jokes q{color:var(--amber);font-size:15px}
  .pairrow{padding:12px 0;border-bottom:1px solid var(--line)}
  .era{padding:10px 14px;border-inline-start:3px solid var(--lip);margin:0 0 14px}
  .era b{display:block}
  .gcard{background:var(--plum);border-radius:24px;padding:20px;margin:0 0 16px}
  .gcard h3{margin:0 0 4px;font-family:var(--fd);font-weight:400;font-size:24px}
  .gcard p{margin:0 0 12px;color:var(--pearl-2)}
  .gbox{position:relative;max-width:420px;margin:0 auto}
  .gbox canvas{display:block;width:100%;border-radius:18px;background:#1b0d24;touch-action:none}
  .gover{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;background:rgba(27,13,36,.86);border-radius:18px;padding:20px}
  .gover b{font-family:var(--fd);font-weight:400;font-size:26px}
  .gbtn{height:48px;padding:0 26px;border-radius:999px;background:var(--lip);color:var(--lip-ink);font-weight:800}
  .ghud{display:flex;justify-content:space-between;color:var(--muted);font-size:15px;margin:0 0 8px}
  .holes{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:360px;margin:0 auto}
  .hole{aspect-ratio:1;border-radius:20px;background:#1b0d24;font-size:44px;line-height:1;display:grid;place-items:center}
  .qopts{display:grid;gap:10px;margin-top:12px}
  .qopt{min-height:48px;border-radius:14px;border:1px solid var(--line);background:var(--night);font-weight:600;padding:8px 14px}
  .qopt.ok{background:rgba(123,224,184,.18);border-color:var(--mint)}
  .qopt.no{background:rgba(240,80,127,.18);border-color:var(--lip)}
  .gph{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 12px;font-size:14px}
  .gph label{display:inline-flex;align-items:center;gap:6px;background:var(--plum-2);border-radius:999px;padding:6px 14px;cursor:pointer}
  .gph input{display:none}
  .qform{background:var(--plum);border-radius:26px;padding:26px;margin:10px 0 40px;display:flex;flex-direction:column;gap:16px}
  .qform h3{margin:0;font-family:var(--fd);font-weight:400;font-size:26px}
  .qform p{margin:0;color:var(--pearl-2)}
  .qform label{display:flex;flex-direction:column;gap:6px;font-weight:600}
  .qform textarea{min-height:76px;border-radius:14px;border:1px solid var(--line);background:var(--night);padding:10px 14px;resize:vertical;font:inherit;color:inherit}
  `;
  document.head.appendChild(css);

  const E = esc;
  const arr = (v) => (Array.isArray(v) ? v : []);
  const txt = (v) => String(v ?? '');

  /* ---------- before the report: questions, names of unnamed people, optional pictures for the games ---------- */
  const resizeJpeg = (file) => new Promise((res) => {
    const im = new Image(), u = URL.createObjectURL(file);
    im.onload = () => {
      const k = Math.min(1, 220 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(im.naturalWidth * k)); c.height = Math.max(1, Math.round(im.naturalHeight * k));
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); res(c.toDataURL('image/jpeg', 0.72));
    };
    im.onerror = () => res(null); im.src = u;
  });
  window.PQ = {
    async run() {
      const msg = $('#askMsg'), btn = $('#goBtn');
      msg.textContent = t('qLoad'); btn.disabled = true;
      let qs = [], ph = [];
      try {
        const { data: { session } } = await sb.auth.getSession();
        const r = await fetch(`${SB_URL}/functions/v1/penina`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}`, apikey: SB_KEY }, body: JSON.stringify({ mode: 'questions', lang: L, stats: STATS, excerpt: EXCERPT }) });
        const j = JSON.parse((await r.text()).trim() || '{}');
        qs = arr(j.questions).filter((q) => q && q.q).slice(0, 6);
        ph = arr(j.photos).filter((x) => x && x.name).slice(0, 4);
      } catch { /* no questions, no problem */ }
      msg.textContent = ''; btn.disabled = false;
      const un = STATS.people.filter((p) => isPlaceholder(p.name)).slice(0, 12);
      if (!qs.length && !ph.length && !un.length) return { answers: [], photos: [] };
      const ask = $('#ask'); ask.classList.add('hide');
      const inp = 'height:44px;border-radius:12px;border:1px solid var(--line);background:var(--night);padding:0 12px;color:inherit;font:inherit';
      return new Promise((resolve) => {
        const f = document.createElement('form'); f.className = 'qform';
        f.innerHTML = `<h3>${E(t('qTitle'))}</h3><p>${E(t('qSub'))}</p>`
          + (un.length ? `<h3 style="font-size:20px">${E(t('nmT'))}</h3><p>${E(t('nmS'))}</p>` + un.map((p, i) => `<label>${E(p.name)}<input name="n${i}" maxlength="40" style="${inp}"></label>`).join('') : '')
          + qs.map((q, i) => `<label>${E(q.q)}<textarea name="q${i}" maxlength="700" placeholder="${E(q.hint || '')}"></textarea></label>`).join('')
          + (ph.length ? `<h3 style="font-size:20px">${E(t('games'))}</h3><p>${E(t('photoHint'))}</p>` + ph.map((x, i) => `<label>📷 ${E(t('photoOf', { n: txt(x.name) }))}${x.why ? ` <span style="font-weight:400;color:var(--muted)">· ${E(x.why)}</span>` : ''}<input type="file" accept="image/*" name="p${i}"></label>`).join('') : '')
          + `<button class="go" type="submit">${E(t('qGo'))}</button><button type="button" class="skipq" style="color:var(--muted);font-size:15px;text-decoration:underline;text-underline-offset:4px;align-self:center">${E(t('qSkip'))}</button>`;
        ask.after(f); f.scrollIntoView({ block: 'start' });
        const done = (out) => { f.remove(); ask.classList.remove('hide'); resolve(out); };
        f.onsubmit = async (e) => {
          e.preventDefault();
          const map = {}; un.forEach((p, i) => { const v = f.elements['n' + i].value.trim().replace(/[:\n]/g, ' ').slice(0, 40); if (v) map[p.name] = v; });
          if (Object.keys(map).length) { renameAll(map); saveLocal(); }
          const photos = [];
          for (let i = 0; i < ph.length; i++) { const file = f.elements['p' + i].files[0]; if (file && file.type.startsWith('image/')) { const d = await resizeJpeg(file); if (d) photos.push({ name: txt(ph[i].name).slice(0, 40), data: d }); } }
          done({ answers: qs.map((q, i) => ({ q: q.q, a: f.elements['q' + i].value.trim() })).filter((x) => x.a), photos });
        };
        f.querySelector('.skipq').onclick = () => done({ answers: [], photos: [] });
      });
    },
  };

  /* ---------- the report ---------- */

  /* the fixed "more from Barusik Platforms" block: static text, no tokens */
  const PROMO = {
    he: { h: 'עוד מבית BARUSIK PLATFORMS', s: 'מוזמנים לנסות', go: 'לפתוח', i: [['tr', '✈️', 'Bar Lvovski Travel', 'מלונות, טיסות וחבילות במחירי סוכן', '/travel/'], ['cx', '♟️', 'קומפליצס', 'שחמט עם דק כלים משוגע', '/complichess/'], ['pk', '💬', 'פלטפורמיקה', 'פוסטים, קליפים וצ׳אטים. 99% ליוצרים', '/platformika/'], ['cr', '🪙', 'Barusik Crypto', 'מסחר ומטבעות משלכם, בהדגמה', '/crypto/'], ['lr', '📚', 'LearnLume', 'אפליקציית למידה למבחן מהחומר שלכם', '/learnlume/']] },
    en: { h: 'More from BARUSIK PLATFORMS', s: 'Come and try', go: 'Open', i: [['tr', '✈️', 'Bar Lvovski Travel', 'Hotels, flights and packages at agent prices', '/travel/'], ['cx', '♟️', 'Complichess', 'Chess with a wild deck of pieces', '/complichess/'], ['pk', '💬', 'Platformika', 'Posts, clips and chats. 99% to creators', '/platformika/'], ['cr', '🪙', 'Barusik Crypto', 'Trade or create your own coin, demo mode', '/crypto/'], ['lr', '📚', 'LearnLume', 'An exam-prep app built from your own course material', '/learnlume/']] },
    ar: { h: 'المزيد من BARUSIK PLATFORMS', s: 'جرّبوا', go: 'افتح', i: [['tr', '✈️', 'Bar Lvovski Travel', 'فنادق ورحلات وباقات بأسعار الوكلاء', '/travel/'], ['cx', '♟️', 'كومبليتشس', 'شطرنج بتشكيلة قطع مجنونة', '/complichess/'], ['pk', '💬', 'بلاتفورميكا', 'منشورات ومقاطع ومحادثات. 99% للمبدعين', '/platformika/'], ['cr', '🪙', 'Barusik Crypto', 'تداول أو أنشئ عملتك، وضع تجريبي', '/crypto/'], ['lr', '📚', 'LearnLume', 'تطبيق استعداد للامتحان من مادتك', '/learnlume/']] },
    ru: { h: 'Ещё от BARUSIK PLATFORMS', s: 'Попробуйте', go: 'Открыть', i: [['tr', '✈️', 'Bar Lvovski Travel', 'Отели, перелёты и туры по агентским ценам', '/travel/'], ['cx', '♟️', 'Complichess', 'Шахматы с безумной колодой фигур', '/complichess/'], ['pk', '💬', 'Platformika', 'Посты, клипы и чаты. 99% авторам', '/platformika/'], ['cr', '🪙', 'Barusik Crypto', 'Торгуйте или создайте свою монету, демо', '/crypto/'], ['lr', '📚', 'LearnLume', 'Приложение для экзамена из ваших материалов', '/learnlume/']] },
    es: { h: 'Más de BARUSIK PLATFORMS', s: 'Anímate a probar', go: 'Abrir', i: [['tr', '✈️', 'Bar Lvovski Travel', 'Hoteles, vuelos y paquetes a precio de agente', '/travel/'], ['cx', '♟️', 'Complichess', 'Ajedrez con un mazo de piezas alocado', '/complichess/'], ['pk', '💬', 'Platformika', 'Publicaciones, clips y chats. 99% a los creadores', '/platformika/'], ['cr', '🪙', 'Barusik Crypto', 'Opera o crea tu moneda, modo demo', '/crypto/'], ['lr', '📚', 'LearnLume', 'App de examen hecha con tu material', '/learnlume/']] },
    fr: { h: 'Encore chez BARUSIK PLATFORMS', s: 'Venez essayer', go: 'Ouvrir', i: [['tr', '✈️', 'Bar Lvovski Travel', 'Hôtels, vols et forfaits à prix agent', '/travel/'], ['cx', '♟️', 'Complichess', 'Échecs avec un jeu de pièces déjanté', '/complichess/'], ['pk', '💬', 'Platformika', 'Posts, clips et chats. 99 % aux créateurs', '/platformika/'], ['cr', '🪙', 'Barusik Crypto', 'Tradez ou créez votre monnaie, mode démo', '/crypto/'], ['lr', '📚', 'LearnLume', 'Appli d’examen faite avec vos cours', '/learnlume/']] },
  };
  function promoHTML() {
    const P = PROMO[L] || PROMO.en;
    return `<div class="sec promo"><h2>${E(P.h)}</h2><p class="mute" style="margin:0 0 12px;color:var(--muted)">${E(P.s)}</p><div class="tiles">${P.i.map(([k, em, n, d, u]) => `<a class="tile" href="${u}" data-k="${k}"><span class="te">${em}</span><b>${E(n)}</b><span class="td">${E(d)}</span><span class="tg">${E(P.go)} ↗</span></a>`).join('')}</div></div>`;
  }
  const css2 = document.createElement('style');
  css2.textContent = `.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}.tile{display:flex;flex-direction:column;gap:6px;background:var(--plum);border-radius:20px;padding:16px;text-decoration:none;color:inherit;transition:transform .15s,background .15s}.tile:hover,.tile:focus-visible{transform:translateY(-3px);background:var(--plum-2)}.tile .te{font-size:30px;line-height:1}.tile b{font-family:var(--fd);font-weight:400;font-size:18px}.tile .td{color:var(--pearl-2);font-size:14px;flex:1}.tile .tg{color:var(--amber);font-weight:800;font-size:14px}`;
  document.head.appendChild(css2);
  const addPromo = () => { const el = $('#report'); el.querySelector('.promo')?.remove(); el.insertAdjacentHTML('beforeend', promoHTML()); };
  const v1 = renderReport;
  window.renderReport = function (r) {
    if (!r || r.v !== 2) { v1(r); linkBox($('#report')); addPromo(); return; }
    const el = $('#report'); el.classList.remove('hide');
    const sec = (title, inner) => (inner ? `<div class="sec"><h2>${E(title)}</h2>${inner}</div>` : '');
    const lead = txt(r.verdict).split(/\n\s*\n/).filter(Boolean).map((p) => `<p>${E(p)}</p>`).join('');
    const awards = arr(r.awards).map((a) => `<div class="award"><b>🏆 ${E(a.title)}</b><span class="wn">${E(a.who)}</span><p>${E(a.why)}</p></div>`).join('');
    const people = arr(r.people).map((p) => `
      <article class="card"><div class="top"><span class="dot" style="background:hsl(${hue(txt(p.name))} 70% 72%)">${E(initial(txt(p.name)))}</span><div><h3>${E(p.name)}</h3><span class="role">${E(p.role)}</span></div></div>
        <p>${E(p.roast)}</p><p class="kind">${E(p.kind)}</p>
        ${arr(p.habits).length ? `<div class="chips" aria-label="${E(t('habits'))}">${arr(p.habits).map((h) => `<span>${E(h)}</span>`).join('')}</div>` : ''}
        ${arr(p.signature).length ? `<div class="sigq">${arr(p.signature).map((s) => `<div>״${E(s)}״</div>`).join('')}</div>` : ''}
        ${p.fun_fact ? `<div class="fact">${E(t('fact'))}: ${E(p.fun_fact)}</div>` : ''}
        <div class="flags"><span class="g">${E(t('green'))}: ${E(p.green)}</span><span class="r">${E(t('red'))}: ${E(p.red)}</span></div></article>`).join('');
    const cases = arr(r.cases);
    const caseHtml = (c, i) => `<article class="case${i >= 10 ? ' extra hide' : ''}"><h3>${i + 1}. ${E(c.title)}</h3><div class="who2">${E(c.when)} · ${E(c.who)}</div><p>${E(c.story)}</p>${c.quote ? `<q>${E(c.quote)}</q>` : ''}<p class="pl">${E(c.punchline)}</p></article>`;
    const jokes = arr(r.jokes).map((j) => `<div class="j"><b>${E(j.title)}</b> <span class="mute" style="color:var(--muted)">· ${E(j.who)}</span><p>${E(j.explain)}</p>${j.quote ? `<q>״${E(j.quote)}״</q>` : ''}</div>`).join('');
    const pairs = arr(r.pairs).map((p) => `<div class="pairrow"><b>${E(p.a)} + ${E(p.b)}</b><p style="margin:4px 0 0;color:var(--pearl-2)">${E(p.note)}</p></div>`).join('');
    const tips = arr(r.tips).map((x) => `<div class="j"><b>💡 ${E(x.title)}</b>${x.who ? ` <span style="color:var(--muted)">· ${E(x.who)}</span>` : ''}<p>${E(x.tip)}</p></div>`).join('');
    const eras = arr(r.eras).map((e) => `<div class="era"><b>${E(e.label)}</b>${E(e.note)}</div>`).join('');
    const dyn = arr(r.dynamics).length ? `<ul class="dyn">${arr(r.dynamics).map((x) => `<li>${E(x)}</li>`).join('')}</ul>` : '';
    const moments = arr(r.moments).map((x) => `<blockquote><q>${E(x.quote)}</q><cite>${E(x.who)} · ${E(x.note)}</cite></blockquote>`).join('');
    const games = arr(r.games).filter(validGame);
    const pic = {}; arr(r.photos).forEach((x) => { if (x && x.name && /^data:image\/jpeg;base64,/.test(x.data || '')) { const im = new Image(); im.src = x.data; pic[txt(x.name).toLowerCase().trim()] = im; } });
    const findPic = (n) => { n = txt(n).toLowerCase().trim(); if (!n) return null; for (const k in pic) if (k === n || (k.length > 2 && (n.includes(k) || k.includes(n)))) return pic[k]; return null; };
    games.forEach((g) => { g._ph = g._ph || {}; [['hero', g.hero_name], ['bad', g.bad_name], ['good', g.good_name]].forEach(([k, n]) => { const im = findPic(n); if (im) g._ph[k] = im; }); });
    el.innerHTML = `
      <div class="verdict"><div class="pearl rolls" style="--dir:${RTL[L] ? -1 : 1}" role="img" aria-label="${E(t('score'))} ${E(r.score)}/10"><span class="score n">${E(r.score)}<small>/10</small></span></div>
        <div><h1>${E(r.headline)}</h1>${r.score_line ? `<p class="sline">${E(r.score_line)}</p>` : ''}</div></div>
      <div class="lead">${lead}</div>
      ${sec(t('awards'), awards ? `<div class="awards">${awards}</div>` : '')}
      ${sec(t('people2'), people)}
      ${sec(t('cases'), cases.length ? cases.map(caseHtml).join('') + (cases.length > 10 ? `<button class="morebtn" id="moreCases" type="button">${E(t('more', { n: cases.length - 10 }))}</button>` : '') : '')}
      ${sec(t('jokes'), jokes ? `<div class="jokes">${jokes}</div>` : '')}
      ${sec(t('games'), games.length ? `<div id="games">${games.map((g, i) => `<div class="gcard"><h3>${E(g.title)}</h3><p>${E(g.intro)}</p>${photoPick(g,i)}<div class="gmount" data-g="${i}"><button class="gbtn" type="button">${E(t('play'))}</button></div></div>`).join('')}</div>` : '')}
      ${sec(t('tips'), tips ? `<div class="jokes">${tips}</div>` : '')}
      ${sec(t('pairs'), pairs)}
      ${sec(t('eras'), eras)}
      ${sec(t('dyn'), dyn)}
      ${sec(t('moments'), moments)}
      <div class="sec"><h2>${E(t('advice'))}</h2><p class="advice">${E(r.advice)}</p></div>
      <div class="actions"><button class="go" id="shareBtn" style="padding:0 26px">${E(t('share'))}</button><button class="btn2" id="againBtn">${E(t('again'))}</button></div>`;
    $('#shareBtn').onclick = share;
    $('#againBtn').onclick = () => { SHARED = false; CUR = null; REPORT = null; STATS = null; EXCERPT = null; forgetLocal(); el.classList.add('hide'); $('#start').classList.remove('hide'); $('#file').value = ''; scrollTo(0, 0); };
    const more = $('#moreCases'); if (more) more.onclick = () => { el.querySelectorAll('.case.extra').forEach((c) => c.classList.remove('hide')); more.remove(); };
    el.querySelectorAll('.gph input').forEach((inp) => inp.onchange = () => { const f = inp.files[0]; if (!f || !f.type.startsWith('image/')) return; const g = games[+inp.dataset.g], im = new Image(); im.onload = () => { (g._ph = g._ph || {})[inp.dataset.k] = im; inp.parentElement.style.outline = '2px solid var(--mint)'; }; im.src = URL.createObjectURL(f); });
    el.querySelectorAll('.gmount').forEach((m) => { m.querySelector('button').onclick = () => launch(m, games[+m.dataset.g]); });
    linkBox(el); addPromo();
    scrollTo(0, 0);
  };


  /* ---------- a private link to the finished report ---------- */
  let SHARED = false, CUR = null;
  async function savedId() {
    if (CUR) return CUR;
    const q = await sb.from('pn_requests').select('id').not('report', 'is', null).order('done_at', { ascending: false, nullsFirst: false }).limit(1);
    return q.data && q.data[0] && q.data[0].id;
  }
  function linkBox(el) {
    const main = el.querySelector('#shareBtn'), row = el.querySelector('.actions'); if (!main || !row || row.querySelector('[data-img]')) return;
    const imgBtn = document.createElement('button'); imgBtn.className = 'btn2'; imgBtn.type = 'button'; imgBtn.dataset.img = '1'; imgBtn.textContent = '🖼️ ' + t('img'); imgBtn.onclick = share;
    main.after(imgBtn);
    const note = document.createElement('p'); note.style.cssText = 'margin:10px 0 0;font-size:14px;color:var(--muted);flex-basis:100%;word-break:break-all'; row.appendChild(note);
    if (SHARED) { main.textContent = t('img'); main.onclick = share; imgBtn.remove(); return; }
    main.textContent = '🔗 ' + t('lnk');
    main.onclick = async () => {
      if (!USER) { share(); return; }
      main.disabled = true; note.textContent = '';
      try {
        const id = await savedId(); if (!id) throw 0;
        const r = await sb.rpc('pn_share_report', { p_id: id, p_on: true }); if (r.error || !r.data) throw 0;
        const url = location.origin + '/penina/?r=' + r.data;
        let shared = false;
        if (navigator.share) { try { await navigator.share({ url, title: t('title'), text: t('title') }); shared = true; } catch { /* cancelled */ } }
        if (!shared) { try { await navigator.clipboard.writeText(url); } catch { /* shown below anyway */ } }
        note.innerHTML = E(t('lnkOk')) + '<br><span dir="ltr">' + E(url) + '</span> · <a href="#" id="lnkOff" style="color:var(--amber)">' + E(t('lnkOff')) + '</a>';
        note.querySelector('#lnkOff').onclick = async (e) => { e.preventDefault(); await sb.rpc('pn_share_report', { p_id: id, p_on: false }); note.textContent = t('lnkGone'); };
      } catch { note.textContent = t('busy'); }
      main.disabled = false;
    };
  }
  window.PShare = {
    async boot() {
      const adm = new URLSearchParams(location.search).get('a');
      if (adm && /^[0-9a-f-]{36}$/i.test(adm)) {
        try {
          const { data: { session } } = await sb.auth.getSession(); if (!session) return;
          const r = await sb.rpc('pn_admin_get_report', { p_id: adm }); if (r.error || !r.data || !r.data.report) return;
          SHARED = true; REPORT = r.data.report; $('#start').classList.add('hide'); $('#local').classList.add('hide'); renderReport(REPORT);
          const d = r.data, bar = document.createElement('div');
          bar.style.cssText = 'background:var(--plum);border-radius:16px;padding:12px 16px;margin:0 0 18px;font-size:14px;color:var(--pearl-2)';
          bar.innerHTML = '<b>Admin</b> · <span dir="ltr">' + E(d.email) + '</span> · ' + E(d.model) + (d.cost_usd != null ? ' · $' + Number(d.cost_usd).toFixed(2) : '') +
            (arr(d.answers).length ? '<details style="margin-top:8px"><summary style="cursor:pointer">Q&amp;A</summary>' + arr(d.answers).map((x) => '<p style="margin:8px 0 0"><b>' + E(x.q) + '</b><br>' + E(x.a) + '</p>').join('') + '</details>' : '');
          $('#report').prepend(bar);
        } catch { /* not allowed */ }
        return;
      }
      const tok = new URLSearchParams(location.search).get('r'); if (!tok || !/^[0-9a-f-]{36}$/i.test(tok)) return;
      try {
        const r = await sb.rpc('pn_shared_report', { p_token: tok });
        if (r.error || !r.data) return;
        SHARED = true; REPORT = r.data; $('#start').classList.add('hide'); $('#local').classList.add('hide'); renderReport(REPORT);
      } catch { /* not a valid link: show the normal page */ }
    },
  };


  /* ---------- names: contacts that are only a number get a neutral label, and the customer can name anyone ---------- */
  const PHONEISH = (n) => (String(n).replace(/\D/g, '').length >= 6 && !/\p{L}/u.test(n)) || /^[~\s]*$/.test(n);
  const isPlaceholder = (n) => n.startsWith(t('nmP') + ' ') && /\d+$/.test(n);
  function renameAll(map) {
    for (const p of STATS.people) if (map[p.name]) p.name = map[p.name];
    EXCERPT = EXCERPT.split('\n').map((ln) => {
      const m = ln.match(/^\d{4}-\d\d-\d\d \d\d:\d\d \| /); if (!m) return ln;
      const k = ln.indexOf(': ', m[0].length); if (k < 0) return ln;
      const who = ln.slice(m[0].length, k); return map[who] ? m[0] + map[who] + ln.slice(k) : ln;
    }).join('\n');
    if (REPORT === null) saveLocal();
  }
  window.PNames = {
    fix() {
      const map = {}; let n = 1;
      for (const p of STATS.people) if (PHONEISH(p.name)) map[p.name] = t('nmP') + ' ' + n++;
      if (Object.keys(map).length) renameAll(map);
    },
    render() {
      const ask = $('#ask'); if (!ask || !STATS) return; $('#namesBox')?.remove();
      const ppl = STATS.people.slice(0, 30), un = ppl.filter((p) => isPlaceholder(p.name)), rest = ppl.filter((p) => !isPlaceholder(p.name));
      const row = (p) => `<label style="display:flex;flex-direction:column;gap:4px;font-weight:600"><span>${E(p.name)} <span style="color:var(--muted);font-weight:400">· ${p.msgs}</span></span><input data-old="${E(p.name)}" maxlength="40" placeholder="${E(p.name)}" style="height:44px;border-radius:12px;border:1px solid var(--line);background:var(--night);padding:0 12px;color:inherit;font:inherit"></label>`;
      const box = document.createElement('div'); box.id = 'namesBox'; box.className = 'qform'; box.style.margin = '0 0 24px';
      box.innerHTML = `<h3>${E(t('nmT'))}</h3><p>${E(t('nmS'))}</p>${un.map(row).join('')}${rest.length ? `<details${un.length ? '' : ' open'}><summary style="cursor:pointer;color:var(--amber);margin:4px 0 10px">${E(t('nmMore'))}</summary><div style="display:flex;flex-direction:column;gap:12px">${rest.map(row).join('')}</div></details>` : ''}<button class="go" type="button">${E(t('nmGo'))}</button>`;
      ask.before(box);
      box.querySelector('button').onclick = () => {
        const map = {}; box.querySelectorAll('input').forEach((i) => { const v = i.value.trim().replace(/[:\n]/g, ' ').slice(0, 40); if (v && v !== i.dataset.old) map[i.dataset.old] = v; });
        if (Object.keys(map).length) { renameAll(map); saveLocal(); renderLocal(); }
      };
    },
  };
  const rl = renderLocal;
  window.renderLocal = function () { rl(); PNames.render(); };


  /* ---------- the customer's own list of reports ---------- */
  async function sendLink(id, btn) {
    btn.disabled = true;
    try {
      const r = await sb.rpc('pn_share_report', { p_id: id, p_on: true }); if (r.error || !r.data) throw 0;
      const url = location.origin + '/penina/?r=' + r.data;
      if (navigator.share) { try { await navigator.share({ url, title: t('title') }); } catch { /* cancelled */ } }
      else { try { await navigator.clipboard.writeText(url); } catch { /* ignore */ } btn.textContent = t('lnkOk').split('.')[0]; setTimeout(() => { btn.textContent = t('mySend'); }, 2500); }
    } catch { btn.textContent = t('busy').slice(0, 30); }
    btn.disabled = false;
  }
  window.PList = {
    async load() {
      const start = $('#start'); if (!start || !sb || !USER) { $('#myReports')?.remove(); return; }
      let rows = [];
      try {
        const q = await sb.from('pn_requests').select('id,done_at,headline:report->>headline,score:report->>score').not('report', 'is', null).order('done_at', { ascending: false, nullsFirst: false }).limit(30);
        rows = q.data || [];
      } catch { /* no list */ }
      $('#myReports')?.remove(); if (!rows.length) return;
      const box = document.createElement('div'); box.id = 'myReports'; box.className = 'sec';
      box.innerHTML = `<h2>${E(t('myT'))}</h2>` + rows.map((r) => `<div class="pairrow" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><div style="flex:1;min-width:180px"><b>${E(r.headline || '—')}</b><br><span style="color:var(--muted);font-size:14px">${r.done_at ? new Date(r.done_at).toLocaleDateString(L) : ''}${r.score ? ' · ' + E(r.score) + '/10' : ''}</span></div><button class="btn2" type="button" data-open="${r.id}" style="height:42px;padding:0 18px">${E(t('myOpen'))}</button><button class="btn2" type="button" data-send="${r.id}" style="height:42px;padding:0 18px">${E(t('mySend'))}</button></div>`).join('');
      start.appendChild(box);
      box.querySelectorAll('[data-open]').forEach((b) => b.onclick = async () => {
        b.disabled = true;
        const q = await sb.from('pn_requests').select('report').eq('id', b.dataset.open).maybeSingle();
        b.disabled = false; if (!q.data || !q.data.report) return;
        CUR = b.dataset.open; SHARED = false; REPORT = q.data.report; $('#start').classList.add('hide'); $('#local').classList.add('hide'); renderReport(REPORT);
      });
      box.querySelectorAll('[data-send]').forEach((b) => b.onclick = () => sendLink(b.dataset.send, b));
    },
  };
  const ra = refreshAsk;
  window.refreshAsk = async function () { await ra(); PList.load(); };

  /* ---------- the games ---------- */
  function validGame(g) {
    if (!g || !g.title || !g.intro) return false;
    if (g.type === 'quiz') return arr(g.rounds).filter((q) => q && q.quote && q.answer && arr(q.options).length >= 2).length >= 3;
    return ['dodge', 'catch', 'tap'].includes(g.type);
  }
  function photoPick(g, i) {
    const slots = g.type === 'dodge' ? [['hero', g.hero_name], ['bad', g.bad_name]] : g.type === 'catch' ? [['good', g.good_name], ['bad', g.bad_name]] : g.type === 'tap' ? [['bad', g.bad_name]] : [];
    const ok = slots.filter(([, n]) => txt(n).trim());
    // photos are collected before the report is written, never in the shared page
    return '';
    if (!ok.length) return '';
    return `<div class="gph" title="${E(t('photoHint'))}">${ok.map(([k, n]) => `<label>📷 ${E(t('photoOf', { n: txt(n) }))}<input type="file" accept="image/*" data-g="${i}" data-k="${k}"></label>`).join('')}</div><p style="font-size:13px;color:var(--muted);margin:-4px 0 10px">${E(t('photoHint'))}</p>`;
  }
  function sprite(x, g, k, fallback, px, py, size) {
    const im = g._ph && g._ph[k];
    if (im && im.naturalWidth) {
      x.save(); x.beginPath(); x.arc(px, py, size * 0.55, 0, 7); x.clip();
      const r = Math.max(size * 1.1 / im.naturalWidth, size * 1.1 / im.naturalHeight), w = im.naturalWidth * r, h = im.naturalHeight * r;
      x.drawImage(im, px - w / 2, py - h / 2, w, h); x.restore();
    } else { x.font = size + 'px serif'; x.fillText(fallback, px, py); }
  }
  let stopCurrent = null;
  function launch(m, g) {
    if (stopCurrent) stopCurrent();
    ({ dodge, catch: catchGame, tap, quiz }[g.type])(m, g);
  }
  const emoji = (s, d) => (txt(s).trim() ? [...txt(s).trim()].slice(0, 6).join('') : d);
  function overlay(box, title, line, onAgain) {
    const o = document.createElement('div'); o.className = 'gover';
    o.innerHTML = `<b>${E(title)}</b><div>${E(line)}</div><button class="gbtn" type="button">${E(t('again2'))}</button>`;
    o.querySelector('button').onclick = () => { o.remove(); onAgain(); };
    box.appendChild(o);
  }
  function canvasBox(m, hint) {
    m.innerHTML = `<div class="ghud"><span class="hl"></span><span class="hr"></span></div><div class="gbox"><canvas></canvas></div><p style="margin:10px 0 0;font-size:14px;color:var(--muted);text-align:center">${E(hint)}</p>`;
    const box = m.querySelector('.gbox'), cv = m.querySelector('canvas');
    const W = Math.min(420, m.clientWidth || 360), H = Math.round(W * 1.15), dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px';
    const x = cv.getContext('2d'); x.scale(dpr, dpr); x.textAlign = 'center'; x.textBaseline = 'middle';
    return { box, cv, x, W, H, hl: m.querySelector('.hl'), hr: m.querySelector('.hr') };
  }
  const heart = (n) => '❤️'.repeat(Math.max(0, n)) || '💔';

  /* arcade: something falls, you move left and right. kind 'dodge' = avoid it, kind 'catch' = catch the good one, avoid the bad one */
  function arcade(m, g, kind) {
    const hero = kind === 'dodge' ? emoji(g.hero_emoji, '🙂') : '🧺', bad = emoji(g.bad_emoji, kind === 'dodge' ? '🚗' : '💣'), good = emoji(g.good_emoji, '⭐');
    const C = canvasBox(m, t('hint1')), { box, cv, x, W, H } = C;
    let px, lives, score, items, raf, last, t0, keys, dead, spawnAcc;
    const DURATION = 40;
    function reset() { px = W / 2; lives = 3; score = 0; items = []; keys = {}; dead = false; spawnAcc = 0; t0 = last = performance.now(); raf = requestAnimationFrame(frame); }
    function end(won) {
      dead = true; cancelAnimationFrame(raf); stopCurrent = null;
      overlay(box, won ? t('win') : t('over'), `${txt(won ? g.win_text : g.lose_text)} · ${t('score2')}: ${score}`, reset);
    }
    function frame(now) {
      if (dead) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now; const el = (now - t0) / 1000;
      if (keys.ArrowLeft) px -= 330 * dt; if (keys.ArrowRight) px += 330 * dt; px = Math.max(24, Math.min(W - 24, px));
      spawnAcc += dt * (1.1 + el * 0.045);
      while (spawnAcc >= 1) { spawnAcc -= 1; const isGood = kind === 'catch' && Math.random() < 0.55; items.push({ x: 24 + Math.random() * (W - 48), y: -30, v: 110 + el * 5 + Math.random() * 70, good: isGood }); }
      for (const it of items) it.y += it.v * dt;
      items = items.filter((it) => {
        const hit = Math.abs(it.x - px) < 30 && Math.abs(it.y - (H - 44)) < 32;
        if (hit) { if (kind === 'dodge') lives--; else if (it.good) score++; else lives--; return false; }
        if (it.y > H + 30) { if (kind === 'dodge') score++; return false; }
        return true;
      });
      x.clearRect(0, 0, W, H);
      const bg = x.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#2a1536'); bg.addColorStop(1, '#1b0d24'); x.fillStyle = bg; x.fillRect(0, 0, W, H);
      for (const it of items) it.good ? sprite(x, g, 'good', good, it.x, it.y, 38) : sprite(x, g, 'bad', bad, it.x, it.y, 38);
      sprite(x, g, 'hero', hero, px, H - 44, 46);
      C.hl.textContent = heart(lives); C.hr.textContent = `${t('score2')}: ${score} · ${Math.max(0, Math.ceil(DURATION - el))}`;
      if (lives <= 0) return end(false);
      if (el >= DURATION) return end(true);
      raf = requestAnimationFrame(frame);
    }
    const mv = (e) => { const r = cv.getBoundingClientRect(); px = (e.clientX - r.left) / r.width * W; };
    cv.addEventListener('pointermove', mv); cv.addEventListener('pointerdown', mv);
    const kd = (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { keys[e.key] = true; e.preventDefault(); } }, ku = (e) => { keys[e.key] = false; };
    addEventListener('keydown', kd); addEventListener('keyup', ku);
    stopCurrent = () => { dead = true; cancelAnimationFrame(raf); removeEventListener('keydown', kd); removeEventListener('keyup', ku); m.innerHTML = `<button class="gbtn" type="button">${E(t('play'))}</button>`; m.querySelector('button').onclick = () => launch(m, g); };
    reset();
  }
  const dodge = (m, g) => arcade(m, g, 'dodge');
  const catchGame = (m, g) => arcade(m, g, 'catch');

  function tap(m, g) {
    const target = emoji(g.bad_emoji, '🎯');
    m.innerHTML = `<div class="ghud"><span class="hl"></span><span class="hr"></span></div><div class="gbox"><div class="holes">${Array.from({ length: 9 }, () => '<button class="hole" type="button" aria-label="' + E(txt(g.bad_name) || target) + '"></button>').join('')}</div></div><p style="margin:10px 0 0;font-size:14px;color:var(--muted);text-align:center">${E(t('hint2'))}</p>`;
    const box = m.querySelector('.gbox'), holes = [...m.querySelectorAll('.hole')], hl = m.querySelector('.hl'), hr = m.querySelector('.hr');
    let score = 0, left = 30, timer, popper, dead = false;
    const clear = () => holes.forEach((h) => { h.textContent = ''; h.innerHTML = ''; h.dataset.on = ''; });
    function pop() { clear(); const h = holes[Math.floor(Math.random() * 9)]; if (g._ph && g._ph.bad) { h.innerHTML = ''; const im = g._ph.bad.cloneNode(); im.style.cssText = 'width:80%;height:80%;object-fit:cover;border-radius:50%'; h.appendChild(im); } else h.textContent = target; h.dataset.on = '1'; popper = setTimeout(pop, 650 + Math.random() * 350); }
    function stop(won) { dead = true; clearInterval(timer); clearTimeout(popper); clear(); stopCurrent = null; overlay(box, won ? t('win') : t('over'), `${txt(won ? g.win_text : g.lose_text)} · ${t('score2')}: ${score}`, () => tap(m, g)); }
    holes.forEach((h) => h.onclick = () => { if (dead || h.dataset.on !== '1') return; score++; h.dataset.on = ''; h.textContent = '💥'; hl.textContent = `${t('score2')}: ${score}`; });
    hl.textContent = `${t('score2')}: 0`; hr.textContent = String(left);
    timer = setInterval(() => { left--; hr.textContent = String(left); if (left <= 0) stop(score >= 12); }, 1000);
    pop();
    stopCurrent = () => { dead = true; clearInterval(timer); clearTimeout(popper); m.innerHTML = `<button class="gbtn" type="button">${E(t('play'))}</button>`; m.querySelector('button').onclick = () => launch(m, g); };
  }

  function quiz(m, g) {
    const rounds = arr(g.rounds).filter((q) => q && q.quote && q.answer && arr(q.options).length >= 2).slice(0, 8);
    let i = 0, right = 0;
    const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
    function show() {
      if (i >= rounds.length) { m.innerHTML = `<div class="gover" style="position:static;background:none"><b>${E(right >= rounds.length / 2 ? t('win') : t('over'))}</b><div>${E(t('quizRes', { n: right, t: rounds.length }))}</div><button class="gbtn" type="button">${E(t('again2'))}</button></div>`; m.querySelector('button').onclick = () => { i = 0; right = 0; show(); }; return; }
      const q = rounds[i], opts = shuffle(arr(q.options).map(txt));
      if (!opts.includes(txt(q.answer))) opts[0] = txt(q.answer);
      m.innerHTML = `<div class="ghud"><span>${E(t('quizQ'))}</span><span>${i + 1}/${rounds.length}</span></div><blockquote style="border:0;padding:6px 0 0"><q>${E(q.quote)}</q></blockquote><div class="qopts">${opts.map((o) => `<button class="qopt" type="button">${E(o)}</button>`).join('')}</div>`;
      m.querySelectorAll('.qopt').forEach((b) => b.onclick = () => {
        const ok = b.textContent === txt(q.answer); if (ok) right++;
        m.querySelectorAll('.qopt').forEach((x) => { x.disabled = true; if (x.textContent === txt(q.answer)) x.classList.add('ok'); });
        if (!ok) b.classList.add('no');
        setTimeout(() => { i++; show(); }, 1100);
      });
    }
    stopCurrent = () => { m.innerHTML = `<button class="gbtn" type="button">${E(t('play'))}</button>`; m.querySelector('button').onclick = () => launch(m, g); };
    show();
  }
})();
