const CACHE_NAME = "tugas-v2";
const ASSETS = [
  "index.html",
  "add.html",
  "app.js",
  "manifest.json"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});

self.addEventListener("message", event => {
  if (event.data === "REMINDER") {
    self.registration.showNotification("Pengingat Deadline!", {
      body: "Ada tugas yang deadline hari ini!",
      icon: "icon-192.png"
    });
  }
});
