self.addEventListener("install", () => {
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

function notifyOpenClients(jobId) {
  return self.clients
    .matchAll({
      type: "window",
      includeUncontrolled: true
    })
    .then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "TMFIT_REST_TIMER_STOP",
          jobId: jobId || null
        });
      });
    });
}

async function stopRestTimer(data = {}) {
  const jobId = data.jobId || "";
  const stopToken = data.stopToken || "";
  const stopUrl = data.stopUrl || "/api/rest-timer/stop";

  if (!jobId || !stopToken) {
    await notifyOpenClients(jobId);
    return false;
  }

  try {
    const response = await fetch(stopUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        job_id: jobId,
        stop_token: stopToken
      })
    });

    await notifyOpenClients(jobId);
    return response.ok;
  } catch {
    await notifyOpenClients(jobId);
    return false;
  }
}

self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {
      title: "TMFIT · Recupero terminato",
      body: event.data ? event.data.text() : "È il momento di iniziare la prossima serie."
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
    vibrate: [220, 90, 220],
    actions: [
      {
        action: "stop",
        title: "Interrompi"
      },
      {
        action: "open",
        title: "Apri Allenati"
      }
    ],
    data: {
      url: payload.url || "/?tmfit=training",
      stopUrl: payload.stopUrl || "/api/rest-timer/stop",
      jobId: payload.jobId || null,
      stopToken: payload.stopToken || null,
      attempt: Number(payload.attempt || 0)
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  const action = event.action || "open";
  const notificationData = event.notification.data || {};
  event.notification.close();

  if (action === "stop") {
    event.waitUntil(stopRestTimer(notificationData));
    return;
  }

  const destination = new URL(
    notificationData.url || "/?tmfit=training",
    self.location.origin
  ).href;

  event.waitUntil(
    Promise.all([
      stopRestTimer(notificationData),
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
    ])
  );
});
