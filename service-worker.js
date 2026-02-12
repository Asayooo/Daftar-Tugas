const CACHE_NAME = "tugas-v4";

const ASSETS = [
  "./",
  "index.html",
  "add.html",
  "app.js",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
  "notif.mp3"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});

self.addEventListener("message", event => {
  if (event.data?.type === "SMART_REMINDER") {
    self.registration.showNotification(event.data.title, {
      body: event.data.body,
      icon: "icon-192.png",
      badge: "icon-192.png"
    });
  }
});
