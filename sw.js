/* ============================================================
   EDUCA-PSY — sw.js (Service Worker PWA)
   ============================================================ */

const CACHE_NAME = 'educapsy-v1';
const ASSETS_A_METTRE_EN_CACHE = [
  '/',
  '/index.html',
  '/articles.html',
  '/emplois.html',
  '/a-propos.html',
  '/contact.html',
  '/connexion.html',
  '/style.css',
  '/interface.js',
  '/logo.svg',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_A_METTRE_EN_CACHE).catch((err) => {
        console.warn('[SW] Pré-mise en cache partielle :', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // On ignore les requêtes non-GET et les requêtes Firestore/Google APIs
  if (req.method !== 'GET' || req.url.includes('firestore.googleapis.com') || req.url.includes('google-analytics')) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(req).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (req.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Contenu temporairement inaccessible hors-ligne.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        });
      })
  );
});
