const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname + "/../")); // Servir archivos desde la carpeta door-widget

// Ruta para registrar usuario
app.post("/api/register", (req, res) => {
  const { userId, code, location } = req.body;
  console.log("Registering user:", { userId, code, location });
  // Por ahora, solo logueamos y respondemos con éxito
  res.json({ success: true, message: "Registered successfully" });
});

// Ruta para "door-press"
app.post("/api/door-press", (req, res) => {
  const { userId } = req.body;

  // Aquí puedes hacer la lógica que quieras...
  console.log(`Usuario ${userId} tocó la puerta`);

  // Envía a todos los clientes que la puerta fue presionada
  io.emit("door-pressed", { userId });

  res.json({ success: true });
});

server.listen(3000, () => {
  console.log("Servidor escuchando en puerto 3000");
});
