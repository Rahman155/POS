const CACHE_NAME = 'pos-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/manifest.json'
];

// Tahap Install: Menyimpan aset ke cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Tahap Fetch: Mengambil dari cache jika offline
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});

// Menyaring permintaan gambar untuk disimpan otomatis ke cache terpisah
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Jika yang direquest adalah aset gambar
  if (event.request.destination === 'image' || requestUrl.pathname.includes('/images/')) {
    event.respondWith(
      caches.open('pos-images-cache').then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          // 1. Jika gambar ada di cache, langsung kembalikan gambar tersebut (Sangat Cepat)
          if (cachedResponse) return cachedResponse;

          // 2. Jika tidak ada, ambil dari internet, lalu simpan salinannya ke cache
          return fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(() => {
            // 3. Fallback: Jika offline dan gambar belum pernah di-cache, tampilkan gambar placeholder default
            return caches.match('/assets/images/placeholder-default.webp');
          });
        });
      })
    );
  }
});