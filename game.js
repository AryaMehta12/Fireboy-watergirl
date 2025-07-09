// --- Setup ---
const socket = new WebSocket('wss://fireboy-watergirl-production.up.railway.app');
let peer;
let isConnected = false;

// --- UI Elements ---
const hostBtn = document.getElementById('hostBtn');
const joinBtn = document.getElementById('joinBtn');
const menu = document.getElementById('menu');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Game State ---
let player1 = { x: 100, y: 500, color: 'red' };   // You
let player2 = { x: 600, y: 500, color: 'blue' };  // Peer

// --- Host/Join Logic ---
hostBtn.onclick = () => startConnection(true);
joinBtn.onclick = () => startConnection(false);

function startConnection(isInitiator) {
  peer = new SimplePeer({ initiator: isInitiator, trickle: false });

  peer.on('signal', data => {
    socket.send(JSON.stringify({ signal: data }));
  });

  peer.on('connect', () => {
    isConnected = true;
    menu.style.display = 'none';
    canvas.style.display = 'block';
    draw();
  });

  peer.on('data', data => {
    try {
      player2 = JSON.parse(data);
    } catch (e) {}
  });
}

// --- Signaling via Railway ---
socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.signal && peer) {
    peer.signal(message.signal);
  }
};

// --- Controls ---
document.addEventListener('keydown', e => {
  if (!isConnected) return;
  if (e.key === 'a') player1.x -= 10;
  if (e.key === 'd') player1.x += 10;
  if (e.key === 'w') player1.y -= 10;
  if (e.key === 's') player1.y += 10;
});

// --- Send Position ---
setInterval(() => {
  if (peer && peer.connected) {
    peer.send(JSON.stringify(player1));
  }
}, 50); // 20 times per second

// --- Draw Loop ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = player1.color;
  ctx.fillRect(player1.x, player1.y, 40, 40);
  ctx.fillStyle = player2.color;
  ctx.fillRect(player2.x, player2.y, 40, 40);
  requestAnimationFrame(draw);
}
