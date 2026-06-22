const CACHE = "ledger-v1";
const STATIC_ASSETS = [
  "/dashboard",
  "/dashboard/journal",
  "/dashboard/journal/import",
  "/dashboard/profile",
  "/dashboard/settings",
  "/dashboard/strategies",
  "/dashboard/leaderboard",
  "/dashboard/analytics",
  "/dashboard/calendar",
  "/dashboard/reports",
  "/login",
  "/register",
  "/offline",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  if (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/__nextjs")) {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  if (url.pathname.startsWith("/share/")) {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE).then((cache) => {
          if (request.method === "GET" && response.ok) {
            cache.put(request, clone);
          }
        });
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.headers.get("Accept")?.includes("text/html")) {
            return caches.match("/offline");
          }
          return new Response("", { status: 408 });
        });
      })
  );
});

async function networkFirstWithCache(request) {
  try {
    const response = await fetch(request);
    const clone = response.clone();
    caches.open(CACHE).then((cache) => {
      if (response.ok) cache.put(request, clone);
    });
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.headers.get("Accept")?.includes("text/html")) {
      return caches.match("/offline");
    }
    return new Response("", { status: 408 });
  }
}
