/**
 * SERVICE WORKER - Educa-Psy PWA
 * Version 1.0.0
 */

const CACHE_NAME = 'educapsy-v1.0.0';
const CACHE_DYNAMIC = 'educapsy-dynamic-v1';

// Fichiers à mettre en cache lors de l'installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/presentation.html',
  '/services.html',
  '/contact.html',
  '/videos.html',
  '/blog.html',
  
  // CSS
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/pages/home.css',
  
  // JavaScript
  '/js/utils.js',
  '/js/navigation.js',
  '/js/animations.js',
  '/js/cookies.js',
  '/js/chat.js',
  
  // Images essentielles
  '/images/Logo.webp',
  '/images/favicon.ico',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
  
  // Polices et autres ressources
  '/manifest.json'
];

// Ressources externes à mettre en cache
const EXTERNAL_RESOURCES = [
  'https://www.googletagmanager.com/gtag/js'
];

/**
 * Installation du Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installation en cours...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Mise en cache des fichiers statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation terminée');
        return self.skipWaiting(); // Activer immédiatement
      })
      .catch((error) => {
        console.error('[SW] Erreur lors de l\'installation:', error);
      })
  );
});

/**
 * Activation du Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation en cours...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Supprimer les anciens caches
            if (cacheName !== CACHE_NAME && cacheName !== CACHE_DYNAMIC) {
              console.log('[SW] Suppression de l\'ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation terminée');
        return self.clients.claim(); // Prendre le contrôle immédiatement
      })
  );
});

/**
 * Interception des requêtes (stratégie Cache First)
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ne pas intercepter les requêtes Chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Ne pas intercepter les requêtes vers Google Analytics
  if (url.hostname.includes('google-analytics.com') || 
      url.hostname.includes('googletagmanager.com')) {
    return;
  }
  
  // Stratégie différente selon le type de ressource
  if (request.method === 'GET') {
    // Pour les pages HTML : Network First (toujours essayer le réseau d'abord)
    if (request.headers.get('accept').includes('text/html')) {
      event.respondWith(networkFirst(request));
    }
    // Pour les autres ressources : Cache First
    else {
      event.respondWith(cacheFirst(request));
    }
  }
});

/**
 * Stratégie Cache First
 * Essaie le cache d'abord, puis le réseau si non trouvé
 */
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Ressource servie depuis le cache:', request.url);
      return cachedResponse;
    }
    
    // Si pas en cache, récupérer depuis le réseau
    const networkResponse = await fetch(request);
    
    // Mettre en cache dynamiquement si la réponse est valide
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, networkResponse.clone());
      console.log('[SW] Nouvelle ressource mise en cache:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Erreur lors de la récupération:', error);
    
    // Retourner une page offline si disponible
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    
    // Sinon retourner une réponse d'erreur minimale
    return new Response('Contenu non disponible hors ligne', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

/**
 * Stratégie Network First
 * Essaie le réseau d'abord, puis le cache si échec
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Mettre à jour le cache avec la nouvelle version
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('[SW] Cache mis à jour:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Réseau indisponible, utilisation du cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Page offline de secours
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    
    return new Response('Page non disponible hors ligne', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/html'
      })
    });
  }
}

/**
 * Gestion des messages depuis l'application
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Nettoyer le cache dynamique si demandé
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_DYNAMIC).then(() => {
        console.log('[SW] Cache dynamique nettoyé');
      })
    );
  }
  
  // Récupérer la version du cache
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME
    });
  }
});

/**
 * Gestion des notifications push (optionnel)
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nouvelle notification',
      icon: '/images/icon-192x192.png',
      badge: '/images/icon-192x192.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Educa-Psy', options)
    );
  } catch (error) {
    console.error('[SW] Erreur lors de l\'affichage de la notification:', error);
  }
});

/**
 * Gestion du clic sur les notifications
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Vérifier si une fenêtre est déjà ouverte
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Sinon ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

/**
 * Synchronisation en arrière-plan (optionnel)
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  try {
    // Implémenter la logique de synchronisation si nécessaire
    console.log('[SW] Synchronisation des messages...');
  } catch (error) {
    console.error('[SW] Erreur de synchronisation:', error);
  }
}

console.log('[SW] Service Worker chargé - Version:', CACHE_NAME);
