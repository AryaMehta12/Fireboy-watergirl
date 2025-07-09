

// Connect to your deployed signaling server (use wss:// if using HTTPS)
const socket = new WebSocket('fireboy-watergirl-production.up.railway.app');

let peer;
let isInitiator = false; // Set this based on whether the player is hosting or joining

// UI: You should have buttons or a prompt to pick host/join and call startConnection(true/false)
function startConnection(initiator) {
  isInitiator = initiator;
  peer = new SimplePeer({ initiator, trickle: false });

  peer.on('signal', data => {
    socket.send(JSON.stringify({ signal: data }));
  });

  peer.on('connect', () => {
    console.log('Peer connection established!');
  });

  peer.on('data', data => {
    // Handle data received from the other player (e.g., player positions)
    const otherPlayer = JSON.parse(data);
    // Update your game state here
    player2 = otherPlayer;
  });
}

// Handle signaling messages from the server
socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.signal) {
    peer.signal(message.signal);
  }
};

// Example player objects
let player1 = { x: 100, y: 500, color: 'red' };
let player2 = { x: 600, y: 500, color: 'blue' };

// Keyboard controls for player1
document.addEventListener('keydown', (e) => {
  if (e.key === 'a') player1.x -= 10;
  if (e.key === 'd') player1.x += 10;
  if (e.key === 'w') player1.y -= 10;
  if (e.key === 's') player1.y += 10;
});

// Send your player1 position to your peer regularly
function sendPosition() {
  if (peer && peer.connected) {
    peer.send(JSON.stringify(player1));
  }
}
setInterval(sendPosition, 50); // 20 times per second

// Drawing the game (simple example)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = player1.color;
  ctx.fillRect(player1.x, player1.y, 40, 40);
  ctx.fillStyle = player2.color;
  ctx.fillRect(player2.x, player2.y, 40, 40);
  requestAnimationFrame(draw);
}
draw();
