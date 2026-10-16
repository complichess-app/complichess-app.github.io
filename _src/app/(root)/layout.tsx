import '../globals.css';
export const metadata = { title: 'Barusik Platforms', description: 'Platformika · Complichess · Crypto' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="he" dir="rtl"><body>{children}</body></html>);
}
