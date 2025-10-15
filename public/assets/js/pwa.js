// Lightweight PWA bootstrap: registers the service worker
(() => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('Service worker registered:', reg.scope);
        })
        .catch(err => {
          console.error('Service worker registration failed:', err);
        });
    });
  }
})();