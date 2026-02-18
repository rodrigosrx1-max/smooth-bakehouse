const CACHE_NAME = "smooth-cache-v11";

const FILES_TO_CACHE = [
  "/",
  "index.html",
  "offline.html",

  /* CSS essenciais */
  "css/global/reset.css",
  "css/global/base.css",
  "css/theme/theme.css",

  /* Ícones */
  "img/icons/icone-smooth.png",
  "img/icons/icone-maskable.png"
];


/* ========================
   INSTALL
======================== */
self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );
});


/* ========================
   ACTIVATE
======================== */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});


/* ========================
   FETCH
======================== */
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {

      if (cached) return cached;

      return fetch(event.request)
        .then(response => {

          if (
            response.status === 200 &&
            response.type === "basic"
          ) {
            const clone = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, clone));
          }

          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("offline.html");
          }
        });

    })
  );
});
