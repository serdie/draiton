// sw.js - Service Worker

const CACHE_NAME = 'draiton-cache-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/styles/globals.css'
  // Añade aquí los recursos estáticos más importantes que quieres cachear
];

self.addEventListener('install', event => {
  // Realiza la instalación del service worker
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierta');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Importante: Clona la petición. Una petición es un stream y solo se puede consumir una vez.
        // Necesitamos clonarla para poder enviarla a la caché y al navegador.
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Comprueba si hemos recibido una respuesta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Importante: Clona la respuesta. Una respuesta es un stream y solo se puede consumir una vez.
            // Necesitamos clonarla para poder enviarla a la caché y al navegador.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
