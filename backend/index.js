

const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
app.use(express.static('public'));

const wss = new WebSocket.Server({ server, maxPayload: 100 * 1024 * 1024 });
const rooms = {};

// Connection heartbeat
function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', heartbeat);

  console.log('New client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      const { type, roomId, payload } = data;

      switch (type) {
        case 'join':
          if (!rooms[roomId]) rooms[roomId] = new Set();
          rooms[roomId].add(ws);
          ws.roomId = roomId;
          broadcastToRoom(roomId, { 
            type: 'system', 
            payload: `User joined room ${roomId}` 
          }, ws);
          break;

        case 'file-meta':
        case 'file-chunk':
        case 'file-complete':
          if (rooms[roomId]) {
            broadcastToRoom(roomId, { type, payload }, ws);
          }
          break;
      }
    } catch (err) {
      console.error('Message error:', err);
    }
  });

  ws.on('close', () => {
    const { roomId } = ws;
    if (roomId && rooms[roomId]) {
      rooms[roomId].delete(ws);
      broadcastToRoom(roomId, { 
        type: 'system', 
        payload: 'A user disconnected' 
      });
    }
  });
});

// Ping all clients every 30 seconds
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

function broadcastToRoom(roomId, message, excludeWs = null) {
  if (!rooms[roomId]) return;
  rooms[roomId].forEach(client => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});