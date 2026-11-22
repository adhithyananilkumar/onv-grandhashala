/*
 * ONV Library service worker: makes the site an installable app that still opens offline.
 *
 *  - /_next/static/*         cache first (file names change on every build, so never stale)
 *  - images, brand, icons    stale-while-revalidate (show the saved copy, refresh in the background)
 *  - public pages            network first, saved copy offline, else the offline page
 *  - GET /api/catalog        network first, saved copy offline (books, classes, events, Vipani)
 *  - everything personal     never cached: /api/auth, /api/me, /api/admin, payments, /admin, /me
 *
 * Bump VERSION to drop every old cache on the next visit.
 */
const VERSION = "v4";
const STATIC = `onv-static-${VERSION}`;
const PAGES = `onv-pages-${VERSION}`;
const DATA = `onv-data-${VERSION}`;
const MEDIA = `onv-media-${VERSION}`;
const OFFLINE = "/offline";

const PRECACHE_MEDIA = ["/brand/onv-icon.svg", "/icons/icon-192.png", "/icons/icon-512.png"];

// Pages that hold no personal data and are worth having offline.
const PUBLIC_PAGE = /^\/($|catalogue|classes|events|vipani|join|offline)(\/|$|\?)/;
const PUBLIC_DATA = /^\/api\/catalog(\/|$)/;

// Scripts, styles and fonts a saved page needs to run offline. The browser often serves these
// from its own memory cache without asking the worker, so they are saved from each page's HTML.
const ASSET = /\/_next\/static\/[\w\-.\/~%]+\.(?:js|css|woff2)/g;

async function warm(html) {
  const stat = await caches.open(STATIC);
  const list = [...new Set(html.match(ASSET) ?? [])];
  await Promise.all(list.map((a) => stat.match(a).then((hit) => hit || stat.add(a)).catch(() => {})));
}

// The offline page, kept in step with the current deploy (with everything it links to).
async function refreshOffline() {
  const res = await fetch(OFFLINE, { cache: "no-store" });
  if (!res.ok) return;
  const html = await res.clone().text();
  await (await caches.open(PAGES)).put(OFFLINE, res);
  await warm(html);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([refreshOffline(), caches.open(MEDIA).then((c) => c.addAll(PRECACHE_MEDIA))]).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keep = new Set([STATIC, PAGES, DATA, MEDIA]);
    for (const k of await caches.keys()) if (k.startsWith("onv-") && !keep.has(k)) await caches.delete(k);
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
    await self.clients.claim();
  })());
});

// Signing in or out: forget saved pages and data so nothing from the last person lingers
// (the offline page is saved again straight away).
self.addEventListener("message", (event) => {
  if (event.data === "clear-user-caches") {
    event.waitUntil(Promise.all([caches.delete(PAGES), caches.delete(DATA)]).then(() => refreshOffline()).catch(() => {}));
  }
});

async function networkFirst(request, cacheName, event, fallback) {
  const cache = await caches.open(cacheName);
  try {
    const res = (request.mode === "navigate" && (await event.preloadResponse)) || (await fetch(request));
    if (res.ok && res.type === "basic") {
      cache.put(request, res.clone());
      if (request.mode === "navigate") event.waitUntil(res.clone().text().then(warm).catch(() => {}));
    }
    return res;
  } catch {
    const saved = await cache.match(request, { ignoreSearch: request.mode === "navigate" });
    if (saved) return saved;
    if (fallback) return (await caches.match(fallback)) || Response.error();
    return Response.error();
  }
}

async function cacheFirst(request, cacheName) {
  const saved = await caches.match(request);
  if (saved) return saved;
  const res = await fetch(request);
  if (res.ok) (await caches.open(cacheName)).put(request, res.clone());
  return res;
}

async function staleWhileRevalidate(request, cacheName, event) {
  const cache = await caches.open(cacheName);
  const saved = await caches.match(request);
  const fresh = fetch(request).then((res) => { if (res.ok) cache.put(request, res.clone()); return res; });
  if (saved) { event.waitUntil(fresh.catch(() => {})); return saved; }
  return fresh;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const p = url.pathname;

  // Page loads.
  if (request.mode === "navigate") {
    if (PUBLIC_PAGE.test(p)) {
      event.respondWith(networkFirst(request, PAGES, event, OFFLINE));
    } else {
      // Private pages (account, staff console): always live; offline page if there is no network.
      event.respondWith((async () => {
        try { return (await event.preloadResponse) || (await fetch(request)); }
        catch { return (await caches.match(OFFLINE)) || Response.error(); }
      })());
    }
    return;
  }

  if (p.startsWith("/_next/static/")) { event.respondWith(cacheFirst(request, STATIC)); return; }
  if (PUBLIC_DATA.test(p)) { event.respondWith(networkFirst(request, DATA, event)); return; }
  if (p.startsWith("/img/") || p.startsWith("/brand/") || p.startsWith("/icons/") || p.startsWith("/_next/image")) {
    event.respondWith(staleWhileRevalidate(request, MEDIA, event));
  }
  // Everything else (other API calls, page data for in-app navigation) goes straight to the network.
});
