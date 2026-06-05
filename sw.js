// AlluviAI service worker — offline cache for app shell + map tiles
const SHELL = 'alluviai-shell-v1';
const TILES = 'alluviai-tiles-v1';
const SHELL_FILES = [
  './', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL)
    .then(c => Promise.allSettled(SHELL_FILES.map(f => c.add(f))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(
    ks.filter(k => k !== SHELL && k !== TILES).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
function isTile(u){ return /arcgisonline|tile\.openstreetmap|basemaps|\/tile\//.test(u); }
self.addEventListener('fetch', e => {
  const url = e.request.url;
  if (isTile(url)) {
    e.respondWith(caches.open(TILES).then(c =>
      c.match(e.request).then(hit => hit || fetch(e.request).then(net => {
        c.put(e.request, net.clone()); return net;
      }).catch(() => hit))));
  } else {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
  }
});
