self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", () => {
  return;
});

function restTimerTag(data = {}) {
  if (data.tag) return String(data.tag);
  if (data.jobId) return `tmfit-rest-${data.jobId}`;
  return "tmfit-rest-timer";
}

async function setTmfitBadge(value = 1) {
  try {
    if ("setAppBadge" in self.navigator) {
      await self.navigator.setAppBadge(Math.max(1, Number(value) || 1));
    }
  } catch {
    // Il badge è opzionale e può essere disattivato dall'utente.
  }
}

async function clearTmfitBadge() {
  try {
    if ("clearAppBadge" in self.navigator) {
      await self.navigator.clearAppBadge();
    }
  } catch {
    // API opzionale.
  }
}

async function closeRestTimerNotifications(data = {}) {
  try {
    const notifications = await self.registration.getNotifications({
      tag: restTimerTag(data)
    });
    notifications.forEach((notification) => notification.close());
  } catch {
    // Nessuna notifica da chiudere o API non disponibile.
  }
}

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
    await Promise.all([
      notifyOpenClients(jobId),
      closeRestTimerNotifications(data),
      clearTmfitBadge()
    ]);
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

    await Promise.all([
      notifyOpenClients(jobId),
      closeRestTimerNotifications(data),
      clearTmfitBadge()
    ]);
    return response.ok;
  } catch {
    await Promise.all([
      notifyOpenClients(jobId),
      closeRestTimerNotifications(data),
      clearTmfitBadge()
    ]);
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
      body: event.data
        ? event.data.text()
        : "È il momento di iniziare la prossima serie."
    };
  }

  const phase = payload.phase === "active" ? "active" : "finished";
  const silent = phase === "active" || payload.silent === true;
  const title =
    payload.title ||
    (phase === "active"
      ? "TMFIT · Recupero attivo"
      : "TMFIT · Recupero terminato");
  const tag = payload.tag || restTimerTag(payload);
  const options = {
    body:
      payload.body ||
      (phase === "active"
        ? "Recupero in corso."
        : "È il momento di iniziare la prossima serie."),
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag,
    renotify: phase === "finished",
    requireInteraction: true,
    silent,
    timestamp: Number(payload.timestamp) || Date.now(),
    actions: [
      {
        action: "stop",
        title: "Interrompi"
      },
      {
        action: "open",
        title: phase === "active" ? "Apri allenamento" : "Prossima serie"
      }
    ],
    data: {
      phase,
      url:
        payload.url ||
        (phase === "active"
          ? "/?tmfit=training&tmfit_rest_action=current"
          : "/?tmfit=training&tmfit_rest_action=next"),
      stopUrl: payload.stopUrl || "/api/rest-timer/stop",
      jobId: payload.jobId || null,
      stopToken: payload.stopToken || null,
      attempt: Number(payload.attempt || 0),
      tag
    }
  };

  if (!silent) {
    options.vibrate = [220, 90, 220];
  }

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      setTmfitBadge(payload.appBadge || 1)
    ])
  );
});

async function openTmfitWindow(destination) {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true
  });
  const existing = clients.find((client) =>
    client.url.startsWith(self.location.origin)
  );

  if (existing) {
    if ("navigate" in existing) {
      await existing.navigate(destination);
    }
    return existing.focus();
  }

  return self.clients.openWindow(destination);
}

self.addEventListener("notificationclick", (event) => {
  const action = event.action || "open";
  const notificationData = event.notification.data || {};
  const phase = notificationData.phase === "active" ? "active" : "finished";
  const destination = new URL(
    notificationData.url ||
      (phase === "active"
        ? "/?tmfit=training&tmfit_rest_action=current"
        : "/?tmfit=training&tmfit_rest_action=next"),
    self.location.origin
  ).href;

  if (action === "stop") {
    event.notification.close();
    event.waitUntil(stopRestTimer(notificationData));
    return;
  }

  if (phase === "active") {
    event.notification.close();
    event.waitUntil(openTmfitWindow(destination));
    return;
  }

  event.notification.close();
  event.waitUntil(
    Promise.all([
      stopRestTimer(notificationData),
      openTmfitWindow(destination)
    ])
  );
});
