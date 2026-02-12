const CACHE_NAME = "tugas-vFinal3";

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


self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});

self.addEventListener("message", event => {
  if (event.data?.type === "SMART_REMINDER") {
    self.registration.showNotification(event.data.title, {
      body: event.data.body,
      icon: "icon-192.png",
      badge: "icon-192.png",
      data: {playSound: true}
    });
  }
});

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationshow", event => {
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true })
      .then(clients => {
        clients.forEach(client => {
          client.postMessage("PLAY_SOUND");
        });
      })
  );
});


