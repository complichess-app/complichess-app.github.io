import { LANGS, DICTS } from '../../lib/i18n';
/* "/" picks the saved language, then the browser language, else Hebrew. */
const pick = `(function(){var L=${JSON.stringify(LANGS)};var s=null;try{s=localStorage.getItem('barusik.lang')}catch(e){}
var n=(navigator.languages||[navigator.language||'he']).map(function(x){return String(x).slice(0,2).toLowerCase()});
var l=(s&&L.indexOf(s)>=0)?s:(n.find(function(x){return L.indexOf(x)>=0})||'he');if(l==='iw')l='he';location.replace('/'+l+'/'+location.hash);})();`;
export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#090B1F', color: '#EEEAF8', fontFamily: 'system-ui' }}>
      <script dangerouslySetInnerHTML={{ __html: pick }} />
      <nav style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {LANGS.map((l) => (<a key={l} href={`/${l}/`} style={{ color: '#EEEAF8' }}>{DICTS[l].brand}</a>))}
      </nav>
    </main>
  );
}
