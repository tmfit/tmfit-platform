const TMFIT_SW_VERSION = "tmfit-pwa-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/_next/static/")) return;

  event.respondWith(
    fetch(request).catch(() => {
      if (request.mode === "navigate") {
        return new Response(
          "TMFIT non è disponibile offline. Controlla la connessione e riapri l'app.",
          {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" }
          }
        );
      }

      return new Response("", { status: 503 });
    })
  );
});
