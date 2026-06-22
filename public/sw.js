/* Service worker Dividen IDX - dependency-free.
   Strategi: app shell di-precache, /api/* selalu jaringan (jangan cache harga/ics),
   navigasi network-first dengan fallback shell, aset statis stale-while-revalidate. */
const CACHE = "dividen-idx-v2";
const SHELL = [
  "/",
  "/kalender",
  "/sektor",
  "/leaderboard",
  "/banding",
  "/panduan",
  "/istilah",
  "/artikel",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(SHELL))
      .catch(() => {}),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Jangan pernah cache API: harga & .ics harus selalu segar dari jaringan.
  if (url.pathname.startsWith("/api/")) return;

  // Navigasi halaman: network-first, fallback ke shell saat offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match("/"))),
    );
    return;
  }

  // Aset statis & lainnya: stale-while-revalidate.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
