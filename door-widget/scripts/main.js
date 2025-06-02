// main.js

// playSound is now in utils.js
// sendNotification is now in utils.js

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
        console.error("Error obteniendo la ubicación:", error.message); // Log error message
        reject(new Error(`Error obteniendo la ubicación: ${error.message}`)); // Reject with a new error
      },
      { enableHighAccuracy: true }
    );
  });
}

// sendNotification is now in utils.js

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
      const userId = localStorage.getItem('userId');
      const code = localStorage.getItem('code');

      if (!userId || !code) {
        console.warn("Faltan datos en localStorage: userId o code no están definidos.");
        alert("Por favor, configura tu User ID y Code antes de usar el botón.");
        return;
      }

      let location;
      try {
        location = await getCurrentLocation();
        console.log("Ubicación obtenida:", location);
      } catch (locationError) {
        console.error(locationError.message);
        alert(locationError.message); // Inform user about geolocation error
        return; // Stop if location is not available
      }

      // Registrar ubicación (using relative path, assuming same origin)
      const registerResponse = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code, location })
      });

      if (!registerResponse.ok) {
        const errorText = await registerResponse.text();
        console.error("Error al registrar la ubicación:", registerResponse.status, errorText);
        alert(`Error al registrar la ubicación: ${errorText} (Status: ${registerResponse.status})`);
        return;
      }
      console.log("Respuesta de /api/register:", await registerResponse.json());


      // Presionar Door (using relative path)
      const doorResponse = await fetch('/api/door-press', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!doorResponse.ok) {
        const errorText = await doorResponse.text();
        console.error("Error al presionar la puerta:", doorResponse.status, errorText);
        alert(`Error al notificar la puerta: ${errorText} (Status: ${doorResponse.status})`);
        return;
      }

      const data = await doorResponse.json();
      console.log("Respuesta completa de /api/door-press:", JSON.stringify(data, null, 2));

      // Notification for the user who pressed the button, based on server response
      sendNotification("Door Event", data.message || "Tu toque a la puerta fue procesado.");

      // Information about the closest user found (if any)
      if (data.closestUser) {
        let proximityMessage = `El usuario '${data.closestUser}' es el más cercano en tu grupo.`;
        if (data.closestUserMessage) {
          proximityMessage += ` Su mensaje: "${data.closestUserMessage}".`;
        }
        if (data.debug && typeof data.debug.distance === 'number') {
          proximityMessage += ` Distancia: ${data.debug.distance.toFixed(0)}m.`;
        }
        sendNotification("Info de Proximidad", proximityMessage);
      } else if (data.notifiedUsers && data.notifiedUsers.length > 0) {
        sendNotification("Info de Proximidad", "Hay otros usuarios en tu grupo, pero ninguno fue identificado como cercano con los datos actuales.");
      } else {
        sendNotification("Info de Proximidad", "No se encontraron otros usuarios en tu grupo para la notificación de proximidad.");
      }

    } catch (error) {
      console.error("Error general en la acción del botón:", error);
      alert("Ocurrió un error inesperado. Revisa la consola para más detalles.");
    }
  });
});

document.getElementById('save-config-button').addEventListener('click', () => {
  const userId = document.getElementById('userId-input').value.trim();
  const code = document.getElementById('code-input').value.trim();

  if (!userId || !code) {
    alert("Por favor, completa ambos campos (User ID y Code) antes de guardar.");
    return;
  }

  localStorage.setItem('userId', userId);
  localStorage.setItem('code', code);
  alert("Datos guardados correctamente en localStorage.");
});

// Conecta el cliente a Socket.IO
// io() will connect to the host that serves the page.
const socket = io();

// Escucha el evento 'door-pressed'
socket.on('door-pressed', (eventData) => {
  const currentUserId = localStorage.getItem('userId');
  console.log(`Evento 'door-pressed' recibido via Socket.IO:`, eventData);

  if (eventData.userId && eventData.userId !== currentUserId) {
    sendNotification("Notificación Remota (Door Widget)", `El usuario '${eventData.userId}' tocó la puerta.`);
  } else if (eventData.userId === currentUserId) {
    console.log("Recibido broadcast de mi propio evento 'door-pressed'. No se muestra notificación duplicada desde socket.");
  } else {
    console.warn("Evento 'door-pressed' recibido sin userId:", eventData);
  }
});

socket.on('connect_error', (err) => {
  console.error("Error de conexión con Socket.IO:", err.message);
  alert("No se pudo conectar al servidor de notificaciones en tiempo real. Algunas funciones pueden no estar disponibles.");
});

socket.on('disconnect', (reason) => {
  console.log("Desconectado de Socket.IO:", reason);
});
