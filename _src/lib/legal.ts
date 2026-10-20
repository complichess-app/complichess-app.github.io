import type { Lang } from './i18n';

// Privacy policy and terms of use for every Barusik platform. Last reviewed 2026-10-20.
// Plain-language texts written for the services as they are actually built (Supabase, GitHub Pages, Cloudflare).
// Hebrew is the binding version; the other languages are translations.

type Sec = { h: string; p: string[] };
type Doc = { title: string; intro: string; secs: Sec[] };
export type LegalT = { privacy: Doc; terms: Doc; back: string; updated: string; privacyLink: string; termsLink: string; binding: string };

const he: LegalT = {
  back: 'חזרה לאתר',
  updated: 'עודכן לאחרונה: 20 באוקטובר 2026',
  privacyLink: 'מדיניות פרטיות',
  termsLink: 'תנאי שימוש',
  binding: '',
  privacy: {
    title: 'מדיניות פרטיות',
    intro: 'המדיניות הזו מסבירה איזה מידע נאסף בפלטפורמות של ברוסיק (barusik.com, Bar Lvovski Travel, פלטפורמיקה, קומפליצס, ובהמשך LearnLume ופלטפורמת הקריפטו), למה, ומה הזכויות שלכם. מפעיל השירותים: בר לבובסקי (Barusik Platforms).',
    secs: [
      { h: 'איזה מידע נאסף', p: [
        'חשבון משותף: מייל, שם משתמש וסיסמה. הסיסמה נשמרת רק כגיבוב מוצפן — אף אחד, כולל אנחנו, לא יכול לקרוא אותה.',
        'פלטפורמיקה: הפרופיל (שם, ביו, תמונות), פוסטים, קליפים, סטוריז, תגובות, לייקים, הודעות פרטיות, חסימות ודיווחים.',
        'קומפליצס: שם השחקן, דירוג ונתוני משחקים.',
        'Bar Lvovski Travel: כששולחים בקשה או הזמנה — שם, טלפון, מייל (לא חובה), הערות ופרטי הנסיעה. חיפושים באתר נשמרים זמנית כדי להחזיר תשובה מהירה לחיפוש זהה.',
        'מידע טכני: כדי למנוע הצפה וניצול לרעה, נשמר לזמן קצר "טביעה" מוצפנת (גיבוב) של כתובת ה־IP — לא הכתובת עצמה. ספקי האירוח שומרים יומני גישה רגילים.',
      ] },
      { h: 'למה המידע משמש', p: [
        'כדי להפעיל את השירותים: התחברות, הצגת התוכן שלכם, שליחת הודעות, משחק ודירוג.',
        'כדי לטפל בבקשות והזמנות נסיעה ולחזור אליכם בטלפון, בוואטסאפ או במייל.',
        'כדי לשמור על אבטחה, למנוע ספאם ולטפל בדיווחים.',
        'אנחנו לא מוכרים מידע, לא מציגים פרסומות ולא משתמשים בעוגיות מעקב או פרסום.',
      ] },
      { h: 'מה גלוי לאחרים', p: [
        'בפלטפורמיקה: הפרופיל, הפוסטים, הקליפים, התגובות והלייקים גלויים לכל מי שנכנס. סטוריז גלויים 24 שעות. הודעות פרטיות גלויות רק לשולח ולנמען.',
        'בקומפליצס: שם השחקן והדירוג עשויים להופיע בטבלאות.',
        'בקשות נסיעה גלויות רק לבר.',
      ] },
      { h: 'עם מי המידע משותף', p: [
        'Supabase — מסד הנתונים, ההתחברות ואחסון הקבצים. השרתים עשויים להיות מחוץ לישראל.',
        'GitHub Pages ו־Cloudflare — אירוח האתר וניהול הדומיין.',
        'ספקי נסיעות (חברות תעופה, בתי מלון, השכרת רכב וכו׳) — רק פרטי ההזמנה הדרושים, ורק כשאתם מבקשים להזמין.',
        'רשויות — רק אם החוק מחייב.',
      ] },
      { h: 'כמה זמן המידע נשמר', p: [
        'מידע החשבון והתוכן — עד שמוחקים את החשבון.',
        'בקשות והזמנות נסיעה — כל עוד נדרש לטפל בהן ולפי מה שהחוק מחייב לגבי רישומים.',
        'טביעות IP למניעת הצפה — עד יום אחד. חיפושי נסיעות זמניים — עד יומיים.',
      ] },
      { h: 'הזכויות שלכם', p: [
        'לעיין במידע עליכם, לתקן אותו ולבקש למחוק אותו.',
        'מחיקת חשבון: בפלטפורמיקה, בדף הפרופיל שלכם → "מחיקת החשבון". המחיקה מוחקת את החשבון המשותף ואת כל התוכן שלכם.',
        'אפשר גם לכתוב לנו, ונטפל תוך 30 יום.',
      ] },
      { h: 'אחסון מקומי בדפדפן', p: [
        'האתרים שומרים בדפדפן שלכם את ההתחברות ואת ההעדפות (שפה, הגדרות נגישות). אין עוגיות של צד שלישי.',
      ] },
      { h: 'ילדים', p: [
        'פלטפורמיקה מיועדת לגילאי 13 ומעלה. מתחת לגיל 18 — בהסכמת הורה. אם הגיע אלינו מידע על ילד מתחת לגיל 13, נמחק אותו.',
      ] },
      { h: 'אבטחה', p: [
        'הגישה לכל טבלה מוגבלת ברמת השרת: כל משתמש רואה ומשנה רק את מה שמותר לו, ורק המנהל רואה בקשות נסיעה ודיווחים. דף הניהול מציג כמה הודעות כל משתמש שלח — לא את תוכנן. שום מערכת לא מאובטחת לחלוטין; אם מצאתם בעיה, כתבו לנו.',
      ] },
      { h: 'שינויים', p: [
        'אם המדיניות תשתנה, נעדכן את התאריך בעמוד הזה. שינוי מהותי יוצג גם באתר.',
      ] },
    ],
  },
  terms: {
    title: 'תנאי שימוש',
    intro: 'השימוש בפלטפורמות של ברוסיק (barusik.com, Bar Lvovski Travel, פלטפורמיקה, קומפליצס והשירותים שיתווספו) כפוף לתנאים האלה. מי שמשתמש בשירותים מסכים להם.',
    secs: [
      { h: 'החשבון', p: [
        'חשבון אחד משמש את כל הפלטפורמות. אתם אחראים לשמור על הסיסמה ועל מה שנעשה בחשבון.',
        'פלטפורמיקה מיועדת לגילאי 13 ומעלה (מתחת לגיל 18 — בהסכמת הורה).',
      ] },
      { h: 'מה אסור', p: [
        'הטרדה, איומים, הסתה, תוכן מיני של קטינים, התחזות, ספאם, הונאה, הפרת זכויות יוצרים, הפצת מידע אישי של אחרים, או כל דבר לא חוקי.',
        'ניסיון לפרוץ, להציף את השירותים, לאסוף מידע באופן אוטומטי או לעקוף מגבלות.',
        'אפשר לחסום משתמשים ולדווח על תוכן. אנחנו רשאים להסיר תוכן ולחסום חשבונות שמפרים את התנאים.',
      ] },
      { h: 'התוכן שלכם', p: [
        'התוכן שאתם מעלים נשאר שלכם. אתם נותנים לנו רשות להציג אותו בשירותים כל עוד הוא באתר. אתם אחראים לכך שיש לכם זכות לפרסם אותו.',
      ] },
      { h: 'קומפליצס', p: [
        'הרעיון, החוקים, הכלים, העיצוב והקוד של קומפליצס הם קניין של בר לבובסקי, וכל הזכויות שמורות. שימוש מעבר למשחק עצמו דורש אישור בכתב.',
      ] },
      { h: 'Bar Lvovski Travel', p: [
        'בר לבובסקי פועל כסוכן נסיעות ומתווך בין הלקוח לבין ספקי השירות (חברות תעופה, מלונות, השכרת רכב ועוד).',
        'המחירים באתר נכונים לרגע החיפוש ועשויים להשתנות. שליחת הזמנה באתר אינה מחייבת: ההזמנה סופית רק אחרי שבר מאשר, שולח פרטי תשלום והתשלום מתקבל.',
        'על כל הזמנה חלים גם תנאי הספק (ביטול, שינויים, כבודה וכו׳), שיימסרו לפני התשלום. אחריות הספק על השירות עצמו היא של הספק.',
        'ביטול עסקה ייעשה לפי חוק הגנת הצרכן ותנאי הספק.',
      ] },
      { h: 'אחריות', p: [
        'השירותים ניתנים כפי שהם (AS IS). אנחנו עושים מאמץ שיפעלו כראוי, אבל לא מתחייבים לזמינות מלאה או להיעדר תקלות. האחריות שלנו מוגבלת ככל שהחוק מתיר.',
      ] },
      { h: 'דין ושיפוט', p: [
        'על התנאים חל הדין הישראלי. סמכות השיפוט — לבתי המשפט המוסמכים במחוז תל אביב.',
      ] },
      { h: 'שינויים', p: [
        'אנחנו רשאים לעדכן את התנאים. התאריך בעמוד הזה מראה מתי עודכנו לאחרונה.',
      ] },
    ],
  },
};

const en: LegalT = {
  back: 'Back to site', updated: 'Last updated: 20 October 2026', privacyLink: 'Privacy policy', termsLink: 'Terms of use',
  binding: 'This is a translation. If there is any difference, the Hebrew version applies.',
  privacy: {
    title: 'Privacy policy',
    intro: 'This policy explains what information Barusik Platforms (barusik.com, Bar Lvovski Travel, Platformika, Complichess, and later LearnLume and the crypto platform) collects, why, and what your rights are. The services are run by Bar Lvovski (Barusik Platforms).',
    secs: [
      { h: 'What we collect', p: [
        'Shared account: email, username and password. The password is stored only as a secure hash — nobody, including us, can read it.',
        'Platformika: your profile (name, bio, pictures), posts, clips, stories, comments, likes, private messages, blocks and reports.',
        'Complichess: player name, rating and game data.',
        'Bar Lvovski Travel: when you send a request or booking — name, phone, email (optional), notes and trip details. Searches are kept briefly so identical searches can be answered quickly.',
        'Technical data: to prevent flooding and abuse we briefly keep a one-way hash of your IP address — not the address itself. Hosting providers keep standard access logs.',
      ] },
      { h: 'How it is used', p: [
        'To run the services: sign-in, showing your content, messaging, games and ratings.',
        'To handle travel requests and bookings and contact you by phone, WhatsApp or email.',
        'To keep the services secure, stop spam and handle reports.',
        'We do not sell data, show ads, or use tracking or advertising cookies.',
      ] },
      { h: 'What others can see', p: [
        'On Platformika your profile, posts, clips, comments and likes are public. Stories are visible for 24 hours. Private messages are visible only to the sender and recipient.',
        'On Complichess your player name and rating may appear in tables.',
        'Travel requests are visible only to Bar.',
      ] },
      { h: 'Who we share it with', p: [
        'Supabase — database, sign-in and file storage. Servers may be outside Israel.',
        'GitHub Pages and Cloudflare — website hosting and domain.',
        'Travel suppliers (airlines, hotels, car rental, etc.) — only the booking details they need, and only when you ask to book.',
        'Authorities — only where the law requires it.',
      ] },
      { h: 'How long we keep it', p: [
        'Account data and content — until you delete your account.',
        'Travel requests and bookings — as long as needed to handle them and as the law requires for records.',
        'IP hashes for flood protection — up to one day. Temporary travel searches — up to two days.',
      ] },
      { h: 'Your rights', p: [
        'You can see, correct and ask us to delete your information.',
        'Delete your account: in Platformika, open your profile → "Delete account". This deletes the shared account and all your content.',
        'You can also write to us and we will handle it within 30 days.',
      ] },
      { h: 'Local browser storage', p: ['The sites keep your sign-in and preferences (language, accessibility settings) in your browser. There are no third-party cookies.'] },
      { h: 'Children', p: ['Platformika is for ages 13 and up; under 18 with a parent’s consent. If we learn we hold data of a child under 13, we delete it.'] },
      { h: 'Security', p: ['Access to every table is restricted on the server: each user sees and changes only what they are allowed to, and only the admin sees travel requests and reports. The admin page shows how many messages each user sent — never their content. No system is perfectly secure; if you find a problem, please tell us.'] },
      { h: 'Changes', p: ['If this policy changes we will update the date on this page. Material changes will also be shown on the site.'] },
    ],
  },
  terms: {
    title: 'Terms of use',
    intro: 'Using Barusik Platforms (barusik.com, Bar Lvovski Travel, Platformika, Complichess and services added later) is subject to these terms. By using the services you agree to them.',
    secs: [
      { h: 'Your account', p: ['One account works on every platform. You are responsible for your password and for what happens in your account.', 'Platformika is for ages 13 and up (under 18 with a parent’s consent).'] },
      { h: 'Not allowed', p: [
        'Harassment, threats, incitement, sexual content involving minors, impersonation, spam, fraud, copyright infringement, sharing other people’s personal data, or anything illegal.',
        'Trying to break in, flood the services, scrape data automatically or get around limits.',
        'You can block users and report content. We may remove content and suspend accounts that break these terms.',
      ] },
      { h: 'Your content', p: ['What you upload stays yours. You let us display it on the services while it is there, and you confirm you have the right to post it.'] },
      { h: 'Complichess', p: ['The Complichess concept, rules, pieces, design and code belong to Bar Lvovski; all rights reserved. Any use beyond playing the game needs written permission.'] },
      { h: 'Bar Lvovski Travel', p: [
        'Bar Lvovski acts as a travel agent between you and the service providers (airlines, hotels, car rental and others).',
        'Prices on the site are correct at the time of the search and may change. Sending a booking on the site is not binding: it is final only after Bar confirms, sends payment details and payment is received.',
        'Each booking is also subject to the supplier’s terms (cancellation, changes, baggage, etc.), which you receive before paying. The supplier is responsible for the service itself.',
        'Cancellations follow Israeli consumer protection law and the supplier’s terms.',
      ] },
      { h: 'Liability', p: ['The services are provided as is. We work to keep them running well but do not promise full availability or that they are error-free. Our liability is limited as far as the law allows.'] },
      { h: 'Law', p: ['These terms are governed by Israeli law. The competent courts in the Tel Aviv district have jurisdiction.'] },
      { h: 'Changes', p: ['We may update these terms. The date on this page shows when they last changed.'] },
    ],
  },
};

// Shorter translations keep the same structure; Hebrew is binding.
function translated(base: LegalT, t: Partial<LegalT> & { binding: string }): LegalT { return { ...base, ...t }; }

const ar = translated(en, {
  back: 'العودة إلى الموقع', updated: 'آخر تحديث: 20 أكتوبر 2026', privacyLink: 'سياسة الخصوصية', termsLink: 'شروط الاستخدام',
  binding: 'هذه ترجمة. في حال وجود اختلاف، تسري النسخة العبرية. التفاصيل الكاملة أدناه باللغة الإنجليزية.',
  privacy: { ...en.privacy, title: 'سياسة الخصوصية', intro: 'نجمع فقط ما نحتاجه لتشغيل الخدمات: بيانات الحساب، محتوى بلاتفورميكا، بيانات لعبة كومبليتشس، وتفاصيل طلبات السفر. لا نبيع البيانات ولا نعرض إعلانات. يمكنك حذف حسابك من صفحة ملفك الشخصي في بلاتفورميكا. التفاصيل الكاملة (بالإنجليزية):' },
  terms: { ...en.terms, title: 'شروط الاستخدام', intro: 'يخضع استخدام منصات باروسيك لهذه الشروط. يُمنع التحرش والاحتيال والبريد المزعج وأي محتوى غير قانوني. حجوزات السفر نهائية فقط بعد تأكيد بار واستلام الدفع. يسري القانون الإسرائيلي. التفاصيل الكاملة (بالإنجليزية):' },
});
const ru = translated(en, {
  back: 'Назад на сайт', updated: 'Последнее обновление: 20 октября 2026', privacyLink: 'Политика конфиденциальности', termsLink: 'Условия использования',
  binding: 'Это перевод. При расхождениях действует версия на иврите. Полный текст ниже — на английском.',
  privacy: { ...en.privacy, title: 'Политика конфиденциальности', intro: 'Мы собираем только то, что нужно для работы сервисов: данные аккаунта, контент Платформики, игровые данные Complichess и детали заявок на путешествия. Мы не продаём данные и не показываем рекламу. Удалить аккаунт можно в профиле Платформики. Полный текст (на английском):' },
  terms: { ...en.terms, title: 'Условия использования', intro: 'Использование платформ Barusik регулируется этими условиями. Запрещены травля, мошенничество, спам и любой незаконный контент. Бронирование поездки окончательно только после подтверждения Бара и получения оплаты. Действует право Израиля. Полный текст (на английском):' },
});
const es = translated(en, {
  back: 'Volver al sitio', updated: 'Última actualización: 20 de octubre de 2026', privacyLink: 'Política de privacidad', termsLink: 'Términos de uso',
  binding: 'Esta es una traducción. Si hay diferencias, rige la versión en hebreo. El texto completo está abajo en inglés.',
  privacy: { ...en.privacy, title: 'Política de privacidad', intro: 'Solo recopilamos lo necesario para ofrecer los servicios: datos de la cuenta, contenido de Platformika, datos de juego de Complichess y detalles de solicitudes de viaje. No vendemos datos ni mostramos anuncios. Puedes eliminar tu cuenta desde tu perfil en Platformika. Texto completo (en inglés):' },
  terms: { ...en.terms, title: 'Términos de uso', intro: 'El uso de las plataformas Barusik está sujeto a estos términos. Se prohíben el acoso, el fraude, el spam y cualquier contenido ilegal. Una reserva de viaje es definitiva solo tras la confirmación de Bar y el pago. Rige la ley israelí. Texto completo (en inglés):' },
});
const fr = translated(en, {
  back: 'Retour au site', updated: 'Dernière mise à jour : 20 octobre 2026', privacyLink: 'Politique de confidentialité', termsLink: 'Conditions d’utilisation',
  binding: 'Ceci est une traduction. En cas de différence, la version hébraïque prévaut. Le texte complet ci-dessous est en anglais.',
  privacy: { ...en.privacy, title: 'Politique de confidentialité', intro: 'Nous ne collectons que ce qui est nécessaire au fonctionnement des services : données du compte, contenu de Platformika, données de jeu Complichess et détails des demandes de voyage. Nous ne vendons pas de données et n’affichons pas de publicité. Vous pouvez supprimer votre compte depuis votre profil Platformika. Texte complet (en anglais) :' },
  terms: { ...en.terms, title: 'Conditions d’utilisation', intro: 'L’utilisation des plateformes Barusik est soumise à ces conditions. Harcèlement, fraude, spam et tout contenu illégal sont interdits. Une réservation de voyage n’est définitive qu’après la confirmation de Bar et le paiement. Le droit israélien s’applique. Texte complet (en anglais) :' },
});

export const LEGAL: Record<Lang, LegalT> = { he, en, ar, ru, es, fr };
