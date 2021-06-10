var CACHE_NAME = 'sunnyserve-v1';
var urlsToCache = [
//   '/',
//   '/styles/main.css',
//   '/script/main.js'
];

self.addEventListener('install', function (event) {
    'use strict';
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function (event) {
    'use strict';
    event.respondWith(
    caches.match(event.request)
            .then(function(response) {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
