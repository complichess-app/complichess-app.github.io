import { CONTACT, DICTS, type Lang } from '../lib/i18n';
import { LEGAL } from '../lib/legal';
import A11yMenu from './A11yMenu';

export default function LegalPage({ lang, kind }: { lang: Lang; kind: 'privacy' | 'terms' }) {
  const t = LEGAL[lang]; const doc = t[kind]; const d = DICTS[lang];
  const other = kind === 'privacy' ? { href: `/${lang}/terms/`, label: t.termsLink } : { href: `/${lang}/privacy/`, label: t.privacyLink };
  return (
    <main id="main" className="mx-auto min-h-[100svh] max-w-3xl px-5 pb-28 pt-12 md:pt-20" style={{ background: 'transparent' }}>
      <a href={`/${lang}/`} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 font-bold hover:bg-white/5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden className="ltr:-scale-x-100"><path d="M9 6l6 6-6 6" /></svg>{t.back}
      </a>
      <h1 className="mt-8 text-4xl font-black tracking-tight md:text-6xl">{doc.title}</h1>
      <p className="mt-2 text-mist">{d.brand} · barusik.com</p>
      {t.binding && <p className="mt-6 rounded-2xl border border-white/15 p-4 text-base text-mist">{t.binding}</p>}
      <div className="mt-8 space-y-5 text-lg leading-relaxed text-paper/90">
        <p>{doc.intro}</p>
        {doc.secs.map((s) => (
          <section key={s.h} className="space-y-3 pt-2" lang={t.binding ? 'en' : undefined} dir={t.binding && lang !== 'en' ? 'ltr' : undefined}>
            <h2 className="text-2xl font-black">{s.h}</h2>
            {s.p.map((p, i) => <p key={i}>{p}</p>)}
          </section>
        ))}
        <p>✉️ <a href={`mailto:${CONTACT}`} dir="ltr" className="font-bold text-gold underline underline-offset-4">{CONTACT}</a></p>
        <p className="text-base text-mist">{t.updated} · <a href={other.href} className="underline underline-offset-4">{other.label}</a></p>
      </div>
      <A11yMenu lang={lang} />
    </main>
  );
}
