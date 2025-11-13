const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const box = 20;
let snake = [{ x: 9 * box, y: 10 * box }];
let direction = null;
let food = {
  x: Math.floor(Math.random() * 20) * box,
  y: Math.floor(Math.random() * 20) * box
};

let score = 0;
let coins = parseInt(localStorage.getItem("coins")) || 0;
let equippedColor = localStorage.getItem("equippedColor") || "#00FF00";

document.getElementById("coins").textContent = coins;

document.addEventListener("keydown", handleDirection);

function handleDirection(e) {
  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
}

function drawGrid() {
  ctx.fillStyle = "#151515";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // petit motif pour mieux voir la grille
  ctx.strokeStyle = "#1f1f1f";
  for (let i = 0; i < canvas.width / box; i++) {
    ctx.beginPath();
    ctx.moveTo(i * box, 0);
    ctx.lineTo(i * box, canvas.height);
    ctx.stroke();
  }
  for (let j = 0; j < canvas.height / box; j++) {
    ctx.beginPath();
    ctx.moveTo(0, j * box);
    ctx.lineTo(canvas.width, j * box);
    ctx.stroke();
  }
}

function draw() {
  drawGrid();

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

  // mange une pomme
  if (headX === food.x && headY === food.y) {
    score++;
    coins += 5;
    localStorage.setItem("coins", coins);
    document.getElementById("coins").textContent = coins;
    document.getElementById("score").textContent = score;
    food = {
      x: Math.floor(Math.random() * 20) * box,
      y: Math.floor(Math.random() * 20) * box
    };
  } else {
    snake.pop();
  }

  const newHead = { x: headX, y: headY };

  // collisions
  if (
    headX < 0 ||
    headY < 0 ||
    headX >= canvas.width ||
    headY >= canvas.height ||
    collision(newHead, snake)
  ) {
    clearInterval(game);
    alert("💀 Game Over ! Ton score : " + score);
  }

  snake.unshift(newHead);
}

function collision(head, array) {
  return array.some(s => s.x === head.x && s.y === head.y);
}

// 100 ms → 120 ms (−20 % de vitesse)
let game = setInterval(draw, 120);
