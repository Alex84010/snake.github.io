const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const box = 20;
const gridCount = canvas.width / box; // 20 cases par ligne/colonne

let snake = [{ x: 9 * box, y: 10 * box }];
let direction = null;
let food = randomFood();
let score = 0;
let coins = parseInt(localStorage.getItem("coins")) || 0;
let equippedColor = localStorage.getItem("equippedColor") || "#00FF00";
let gameOver = false;

document.getElementById("coins").textContent = coins;

// on crée un bouton “Recommencer”
const restartBtn = document.createElement("button");
restartBtn.textContent = "🔁 Recommencer";
restartBtn.style.display = "none";
restartBtn.onclick = () => location.reload();
document.body.appendChild(restartBtn);

document.addEventListener("keydown", handleDirection);

function handleDirection(e) {
  if (gameOver) return;
  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
}

// 🎨 FOND EN DAMIER NOIR / MARRON
function drawGround() {
  for (let x = 0; x < gridCount; x++) {
    for (let y = 0; y < gridCount; y++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? "#1e1e1e" : "#3c2f1c";
      ctx.fillRect(x * box, y * box, box, box);
    }
  }
}

// 🍎 Génère une pomme aléatoirement
function randomFood() {
  return {
    x: Math.floor(Math.random() * gridCount) * box,
    y: Math.floor(Math.random() * gridCount) * box
  };
}

function draw() {
  if (gameOver) return;

  drawGround();

  // 🍎 pomme
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  // 🐍 serpent
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

  // ✅ Autoriser la dernière case avant sortie
  if (headX < 0 || headY < 0 || headX > canvas.width - box || headY > canvas.height - box) {
    endGame();
    return;
  }

  // 🍏 mange une pomme
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

  if (collision(newHead, snake)) {
    endGame();
    return;
  }

  snake.unshift(newHead);
}

// 💥 Collision avec le corps
function collision(head, array) {
  return array.some(s => s.x === head.x && s.y === head.y);
}

// 🧨 Fin du jeu sans alerte
function endGame() {
  gameOver = true;
  clearInterval(game);

  // afficher un overlay semi-transparent
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#FFD700";
  ctx.font = "22px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`💀 Game Over ! Score : ${score}`, canvas.width / 2, canvas.height / 2);

  restartBtn.style.display = "inline-block";
  restartBtn.style.marginTop = "15px";
}

// 🔁 Boucle du jeu (ralentie à 120 ms)
let game = setInterval(draw, 120);
