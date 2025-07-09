const PORT = process.env.PORT || 3000;
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: PORT });

let clients = [];

server.on('connection', (socket) => {
  clients.push(socket);

  socket.on('message', (msg) => {
    // Relay the message to all other clients
    clients.forEach((client) => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  });

  socket.on('close', () => {
    clients = clients.filter((client) => client !== socket);
  });
});

console.log(`Signaling server running on ws://localhost:${PORT}`);
