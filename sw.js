/* Give A Bit HQ — service worker (network-only for app shell; no stale HTML/JS) */
const HQ_SW_VERSION = "3.18.1";
const CACHE = "hq-cache-v3.18.1";

/** Never serve shell from cache — ops glass must always match deploy. */
function isAppShell(url) {
  const p = url.pathname;
  if (p === "/" || p === "/index.html") return true;
  if (p === "/hq.css" || p === "/hq.js" || p === "/sw.js") return true;
  // versioned query still shell
  if (p.startsWith("/hq.css") || p.startsWith("/hq.js")) return true;
  return false;
}

self.addEventListener("install", (e) => {
  // Drop everything old immediately; do not precache HTML/JS
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => clients.claim())
  );
});

self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
  if (e.data && e.data.type === "PURGE") {
    e.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))));
  }
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;

  // App shell: network only (bypass HTTP cache too)
  if (isAppShell(url)) {
    e.respondWith(
      fetch(req, { cache: "no-store" }).catch(
        () =>
          new Response(
            `<!doctype html><meta charset=utf-8><title>HQ offline</title>
             <body style="font-family:system-ui;background:#1a1208;color:#f0dcc0;padding:2rem">
             <h1>HQ offline</h1><p>Could not reach network. Retry when online.</p>
             <p class=mono>sw ${HQ_SW_VERSION}</p></body>`,
            { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
          )
      )
    );
    return;
  }

  // JSON / MD: network first, short offline fallback
  if (url.pathname.endsWith(".json") || url.pathname.endsWith(".md")) {
    e.respondWith(
      fetch(req, { cache: "no-store" })
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || new Response("{}", { status: 503 })))
    );
    return;
  }

  // Static images etc: cache-first
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req)
          .then((res) => {
            if (res && res.ok && res.type === "basic") {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => new Response("", { status: 503 }))
    )
  );
});
