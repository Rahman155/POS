if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker berhasil didaftarkan!', reg))
      .catch(err => console.log('Pendaftaran Service Worker gagal:', err));
  });
}