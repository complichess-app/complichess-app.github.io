import type { Metadata } from 'next';
import { CONTACT, DICTS, LANGS, type Lang } from '../../../lib/i18n';
import { A11Y_T } from '../../../lib/a11y';
import A11yMenu from '../../../components/A11yMenu';

export function generateStaticParams() { return LANGS.map((lang) => ({ lang })); }
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params; const t = A11Y_T[lang as Lang];
  return { title: `${t.stTitle} · Barusik`, alternates: { canonical: `/${lang}/accessibility/` } };
}
export default async function Statement({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params; const l = lang as Lang; const t = A11Y_T[l]; const d = DICTS[l];
  return (
    <main id="main" className="mx-auto min-h-[100svh] max-w-3xl px-5 pb-28 pt-12 md:pt-20" style={{ background: 'transparent' }}>
      <a href={`/${l}/`} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 font-bold hover:bg-white/5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden className="ltr:-scale-x-100"><path d="M9 6l6 6-6 6" /></svg>{t.back}
      </a>
      <h1 className="mt-8 text-4xl font-black tracking-tight md:text-6xl">{t.stTitle}</h1>
      <p className="mt-2 text-mist">{d.brand} · barusik.com</p>
      <div className="mt-8 space-y-5 text-lg leading-relaxed text-paper/90">
        {t.stBody.map((p, i) => <p key={i}>{p}</p>)}
        <p>{t.stContact} <a href={`mailto:${CONTACT}`} dir="ltr" className="font-bold text-gold underline underline-offset-4">{CONTACT}</a></p>
        <p className="text-base text-mist">{t.updated}</p>
      </div>
      <A11yMenu lang={l} />
    </main>
  );
}
