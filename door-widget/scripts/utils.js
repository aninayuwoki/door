// Utilidades generales

function playSound() {
  const audio = new Audio('/assets/door-sound.mp3');
  audio.play().catch((error) => {
    console.error("Error reproduciendo el sonido:", error);
    // alert("Error al reproducir el sonido. Ver consola."); // Optional user feedback
  });
}

/**
 * Envía notificaciones. Prioritiza Service Worker si disponible y permission granted,
 * con fallback a new Notification() y maneja solicitud de permisos.
 */
function sendNotification(title, body) {
  if (!("Notification" in window)) {
    console.warn("Este navegador no soporta notificaciones de escritorio.");
    alert("Este navegador no soporta notificaciones de escritorio.");
    return;
  }

  const showNotificationViaSW = (reg) => {
    reg.showNotification(title, {
      body: body,
      icon: '/assets/logo.png', // Ensure this path is correct
      vibrate: [200, 100, 200],
    });
  };

  const showNotificationDirectly = () => {
    new Notification(title, { body: body, icon: '/assets/logo.png' });
  };

  if (Notification.permission === "granted") {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(showNotificationViaSW);
    } else {
      // Fallback if SW not active, though permission is granted
      showNotificationDirectly();
    }
  } else if (Notification.permission !== "denied") { // 'default' state, ask for permission
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then(showNotificationViaSW);
        } else {
          showNotificationDirectly();
        }
      } else {
        console.warn("Permiso para notificaciones fue denegado.");
        alert("Has denegado el permiso para notificaciones.");
      }
    });
  } else { // Notification.permission === "denied"
    console.warn("Permiso para notificaciones está denegado por el usuario.");
    alert("El permiso para notificaciones está denegado. Por favor, habilítalo en la configuración del sitio si deseas recibirlas.");
  }
}
