// --- Unique Client ID ---
function randomId() {
  return Math.random().toString(36).substr(2, 9);
}
const clientId = randomId();
let peer = null;
let isConnected = false;
let role = null; // 'host' or 'join'
let peerId = null; // The other client's id

// --- UI Elements ---
const hostBtn = document.getElementById('hostBtn');
const joinBtn = document.getElementById('joinBtn');
const menu = document.getElementById('menu');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Game State ---
let player1 = { x: 100, y: 500, color: 'red' };
let player2 = { x: 600, y: 500, color: 'blue' };

// --- WebSocket Setup ---
const socket = new WebSocket('wss://fireboy-watergirl-production.up.railway.app');

socket.onopen = () => {
  console.log('WebSocket connected');
};

hostBtn.onclick = () => {
  role = 'host';
  peer = null;
  peerId = null;
  isConnected = false;
  startHost();
};

joinBtn.onclick = () => {
  role = 'join';
  peer = null;
  peerId = null;
  isConnected = false;
  startJoin();
};

function startHost() {
  // Wait for a joiner to announce themselves
  console.log('Host clicked');
}

function startJoin() {
  // Announce to server that you want to join
  console.log('Join clicked');
  socket.send(JSON.stringify({ type: 'join', from: clientId }));
}

// --- Handle Incoming WebSocket Messages ---
socket.onmessage = async (event) => {
  let msg;
  if (event.data instanceof Blob) {
    msg = JSON.parse(await event.data.text());
  } else {
    msg = JSON.parse(event.data);
  }

  // Ignore messages not meant for us (if target is set)
  if (msg.target && msg.target !== clientId) return;

  // Host receives join announcement
  if (role === 'host' && msg.type === 'join' && !peer) {
    peerId = msg.from;
    peer = new SimplePeer({ initiator: true, trickle: false });

    peer.on('signal', data => {
      socket.send(JSON.stringify({ type: 'signal', from: clientId, target: peerId, signal: data }));
    });

    setupPeerEvents();
  }

  // Both handle signaling messages
  if (msg.type === 'signal' && msg.signal) {
    if (!peer) {
      // For joiner: create peer on first signal received
      peerId = msg.from;
      peer = new SimplePeer({ initiator: false, trickle: false });

      peer.on('signal', data => {
        socket.send(JSON.stringify({ type: 'signal', from: clientId, target: peerId, signal: data }));
      });

      setupPeerEvents();
    }
    peer.signal(msg.signal);
  }
};

function setupPeerEvents() {
  peer.on('connect', () => {
    isConnected = true;
    assignColors();
    menu.style.display = 'none';
    canvas.style.display = 'block';
    draw();
    // Send role to peer
    peer.send(JSON.stringify({ type: 'role', role }));
  });

  peer.on('data', data => {
    let str = data;
    if (data instanceof ArrayBuffer) str = new TextDecoder().decode(data);
    else if (typeof data !== 'string') str = data.toString();
    const message = JSON.parse(str);

    if (message.type === 'role') {
      role = message.role === 'host' ? 'join' : 'host';
      assignColors();
    } else if (message.x !== undefined && message.y !== undefined) {
      player2.x = message.x;
      player2.y = message.y;
    }
  });
}

// --- Assign Colors ---
function assignColors() {
  if (role === 'host') {
    player1.color = 'red';
    player2.color = 'blue';
  } else {
    player1.color = 'blue';
    player2.color = 'red';
  }
}

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
    peer.send(JSON.stringify({ x: player1.x, y: player1.y }));
  }
}, 50);

// --- Draw Loop ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = player1.color;
  ctx.fillRect(player1.x, player1.y, 40, 40);
  ctx.fillStyle = player2.color;
  ctx.fillRect(player2.x, player2.y, 40, 40);
  requestAnimationFrame(draw);
}
