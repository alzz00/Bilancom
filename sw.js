// Uygulamayı telefonda saklar: internet yokken de açılır.
// Her yayında VERSION değişmeli (node araclar/surum-artir.js); telefon yeni sürümü indirip "Yeni sürüm hazır" der.
const VERSION = '2026.09.28-0115';
const CACHE = 'bilancom-' + VERSION;
const SHELL = ['./', './index.html', './manifest.webmanifest', './ikonlar/ikon-180.png', './ikonlar/ikon-192.png', './ikonlar/ikon-512.png',
  './listeler/hisseler.json', './listeler/fonlar.json'];

self.addEventListener('install', event => {
  // Fresh copies past the browser's HTTP cache, so a new version never mixes with old files.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => (k.startsWith('bilancom-') || k.startsWith('hesap-defterim-')) && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// The page sends this when the user taps "Yenile".
self.addEventListener('message', event => {
  if (event.data === 'yenile') self.skipWaiting();
});

// Own files come from this version's cache; other hosts (the price feed) go to the network.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(async cache => {
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok && !res.redirected) cache.put(req, res.clone());
      return res;
    }),
  );
});
