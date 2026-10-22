const CACHE_NAME = 'nutrio-shell-v2';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);

    const response = await fetch('/index.html', { cache: 'reload' });
    if (response.ok) {
      const html = await response.text();
      const assets = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)]
        .map(([, path]) => new URL(path, self.location.origin))
        .filter((url) => url.origin === self.location.origin);

      await Promise.all(assets.map(async (url) => {
        try {
          const assetResponse = await fetch(url);
          if (assetResponse.ok) await cache.put(url, assetResponse);
        } catch (error) {
          console.warn('Unable to precache app asset:', url.pathname, error);
        }
      }));
      await cache.put('/index.html', new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }));
    }

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames
      .filter((name) => name.startsWith('nutrio-shell-') && name !== CACHE_NAME)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put('/index.html', response.clone());
        }
        return response;
      } catch {
        return (await caches.match('/index.html')) || Response.error();
      }
    })());
    return;
  }

  if (url.pathname.startsWith('/assets/') || url.pathname === '/manifest.webmanifest') {
    event.respondWith((async () => {
      const cached = await caches.match(request, { ignoreVary: true });
      if (cached) return cached;

      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    })());
  }
});
