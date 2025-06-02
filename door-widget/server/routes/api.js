const express = require('express');
const router = express.Router();

// routes/api.js



router.post('/door-press', (req, res) => {
  console.log('Alguien presionó Door');
  const { userId } = req.body;
  res.json({
    message: 'Notificación enviada',
    closestUser: userId,
    closestUserMessage: "¡Ya llegué!"
  });
});

module.exports = router;


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
    return res.status(400).json({ error: "Faltan campos" });
  }
  users.set(userId, { code, location, message: message || "¡Ya llegué!" });
  res.json({ status: "ok" });
});

// Cuando alguien presiona el botón Door
router.post('/door-press', (req, res) => {
  console.log('Alguien presionó Door');
  const { userId } = req.body;
  // Aquí puedes hacer la lógica real
  res.json({ message: 'Notificación enviada', closestUser: userId, closestUserMessage: "¡Ya llegué!" });



  const userData = users.get(userId);
  const groupCode = userData.code;

  // Filtrar los usuarios vinculados a ese código
  const groupUsers = Array.from(users.entries())
    .filter(([_, u]) => u.code === groupCode && u.location)
    .map(([id, u]) => ({ userId: id, ...u }));

  // Calcular distancias
  let closestUser = null;
  let minDistance = Infinity;
  for (const u of groupUsers) {
    if (u.userId === userId) continue;
    const d = calculateDistance(userData.location, u.location);
    if (d < minDistance) {
      minDistance = d;
      closestUser = u;
    }
  }

  // Simulamos notificaciones: devolvemos la lista de usuarios que recibirían la notificación
  res.json({
    notifiedUsers: groupUsers.map(u => u.userId),
    closestUser: closestUser ? closestUser.userId : null,
    closestUserMessage: closestUser ? closestUser.message : null
  });
});

module.exports = router;
