/* Accessibility settings for barusik.com: saved per browser, applied as classes on <html> before paint. */
import type { Lang } from './i18n';

export const A11Y_KEYS = ['big', 'bigger', 'contrast', 'still', 'links', 'font', 'cursor', 'gray', 'focus'] as const;
export type A11yKey = (typeof A11Y_KEYS)[number];
export type A11yState = Partial<Record<A11yKey, boolean>>;
const STORE = 'barusik.a11y';

export function readA11y(): A11yState {
  try { return JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch { return {}; }
}
export function writeA11y(s: A11yState) {
  try { localStorage.setItem(STORE, JSON.stringify(s)); } catch {}
  applyA11y(s);
}
export function applyA11y(s: A11yState) {
  const h = document.documentElement;
  A11Y_KEYS.forEach((k) => h.classList.toggle('a11y-' + k, !!s[k]));
}
/* motion and the custom cursor respect both the system setting and the site's own switches */
export const prefersStill = () => {
  try { return matchMedia('(prefers-reduced-motion: reduce)').matches || !!readA11y().still; } catch { return false; }
};
export const customCursorOff = () => prefersStill() || !!readA11y().cursor || !!readA11y().contrast;

/* runs inline in <head> so the page never flashes without the person's settings */
export const A11Y_BOOT = `try{var s=JSON.parse(localStorage.getItem('${STORE}')||'{}');for(var k in s)if(s[k])document.documentElement.classList.add('a11y-'+k)}catch(e){}`;

type T = { open: string; title: string; big: string; bigger: string; contrast: string; still: string; links: string; font: string; cursor: string; gray: string; focus: string; reset: string; statement: string; close: string; back: string; stTitle: string; stBody: string[]; stContact: string; updated: string };
export const A11Y_T: Record<Lang, T> = {
  he: {
    open: 'תפריט נגישות', title: 'נגישות', big: 'הגדלת טקסט', bigger: 'הגדלה נוספת', contrast: 'ניגודיות גבוהה', still: 'עצירת אנימציות ותנועה', links: 'הדגשת קישורים', font: 'גופן קריא', cursor: 'סמן עכבר גדול ורגיל', gray: 'גווני אפור', focus: 'הדגשת פוקוס מקלדת', reset: 'איפוס הגדרות', statement: 'הצהרת נגישות', close: 'סגור', back: 'חזרה לאתר',
    stTitle: 'הצהרת נגישות',
    stBody: [
      'אנחנו רוצים שכל אחד ואחת יוכלו להשתמש באתר barusik.com, כולל אנשים עם מוגבלות. האתר נבנה מתוך שאיפה לעמוד בתקן הישראלי ת"י 5568 ובהנחיות WCAG 2.1 ברמה AA, ואנחנו ממשיכים לבדוק ולשפר אותו.',
      'מה יש באתר: תפריט נגישות (הגדלת טקסט, ניגודיות גבוהה, עצירת אנימציות, הדגשת קישורים, גופן קריא, סמן רגיל וגדול, גווני אפור והדגשת פוקוס), ניווט מלא במקלדת עם קישור "דלג לתוכן", תמיכה בקוראי מסך, התאמה להגדרת "הפחתת תנועה" של המכשיר, ושש שפות כולל עברית וערבית מימין לשמאל.',
      'ייתכן שחלקים מסוימים עדיין לא נגישים במלואם — למשל התצוגה התלת־ממדית, שהיא קישוט בלבד ואינה נדרשת לשימוש באתר. כל המידע והפעולות זמינים גם בטקסט.',
    ],
    stContact: 'נתקלתם בבעיה? כתבו לנו ונטפל בה בהקדם:', updated: 'עודכן לאחרונה: אוקטובר 2026',
  },
  en: {
    open: 'Accessibility menu', title: 'Accessibility', big: 'Larger text', bigger: 'Even larger text', contrast: 'High contrast', still: 'Stop animations and motion', links: 'Highlight links', font: 'Readable font', cursor: 'Large standard cursor', gray: 'Grayscale', focus: 'Highlight keyboard focus', reset: 'Reset settings', statement: 'Accessibility statement', close: 'Close', back: 'Back to the site',
    stTitle: 'Accessibility statement',
    stBody: [
      'We want everyone to be able to use barusik.com, including people with disabilities. The site aims to meet Israeli Standard 5568 and WCAG 2.1 level AA, and we keep testing and improving it.',
      'What the site offers: an accessibility menu (larger text, high contrast, stop animations, highlighted links, readable font, a large standard cursor, grayscale and focus highlighting), full keyboard navigation with a "skip to content" link, screen-reader support, respect for the device\'s "reduce motion" setting, and six languages including right-to-left Hebrew and Arabic.',
      'Some parts may not yet be fully accessible — for example the 3D scene, which is decorative only and not needed to use the site. All information and actions are also available as text.',
    ],
    stContact: 'Found a problem? Write to us and we will fix it as soon as we can:', updated: 'Last updated: October 2026',
  },
  ar: {
    open: 'قائمة إمكانية الوصول', title: 'إمكانية الوصول', big: 'تكبير النص', bigger: 'تكبير إضافي', contrast: 'تباين عالٍ', still: 'إيقاف الحركة والرسوم المتحركة', links: 'إبراز الروابط', font: 'خط سهل القراءة', cursor: 'مؤشر عادي كبير', gray: 'تدرّج رمادي', focus: 'إبراز تركيز لوحة المفاتيح', reset: 'إعادة الضبط', statement: 'بيان إمكانية الوصول', close: 'إغلاق', back: 'العودة إلى الموقع',
    stTitle: 'بيان إمكانية الوصول',
    stBody: [
      'نريد أن يتمكن الجميع من استخدام barusik.com، بمن فيهم الأشخاص ذوو الإعاقة. يسعى الموقع إلى الالتزام بالمعيار الإسرائيلي 5568 وإرشادات WCAG 2.1 بمستوى AA، ونواصل فحصه وتحسينه.',
      'ما يوفره الموقع: قائمة إمكانية الوصول (تكبير النص، تباين عالٍ، إيقاف الحركة، إبراز الروابط، خط سهل القراءة، مؤشر عادي كبير، تدرّج رمادي وإبراز التركيز)، تنقل كامل بلوحة المفاتيح مع رابط "تخطَّ إلى المحتوى"، دعم قارئات الشاشة، احترام إعداد "تقليل الحركة" في الجهاز، وست لغات منها العبرية والعربية من اليمين إلى اليسار.',
      'قد لا تكون بعض الأجزاء متاحة بالكامل بعد — مثل المشهد ثلاثي الأبعاد، وهو للزينة فقط ولا يلزم لاستخدام الموقع. جميع المعلومات والإجراءات متوفرة نصيًا أيضًا.',
    ],
    stContact: 'واجهت مشكلة؟ اكتب لنا وسنعالجها في أقرب وقت:', updated: 'آخر تحديث: أكتوبر 2026',
  },
  ru: {
    open: 'Меню доступности', title: 'Доступность', big: 'Крупный текст', bigger: 'Ещё крупнее', contrast: 'Высокий контраст', still: 'Остановить анимацию и движение', links: 'Выделить ссылки', font: 'Удобочитаемый шрифт', cursor: 'Большой обычный курсор', gray: 'Оттенки серого', focus: 'Выделить фокус клавиатуры', reset: 'Сбросить настройки', statement: 'Заявление о доступности', close: 'Закрыть', back: 'Назад на сайт',
    stTitle: 'Заявление о доступности',
    stBody: [
      'Мы хотим, чтобы сайтом barusik.com мог пользоваться каждый, включая людей с инвалидностью. Сайт стремится соответствовать израильскому стандарту 5568 и WCAG 2.1 уровня AA, и мы продолжаем его проверять и улучшать.',
      'Что есть на сайте: меню доступности (крупный текст, высокий контраст, остановка анимации, выделение ссылок, удобочитаемый шрифт, большой обычный курсор, оттенки серого и выделение фокуса), полная навигация с клавиатуры со ссылкой «Перейти к содержимому», поддержка экранных чтецов, учёт настройки «уменьшить движение» и шесть языков, включая иврит и арабский справа налево.',
      'Некоторые части пока могут быть доступны не полностью — например, 3D-сцена, которая носит декоративный характер и не нужна для пользования сайтом. Вся информация и действия доступны и в виде текста.',
    ],
    stContact: 'Нашли проблему? Напишите нам, и мы исправим её как можно скорее:', updated: 'Обновлено: октябрь 2026',
  },
  es: {
    open: 'Menú de accesibilidad', title: 'Accesibilidad', big: 'Texto más grande', bigger: 'Aún más grande', contrast: 'Alto contraste', still: 'Detener animaciones y movimiento', links: 'Resaltar enlaces', font: 'Fuente legible', cursor: 'Cursor estándar grande', gray: 'Escala de grises', focus: 'Resaltar foco del teclado', reset: 'Restablecer', statement: 'Declaración de accesibilidad', close: 'Cerrar', back: 'Volver al sitio',
    stTitle: 'Declaración de accesibilidad',
    stBody: [
      'Queremos que todo el mundo pueda usar barusik.com, incluidas las personas con discapacidad. El sitio busca cumplir la norma israelí 5568 y las pautas WCAG 2.1 nivel AA, y seguimos revisándolo y mejorándolo.',
      'Qué ofrece el sitio: un menú de accesibilidad (texto más grande, alto contraste, detener animaciones, resaltar enlaces, fuente legible, cursor estándar grande, escala de grises y resaltado del foco), navegación completa con teclado con un enlace «Saltar al contenido», compatibilidad con lectores de pantalla, respeto por la opción «reducir movimiento» del dispositivo y seis idiomas, incluidos el hebreo y el árabe de derecha a izquierda.',
      'Algunas partes pueden no ser aún totalmente accesibles, por ejemplo la escena 3D, que es solo decorativa y no hace falta para usar el sitio. Toda la información y las acciones también están disponibles como texto.',
    ],
    stContact: '¿Encontraste un problema? Escríbenos y lo arreglaremos lo antes posible:', updated: 'Última actualización: octubre de 2026',
  },
  fr: {
    open: 'Menu d’accessibilité', title: 'Accessibilité', big: 'Texte plus grand', bigger: 'Encore plus grand', contrast: 'Contraste élevé', still: 'Arrêter les animations et le mouvement', links: 'Souligner les liens', font: 'Police lisible', cursor: 'Grand curseur standard', gray: 'Niveaux de gris', focus: 'Mettre en évidence le focus clavier', reset: 'Réinitialiser', statement: 'Déclaration d’accessibilité', close: 'Fermer', back: 'Retour au site',
    stTitle: 'Déclaration d’accessibilité',
    stBody: [
      'Nous voulons que chacun puisse utiliser barusik.com, y compris les personnes en situation de handicap. Le site vise la conformité à la norme israélienne 5568 et aux WCAG 2.1 niveau AA, et nous continuons à le tester et à l’améliorer.',
      'Ce que propose le site : un menu d’accessibilité (texte plus grand, contraste élevé, arrêt des animations, liens soulignés, police lisible, grand curseur standard, niveaux de gris et mise en évidence du focus), une navigation complète au clavier avec un lien « Aller au contenu », la prise en charge des lecteurs d’écran, le respect du réglage « réduire les animations » de l’appareil et six langues, dont l’hébreu et l’arabe de droite à gauche.',
      'Certaines parties ne sont peut-être pas encore entièrement accessibles — par exemple la scène 3D, purement décorative et inutile pour utiliser le site. Toutes les informations et actions sont aussi disponibles en texte.',
    ],
    stContact: 'Un problème ? Écrivez-nous et nous le corrigerons au plus vite :', updated: 'Dernière mise à jour : octobre 2026',
  },
};
