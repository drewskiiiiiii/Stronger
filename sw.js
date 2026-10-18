/* STRONGER service worker: caches the app shell so it opens offline.
 * Same-origin files use stale-while-revalidate (updates arrive on the next open); other requests (fonts, images) are cached as they load. */
const CACHE = 'stronger-54cf628a23';
const SHELL = ['./', 'index.html', 'app.js', 'styles.css', 'pdf-import.js', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
    'vendor/react.production.min.js', 'vendor/react-dom.production.min.js', 'vendor/pdf.min.js', 'vendor/pdf.worker.min.js', 'vendor/xlsx.full.min.js'];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('stronger-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
    const req = e.request;
    if (req.method !== 'GET') return;
    e.respondWith(caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(req, { ignoreSearch: true });
        const network = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()); return res; }).catch(() => null);
        if (cached) { e.waitUntil(network); return cached; }
        return (await network) || (req.mode === 'navigate' ? cache.match('index.html') : Response.error());
    }));
});
