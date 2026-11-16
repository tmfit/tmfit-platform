const TMFIT_SW_VERSION = "5.4";
const WORKOUT_SHELL = "tmfit-workout-shell-v1";
const shellUrl = new URL("/", self.location.origin).href;
let preparingShell;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

function isShellAsset(path) {
  return path.startsWith("/_next/static/") || path === "/tmfit-logo.png";
}

async function fetchWithDeadline(request, duration) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), duration);
  try {
    return await fetch(request, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function assetsForShell(html) {
  return [...new Set(Array.from(html.matchAll(/(?:src|href)="(\/_next\/static\/[^"<>]+)"/g),
    (match) => match[1])), "/tmfit-logo.png"];
}

async function prepareShell() {
  const cache = await caches.open(WORKOUT_SHELL);
  const previous = await cache.match(shellUrl);
  try {
    const response = await fetchWithDeadline(new Request(shellUrl, { cache: "reload" }), 5_000);
    if (!response.ok) throw new Error("Workout shell unavailable");
    const html = await response.clone().text();
    const assets = assetsForShell(html);
    if (!html.includes('name="tmfit-offline-shell"') || assets.length < 2) {
      throw new Error("Workout shell could not be identified");
    }
    await Promise.all(assets.map(async (path) => {
      const url = new URL(path, shellUrl).href;
      if (await cache.match(url)) return;
      const asset = await fetchWithDeadline(url, 8_000);
      if (!asset.ok) throw new Error("Workout asset unavailable");
      await cache.put(url, asset);
    }));
    await cache.put(shellUrl, response);

    // Retain the previous shell's chunks during a deployment transition.
    const keep = new Set(["/", ...assets, ...assetsForShell(previous ? await previous.text() : "")]);
    await Promise.all((await cache.keys()).map((request) => {
      if (!keep.has(new URL(request.url).pathname)) return cache.delete(request);
    }));
    return true;
  } catch {
    if (!previous) return false;
    const assets = assetsForShell(await previous.text().catch(() => ""));
    const cachedAssets = await Promise.all(assets.map((path) => cache.match(new URL(path, shellUrl).href)));
    return assets.length > 1 && cachedAssets.every(Boolean);
  }
}

self.addEventListener("message", (event) => {
  if (event.data?.type !== "TMFIT_PREPARE_WORKOUT" || !event.ports[0]) return;
  preparingShell ||= prepareShell().catch(() => false).finally(() => { preparingShell = null; });
  event.waitUntil(preparingShell.then((ready) => event.ports[0].postMessage({ ready })));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (request.mode === "navigate" && url.pathname === "/") {
    event.respondWith((async () => {
      const cached = await caches.match(shellUrl, { cacheName: WORKOUT_SHELL }).catch(() => undefined);
      if (!cached) return fetch(request);
      try {
        const response = await fetchWithDeadline(request, 2_500);
        return response.status >= 500 ? cached : response;
      } catch {
        return cached;
      }
    })());
  } else if (isShellAsset(url.pathname)) {
    event.respondWith((async () => {
      const cached = await caches.match(request, { cacheName: WORKOUT_SHELL }).catch(() => undefined);
      return cached || fetch(request);
    })());
  }
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
    // Il badge è opzionale e dipende dalle impostazioni iOS.
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

  const title = payload.title || "TMFIT · Recupero terminato";
  const tag = payload.tag || restTimerTag(payload);
  const options = {
    body:
      payload.body || "È il momento di iniziare la prossima serie.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag,
    renotify: false,
    requireInteraction: true,
    silent: false,
    timestamp: Number(payload.timestamp) || Date.now(),
    actions: [
      {
        action: "stop",
        title: "Chiudi"
      },
      {
        action: "open",
        title: "Apri serie"
      }
    ],
    data: {
      url:
        payload.url ||
        "/?tmfit=training&tmfit_rest_action=next",
      stopUrl: payload.stopUrl || "/api/rest-timer/stop",
      jobId: payload.jobId || null,
      stopToken: payload.stopToken || null,
      tag
    }
  };

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
  const destination = new URL(
    notificationData.url ||
      "/?tmfit=training&tmfit_rest_action=next",
    self.location.origin
  ).href;

  event.notification.close();

  if (action === "stop") {
    event.waitUntil(stopRestTimer(notificationData));
    return;
  }

  event.waitUntil(
    Promise.all([
      stopRestTimer(notificationData),
      openTmfitWindow(destination)
    ])
  );
});

self.addEventListener("notificationclose", (event) => {
  event.waitUntil(clearTmfitBadge());
});
