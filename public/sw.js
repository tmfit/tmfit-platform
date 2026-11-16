const TMFIT_SW_VERSION = "5.7";
const WORKOUT_SHELL = "tmfit-workout-shell-v1";
const shellUrl = new URL("/", self.location.origin).href;
let preparingShell;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

function isShellAsset(path) {
  return path.startsWith("/_next/static/") || path === "/tmfit-logo.png";
}

async function withDeadline(run, duration) {
  const controller = new AbortController();
  let timeout;
  const deadline = new Promise((_, reject) => {
    timeout = setTimeout(() => {
      controller.abort();
      const error = new Error("Workout resource timed out");
      error.name = "TimeoutError";
      reject(error);
    }, duration);
  });
  try {
    return await Promise.race([run(controller.signal), deadline]);
  } finally {
    clearTimeout(timeout);
  }
}

function fetchWithDeadline(request, duration, consume = (response) => response) {
  return withDeadline((signal) => fetch(request, { signal }).then(consume), duration);
}

function assetsForShell(html) {
  const urls = Array.from(html.matchAll(/(?:src|href)=["'](\/_next\/static\/[^"'<>]+)["']/g),
    ([, path]) => new URL(path.replace(/&amp;/g, "&"), shellUrl));
  return [...new Set(urls.filter((url) => /\.(?:js|css)$/.test(url.pathname)).map((url) => url.href))];
}

async function cachedShellReady(cache, response) {
  if (!response) return false;
  const html = await response.text();
  const assets = assetsForShell(html);
  return html.includes('name="tmfit-offline-shell"') && assets.length > 0 &&
    (await Promise.all(assets.map((url) => cache.match(url)))).every(Boolean);
}

async function prepareShell(download, signal) {
  const cache = await caches.open(WORKOUT_SHELL);
  const previous = await cache.match(shellUrl);
  if (!download || signal.aborted) return cachedShellReady(cache, previous);
  try {
    const { response, html } = await fetchWithDeadline(new Request(shellUrl, {
      cache: "reload",
      credentials: "same-origin",
      headers: { Accept: "text/html" }
    }), 4_000, async (response) => {
        const url = new URL(response.url || shellUrl);
        if (!response.ok || url.origin !== self.location.origin || url.pathname !== "/") {
          throw new Error("Workout shell unavailable");
        }
        return { response, html: await response.clone().text() };
      }
    );
    const assets = assetsForShell(html);
    if (!html.includes('name="tmfit-offline-shell"') || assets.length === 0) {
      throw new Error("Workout shell could not be identified");
    }
    if (signal.aborted) return false;
    await Promise.all(assets.map(async (url) => {
      if (await cache.match(url) || signal.aborted) return;
      await fetchWithDeadline(new Request(url, { cache: "force-cache", credentials: "same-origin" }), 6_000, async (asset) => {
        if (!asset.ok || new URL(asset.url || url).origin !== self.location.origin ||
          asset.headers.get("Content-Type")?.includes("text/html")) throw new Error("Workout asset unavailable");
        if (!signal.aborted) await cache.put(url, asset);
      });
    }));

    // Store the app document under the entry URL even if the preview redirected to it.
    const document = response.redirected ? new Response(response.body, {
      status: response.status,
      headers: response.headers
    }) : response;
    // Retain the previous shell's chunks, including any deployment query parameters.
    const keep = new Set([shellUrl, ...assets, ...assetsForShell(previous ? await previous.clone().text() : "")]);
    if (signal.aborted) return false;
    await cache.put(shellUrl, document);
    await Promise.all((await cache.keys()).map((request) => {
      if (!signal.aborted && isShellAsset(new URL(request.url).pathname) && !keep.has(request.url)) return cache.delete(request);
    }));
    return (await Promise.all(assets.map((url) => cache.match(url)))).every(Boolean);
  } catch {
    return cachedShellReady(cache, previous);
  }
}

self.addEventListener("message", (event) => {
  if (event.data?.type !== "TMFIT_PREPARE_WORKOUT" || !event.ports[0]) return;
  let check;
  if (event.data.download === false) {
    check = withDeadline((signal) => prepareShell(false, signal), 2_500);
  } else {
    preparingShell ||= withDeadline((signal) => prepareShell(true, signal), 11_000)
      .finally(() => { preparingShell = null; });
    check = preparingShell;
  }
  event.waitUntil(check.then((ready) => ({ ready }), (error) => ({
    ready: false, issue: error.name === "TimeoutError" ? "timeout" : "storage"
  }))
    .then((result) => event.ports[0].postMessage(result)));
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
      const options = { cacheName: WORKOUT_SHELL };
      let cached = await caches.match(request, options).catch(() => undefined);
      // The runtime can request the same content-hashed asset without Vercel's deployment query.
      if (!cached && !url.search && /^\/_next\/static\/(?:chunks\/.*-|css\/)[a-f0-9]{8,}\.(?:js|css)$/.test(url.pathname)) {
        cached = await caches.match(request, { ...options, ignoreSearch: true }).catch(() => undefined);
      }
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
