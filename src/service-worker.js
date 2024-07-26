/* eslint-disable no-restricted-globals */
/* eslint-disable no-unused-expressions */

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

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

// Cache Mapbox tiles
registerRoute(
  ({ url }) => url.origin === 'https://api.mapbox.com' || url.origin === 'https://a.tiles.mapbox.com' || url.origin === 'https://b.tiles.mapbox.com' || url.origin === 'https://c.tiles.mapbox.com' || url.origin === 'https://d.tiles.mapbox.com',
  new CacheFirst({
    cacheName: 'mapbox-tiles',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60, // Cache for 30 Days
        maxEntries: 100, // Only cache 100 tiles
      }),
    ],
  })
);

/* eslint-enable no-restricted-globals */
/* eslint-enable no-unused-expressions */
