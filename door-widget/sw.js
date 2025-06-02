self.addEventListener('install', e => {
  console.log("Service Worker instalado");
  self.skipWaiting();
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  clients.openWindow('/');
});
