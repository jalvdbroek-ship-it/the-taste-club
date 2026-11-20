// Offline-cache: schil, data en afbeeldingen worden vooraf opgehaald; daarna stale-while-revalidate voor same-origin GET.
// Verhoog VERSION bij elke wijziging aan bestanden, anders blijft een oude cache actief.
const VERSION = "tasteclub-v6";
const CORE = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "config/app.json",
  "public/css/base.css",
  "public/css/components.css",
  "public/css/motion.css",
  "public/css/scre",
  "public/css/screens.css",
  "public/css/tokens.css",
  "public/fonts/bodoni-moda-latin.woff2",
  "public/fonts/cormorant-italic-latin.woff2",
  "public/fonts/cormorant-normal-latin.woff2",
  "public/fonts/instrument-sans-latin.woff2",
  "public/icons/apple-touch-icon.png",
  "public/icons/favicon.svg",
  "public/icons/icon-192.png",
  "public/icons/icon-512.png",
  "public/icons/icon-maskable-512.png",
  "public/icons/merkteken.svg",
  "public/img/chevron.svg",
  "public/img/deelbeeld.jpg",
  "public/img/korrel.svg",
  "public/img/nix18/nix18-wit.png",
  "public/img/producten/bacardi-carta-blanca.webp",
  "public/img/producten/ballantines-finest.webp",
  "public/img/producten/beefeater-london-dry.webp",
  "public/img/producten/campari.webp",
  "public/img/producten/gordons-london-dry.webp",
  "public/img/producten/havana-club-3.webp",
  "public/img/producten/hennessy-vs.webp",
  "public/img/producten/jb-rare.webp",
  "public/img/producten/johnnie-walker-black-label.webp",
  "public/img/producten/martini-bianco.webp",
  "public/img/producten/smirnoff-vodka.webp",
  "src/app.js",
  "src/components/icons.js",
  "src/components/product-card.js",
  "src/components/radar.js",
  "src/components/shell.js",
  "src/data/catalog.json",
  "src/data/events.json",
  "src/data/gifts.json",
  "src/data/golden-pick.json",
  "src/data/recepten.json",
  "src/data/stories.json",
  "src/lib/admin-forms.js",
  "src/lib/admin-store.mjs",
  "src/lib/age.mjs",
  "src/lib/collection.mjs",
  "src/lib/datasource.mjs",
  "src/lib/dom.js",
  "src/lib/env.mjs",
  "src/lib/events.mjs",
  "src/lib/feest.mjs",
  "src/lib/gifts.mjs",
  "src/lib/notes-ui.js",
  "src/lib/storage.mjs",
  "src/lib/taste.mjs",
  "src/lib/validate.mjs",
  "src/router.js",
  "src/screens/about.js",
  "src/screens/admin.js",
  "src/screens/club.js",
  "src/screens/collection.js",
  "src/screens/gift.js",
  "src/screens/home.js",
  "src/screens/more.js",
  "src/screens/pick.js",
  "src/screens/privacy.js",
  "src/screens/product.js",
  "src/screens/products.js",
  "src/screens/recepten.js",
  "src/screens/taste.js",
  "src/screens/tour.js",
  "src/state/app-state.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || (req.mode === "navigate" ? cache.match("index.html") : Response.error());
  })());
});
