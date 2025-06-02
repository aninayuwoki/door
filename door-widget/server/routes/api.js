const express = require('express');
const router = express.Router();

// Simulación de base de datos en memoria
const users = new Map(); // key: userId, value: { location, code, message }

function calculateDistance(loc1, loc2) {
  const R = 6371e3; // radio de la Tierra en metros
  const toRadians = deg => deg * (Math.PI / 180);
  const dLat = toRadians(loc2.lat - loc1.lat);
  const dLon = toRadians(loc2.lon - loc1.lon);

  const lat1 = toRadians(loc1.lat);
  const lat2 = toRadians(loc2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

// Registrar o actualizar usuario
router.post('/register', (req, res) => {
  const { userId, code, location, message } = req.body;
  if (!userId || !code || !location) {
    return res.status(400).json({ error: "Faltan campos: userId, code y location son requeridos." });
  }
  if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
    return res.status(400).json({ error: "Formato de location inválido. Se requiere { latitude: number, longitude: number }." });
  }
  users.set(userId, { code, location, message: message || "¡Ya llegué!" });
  console.log(`Usuario ${userId} registrado/actualizado con código ${code} y ubicación ${JSON.stringify(location)}.`);
  res.json({ status: "ok", message: `Usuario ${userId} registrado/actualizado.` });
});

// Cuando alguien presiona el botón Door
router.post('/door-press', (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId es requerido." });
  }

  const userData = users.get(userId);

  if (!userData) {
    return res.status(404).json({ error: `Usuario ${userId} no encontrado. Asegúrate de que el usuario esté registrado (llamada a /api/register) y que el ID sea correcto.` });
  }
  if (!userData.code || !userData.location || typeof userData.location.latitude !== 'number' || typeof userData.location.longitude !== 'number') {
    return res.status(400).json({ error: `Datos incompletos o inválidos (falta code o location válida) para el usuario ${userId}. El usuario debe registrarse con code y location { latitude, longitude }.` });
  }
  
  console.log(`'${userId}' tocó la puerta (procesado por la ruta avanzada en api.js)`);

  // Emit event through Socket.IO to all clients
  const io = req.app.get('socketio');
  if (io) {
    io.emit('door-pressed', { userId }); // Notifica a todos que alguien tocó
  } else {
    console.error("Socket.IO no está disponible en req.app.get('socketio')");
    // Consider how to handle this error; maybe the response should indicate a partial failure.
  }

  const groupCode = userData.code;

  // Filtrar los usuarios vinculados al mismo código, excluyendo al que tocó y asegurando que tengan ubicación válida
  const groupUsers = Array.from(users.entries())
    .filter(([key, u]) => 
      key !== userId && 
      u.code === groupCode && 
      u.location && 
      typeof u.location.latitude === 'number' && 
      typeof u.location.longitude === 'number'
    )
    .map(([id, u]) => ({ userId: id, ...u }));

  let closestUser = null;
  let minDistance = Infinity;

  if (groupUsers.length > 0) {
    for (const u of groupUsers) {
      const d = calculateDistance(userData.location, u.location);
      if (d < minDistance) {
        minDistance = d;
        closestUser = u;
      }
    }
  }

  res.json({
    message: `El evento de puerta para '${userId}' fue procesado.`,
    notifiedUsers: groupUsers.map(u => u.userId), 
    closestUser: closestUser ? closestUser.userId : null,
    closestUserMessage: closestUser ? (closestUser.message || `¡${closestUser.userId} (el más cercano) está aquí!`) : null,
    debug: {
      distance: closestUser ? minDistance : null
    }
  });
});

module.exports = router;
