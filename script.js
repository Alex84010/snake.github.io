const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 420;
canvas.height = 420;

const box = 20;
let snake = [{ x: 10 * box, y: 10 * box }];
let direction = null;

let score = 0;
let coins = parseInt(localStorage.getItem("coins")) || 0;
document.getElementById("coins").textContent = formatNumber(coins);

let food = randomFood();
let gameOver = false;

/* --- FORMATTER (K, M, B, T, Qa...) --- */
function formatNumber(n) {
  if (n >= 1e15) return (n/1e15).toFixed(2)+"Qa";
  if (n >= 1e12) return (n/1e12).toFixed(2)+"T";
  if (n >= 1e9) return (n/1e9).toFixed(2)+"B";
  if (n >= 1e6) return (n/1e6).toFixed(2)+"M";
  if (n >= 1e3) return (n/1e3).toFixed(2)+"K";
  return n;
}

/* --- SWIPE (mobile + pc) --- */
let startX=0, startY=0;

canvas.addEventListener("touchstart", e=>{
  startX=e.touches[0].clientX;
  startY=e.touches[0].clientY;
});
canvas.addEventListener("touchmove", e=>{
  const dx=e.touches[0].clientX-startX;
  const dy=e.touches[0].clientY-startY;
  handleSwipe(dx,dy);
});

canvas.addEventListener("mousedown", e=>{
  startX=e.clientX;
  startY=e.clientY;
});
canvas.addEventListener("mousemove", e=>{
  if (e.buttons!==1) return;
  const dx=e.clientX-startX;
  const dy=e.clientY-startY;
  handleSwipe(dx,dy);
});

function handleSwipe(dx,dy){
  if(Math.abs(dx)>Math.abs(dy)){
    if(dx>20) direction="RIGHT";
    if(dx<-20) direction="LEFT";
  } else {
    if(dy>20) direction="DOWN";
    if(dy<-20) direction="UP";
  }
}

/* --- random food --- */
function randomFood(){
  return {
    x: Math.floor(Math.random()* (canvas.width/box)) * box,
    y: Math.floor(Math.random()* (canvas.height/box)) * box
  };
}

/* --- DRAW --- */
function draw(){
  if(gameOver) return;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  // GEM 🍬 (style Brawl Stars)
  ctx.fillStyle = "#ff61d4";
  ctx.shadowColor = "#ff2cc4";
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.roundRect(food.x+4, food.y+4, box-8, box-8, 6);
  ctx.fill();
  ctx.shadowBlur = 0;

  // SNAKE ★ Glow cartoon
  snake.forEach((s,i)=>{
    ctx.fillStyle = i===0 ? "#00ffcc" : "#00ffaa";
    ctx.shadowColor = "#00ffc8";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(s.x+2, s.y+2, box-4, box-4, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // MOVE
  let headX = snake[0].x;
  let headY = snake[0].y;
  
  if(direction==="LEFT") headX -= box;
  if(direction==="RIGHT") headX += box;
  if(direction==="UP") headY -= box;
  if(direction==="DOWN") headY += box;

  // borders
  if(headX<0 || headY<0 || headX>=canvas.width || headY>=canvas.height){
    return endGame();
  }

  // eat
  if(headX===food.x && headY===food.y){
    score++;
    coins += 1000 + score * 50;
    localStorage.setItem("coins", coins);
    document.getElementById("coins").textContent = formatNumber(coins);
    food = randomFood();
  }
  else snake.pop();

  const newHead = {x:headX, y:headY};
  if(snake.some(s=>s.x===newHead.x && s.y===newHead.y)) return endGame();

  snake.unshift(newHead);
}

function endGame(){
  gameOver = true;

  const btn = document.getElementById("restart-btn");
  btn.style.display="inline-block";
}

setInterval(draw,120);
