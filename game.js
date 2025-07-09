const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player positions
let player1 = { x: 100, y: 500, color: 'red' };
let player2 = { x: 600, y: 500, color: 'blue' };

// Draw loop
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw players
  ctx.fillStyle = player1.color;
  ctx.fillRect(player1.x, player1.y, 40, 40);
  ctx.fillStyle = player2.color;
  ctx.fillRect(player2.x, player2.y, 40, 40);
  requestAnimationFrame(draw);
}
draw();

document.addEventListener('keydown', (e) => {
  if (e.key === 'a') player1.x -= 10;
  if (e.key === 'd') player1.x += 10;
  if (e.key === 'w') player1.y -= 10;
  if (e.key === 's') player1.y += 10;
});
