import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

const origin = "https://tmfit.example";
const script = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
const appChunk = "/_next/static/chunks/app/page-1234567890abcdef.js";
const style = "/_next/static/css/0123456789abcdef.css";

function serviceWorker(shell, serve = () => new Response("asset"), openCache = () => {}) {
  const listeners = {};
  const requests = [];
  const files = new Map();
  const cache = {
    match(request, { ignoreSearch = false } = {}) {
      const url = new URL(request.url || request);
      const key = ignoreSearch
        ? [...files.keys()].find((candidate) => candidate.split("?")[0] === url.origin + url.pathname)
        : url.href;
      return files.get(key)?.clone();
    },
    async put(url, response) {
      const body = await response.arrayBuffer();
      files.set(String(url), new Response(body, { headers: response.headers }));
    },
    keys() { return [...files.keys()].map((url) => new Request(url)); },
    delete(request) { files.delete(request.url); }
  };
  runInNewContext(script, {
    self: {
      location: { origin },
      addEventListener(event, callback) { listeners[event] = callback; }
    },
    URL, Request, AbortController,
    setTimeout: (callback, milliseconds) => setTimeout(callback, Math.min(milliseconds, 80)),
    clearTimeout,
    caches: {
      open: async () => { await openCache(); return cache; },
      match: async (request, options) => cache.match(request, options)
    },
    fetch: async (request, options) => {
      const path = new URL(request.url || request).pathname;
      requests.push(path);
      return path === "/" ? new Response(shell) : serve(path, options?.signal);
    }
  });

  function prepare(download = true) {
    return new Promise((resolve) => {
      listeners.message({
        data: { type: "TMFIT_PREPARE_WORKOUT", download },
        ports: [{ postMessage: ({ ready }) => resolve(ready) }],
        waitUntil() {}
      });
    });
  }

  function requestAsset(path) {
    return new Promise((resolve) => listeners.fetch({
      request: new Request(origin + path),
      respondWith: resolve
    }));
  }

  return { prepare, requestAsset, requests, files };
}

function shell(chunk = appChunk, stylesheet = style) {
  return `<meta name="tmfit-offline-shell" content="1"><script src="${chunk}"></script><link href="${stylesheet}" rel="stylesheet">`;
}

test("the cached shell retains the complete URL of a versioned Next.js asset", async () => {
  const chunk = `${appChunk}?dpl=dpl_test`;
  const worker = serviceWorker(shell(chunk));
  assert.equal(await worker.prepare(), true);
  assert.equal(worker.files.has(`${origin}${chunk}`), true);
});

test("runtime requests without the deployment query reuse cached content-hashed assets", async () => {
  let online = true;
  const worker = serviceWorker(shell(`${appChunk}?dpl=dpl_test`, `${style}?dpl=dpl_test`), (path) => {
    if (!online) throw new Error("offline");
    return new Response(path);
  });
  assert.equal(await worker.prepare(), true);
  online = false;
  assert.equal(await (await worker.requestAsset(appChunk)).text(), appChunk);
  assert.equal(await (await worker.requestAsset(style)).text(), style);
  await assert.rejects(worker.requestAsset(`${appChunk}?dpl=dpl_other`), /offline/);
});

test("preparing a workout does not depend on downloading the logo", async () => {
  const worker = serviceWorker(shell(), (path) => new Response("asset", {
    status: path === "/tmfit-logo.png" ? 503 : 200
  }));
  assert.equal(await worker.prepare(), true);
  assert.equal(worker.requests.includes("/tmfit-logo.png"), false);
});

test("checking an offline workout uses the verified cache without making a new request", async () => {
  const worker = serviceWorker(shell());
  assert.equal(await worker.prepare(false), false);
  assert.equal(worker.requests.length, 0);
  assert.equal(await worker.prepare(), true);
  const networkRequests = worker.requests.length;
  assert.equal(await worker.prepare(false), true);
  assert.equal(worker.requests.length, networkRequests);
});

test("a stalled asset body times out and the next preparation can retry", async () => {
  let stall = true;
  const worker = serviceWorker(shell(), (path, signal) => {
    if (!stall || path !== appChunk) return new Response("asset");
    return new Response(new ReadableStream({
      start(stream) { signal.addEventListener("abort", () => stream.error(signal.reason), { once: true }); }
    }));
  });
  const keepAlive = setTimeout(() => {}, 200);
  try {
    assert.equal(await worker.prepare(), false);
    stall = false;
    assert.equal(await worker.prepare(), true);
  } finally {
    clearTimeout(keepAlive);
  }
});

test("a stalled cache open does not block later preparation attempts", async () => {
  let blocked = true;
  const worker = serviceWorker(shell(), undefined, () => blocked ? new Promise(() => {}) : undefined);
  assert.equal(await worker.prepare(), false);
  blocked = false;
  assert.equal(await worker.prepare(), true);
});
