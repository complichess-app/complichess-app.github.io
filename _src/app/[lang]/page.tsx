import { DICTS, type Lang } from '../../lib/i18n';
import Site from '../../components/Site';
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <Site lang={lang as Lang} d={DICTS[lang as Lang]} />;
}
