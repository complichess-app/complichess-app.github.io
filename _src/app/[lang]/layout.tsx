import '../globals.css';
import type { Metadata, Viewport } from 'next';
import { LANGS, DICTS, RTL, type Lang } from '../../lib/i18n';
import { A11Y_BOOT } from '../../lib/a11y';

export function generateStaticParams() { return LANGS.map((lang) => ({ lang })); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params; const d = DICTS[lang as Lang];
  return {
    metadataBase: new URL('https://barusik.com'),
    title: d.metaTitle, description: d.metaDesc,
    alternates: { canonical: `/${lang}/`, languages: Object.fromEntries(LANGS.map((l) => [l, `/${l}/`])) },
    openGraph: { title: d.metaTitle, description: d.metaDesc, url: `/${lang}/`, siteName: 'Barusik Platforms', images: ['/og.png'], type: 'website' },
    icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.png' },
  };
}
export const viewport: Viewport = { themeColor: '#090B1F', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return (
    <html lang={lang} dir={RTL[lang as Lang] ? 'rtl' : 'ltr'}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: A11Y_BOOT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700;800;900&family=Unbounded:wght@200..900&display=swap" />
      </head>
      <body className="grain">{children}</body>
    </html>
  );
}
