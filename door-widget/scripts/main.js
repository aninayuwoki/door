// main.js

/**
 * Reproduce el sonido de la puerta.
 */
function playSound() {
  const audio = new Audio('/assets/door-sound.mp3');
  audio.play().catch((error) => {
    console.error("Error reproduciendo el sonido:", error);
  });
}

/**
 * Obtiene la ubicación actual.
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
async function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('La geolocalización no está disponible');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.error("Error obteniendo la ubicación:", error);
        reject(error);
      },
      { enableHighAccuracy: true }
    );
  });
}

/**
 * Envía notificaciones (usa la API de notificaciones del navegador).
 */
function sendNotification(title, body) {
  if (!("Notification" in window)) {
    console.warn("Las notificaciones no están soportadas en este navegador");
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, { body });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, { body });
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const doorButton = document.getElementById('door-button');

  if (!doorButton) {
    console.error("No se encontró el botón con id 'door-button'");
    return;
  }

  doorButton.addEventListener('click', async () => {
    console.log("Botón presionado");
    playSound();

    try {
      // Verificar datos en localStorage
      const userId = localStorage.getItem('userId');
      const code = localStorage.getItem('code');

      if (!userId || !code) {
        console.warn("Faltan datos en localStorage: userId o code no están definidos.");
        alert("Por favor, ingresa tus datos de usuario antes de usar el botón.");
        return;
      }

      const location = await getCurrentLocation();
      console.log("Ubicación obtenida:", location);

      // Registrar ubicación
      const registerResponse = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code, location })
      });

      if (!registerResponse.ok) {
        const errorText = await registerResponse.text();
        console.error("Error al registrar la ubicación:", errorText);
        alert("Error al registrar la ubicación.");
        return;
      }

      // Presionar Door
      const doorResponse = await fetch('http://localhost:3000/api/door-press', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!doorResponse.ok) {
        const errorText = await doorResponse.text();
        console.error("Error al presionar la puerta:", errorText);
        alert("Error al notificar la puerta.");
        return;
      }

      const data = await doorResponse.json();
      console.log("Respuesta de /api/door-press:", data);

      // Notificar a todos
      sendNotification("Door", "¡Alguien tocó la puerta!");

      // Notificar al más cercano
      if (data.closestUser === userId) {
        sendNotification("Door Cercano", data.closestUserMessage || "¡Ya llegué!");
      }

    } catch (error) {
      console.error("Error general:", error);
      alert("Ocurrió un error. Revisa la consola para más detalles.");
    }
  });
});

document.getElementById('save-config-button').addEventListener('click', () => {
  const userId = document.getElementById('userId-input').value.trim();
  const code = document.getElementById('code-input').value.trim();

  if (!userId || !code) {
    alert("Por favor, completa ambos campos antes de guardar.");
    return;
  }

  localStorage.setItem('userId', userId);
  localStorage.setItem('code', code);
  alert("Datos guardados correctamente en localStorage.");
});

// Conecta el cliente a Socket.IO
const socket = io('http://localhost:3000'); // o la URL de tu servidor

// Escucha el evento 'door-pressed'
socket.on('door-pressed', (data) => {
  console.log("¡Alguien tocó la puerta!", data);
  // Puedes notificar en la UI
  sendNotification("Door Widget", `El usuario ${data.userId} tocó la puerta`);
});
