/* ============================================================
   EDUCA-PSY — sw.js (Service Worker PWA)
   ============================================================ */

const CACHE_NAME = 'educapsy-v18';
const ASSETS_A_METTRE_EN_CACHE = [
  '/',
  '/index.html',
  '/article.html',
  '/articles.html',
  '/changer-une-habitude.html',
  '/stress-pas-toujours-ennemi.html',
  '/devoirs-utiles-ou-pas.html',
  '/dormir-pour-apprendre.html',
  '/baillement-contagieux.html',
  '/gta-6-psychologie.html',
  '/biais-psychologiques.html',
  '/emplois.html',
  '/ia-voix-depression.html',
  '/parole-par-la-pensee.html',
  '/tuteur-ia-harvard.html',
  '/cerveau-lavage-sommeil.html',
  '/rejoyn-application-depression.html',
  '/dissonance-cognitive.html',
  '/a-propos.html',
  '/contact.html',
  '/connexion.html',
  '/style.css',
  '/interface.js',
  '/logo.svg',
  '/logo.png',
  '/favicon.ico',
  '/favicon-48.png',
  '/icon-192.png',
  '/images/changer-habitude.webp',
  '/images/stress-energie.webp',
  '/images/devoirs-ecole.webp',
  '/images/sommeil-memoire.webp',
  '/images/baillement-contagieux.webp',
  '/images/ia-voix-depression.webp',
  '/images/parole-pensee-bci.webp',
  '/images/tuteur-ia-harvard.webp',
  '/images/cerveau-lavage-sommeil.webp',
  '/images/rejoyn-therapie-numerique.webp',
  '/images/gta6-lancement.webp',
  '/images/gta6-vice-city-miami.webp',
  '/images/gta6-manette-ps5.webp',
  '/images/biais-psychologiques-couverture.webp',
  '/images/stanley-mazile.webp',
  '/assets/aistudio/Biais_de_confirmation_12554662.svg',
  '/assets/aistudio/Biais_de_disponibilit__1e793a81.svg',
  '/assets/aistudio/Biais_de_n_gativit__2031562b.svg',
  '/assets/aistudio/Effet_Dunning-Kruger_a0d47c50.svg',
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
