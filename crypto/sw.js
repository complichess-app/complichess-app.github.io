/* Barusik Crypto: offline copy, network first so updates arrive without reinstalling. */
const V = new URL(self.location).searchParams.get('v') || 'dev', PRE = 'crypto-', CACHE = PRE + V;
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'])).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith(PRE) && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  // only this app's own files; the version check and everything else go straight to the network
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname === '/version.json' || !(u.pathname.startsWith(self.registration.scope.replace(location.origin, '')) || u.pathname.startsWith('/lib/'))) return;
  e.respondWith(fetch(r, { cache: 'no-cache' }).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(r, cp)); } return res; }).catch(() => caches.match(r).then((m) => m || (r.mode === 'navigate' ? caches.match('./') : Response.error()))));
});
