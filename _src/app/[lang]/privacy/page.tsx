import type { Metadata } from 'next';
import { LANGS, type Lang } from '../../../lib/i18n';
import { LEGAL } from '../../../lib/legal';
import LegalPage from '../../../components/LegalPage';

export function generateStaticParams() { return LANGS.map((lang) => ({ lang })); }
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: `${LEGAL[lang as Lang].privacy.title} · Barusik`, alternates: { canonical: `/${lang}/privacy/` } };
}
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <LegalPage lang={lang as Lang} kind="privacy" />;
}
