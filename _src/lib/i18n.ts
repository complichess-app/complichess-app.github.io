export const LANGS = ['he', 'en', 'ar', 'ru', 'es', 'fr'] as const;
export type Lang = (typeof LANGS)[number];
export const RTL: Record<Lang, boolean> = { he: true, ar: true, en: false, ru: false, es: false, fr: false };
export const LANG_NAMES: Record<Lang, string> = { he: 'עברית', en: 'English', ar: 'العربية', ru: 'Русский', es: 'Español', fr: 'Français' };

export type Dict = {
  brand: string;            // "Barusik Platforms" in the language
  metaTitle: string;
  metaDesc: string;
  skip: string;
  heroKicker: string;
  heroTitle: string;
  heroSub: string;
  scroll: string;
  nav: { platforms: string; install: string; contact: string; lang: string };
  count: string;            // "5 platforms"
  soon: string;
  live: string;
  open: string;
  install: string;
  howInstall: string;
  pk: { name: string; tag: string; desc: string; points: string[] };
  cx: { name: string; tag: string; desc: string; points: string[] };
  tr: { name: string; tag: string; desc: string; points: string[] };
  trVisit: string;
  trWa: string;
  cr: { name: string; tag: string; desc: string; points: string[] };
  lr: { name: string; tag: string; desc: string; points: string[] };
  lrDl: string;
  lrNote: string;
  drag: string;
  acc: { login: string; signup: string; logout: string; email: string; password: string; username: string; admin: string; one: string; hi: string; check: string; forgot: string; sent: string; bad: string; taken: string; short: string; badMail: string; busy: string; yours: string };
  installTitle: string;
  installSub: string;
  iphone: string;
  android: string;
  computer: string;
  stepsIphone: string[];
  stepsAndroid: string[];
  stepsComputer: string[];
  scanQr: string;
  updatesNote: string;
  close: string;
  contactTitle: string;
  contactSub: string;
  rights: string;
};

const he: Dict = {
  brand: 'הפלטפורמות של ברוסיק',
  metaTitle: 'ברוסיק · הפלטפורמות של ברוסיק',
  metaDesc: 'Bar Lvovski Travel, פלטפורמיקה, קומפליצס, LearnLume ופלטפורמת קריפטו — חמש פלטפורמות תחת חברה אחת.',
  skip: 'דלג לתוכן',
  heroKicker: 'Barusik Platforms',
  heroTitle: 'הפלטפורמות של ברוסיק',
  heroSub: 'סוכנות נסיעות, רשת חברתית שהרווח שלה הולך ליוצרים, שחמט שבו אתה בונה את הצבא, למידה למבחנים עם AI, ופלטפורמת קריפטו בדרך.',
  scroll: 'גלול למטה',
  nav: { platforms: 'הפלטפורמות', install: 'התקנה', contact: 'צור קשר', lang: 'שפה' },
  count: '5 פלטפורמות',
  soon: 'בקרוב',
  live: 'זמין עכשיו',
  open: 'פתח בדפדפן',
  install: 'הורד והתקן',
  howInstall: 'איך מתקינים?',
  tr: {"name": "Bar Lvovski Travel", "tag": "travel.barusik.com", "desc": "סוכנות הנסיעות שלי: מלונות, טיסות, חבילות נופש, השכרת רכב וכרטיסים — במחירי סוכן ועם שירות אישי בוואטסאפ, בכל שעה.", "points": ["מלונות בכל העולם — הזמנה ישירה באתר", "טיסות וחבילות — הצעת מחיר אישית", "וואטסאפ בכל שעה: 055-6630709"]},
  trVisit: 'לאתר הנסיעות',
  trWa: 'וואטסאפ 24/7',
  pk: { name: 'פלטפורמיקה', tag: 'One Platform. Everyone Connected. Creators First.', desc: 'פוסטים, סטוריז, קליפים וצ׳אטים באפליקציה אחת — ו־99% מהרווח הנקי הולך ליוצרים.', points: ['פיד, סטוריז וקליפים', 'צ׳אטים פרטיים', 'מרכז יוצרים עם חלוקת 99/1'] },
  cx: { name: 'קומפליצס', tag: 'Complichess', desc: 'שחמט שבו אתה בונה את השורה האחורית מדק של 35 נקודות: כלים קלאסיים, כלי פיות וכלים מקוריים כמו חבל, אקדח וגרוויטציה.', points: ['נגד המחשב, 10 רמות', 'אונליין עם חבר או יריב אקראי', 'Tempo בזמן אמת ו־Brainmaxing'] },
  cr: { name: 'פלטפורמת קריפטו', tag: 'Barusik Crypto', desc: 'מקום ליצור מטבעות חדשים ולסחור במטבעות קיימים. אנחנו בונים אותה עכשיו.', points: ['יצירת מטבע', 'מסחר', 'בקרוב'] },
  lr: { name: 'LearnLume', tag: 'LearnLume · Windows', desc: "גוררים את קובצי ה־PDF של הקורס, ו־LearnLume בונה מהם במחשב שלך אפליקציית למידה מלאה למבחן: יחידות מאפס, מבחנים פתורים, כרטיסיות, כפתור \"עדיין לא הבנתי\" בכל שאלה וסרטון הסבר לכל נושא. בלי אינטרנט.", points: ["אפליקציית מבחן מחומר הקורס שלך", "\"עדיין לא הבנתי\" בכל שאלה", "עובד במחשב, בלי אינטרנט"] },
  lrDl: "הורד ל־Windows",
  lrNote: "Windows 10/11 + Python 3 · גרסה 0.2 · בהפעלה הראשונה יורדים כלים ומודלים (כ־7 ג׳יגה), ואחר כך הכל עובד בלי אינטרנט.",
  drag: 'גררו כל חלק עם העכבר',
  acc: {"login": "התחברות", "signup": "הרשמה", "logout": "התנתקות", "email": "מייל", "password": "סיסמה", "username": "שם משתמש", "admin": "דף ניהול", "one": "משתמש אחד לכל הפלטפורמות של ברוסיק — פלטפורמיקה, קומפליצס ומה שיבוא. כבר יש לכם משתמש בקומפליצס? התחברו איתו.", "hi": "מחובר/ת בתור", "check": "שלחנו לכם מייל אימות. אשרו אותו ואז התחברו.", "forgot": "שכחתי סיסמה", "sent": "אם המייל רשום — נשלח אליו קישור לאיפוס.", "bad": "מייל או סיסמה לא נכונים", "taken": "שם המשתמש תפוס — נסו אחר", "short": "הסיסמה צריכה לפחות 6 תווים, ושם המשתמש 2–20 תווים", "badMail": "כתובת מייל לא תקינה", "busy": "רגע…", "yours": "הפלטפורמות שלך"},
  installTitle: 'התקנה בשתי לחיצות',
  installSub: 'אין חנות אפליקציות ואין קובץ להוריד. האפליקציה נשמרת במסך הבית ונפתחת כמו כל אפליקציה.',
  iphone: 'אייפון',
  android: 'אנדרואיד',
  computer: 'מחשב',
  stepsIphone: ['פתחו את הקישור בספארי', 'לחצו על כפתור השיתוף', 'בחרו "הוסף למסך הבית"'],
  stepsAndroid: ['פתחו את הקישור בכרום', 'לחצו על ⋮ בפינה', 'בחרו "התקן אפליקציה"'],
  stepsComputer: ['פתחו בכרום או ב־Edge', 'לחצו על סמל ההתקנה בשורת הכתובת', 'האפליקציה תופיע בתפריט ההתחלה'],
  scanQr: 'או סרקו עם הטלפון',
  updatesNote: 'עדכונים מגיעים לבד — בלי להוריד שוב.',
  close: 'סגור',
  contactTitle: 'רוצים לדבר?',
  contactSub: 'שיתופי פעולה, שאלות או בקשת רשות להשתמש בתוכן.',
  rights: 'כל הזכויות שמורות לבר לבובסקי.',
};

const en: Dict = {
  brand: 'Barusik Platforms',
  metaTitle: 'Barusik Platforms',
  metaDesc: 'Bar Lvovski Travel, Platformika, Complichess, LearnLume and a crypto platform — five platforms under one company.',
  skip: 'Skip to content',
  heroKicker: 'Barusik Platforms',
  heroTitle: 'Barusik Platforms',
  heroSub: 'A travel agency, a social network that pays its creators, chess where you build your own army, AI exam prep, and a crypto platform on the way.',
  scroll: 'Scroll down',
  nav: { platforms: 'Platforms', install: 'Install', contact: 'Contact', lang: 'Language' },
  count: '5 platforms',
  soon: 'Coming soon',
  live: 'Available now',
  open: 'Open in browser',
  install: 'Download & install',
  howInstall: 'How to install?',
  tr: {"name": "Bar Lvovski Travel", "tag": "travel.barusik.com", "desc": "My travel agency: hotels, flights, holiday packages, car rental and tickets — at agent prices, with personal service on WhatsApp at any hour.", "points": ["Hotels worldwide — book right on the site", "Flights and packages — a personal quote", "WhatsApp any time: +972 55-663-0709"]},
  trVisit: 'Visit the travel site',
  trWa: 'WhatsApp 24/7',
  pk: { name: 'Platformika', tag: 'One Platform. Everyone Connected. Creators First.', desc: 'Posts, stories, clips and chats in one app — and 99% of net profit goes to creators.', points: ['Feed, stories and clips', 'Private chats', 'Creator hub with a 99/1 split'] },
  cx: { name: 'Complichess', tag: 'Complichess', desc: 'Chess where you build your back rank from a 35-point deck: classic pieces, fairy pieces and originals like the rope, the gun and gravity.', points: ['Vs computer, 10 levels', 'Online with a friend or a random opponent', 'Real-time Tempo and Brainmaxing'] },
  cr: { name: 'Crypto platform', tag: 'Barusik Crypto', desc: 'A place to create new coins and trade existing ones. We are building it now.', points: ['Create a coin', 'Trade', 'Coming soon'] },
  lr: { name: 'LearnLume', tag: 'LearnLume · Windows', desc: "Drop in your course PDFs and LearnLume builds a full exam-prep app from them, on your own computer: units from zero, solved past exams, flashcards, a \"still don’t get it\" button on every question and an explainer video for every topic. No internet needed.", points: ["An exam app from your own course material", "\"Still don’t get it\" on every question", "Runs on your computer, offline"] },
  lrDl: "Download for Windows",
  lrNote: "Windows 10/11 + Python 3 · version 0.2 · the first run downloads tools and models (about 7 GB); after that everything works offline.",
  drag: 'Drag any part with your mouse',
  acc: {"login": "Sign in", "signup": "Sign up", "logout": "Sign out", "email": "Email", "password": "Password", "username": "Username", "admin": "Admin page", "one": "One account for every Barusik platform — Platformika, Complichess and whatever comes next. Already play Complichess? Sign in with that account.", "hi": "Signed in as", "check": "We sent you a confirmation email. Confirm it, then sign in.", "forgot": "Forgot password", "sent": "If the email is registered, a reset link is on its way.", "bad": "Wrong email or password", "taken": "That username is taken — try another", "short": "Password needs 6+ characters and username 2–20", "badMail": "Invalid email address", "busy": "One moment…", "yours": "Your platforms"},
  installTitle: 'Install in two taps',
  installSub: 'No app store, no file to download. The app lives on your home screen and opens like any other app.',
  iphone: 'iPhone',
  android: 'Android',
  computer: 'Computer',
  stepsIphone: ['Open the link in Safari', 'Tap the Share button', 'Choose "Add to Home Screen"'],
  stepsAndroid: ['Open the link in Chrome', 'Tap ⋮ in the corner', 'Choose "Install app"'],
  stepsComputer: ['Open in Chrome or Edge', 'Click the install icon in the address bar', 'The app appears in your start menu'],
  scanQr: 'Or scan with your phone',
  updatesNote: 'Updates arrive on their own — no reinstalling.',
  close: 'Close',
  contactTitle: 'Want to talk?',
  contactSub: 'Partnerships, questions, or permission to use our content.',
  rights: 'All rights reserved to Bar Lvovski.',
};

const ar: Dict = {
  brand: 'منصات باروسيك',
  metaTitle: 'منصات باروسيك',
  metaDesc: 'Bar Lvovski Travel وبلاتفورميكا وكومبليتشس و LearnLume ومنصة عملات رقمية — خمس منصات تحت شركة واحدة.',
  skip: 'انتقل إلى المحتوى',
  heroKicker: 'Barusik Platforms',
  heroTitle: 'منصات باروسيك',
  heroSub: 'وكالة سفر، وشبكة اجتماعية تذهب أرباحها إلى المبدعين، وشطرنج تبني فيه جيشك بنفسك، واستعداد للامتحانات بالذكاء الاصطناعي، ومنصة عملات رقمية في الطريق.',
  scroll: 'مرّر للأسفل',
  nav: { platforms: 'المنصات', install: 'التثبيت', contact: 'تواصل', lang: 'اللغة' },
  count: '5 منصات',
  soon: 'قريبًا',
  live: 'متاح الآن',
  open: 'افتح في المتصفح',
  install: 'نزّل وثبّت',
  howInstall: 'كيف أثبّت؟',
  tr: {"name": "Bar Lvovski Travel", "tag": "travel.barusik.com", "desc": "وكالة السفر الخاصة بي: فنادق ورحلات طيران وباقات عطلات وتأجير سيارات وتذاكر — بأسعار الوكلاء ومع خدمة شخصية عبر واتساب في أي ساعة.", "points": ["فنادق حول العالم — احجز مباشرة من الموقع", "رحلات وباقات — عرض سعر شخصي", "واتساب في أي وقت: 972556630709+"]},
  trVisit: 'إلى موقع السفر',
  trWa: 'واتساب 24/7',
  pk: { name: 'بلاتفورميكا', tag: 'One Platform. Everyone Connected. Creators First.', desc: 'منشورات وقصص ومقاطع ومحادثات في تطبيق واحد — و99% من صافي الربح يذهب إلى المبدعين.', points: ['خلاصة وقصص ومقاطع', 'محادثات خاصة', 'مركز مبدعين بتقسيم 99/1'] },
  cx: { name: 'كومبليتشس', tag: 'Complichess', desc: 'شطرنج تبني فيه صفك الخلفي من تشكيلة بـ35 نقطة: قطع كلاسيكية وقطع خيالية وقطع أصلية مثل الحبل والمسدس والجاذبية.', points: ['ضد الحاسوب، 10 مستويات', 'عبر الإنترنت مع صديق أو خصم عشوائي', 'Tempo في الوقت الحقيقي وBrainmaxing'] },
  cr: { name: 'منصة العملات الرقمية', tag: 'Barusik Crypto', desc: 'مكان لإنشاء عملات جديدة وتداول العملات الموجودة. نحن نبنيها الآن.', points: ['إنشاء عملة', 'تداول', 'قريبًا'] },
  lr: { name: 'LearnLume', tag: 'LearnLume · Windows', desc: "اسحب ملفات PDF الخاصة بالمقرر، ويبني LearnLume منها على حاسوبك تطبيقًا كاملًا للاستعداد للامتحان: وحدات من الصفر، امتحانات محلولة، بطاقات، زر \"ما زلت لم أفهم\" في كل سؤال وفيديو شرح لكل موضوع. بدون إنترنت.", points: ["تطبيق امتحان من مواد مقررك", "\"ما زلت لم أفهم\" في كل سؤال", "يعمل على حاسوبك بدون إنترنت"] },
  lrDl: "نزّل لـ Windows",
  lrNote: "Windows 10/11 + Python 3 · الإصدار 0.2 · التشغيل الأول ينزّل الأدوات والنماذج (حوالي 7 غيغابايت)، وبعدها يعمل كل شيء بدون إنترنت.",
  drag: 'اسحب أي جزء بالفأرة',
  acc: {"login": "تسجيل الدخول", "signup": "إنشاء حساب", "logout": "تسجيل الخروج", "email": "البريد الإلكتروني", "password": "كلمة المرور", "username": "اسم المستخدم", "admin": "صفحة الإدارة", "one": "حساب واحد لكل منصات Barusik — بلاتفورميكا وكومبليتشس وما سيأتي. لديك حساب في كومبليتشس؟ سجّل الدخول به.", "hi": "مسجّل الدخول باسم", "check": "أرسلنا إليك رسالة تأكيد. أكّدها ثم سجّل الدخول.", "forgot": "نسيت كلمة المرور", "sent": "إذا كان البريد مسجّلًا فسيصله رابط لإعادة التعيين.", "bad": "البريد أو كلمة المرور غير صحيحة", "taken": "اسم المستخدم محجوز — جرّب اسمًا آخر", "short": "كلمة المرور 6 أحرف على الأقل واسم المستخدم 2–20 حرفًا", "badMail": "بريد إلكتروني غير صالح", "busy": "لحظة…", "yours": "منصاتك"},
  installTitle: 'التثبيت بلمستين',
  installSub: 'لا متجر تطبيقات ولا ملف للتنزيل. يبقى التطبيق على الشاشة الرئيسية ويفتح مثل أي تطبيق.',
  iphone: 'آيفون',
  android: 'أندرويد',
  computer: 'حاسوب',
  stepsIphone: ['افتح الرابط في Safari', 'اضغط زر المشاركة', 'اختر "إضافة إلى الشاشة الرئيسية"'],
  stepsAndroid: ['افتح الرابط في Chrome', 'اضغط ⋮ في الزاوية', 'اختر "تثبيت التطبيق"'],
  stepsComputer: ['افتح في Chrome أو Edge', 'اضغط رمز التثبيت في شريط العنوان', 'سيظهر التطبيق في قائمة البدء'],
  scanQr: 'أو امسح بهاتفك',
  updatesNote: 'تصل التحديثات تلقائيًا — دون إعادة التثبيت.',
  close: 'إغلاق',
  contactTitle: 'تريد التحدث؟',
  contactSub: 'شراكات أو أسئلة أو طلب إذن لاستخدام المحتوى.',
  rights: 'جميع الحقوق محفوظة لبار لفوفسكي.',
};

const ru: Dict = {
  brand: 'Платформы Barusik',
  metaTitle: 'Платформы Barusik',
  metaDesc: 'Bar Lvovski Travel, Platformika, Complichess, LearnLume и криптоплатформа — пять платформ одной компании.',
  skip: 'Перейти к содержимому',
  heroKicker: 'Barusik Platforms',
  heroTitle: 'Платформы Barusik',
  heroSub: 'Турагентство, соцсеть, которая платит авторам, шахматы, где вы сами собираете армию, подготовка к экзаменам с ИИ и криптоплатформа на подходе.',
  scroll: 'Листайте вниз',
  nav: { platforms: 'Платформы', install: 'Установка', contact: 'Контакты', lang: 'Язык' },
  count: '5 платформ',
  soon: 'Скоро',
  live: 'Доступно',
  open: 'Открыть в браузере',
  install: 'Скачать и установить',
  howInstall: 'Как установить?',
  tr: {"name": "Bar Lvovski Travel", "tag": "travel.barusik.com", "desc": "Моё турагентство: отели, авиабилеты, туры, аренда авто и билеты — по агентским ценам и с личным сервисом в WhatsApp в любое время.", "points": ["Отели по всему миру — бронирование прямо на сайте", "Перелёты и туры — личное предложение", "WhatsApp круглосуточно: +972 55-663-0709"]},
  trVisit: 'На сайт путешествий',
  trWa: 'WhatsApp 24/7',
  pk: { name: 'Platformika', tag: 'One Platform. Everyone Connected. Creators First.', desc: 'Посты, истории, клипы и чаты в одном приложении — и 99% чистой прибыли получают авторы.', points: ['Лента, истории и клипы', 'Личные чаты', 'Центр авторов с разделом 99/1'] },
  cx: { name: 'Complichess', tag: 'Complichess', desc: 'Шахматы, где последнюю горизонталь вы собираете из колоды на 35 очков: классические, сказочные и оригинальные фигуры — верёвка, пистолет и гравитация.', points: ['Против компьютера, 10 уровней', 'Онлайн с другом или случайным соперником', 'Tempo в реальном времени и Brainmaxing'] },
  cr: { name: 'Криптоплатформа', tag: 'Barusik Crypto', desc: 'Место, где можно создавать новые монеты и торговать существующими. Мы строим её прямо сейчас.', points: ['Создание монеты', 'Торговля', 'Скоро'] },
  lr: { name: 'LearnLume', tag: 'LearnLume · Windows', desc: "Перетащите PDF-файлы курса, и LearnLume соберёт из них на вашем компьютере полноценное приложение для подготовки к экзамену: темы с нуля, разобранные экзамены, карточки, кнопка «Всё ещё не понял» у каждого вопроса и видео к каждой теме. Без интернета.", points: ["Приложение к экзамену из ваших материалов", "«Всё ещё не понял» у каждого вопроса", "Работает на компьютере без интернета"] },
  lrDl: "Скачать для Windows",
  lrNote: "Windows 10/11 + Python 3 · версия 0.2 · при первом запуске скачиваются инструменты и модели (около 7 ГБ), дальше всё работает без интернета.",
  drag: 'Перетащите любую деталь мышью',
  acc: {"login": "Войти", "signup": "Регистрация", "logout": "Выйти", "email": "Эл. почта", "password": "Пароль", "username": "Имя пользователя", "admin": "Админ-панель", "one": "Один аккаунт для всех платформ Barusik — Platformika, Complichess и всего, что появится. Уже играете в Complichess? Войдите с тем же аккаунтом.", "hi": "Вы вошли как", "check": "Мы отправили письмо для подтверждения. Подтвердите его и войдите.", "forgot": "Забыли пароль", "sent": "Если адрес зарегистрирован, на него придёт ссылка для сброса.", "bad": "Неверная почта или пароль", "taken": "Это имя занято — попробуйте другое", "short": "Пароль — от 6 символов, имя — 2–20 символов", "badMail": "Неверный адрес почты", "busy": "Минутку…", "yours": "Ваши платформы"},
  installTitle: 'Установка в два касания',
  installSub: 'Без магазина приложений и без файлов. Приложение живёт на главном экране и открывается как обычное.',
  iphone: 'iPhone',
  android: 'Android',
  computer: 'Компьютер',
  stepsIphone: ['Откройте ссылку в Safari', 'Нажмите «Поделиться»', 'Выберите «На экран Домой»'],
  stepsAndroid: ['Откройте ссылку в Chrome', 'Нажмите ⋮ в углу', 'Выберите «Установить приложение»'],
  stepsComputer: ['Откройте в Chrome или Edge', 'Нажмите значок установки в адресной строке', 'Приложение появится в меню «Пуск»'],
  scanQr: 'Или отсканируйте телефоном',
  updatesNote: 'Обновления приходят сами — без переустановки.',
  close: 'Закрыть',
  contactTitle: 'Хотите поговорить?',
  contactSub: 'Партнёрство, вопросы или разрешение на использование материалов.',
  rights: 'Все права принадлежат Бару Львовскому.',
};

const es: Dict = {
  brand: 'Plataformas Barusik',
  metaTitle: 'Plataformas Barusik',
  metaDesc: 'Bar Lvovski Travel, Platformika, Complichess, LearnLume y una plataforma cripto: cinco plataformas bajo una empresa.',
  skip: 'Saltar al contenido',
  heroKicker: 'Barusik Platforms',
  heroTitle: 'Plataformas Barusik',
  heroSub: 'Una agencia de viajes, una red social que paga a sus creadores, un ajedrez donde construyes tu propio ejército, preparación de exámenes con IA y una plataforma cripto en camino.',
  scroll: 'Desliza hacia abajo',
  nav: { platforms: 'Plataformas', install: 'Instalar', contact: 'Contacto', lang: 'Idioma' },
  count: '5 plataformas',
  soon: 'Muy pronto',
  live: 'Disponible',
  open: 'Abrir en el navegador',
  install: 'Descargar e instalar',
  howInstall: '¿Cómo se instala?',
  tr: {"name": "Bar Lvovski Travel", "tag": "travel.barusik.com", "desc": "Mi agencia de viajes: hoteles, vuelos, paquetes vacacionales, alquiler de coches y entradas — a precio de agente y con atención personal por WhatsApp a cualquier hora.", "points": ["Hoteles en todo el mundo — reserva en el sitio", "Vuelos y paquetes — presupuesto personal", "WhatsApp a cualquier hora: +972 55-663-0709"]},
  trVisit: 'Ir al sitio de viajes',
  trWa: 'WhatsApp 24/7',
  pk: { name: 'Platformika', tag: 'One Platform. Everyone Connected. Creators First.', desc: 'Publicaciones, historias, clips y chats en una sola app, y el 99% del beneficio neto va a los creadores.', points: ['Feed, historias y clips', 'Chats privados', 'Centro de creadores con reparto 99/1'] },
  cx: { name: 'Complichess', tag: 'Complichess', desc: 'Ajedrez donde armas tu fila trasera con un mazo de 35 puntos: piezas clásicas, de fantasía y originales como la cuerda, la pistola y la gravedad.', points: ['Contra el ordenador, 10 niveles', 'En línea con un amigo o un rival aleatorio', 'Tempo en tiempo real y Brainmaxing'] },
  cr: { name: 'Plataforma cripto', tag: 'Barusik Crypto', desc: 'Un lugar para crear monedas nuevas y negociar las existentes. La estamos construyendo ahora.', points: ['Crear una moneda', 'Negociar', 'Muy pronto'] },
  lr: { name: 'LearnLume', tag: 'LearnLume · Windows', desc: "Arrastra los PDF del curso y LearnLume crea con ellos, en tu propio ordenador, una app completa para preparar el examen: unidades desde cero, exámenes resueltos, tarjetas, un botón «Sigo sin entenderlo» en cada pregunta y un vídeo explicativo por tema. Sin internet.", points: ["Una app de examen con tu material", "«Sigo sin entenderlo» en cada pregunta", "Funciona en tu ordenador, sin internet"] },
  lrDl: "Descargar para Windows",
  lrNote: "Windows 10/11 + Python 3 · versión 0.2 · la primera vez descarga herramientas y modelos (unos 7 GB); después todo funciona sin internet.",
  drag: 'Arrastra cualquier pieza con el ratón',
  acc: {"login": "Iniciar sesión", "signup": "Registrarse", "logout": "Cerrar sesión", "email": "Correo", "password": "Contraseña", "username": "Usuario", "admin": "Panel de administración", "one": "Una sola cuenta para todas las plataformas de Barusik: Platformika, Complichess y lo que venga. ¿Ya juegas Complichess? Entra con esa cuenta.", "hi": "Sesión iniciada como", "check": "Te enviamos un correo de confirmación. Confírmalo y luego inicia sesión.", "forgot": "Olvidé la contraseña", "sent": "Si el correo está registrado, recibirás un enlace para restablecerla.", "bad": "Correo o contraseña incorrectos", "taken": "Ese usuario ya existe — prueba otro", "short": "La contraseña necesita 6+ caracteres y el usuario 2–20", "badMail": "Correo no válido", "busy": "Un momento…", "yours": "Tus plataformas"},
  installTitle: 'Instalar en dos toques',
  installSub: 'Sin tienda de apps ni archivos que descargar. La app queda en tu pantalla de inicio y se abre como cualquier otra.',
  iphone: 'iPhone',
  android: 'Android',
  computer: 'Ordenador',
  stepsIphone: ['Abre el enlace en Safari', 'Toca el botón Compartir', 'Elige "Añadir a pantalla de inicio"'],
  stepsAndroid: ['Abre el enlace en Chrome', 'Toca ⋮ en la esquina', 'Elige "Instalar aplicación"'],
  stepsComputer: ['Ábrelo en Chrome o Edge', 'Pulsa el icono de instalar en la barra de direcciones', 'La app aparecerá en el menú de inicio'],
  scanQr: 'O escanéalo con el móvil',
  updatesNote: 'Las actualizaciones llegan solas, sin reinstalar.',
  close: 'Cerrar',
  contactTitle: '¿Hablamos?',
  contactSub: 'Colaboraciones, preguntas o permiso para usar nuestro contenido.',
  rights: 'Todos los derechos reservados a Bar Lvovski.',
};

const fr: Dict = {
  brand: 'Plateformes Barusik',
  metaTitle: 'Plateformes Barusik',
  metaDesc: 'Bar Lvovski Travel, Platformika, Complichess, LearnLume et une plateforme crypto : cinq plateformes, une seule entreprise.',
  skip: 'Aller au contenu',
  heroKicker: 'Barusik Platforms',
  heroTitle: 'Plateformes Barusik',
  heroSub: 'Une agence de voyages, un réseau social qui rémunère ses créateurs, des échecs où vous composez votre armée, des révisions avec l’IA, et une plateforme crypto en route.',
  scroll: 'Faites défiler',
  nav: { platforms: 'Plateformes', install: 'Installer', contact: 'Contact', lang: 'Langue' },
  count: '5 plateformes',
  soon: 'Bientôt',
  live: 'Disponible',
  open: 'Ouvrir dans le navigateur',
  install: 'Télécharger et installer',
  howInstall: 'Comment installer ?',
  tr: {"name": "Bar Lvovski Travel", "tag": "travel.barusik.com", "desc": "Mon agence de voyages : hôtels, vols, séjours, location de voitures et billets — aux prix agence, avec un service personnel sur WhatsApp à toute heure.", "points": ["Hôtels dans le monde entier — réservation sur le site", "Vols et séjours — devis personnalisé", "WhatsApp à toute heure : +972 55-663-0709"]},
  trVisit: 'Aller au site de voyages',
  trWa: 'WhatsApp 24/7',
  pk: { name: 'Platformika', tag: 'One Platform. Everyone Connected. Creators First.', desc: 'Publications, stories, clips et messages dans une seule app — et 99 % du bénéfice net revient aux créateurs.', points: ['Fil, stories et clips', 'Messages privés', 'Espace créateurs avec partage 99/1'] },
  cx: { name: 'Complichess', tag: 'Complichess', desc: 'Des échecs où vous composez votre rangée arrière avec un deck de 35 points : pièces classiques, féeriques et originales comme la corde, le pistolet et la gravité.', points: ['Contre l’ordinateur, 10 niveaux', 'En ligne avec un ami ou un adversaire aléatoire', 'Tempo en temps réel et Brainmaxing'] },
  cr: { name: 'Plateforme crypto', tag: 'Barusik Crypto', desc: 'Un endroit pour créer de nouvelles cryptomonnaies et échanger celles qui existent. Nous la construisons en ce moment.', points: ['Créer une monnaie', 'Échanger', 'Bientôt'] },
  lr: { name: 'LearnLume', tag: 'LearnLume · Windows', desc: "Déposez les PDF du cours et LearnLume en fait, sur votre ordinateur, une app complète de révision : unités depuis zéro, examens corrigés, fiches, un bouton « Je ne comprends toujours pas » sur chaque question et une vidéo explicative par thème. Sans internet.", points: ["Une app d’examen à partir de vos cours", "« Je ne comprends toujours pas » sur chaque question", "Fonctionne sur votre ordinateur, hors ligne"] },
  lrDl: "Télécharger pour Windows",
  lrNote: "Windows 10/11 + Python 3 · version 0.2 · le premier lancement télécharge les outils et les modèles (environ 7 Go) ; ensuite tout fonctionne hors ligne.",
  drag: 'Déplacez chaque pièce à la souris',
  acc: {"login": "Se connecter", "signup": "S’inscrire", "logout": "Se déconnecter", "email": "E-mail", "password": "Mot de passe", "username": "Nom d’utilisateur", "admin": "Page d’administration", "one": "Un seul compte pour toutes les plateformes Barusik : Platformika, Complichess et la suite. Vous jouez déjà à Complichess ? Connectez-vous avec ce compte.", "hi": "Connecté en tant que", "check": "Nous vous avons envoyé un e-mail de confirmation. Confirmez-le, puis connectez-vous.", "forgot": "Mot de passe oublié", "sent": "Si l’adresse est inscrite, un lien de réinitialisation arrive.", "bad": "E-mail ou mot de passe incorrect", "taken": "Ce nom est déjà pris — essayez-en un autre", "short": "Mot de passe : 6 caractères min., nom : 2 à 20", "badMail": "Adresse e-mail invalide", "busy": "Un instant…", "yours": "Vos plateformes"},
  installTitle: 'Installer en deux gestes',
  installSub: 'Pas de store, pas de fichier à télécharger. L’app vit sur votre écran d’accueil et s’ouvre comme les autres.',
  iphone: 'iPhone',
  android: 'Android',
  computer: 'Ordinateur',
  stepsIphone: ['Ouvrez le lien dans Safari', 'Touchez le bouton Partager', 'Choisissez « Sur l’écran d’accueil »'],
  stepsAndroid: ['Ouvrez le lien dans Chrome', 'Touchez ⋮ dans le coin', 'Choisissez « Installer l’application »'],
  stepsComputer: ['Ouvrez-le dans Chrome ou Edge', 'Cliquez sur l’icône d’installation dans la barre d’adresse', 'L’app apparaît dans le menu Démarrer'],
  scanQr: 'Ou scannez avec votre téléphone',
  updatesNote: 'Les mises à jour arrivent toutes seules, sans réinstaller.',
  close: 'Fermer',
  contactTitle: 'On en parle ?',
  contactSub: 'Partenariats, questions ou autorisation d’utiliser nos contenus.',
  rights: 'Tous droits réservés à Bar Lvovski.',
};

export const DICTS: Record<Lang, Dict> = { he, en, ar, ru, es, fr };
export const CONTACT = 'complichess.app@gmail.com';
