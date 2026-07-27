self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", () => {
  return;
});

self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data?.json?.() || {};
  } catch {
    payload = {
      title: "TMFIT · Recupero terminato",
      body:
        event.data?.text?.() ||
        "È il momento di iniziare la prossima serie."
    };
  }

  const title = payload.title || "TMFIT · Recupero terminato";

  const options = {
    body: payload.body || "È il momento di iniziare la prossima serie.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: payload.tag || "tmfit-rest-timer",
    renotify: true,
    requireInteraction: true,
    silent: false,
    timestamp: Date.now(),
    vibrate: [240, 120, 240],
    data: {
      url: payload.url || "/?tmfit=training",
      jobId: payload.jobId || null
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const destination = new URL(
    event.notification.data?.url || "/?tmfit=training",
    self.location.origin
  ).href;

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true
      })
      .then((clients) => {
        const existing = clients.find((client) =>
          client.url.startsWith(self.location.origin)
        );

        if (existing) {
          if ("navigate" in existing) {
            return existing
              .navigate(destination)
              .then(() => existing.focus());
          }

          return existing.focus();
        }

        return self.clients.openWindow(destination);
      })
  );
});
