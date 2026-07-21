/* Give A Bit HQ — offline cache service worker v1 */
const CACHE = "hq-cache-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/hq.css",
  "/hq.js",
  "/favicon.png",
  "/apple-touch-icon.png",
  "/manifest.webmanifest",
  "/projects.json",
  "/agents.json",
  "/tools.json",
  "/status.json",
  "/status.example.json",
];
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS))
  );
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(clients.claim());
});
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).catch(() => new Response("Offline", { status: 503 })))
  );
});
