const CACHE_NAME = 'my-pwa-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'manifest.json',
  'css/scanner.css',
  'js/scanner.js',
  'js/sw.js',
  'images/app_icon.png',
  'images/gem=1.jpg',
  'images/gem=2.jpg',
  'images/gem=3.jpg',
  'images/gem=4.jpg',
  'images/gem=5.jpg',
  'images/gem=6.jpg',
  'images/gem=7.jpg',
  'images/gem=8.jpg',
  'images/gem=9.jpg',
  'images/gem=10.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
