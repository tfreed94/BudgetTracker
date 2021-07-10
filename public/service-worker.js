const CACHE_FILES = [

    '/',
    '/manifest.json',
    '/style.css',
    '/db.js',
    '/index.html',
    '/index.js',
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0",
    '/icons/icon-512x512.png',
    '/icons/icon-192x192.png',

];

const STATIC_CACHE = `static-cache-v1`;
const DATA_CACHE = `data-cache`;

self.addEventListener(`install`, evt => {
    evt.waitUntil(caches.open(STATIC_CACHE).then(cache => cache.addAll(CACHE_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener(`activate`, evt => {
    const archivedCaches = [STATIC_CACHE, DATA_CACHE];
    evt.waitUntil(caches.keys().then(namesOfCaches => namesOfCaches.filter(nameOfCache => !archivedCaches.includes(nameOfCache)))
        .then(delCaches => Promise.all(delCaches.map(delCache => caches.delete(delCache))))
        .then(() => self.clients.claim())
    );
});

self.addEventListener(`fetch`, evt => {
    if (evt.req.method !== `GET` || !evt.req.url.startsWith(self.location.origin)) {
        evt.respondWith(fetch(evt.req));
        return;
    }

    if (evt.req.url.includes(`/api/transaction`)) {
        evt.respondWith(
            caches.open(DATA_CACHE).then(cache => fetch(evt.req).then(res => {
                cache.put(evt.req, res.clone());
                return res;
            })
                .catch(() => caches.match(evt.req))
            )
        );
        return;
    }

    evt.respondWith(
        caches.match(evt.req).then(res => {
            if (res) {
                return res;
            }
            return caches.open(DATA_CACHE).then(cache => fetch(evt.req).then(res => cache.put(evt.req, res.clone()).then(() => res))
            );
        })
    );
});