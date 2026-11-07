/* Generated from scripts/sw-template.js. Static assets only; no private API data. */
const CACHE = __CACHE__;
const SHELL = __ASSETS__;
const PREFIX = 'plant-notes-shell-';
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const results = await Promise.allSettled(SHELL.map(async path => {
      const response = await fetch(path, { cache: 'reload', credentials: 'same-origin' });
      if (response.ok) await cache.put(path, response);
    }));
    if (results.every(result => result.status === 'rejected')) {
      throw new Error('Failed to cache the app shell');
    }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(PREFIX) && name !== CACHE)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Never store authenticated responses, uploads, media, or user data.
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/') ||
      url.pathname.startsWith('/socket.io/') || url.pathname.startsWith('/src/') ||
      url.pathname.startsWith('/@')) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
          const cache = await caches.open(CACHE);
          await cache.put('/index.html', response.clone());
        }
        return response;
      } catch {
        return (await caches.match('/index.html')) ||
          new Response('Offline app shell unavailable. Visit once while online.', { status: 503 });
      }
    })());
    return;
  }
  if (!SHELL.includes(url.pathname)) return;
  event.respondWith((async () => {
    const cached = await caches.match(url.pathname);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(url.pathname, response.clone());
    }
    return response;
  })());
});
