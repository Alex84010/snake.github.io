const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Canvas responsive mobile
function resizeCanvas() {
  const size = Math.min(window.innerWidth * 0.9, 450);
  canvas.width = size;
  canvas.height = size;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const box = 20;
let gridCount;

// Recalcul dynamique
function updateGrid() {
  gridCount = Math.floor(canvas.width / box);
}
updateGrid();

let snake = [{ x: 9 * box, y: 10 * box }];
let direction = null;
let score = 0;
let gameOver = false;

let coins = parseInt(localStorage.getItem("coins")) || 0;
document.getElementById("coins").textContent = coins;

// Skins améliorés (gain + style)
const skins = {
  "#00FF00": { gain: 2 },
  "#FF3333": { gain: 5 },
  "#3399FF": { gain: 10 },
  "#FFD700": { gain: 15 },
  "rainbow": { gain: 25 },
  "purple-glow": { gain: 40 },
  "ice": { gain: 55 },
  "fire": { gain: 70 }
};

let equippedColor = localStorage.getItem("equippedColor") || "#00FF00";

const restartBtn = document.getElementById("restart-btn");
restartBtn.style.display = "none";
restartBtn.onclick = () => location.reload();

document.addEventListener("keydown", handleDirection);
const controls = {
  up: document.querySelector(".up"),
  down: document.querySelector(".down"),
  left: document.querySelector(".left"),
  right: document.querySelector(".right")
};

controls.up.onclick = () => setDir("UP");
controls.down.onclick = () => setDir("DOWN");
controls.left.onclick = () => setDir("LEFT");
controls.right.onclick = () => setDir("RIGHT");

function setDir(d) {
  if (gameOver) return;
  const opposite = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
  if (direction !== opposite[d]) direction = d;
}

function handleDirection(e) {
  if (e.key === "ArrowLeft") setDir("LEFT");
  if (e.key === "ArrowUp") setDir("UP");
  if (e.key === "ArrowRight") setDir("RIGHT");
  if (e.key === "ArrowDown") setDir("DOWN");
}

// Swipe mobile
let startX = 0, startY = 0;
canvas.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

canvas.addEventListener("touchmove", e => {
  const dx = e.touches[0].clientX - startX;
  const dy = e.touches[0].clientY - startY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30) setDir("RIGHT");
    if (dx < -30) setDir("LEFT");
  } else {
    if (dy > 30) setDir("DOWN");
    if (dy < -30) setDir("UP");
  }
});

function randomFood() {
  return {
    x: Math.floor(Math.random() * gridCount) * box,
    y: Math.floor(Math.random() * gridCount) * box
  };
}

let food = randomFood();

function drawGround() {
  for (let x = 0; x < gridCount; x++) {
    for (let y = 0; y < gridCount; y++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? "#1e1e1e" : "#3c2f1c";
      ctx.fillRect(x * box, y * box, box, box);
    }
  }
}

function drawSnake() {
  if (equippedColor === "rainbow") {
    snake.forEach((s, i) => {
      ctx.fillStyle = `hsl(${(i * 40) % 360}, 100%, 50%)`;
      ctx.fillRect(s.x, s.y, box, box);
    });
  } else if (equippedColor === "purple-glow") {
    snake.forEach(s => {
      ctx.shadowColor = "#a020f0";
      ctx.shadowBlur = 15;
      ctx.fillStyle = "#a020f0";
      ctx.fillRect(s.x, s.y, box, box);
      ctx.shadowBlur = 0;
    });
  } else if (equippedColor === "ice") {
    snake.forEach(s => {
      ctx.fillStyle = "#a8eaff";
      ctx.fillRect(s.x, s.y, box, box);
    });
  } else if (equippedColor === "fire") {
    snake.forEach((s, i) => {
      ctx.fillStyle = `hsl(${20 + i * 5}, 100%, 50%)`;
      ctx.fillRect(s.x, s.y, box, box);
    });
  } else {
    ctx.fillStyle = equippedColor;
    snake.forEach(s => ctx.fillRect(s.x, s.y, box, box));
  }
}

function draw() {
  if (gameOver) return;

  drawGround();

  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  drawSnake();

  let headX = snake[0].x;
  let headY = snake[0].y;

  if (direction === "LEFT") headX -= box;
  if (direction === "UP") headY -= box;
  if (direction === "RIGHT") headX += box;
  if (direction === "DOWN") headY += box;

  if (headX < 0 || headY < 0 || headX >= canvas.width || headY >= canvas.height) {
    endGame();
    return;
  }

  if (headX === food.x && headY === food.y) {
    score++;
    const gain = skins[equippedColor]?.gain || 2;
    coins += gain;
    localStorage.setItem("coins", coins);
    document.getElementById("coins").textContent = coins;
    document.getElementById("score").textContent = score;

    food = randomFood();
  } else snake.pop();

  const newHead = { x: headX, y: headY };

  if (snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
    endGame();
    return;
  }

  snake.unshift(newHead);
}

function endGame() {
  gameOver = true;
  clearInterval(gameLoop);

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#FFD700";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`💀 Game Over ! Score : ${score}`, canvas.width / 2, canvas.height / 2);

  restartBtn.style.display = "inline-block";
}

let gameLoop = setInterval(draw, 120);
    
