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
  count: string;            // "3 platforms"
  soon: string;
  live: string;
  open: string;
  install: string;
  howInstall: string;
  pk: { name: string; tag: string; desc: string; points: string[] };
  cx: { name: string; tag: string; desc: string; points: string[] };
  cr: { name: string; tag: string; desc: string; points: string[] };
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
  metaDesc: 'פלטפורמיקה, קומפליצס ופלטפורמת קריפטו — שלוש פלטפורמות תחת חברה אחת.',
  skip: 'דלג לתוכן',
  heroKicker: 'Barusik Platforms',
  heroTitle: 'הפלטפורמות של ברוסיק',
  heroSub: 'רשת חברתית שהרווח שלה הולך ליוצרים, שחמט שבו אתה בונה את הצבא, ופלטפורמת קריפטו בדרך.',
  scroll: 'גלול למטה',
  nav: { platforms: 'הפלטפורמות', install: 'התקנה', contact: 'צור קשר', lang: 'שפה' },
  count: '3 פלטפורמות',
  soon: 'בקרוב',
  live: 'זמין עכשיו',
  open: 'פתח בדפדפן',
  install: 'הורד והתקן',
  howInstall: 'איך מתקינים?',
  pk: { name: 'פלטפורמיקה', tag: 'One Platform. Everyone Connected. Creators First.', desc: 'פוסטים, סטוריז, קליפים וצ׳אטים באפליקציה אחת — ו־99% מהרווח הנקי הולך ליוצרים.', points: ['פיד, סטוריז וקליפים', 'צ׳אטים פרטיים', 'מרכז יוצרים עם חלוקת 99/1'] },
  cx: { name: 'קומפליצס', tag: 'Complichess', desc: 'שחמט שבו אתה בונה את השורה האחורית מדק של 35 נקודות: כלים קלאסיים, כלי פיות וכלים מקוריים כמו חבל, אקדח וגרוויטציה.', points: ['נגד המחשב, 10 רמות', 'אונליין עם חבר או יריב אקראי', 'Tempo בזמן אמת ו־Brainmaxing'] },
  cr: { name: 'פלטפורמת קריפטו', tag: 'Barusik Crypto', desc: 'מקום ליצור מטבעות חדשים ולסחור במטבעות קיימים. אנחנו בונים אותה עכשיו.', points: ['יצירת מטבע', 'מסחר', 'בקרוב'] },
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
  metaDesc: 'Platformika, Complichess and a crypto platform — three platforms under one company.',
  skip: 'Skip to content',
  heroKicker: 'Barusik Platforms',
  heroTitle: 'Barusik Platforms',
  heroSub: 'A social network that pays its creators, chess where you build your own army, and a crypto platform on the way.',
  scroll: 'Scroll down',
  nav: { platforms: 'Platforms', install: 'Install', contact: 'Contact', lang: 'Language' },
  count: '3 platforms',
  soon: 'Coming soon',
  live: 'Available now',
  open: 'Open in browser',
  install: 'Download & install',
  howInstall: 'How to install?',
  pk: { name: 'Platformika', tag: 'One Platform. Everyone Connected. Creators First.', desc: 'Posts, stories, clips and chats in one app — and 99% of net profit goes to creators.', points: ['Feed, stories and clips', 'Private chats', 'Creator hub with a 99/1 split'] },
  cx: { name: 'Complichess', tag: 'Complichess', desc: 'Chess where you build your back rank from a 35-point deck: classic pieces, fairy pieces and originals like the rope, the gun and gravity.', points: ['Vs computer, 10 levels', 'Online with a friend or a random opponent', 'Real-time Tempo and Brainmaxing'] },
  cr: { name: 'Crypto platform', tag: 'Barusik Crypto', desc: 'A place to create new coins and trade existing ones. We are building it now.', points: ['Create a coin', 'Trade', 'Coming soon'] },
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
  metaDesc: 'بلاتفورميكا وكومبليتشس ومنصة عملات رقمية — ثلاث منصات تحت شركة واحدة.',
  skip: 'انتقل إلى المحتوى',
  heroKicker: 'Barusik Platforms',
  heroTitle: 'منصات باروسيك',
  heroSub: 'شبكة اجتماعية تذهب أرباحها إلى المبدعين، وشطرنج تبني فيه جيشك بنفسك، ومنصة عملات رقمية في الطريق.',
  scroll: 'مرّر للأسفل',
  nav: { platforms: 'المنصات', install: 'التثبيت', contact: 'تواصل', lang: 'اللغة' },
  count: '3 منصات',
  soon: 'قريبًا',
  live: 'متاح الآن',
  open: 'افتح في المتصفح',
  install: 'نزّل وثبّت',
  howInstall: 'كيف أثبّت؟',
  pk: { name: 'بلاتفورميكا', tag: 'One Platform. Everyone Connected. Creators First.', desc: 'منشورات وقصص ومقاطع ومحادثات في تطبيق واحد — و99% من صافي الربح يذهب إلى المبدعين.', points: ['خلاصة وقصص ومقاطع', 'محادثات خاصة', 'مركز مبدعين بتقسيم 99/1'] },
  cx: { name: 'كومبليتشس', tag: 'Complichess', desc: 'شطرنج تبني فيه صفك الخلفي من تشكيلة بـ35 نقطة: قطع كلاسيكية وقطع خيالية وقطع أصلية مثل الحبل والمسدس والجاذبية.', points: ['ضد الحاسوب، 10 مستويات', 'عبر الإنترنت مع صديق أو خصم عشوائي', 'Tempo في الوقت الحقيقي وBrainmaxing'] },
  cr: { name: 'منصة العملات الرقمية', tag: 'Barusik Crypto', desc: 'مكان لإنشاء عملات جديدة وتداول العملات الموجودة. نحن نبنيها الآن.', points: ['إنشاء عملة', 'تداول', 'قريبًا'] },
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
  metaDesc: 'Platformika, Complichess и криптоплатформа — три платформы одной компании.',
  skip: 'Перейти к содержимому',
  heroKicker: 'Barusik Platforms',
  heroTitle: 'Платформы Barusik',
  heroSub: 'Соцсеть, которая платит авторам, шахматы, где вы сами собираете армию, и криптоплатформа на подходе.',
  scroll: 'Листайте вниз',
  nav: { platforms: 'Платформы', install: 'Установка', contact: 'Контакты', lang: 'Язык' },
  count: '3 платформы',
  soon: 'Скоро',
  live: 'Доступно',
  open: 'Открыть в браузере',
  install: 'Скачать и установить',
  howInstall: 'Как установить?',
  pk: { name: 'Platformika', tag: 'One Platform. Everyone Connected. Creators First.', desc: 'Посты, истории, клипы и чаты в одном приложении — и 99% чистой прибыли получают авторы.', points: ['Лента, истории и клипы', 'Личные чаты', 'Центр авторов с разделом 99/1'] },
  cx: { name: 'Complichess', tag: 'Complichess', desc: 'Шахматы, где последнюю горизонталь вы собираете из колоды на 35 очков: классические, сказочные и оригинальные фигуры — верёвка, пистолет и гравитация.', points: ['Против компьютера, 10 уровней', 'Онлайн с другом или случайным соперником', 'Tempo в реальном времени и Brainmaxing'] },
  cr: { name: 'Криптоплатформа', tag: 'Barusik Crypto', desc: 'Место, где можно создавать новые монеты и торговать существующими. Мы строим её прямо сейчас.', points: ['Создание монеты', 'Торговля', 'Скоро'] },
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
  metaDesc: 'Platformika, Complichess y una plataforma cripto: tres plataformas bajo una empresa.',
  skip: 'Saltar al contenido',
  heroKicker: 'Barusik Platforms',
  heroTitle: 'Plataformas Barusik',
  heroSub: 'Una red social que paga a sus creadores, un ajedrez donde construyes tu propio ejército y una plataforma cripto en camino.',
  scroll: 'Desliza hacia abajo',
  nav: { platforms: 'Plataformas', install: 'Instalar', contact: 'Contacto', lang: 'Idioma' },
  count: '3 plataformas',
  soon: 'Muy pronto',
  live: 'Disponible',
  open: 'Abrir en el navegador',
  install: 'Descargar e instalar',
  howInstall: '¿Cómo se instala?',
  pk: { name: 'Platformika', tag: 'One Platform. Everyone Connected. Creators First.', desc: 'Publicaciones, historias, clips y chats en una sola app, y el 99% del beneficio neto va a los creadores.', points: ['Feed, historias y clips', 'Chats privados', 'Centro de creadores con reparto 99/1'] },
  cx: { name: 'Complichess', tag: 'Complichess', desc: 'Ajedrez donde armas tu fila trasera con un mazo de 35 puntos: piezas clásicas, de fantasía y originales como la cuerda, la pistola y la gravedad.', points: ['Contra el ordenador, 10 niveles', 'En línea con un amigo o un rival aleatorio', 'Tempo en tiempo real y Brainmaxing'] },
  cr: { name: 'Plataforma cripto', tag: 'Barusik Crypto', desc: 'Un lugar para crear monedas nuevas y negociar las existentes. La estamos construyendo ahora.', points: ['Crear una moneda', 'Negociar', 'Muy pronto'] },
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
  metaDesc: 'Platformika, Complichess et une plateforme crypto : trois plateformes, une seule entreprise.',
  skip: 'Aller au contenu',
  heroKicker: 'Barusik Platforms',
  heroTitle: 'Plateformes Barusik',
  heroSub: 'Un réseau social qui rémunère ses créateurs, des échecs où vous composez votre armée, et une plateforme crypto en route.',
  scroll: 'Faites défiler',
  nav: { platforms: 'Plateformes', install: 'Installer', contact: 'Contact', lang: 'Langue' },
  count: '3 plateformes',
  soon: 'Bientôt',
  live: 'Disponible',
  open: 'Ouvrir dans le navigateur',
  install: 'Télécharger et installer',
  howInstall: 'Comment installer ?',
  pk: { name: 'Platformika', tag: 'One Platform. Everyone Connected. Creators First.', desc: 'Publications, stories, clips et messages dans une seule app — et 99 % du bénéfice net revient aux créateurs.', points: ['Fil, stories et clips', 'Messages privés', 'Espace créateurs avec partage 99/1'] },
  cx: { name: 'Complichess', tag: 'Complichess', desc: 'Des échecs où vous composez votre rangée arrière avec un deck de 35 points : pièces classiques, féeriques et originales comme la corde, le pistolet et la gravité.', points: ['Contre l’ordinateur, 10 niveaux', 'En ligne avec un ami ou un adversaire aléatoire', 'Tempo en temps réel et Brainmaxing'] },
  cr: { name: 'Plateforme crypto', tag: 'Barusik Crypto', desc: 'Un endroit pour créer de nouvelles cryptomonnaies et échanger celles qui existent. Nous la construisons en ce moment.', points: ['Créer une monnaie', 'Échanger', 'Bientôt'] },
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
