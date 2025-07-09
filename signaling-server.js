// Connect to signaling server
const socket = new WebSocket('ws://localhost:3000'); // Or use a public PeerJS server

let peer;
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.offer) {
    peer = new SimplePeer({ initiator: false, trickle: false });
    peer.signal(data.offer);
    peer.on('signal', answer => {
      socket.send(JSON.stringify({ answer }));
    });
    setupPeerEvents();
  } else if (data.answer && peer) {
    peer.signal(data.answer);
  }
};

// To start a connection (one player clicks "Host", the other "Join"):
function startConnection(isInitiator) {
  peer = new SimplePeer({ initiator: isInitiator, trickle: false });
  peer.on('signal', data => {
    socket.send(JSON.stringify(isInitiator ? { offer: data } : { answer: data }));
  });
  setupPeerEvents();
}

function setupPeerEvents() {
  peer.on('data', data => {
    // Handle received player2 position
    player2 = JSON.parse(data);
  });
}

// Send your player1 position to your friend
function sendPosition() {
  if (peer && peer.connected) {
    peer.send(JSON.stringify(player1));
  }
}
setInterval(sendPosition, 50); // Send position 20 times per second
