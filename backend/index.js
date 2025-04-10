
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);


app.use(express.static("public"));

// Create WebSocket server on top of HTTP
const wss = new WebSocket.Server({ server });

// Store connected clients by room
const rooms = {};

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      const { type, roomId, payload } = data;

      switch (type) {
        case "join":
          if (!rooms[roomId]) rooms[roomId] = [];
          rooms[roomId].push(ws);
          ws.roomId = roomId;
          break;

        case "file-meta":
        case "file-chunk":
        case "file-complete":
          if (rooms[roomId]) {
            rooms[roomId].forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type, payload }));
              }
            });
          }
          break;
      }
    } catch (err) {
      console.error("Error parsing message:", err);
    }
  });

  ws.on("close", () => {
    const roomId = ws.roomId;
    if (roomId && rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter((client) => client !== ws);
    }
  });
});

// Health check route
app.get("/", (req, res) => res.send("WebSocket File Sharing Server Running"));

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
