const CACHE = 'mrrent-v3'; // bumped: v2 -> v3 to force old caches to be purged
const PRECACHE = ['/', '/browse', '/manifest.json'];
const NETWORK_TIMEOUT_MS = 6000;

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function fetchWithTimeout(request, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), timeoutMs);
    fetch(request).then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

// Network-first: always try live, fall back to cache when offline/slow/erroring
self.addEventListener('fetch', (e) => {
  const { request } = e;

  if (request.method !== 'GET') return;
  if (request.url.includes('/api/')) return; // never cache API calls

  // Never let the service worker intercept Next.js RSC navigation payloads.
  // These must always come from the network so auth/session state stays fresh.
  if (request.headers.get('RSC') === '1' || request.url.includes('_rsc=')) {
    return;
  }

  e.respondWith(
    fetchWithTimeout(request, NETWORK_TIMEOUT_MS)
      .then((res) => {
        // Only cache successful, real (non-opaque-error) responses.
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(request).then((cached) => {
        if (cached) return cached;
        // No cache fallback available — let the browser surface its normal
        // network-error page instead of hanging forever.
        return Response.error();
      }))
  );
});