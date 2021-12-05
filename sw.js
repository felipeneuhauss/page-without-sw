try {
  const CACHE_VERSION = '0.0.1';
  const CACHE_NAME = `my-site-cache-v1${CACHE_VERSION}`;
  const urlsToCache = [
    '/',
    'js/vendor/modernizr-3.11.2.min.js',
    'js/plugins.js',
    'js/main.js',
    `https://mappab-api-staging.herokuapp.com/js/console.js`, // Alias for index.html
  ];

  self.addEventListener('install', function(event) {
    // Perform install steps
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(function(cache) {
          console.log('Opened cache');
          return cache.addAll(urlsToCache);
        })
    );
  });
  self.addEventListener('activate', function(event) {
    console.log('activate', event)
    const cacheAllowlist = [CACHE_NAME];

    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheAllowlist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });

  self.addEventListener('fetch', function(event) {
    console.log('event.request', event.request);
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          // Cache hit - return response
          if (response) {
            return response;
          }

          const fetchRequest = event.request.clone();

          return fetch(fetchRequest).then(
            function(response) {
              // Check if we received a valid response
              if(!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(event.request, responseToCache);
                });

              return response;
            }
          );
        })
    );
  });
} catch (e) {
  console.log(e);
}
