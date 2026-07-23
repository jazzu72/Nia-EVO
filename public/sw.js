const CACHE_NAME = 'nia-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard',
  '/api/watson/health',
  '/manifest.json'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network first, fallback to cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, responseToCache));

        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(response => response || new Response('Offline - Page Not Available', { status: 503 }));
      })
  );
});
