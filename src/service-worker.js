/* eslint-disable no-restricted-globals */
/* eslint-disable no-unused-expressions */

import { precacheAndRoute } from 'workbox-precaching';

// This line automatically injects the manifest with the current build assets
precacheAndRoute(self.__WB_MANIFEST);

const CACHE_NAME = 'survey-cache-v1';

self.addEventListener('install', event => {
  console.log('Service worker installing...');
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
});

self.addEventListener('activate', event => {
  console.log('Service worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Claim clients immediately so the page reloads the service worker without waiting for a navigation event.
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

/* eslint-enable no-restricted-globals */
/* eslint-enable no-unused-expressions */
