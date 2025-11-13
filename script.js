const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let box = 20;
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

document.addEventListener("keydown", directionHandler);

function directionHandler(e) {
  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
}

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 400, 400);

  // food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  // snake
  if (equippedColor === "rainbow") {
    snake.forEach((s, i) => {
      const hue = (i * 40) % 360;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.fillRect(s.x, s.y, box, box);
    });
  } else {
    ctx.fillStyle = equippedColor;
    snake.forEach(s => ctx.fillRect(s.x, s.y, box, box));
  }

  let headX = snake[0].x;
  let headY = snake[0].y;

  if (direction === "LEFT") headX -= box;
  if (direction === "UP") headY -= box;
  if (direction === "RIGHT") headX += box;
  if (direction === "DOWN") headY += box;

  // si mange la pomme
  if (headX === food.x && headY === food.y) {
    score++;
    coins += 5; // gagne 5 pièces
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
    headX >= 400 ||
    headY >= 400 ||
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

let game = setInterval(draw, 100);
