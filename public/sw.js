// Only job: show /offline.html when a page can't load. Nothing else is
// cached, so prices and availability always come fresh from the server.
const CACHE = 'offline-v1';
const OFFLINE_URL = '/offline.html';
const OFFLINE_ICON = '/icons/icon-192.png';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([OFFLINE_URL, OFFLINE_ICON])));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }
  // The offline page's icon has to load without network too.
  if (new URL(event.request.url).pathname === OFFLINE_ICON) {
    event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_ICON)));
  }
});
