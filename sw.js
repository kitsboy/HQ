/* Give A Bit HQ — service worker v2 (network-first for app shell) */
const CACHE = "hq-cache-v2-2026-07-22";
const PRECACHE = [
  "/",
  "/index.html",
  "/favicon.png",
  "/apple-touch-icon.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

/** App shell + data: network first so deploys show up; cache offline fallback. */
function isAppShell(url) {
  const p = url.pathname;
  if (p === "/" || p === "/index.html") return true;
  if (p === "/hq.css" || p === "/hq.js" || p === "/sw.js") return true;
  if (p.endsWith(".json") || p.endsWith(".md")) return true;
  return false;
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  let url;
  try { url = new URL(req.url); } catch { return; }
  if (url.origin !== self.location.origin) return;

  if (isAppShell(url)) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("/index.html") || new Response("Offline", { status: 503 })))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req)
        .then((res) => {
          if (res && res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => new Response("Offline", { status: 503 }))
    )
  );
});
