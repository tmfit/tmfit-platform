import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

const origin = "https://tmfit.example";
const script = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
const appChunk = "/_next/static/chunks/app/page-12.js";
const style = "/_next/static/css/base-34.css";

function serviceWorker(shell, serve = () => new Response("asset")) {
  const listeners = {};
  const requests = [];
  const files = new Map();
  const cache = {
    match(url) { return files.get(String(url))?.clone(); },
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
    caches: { open: async () => cache },
    fetch: async (request, options) => {
      const path = new URL(request.url || request).pathname;
      requests.push(path);
      return path === "/" ? new Response(shell) : serve(path, options.signal);
    }
  });

  function prepare() {
    return new Promise((resolve) => {
      listeners.message({
        data: { type: "TMFIT_PREPARE_WORKOUT" },
        ports: [{ postMessage: ({ ready }) => resolve(ready) }],
        waitUntil() {}
      });
    });
  }

  return { prepare, requests, files };
}

function shell(chunk = appChunk) {
  return `<meta name="tmfit-offline-shell" content="1"><script src="${chunk}"></script><link href="${style}" rel="stylesheet">`;
}

test("the cached shell retains the complete URL of a versioned Next.js asset", async () => {
  const chunk = `${appChunk}?dpl=dpl_test`;
  const worker = serviceWorker(shell(chunk));
  assert.equal(await worker.prepare(), true);
  assert.equal(worker.files.has(`${origin}${chunk}`), true);
});

test("preparing a workout does not depend on downloading the logo", async () => {
  const worker = serviceWorker(shell(), (path) => new Response("asset", {
    status: path === "/tmfit-logo.png" ? 503 : 200
  }));
  assert.equal(await worker.prepare(), true);
  assert.equal(worker.requests.includes("/tmfit-logo.png"), false);
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
