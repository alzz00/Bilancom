// Uygulamayı telefonda önbelleğe alır: internet yokken de açılır, yeni sürüm arka planda iner.
const CACHE = 'hesap-defterim-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './ikonlar/ikon-180.png', './ikonlar/ikon-192.png', './ikonlar/ikon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Own files: answer from the cache at once and refresh it in the background.
// Other hosts (the price feed) always go to the network.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    const fresh = fetch(req)
      .then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; })
      .catch(() => null);
    event.waitUntil(fresh);
    return cached || (await fresh) || Response.error();
  })());
});
