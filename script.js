const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let box = 30;

// ❗ Canvas auto-adapté au mobile (horizontal)
function resizeGame() {
  const size = Math.min(window.innerHeight, window.innerWidth) * 0.85;
  canvas.width = size;
  canvas.height = size;
  box = size / 20;
}
resizeGame();

// Data joueur
let coins = parseInt(localStorage.getItem("coins")) || 0;
let gainBonus = parseInt(localStorage.getItem("gainBonus")) || 2;

// Skin
let equippedColor = localStorage.getItem("equippedColor") || "#00FF00";

document.getElementById("coins").textContent = coins;

// Snake
let snake = [{ x: 10 * box, y: 10 * box }];
let direction = null;

let food = randomFood();
let score = 0;
let gameOver = false;

const restartBtn = document.getElementById("restart-btn");
restartBtn.style.display = "none";
restartBtn.onclick = () => location.reload();

// Génère pomme
function randomFood() {
  return {
    x: Math.floor(Math.random() * 20) * box,
    y: Math.floor(Math.random() * 20) * box
  };
}

// Déplacements PC
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
});

// Swipe mobile
let startX, startY;

canvas.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

canvas.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - startX;
  const dy = e.changedTouches[0].clientY - startY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && direction !== "LEFT") direction = "RIGHT";
    else if (dx < 0 && direction !== "RIGHT") direction = "LEFT";
  } else {
    if (dy > 0 && direction !== "UP") direction = "DOWN";
    else if (dy < 0 && direction !== "DOWN") direction = "UP";
  }
});

// Dessin
function draw() {
  if (gameOver) return;

  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  // Skins spéciaux
  snake.forEach((p, i) => {
    if (equippedColor === "rainbow")
      ctx.fillStyle = `hsl(${(i * 30) % 360}, 100%, 50%)`;
    else if (equippedColor === "fire")
      ctx.fillStyle = `hsl(${20 + i * 8}, 90%, 50%)`;
    else if (equippedColor === "ice")
      ctx.fillStyle = `hsl(${180 + i * 5}, 80%, 70%)`;
    else
      ctx.fillStyle = equippedColor;

    ctx.fillRect(p.x, p.y, box, box);
  });

  // Mouvement
  let head = { x: snake[0].x, y: snake[0].y };

  if (direction === "LEFT") head.x -= box;
  if (direction === "RIGHT") head.x += box;
  if (direction === "UP") head.y -= box;
  if (direction === "DOWN") head.y += box;

  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= canvas.width ||
    head.y >= canvas.height
  ) {
    endGame();
    return;
  }

  if (head.x === food.x && head.y === food.y) {
    score++;
    coins += gainBonus;
    localStorage.setItem("coins", coins);
    document.getElementById("coins").textContent = coins;
    document.getElementById("score").textContent = score;
    food = randomFood();
  } else {
    snake.pop();
  }

  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);
}

function endGame() {
  gameOver = true;
  clearInterval(loop);

  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "26px Arial";
  ctx.textAlign = "center";
  ctx.fillText("💀 GAME OVER", canvas.width / 2, canvas.height / 2 - 10);

  restartBtn.style.display = "block";
}

let loop = setInterval(draw, 120);
