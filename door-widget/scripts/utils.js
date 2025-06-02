// Utilidades generales
function playSound() {
  const audio = new Audio('assets/door-sound.mp3');
  audio.play();
}

function sendNotification(title, message) {
  if (Notification.permission === "granted") {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, {
        body: message,
        icon: 'assets/logo.png',
        vibrate: [200, 100, 200],
      });
    });
  }
}
