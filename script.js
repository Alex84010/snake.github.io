const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const box = 20;
const gridSize = canvas.width / box; // 20x20

let snake = [{ x: 9 * box, y: 10 * box }];
let direction = null;
let food = randomFood();
let score = 0;
let coins = parseInt(localStorage.getItem("coins")) || 0;
let equippedColor = localStorage.getItem("equippedColor") || "#00FF00";
let gameOver = false;

document.getElementById("coins").textContent = coins;

document.addEventListener("keydown", handleDirection);

function handleDirection(e) {
  if (gameOver) return;
  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
}

// --- FOND NOIR / MARRON CLAIR ---
function drawGround() {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      ctx.fillStyle = (i + j) % 2 === 0 ? "#1b1b1b" : "#3a2b1a";
      ctx.fillRect(i * box, j * box, box, box);
    }
  }
}

// --- GÉNÉRATION DE POMME ---
function randomFood() {
  return {
    x: Math.floor(Math.random() * gridSize) * box,
    y: Math.floor(Math.random() * gridSize) * box
  };
}

// --- DESSIN DU JEU ---
function draw() {
  if (gameOver) return;

  drawGround();

  // pomme
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  // serpent
  if (equippedColor === "rainbow") {
    snake.forEach((segment, i) => {
      const hue = (i * 40) % 360;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.fillRect(segment.x, segment.y, box, box);
    });
  } else {
    ctx.fillStyle = equippedColor;
    snake.forEach(segment => ctx.fillRect(segment.x, segment.y, box, box));
  }

  // mouvement
  let headX = snake[0].x;
  let headY = snake[0].y;

  if (direction === "LEFT") headX -= box;
  if (direction === "UP") headY -= box;
  if (direction === "RIGHT") headX += box;
  if (direction === "DOWN") headY += box;

  // MANGE POMME
  if (headX === food.x && headY === food.y) {
    score++;
    coins += 5;
    localStorage.setItem("coins", coins);
    document.getElementById("coins").textContent = coins;
    document.getElementById("score").textContent = score;
    food = randomFood();
  } else {
    snake.pop();
  }

  const newHead = { x: headX, y: headY };

  // --- COLLISIONS ---
  if (
    headX < 0 ||
    headY < 0 ||
    headX >= canvas.width ||
    headY >= canvas.height ||
    collision(newHead, snake)
  ) {
    endGame();
    return;
  }

  snake.unshift(newHead);
}

// --- COLLISION DU CORPS ---
function collision(head, array) {
  return array.some(s => s.x === head.x && s.y === head.y);
}

// --- FIN DU JEU ---
function endGame() {
  gameOver = true;
  clearInterval(game);
  showMessage(`💀 Game Over ! Score : ${score}`);
  setTimeout(() => {
    window.location.reload();
  }, 2000);
}

// --- MESSAGE À L'ÉCRAN ---
function showMessage(text) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);

  ctx.fillStyle = "#FFD700";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 7);
}

// --- BOUCLE DU JEU (ralentie à 120 ms) ---
let game = setInterval(draw, 120);
