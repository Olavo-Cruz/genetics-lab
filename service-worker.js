const CACHE_NAME = 'genetics-lab-v1';
const OFFLINE_URL = '/';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  // only handle GET requests
  if (request.method !== 'GET') return;
  event.respondWith(
    caches.match(request).then(resp => {
      return resp || fetch(request).then(fetchResp => {
        // cache new resources
        return caches.open(CACHE_NAME).then(cache => {
          try { cache.put(request, fetchResp.clone()); } catch(e){/* some requests can't be cached */ }
          return fetchResp;
        });
      }).catch(() => {
        // fallback to index for SPA / offline
        return caches.match('/index.html');
      });
    })
  );
});
