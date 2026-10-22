// Small service worker so repeat visits load instantly, even on a slow or flaky connection.
// - /assets/* files have content hashes in their names, so they are served cache-first.
// - Page navigations go to the network first (so new deploys show up) and fall back to the cache offline.
// - Everything else (images, fonts, PDF) is served from cache and refreshed in the background.
const CACHE = "kapil-portfolio-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match(self.registration.scope))),
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(request);
      // Hashed build files never change, so a cached copy is always correct.
      if (hit && url.pathname.includes("/assets/")) return hit;
      const network = fetch(request).then((response) => {
        if (response.ok) cache.put(request, response.clone());
        return response;
      });
      if (hit) {
        event.waitUntil(network.catch(() => {}));
        return hit;
      }
      return network;
    }),
  );
});
