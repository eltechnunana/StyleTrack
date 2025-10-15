const CACHE_NAME = 'styletrack-cache-v1';
const APP_SHELL = [
  '/home.html',
  '/clients.html',
  '/index.html',
  '/orders.html',
  '/reports.html',
  '/settings.html',
  '/assets/css/style.css',
  '/assets/js/core.js',
  '/assets/js/home.js',
  '/assets/js/clients.js',
  '/assets/js/app.js',
  '/assets/js/measurements-sync.js',
  '/assets/js/orders.js',
  '/assets/js/reports.js',
  '/assets/js/settings.js',
  '/assets/js/pwa.js',
  '/assets/img/favicon.svg',
  '/assets/img/male-figure.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve()))
      );
    }).then(() => self.clients.claim())
  );
});

// Navigation: network-first, fallback to cached home
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/home.html'))
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      return (
        cached ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        }).catch(() => cached)
      );
    })
  );
});