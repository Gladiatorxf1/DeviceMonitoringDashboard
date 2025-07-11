const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const db = require("./db");
const path = require("path");

app.use("/recordings", express.static(path.join(__dirname, "recordings")));

app.get("/api/recordings/:deviceId", async (req, res) => {
  const { deviceId } = req.params;
  const { date } = req.query; // Format: YYYY-MM-DD

  try {
    const [rows] = await db.query(
      "SELECT * FROM recordings WHERE device_id = ? AND DATE(datetime) = ?",
      [deviceId, date]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Fake 20 devices
let devices = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  line: 1,
  radio: 0,
  voltage: 4.7,
  status: "Online",
}));

// REST API to fetch all devices
app.get("/api/devices", (req, res) => {
  res.json(devices);
});

// Emit updates every second
setInterval(() => {
  const index = Math.floor(Math.random() * 20);
  const updatedDevice = {
    ...devices[index],
    line: Math.floor(Math.random() * 4) + 1,
    radio: Math.floor(Math.random() * 2),
    voltage: (4 + Math.random()).toFixed(2),
    status: Math.random() > 0.2 ? "Online" : "Offline",
    timestamp: new Date().toISOString(),
  };

  devices[index] = updatedDevice;
  io.emit("device-update", updatedDevice);
}, 1000);

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

console.log("🔌 WebSocket server running on ws://localhost:8080");

wss.on("connection", (ws) => {
  console.log("⚡ Client connected");

  const interval = setInterval(() => {
    const deviceStatus = [];

    for (let i = 1; i <= 20; i++) {
      deviceStatus.push({
        id: i,
        line: Math.floor(Math.random() * 4), // 0-3
        radio: Math.random() > 0.5,
        voltage: (Math.random() * 5 + 3).toFixed(2), // 3.0–8.0 V
        timestamp: new Date().toISOString(),
      });
    }

    ws.send(JSON.stringify(deviceStatus));
  }, 1000);

  ws.on("close", () => {
    console.log("❌ Client disconnected");
    clearInterval(interval);
  });
});
