const prefix = 'essay-island-mobile:' + self.registration.scope + ':';
const cacheName = prefix + 'v1';
const assets = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
const allowedUrls = new Set(assets.map(asset => new URL(asset, self.registration.scope).href));

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assets)));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(prefix) && key !== cacheName).map(key => caches.delete(key))
  )));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !allowedUrls.has(request.url)) return;

  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    try {
      const response = await fetch(request);
      if (!response.ok) return (await cache.match(request)) || response;
      await cache.put(request, response.clone());
      return response;
    } catch (error) {
      const fallback = await cache.match(request);
      if (fallback) return fallback;
      throw error;
    }
  })());
});
