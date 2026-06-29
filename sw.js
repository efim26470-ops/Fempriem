// Fempriem final cleanup service worker. It intentionally does NOT cache.
const FEM_BUILD = 'dark-only-final-20260629-prices-fix';
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({type:'window', includeUncontrolled:true});
    for (const client of clients) {
      try { client.navigate(client.url); } catch (e) {}
    }
    try { await self.registration.unregister(); } catch (e) {}
  })());
});
self.addEventListener('fetch', () => {});
