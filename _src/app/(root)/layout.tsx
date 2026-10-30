import '../globals.css';
import type { Metadata } from 'next';
import { LANGS } from '../../lib/i18n';
export const metadata: Metadata = {
  metadataBase: new URL('https://barusik.com'),
  title: 'Barusik Platforms · הפלטפורמות של ברוסיק',
  description: 'Bar Lvovski Travel, Platformika, Complichess, Barusik Crypto, LearnLume and Penina — six platforms by Bar Lvovski, one account.',
  alternates: { canonical: '/', languages: { ...Object.fromEntries(LANGS.map((l) => [l, `/${l}/`])), 'x-default': '/' } },
  openGraph: { title: 'Barusik Platforms', url: '/', siteName: 'Barusik Platforms', images: ['/og.png'], type: 'website' },
  icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.png' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="he" dir="rtl"><body>{children}</body></html>);
}
