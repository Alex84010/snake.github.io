/* script.js - Mobile only, 16:9, swipe */
'use strict';

/* --------------------------
   Références DOM
   -------------------------- */
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const coinsEl = document.getElementById('coins');
const restartBtn = document.getElementById('restart-btn');
const rotateOverlay = document.getElementById('rotate-overlay');
const btnMute = document.getElementById('btn-mute');

/* --------------------------
   Audio (placer files dans /sounds)
   - sounds/background.mp3
   - sounds/eat.mp3
   -------------------------- */
const bgMusic = new Audio('sounds/background.mp3'); // place ce fichier
bgMusic.loop = true;
bgMusic.volume = 0.35;

const eatSound = new Audio('sounds/eat.mp3'); // place ce fichier
eatSound.volume = 0.9;

let muted = false;
if (localStorage.getItem('muted') === '1') {
  muted = true;
  bgMusic.muted = true;
  eatSound.muted = true;
  btnMute.textContent = '🔇';
} else {
  btnMute.textContent = '🔊';
}
btnMute?.addEventListener('click', () => {
  muted = !muted;
  localStorage.setItem('muted', muted ? '1' : '0');
  bgMusic.muted = muted;
  eatSound.muted = muted;
  btnMute.textContent = muted ? '🔇' : '🔊';
});

/* Play music on first interaction (mobile autoplay rules) */
function tryStartMusicOnce() {
  if (!bgMusic) return;
  if (bgMusic.paused && !muted) {
    bgMusic.play().catch(()=>{/* ignore */});
  }
}
document.addEventListener('touchstart', tryStartMusicOnce, { once: true });
document.addEventListener('click', tryStartMusicOnce, { once: true });

/* --------------------------
   Configuration / état
   -------------------------- */
let coins = parseInt(localStorage.getItem('coins')) || 0;
let owned = JSON.parse(localStorage.getItem('ownedColors')) || ['#00FF00'];
let equipped = localStorage.getItem('equippedColor') || '#00FF00';
let gainByColor = JSON.parse(localStorage.getItem('gainByColor')) || null;

/* Si gainByColor absent, on va l'initialiser avec les defaults ci-dessous */
const SKINS = [
  { id: 's1', name: 'Vert', color: '#00FF00', price: 0, gain: 2 },
  { id: 's2', name: 'Rouge', color: '#FF3333', price: 60, gain: 4 },
  { id: 's3', name: 'Bleu', color: '#3399FF', price: 120, gain: 6 },
  { id: 's4', name: 'Or', color: '#FFD700', price: 250, gain: 10 },
  { id: 's5', name: 'Rose', color: '#ff77c8', price: 380, gain: 12 },
  { id: 's6', name: 'Violet', color: '#a533ff', price: 520, gain: 15 },
  { id: 's7', name: 'Cyan', color: '#33ffee', price: 750, gain: 17 },
  { id: 's8', name: 'Blanc', color: '#ffffff', price: 950, gain: 20 },
  { id: 's9', name: 'Noir', color: '#000000', price: 1300, gain: 25 },
  { id: 's10', name: 'Arc', color: 'rainbow', price: 2100, gain: 30 },
  { id: 's11', name: 'Feu', color: 'fire', price: 3100, gain: 35 },
  { id: 's12', name: 'Glace', color: 'ice', price: 3600, gain: 40 },
  { id: 's13', name: 'Lave', color: 'lava', price: 4200, gain: 45 },
  { id: 's14', name: 'Plasma', color: 'plasma', price: 5200, gain: 50 },
  { id: 's15', name: 'Émeraude', color: '#00d48c', price: 6600, gain: 60 },
  { id: 's16', name: 'Rubis', color: '#c4003b', price: 8200, gain: 70 },
  { id: 's17', name: 'Saphir', color: '#0033ff', price: 9300, gain: 80 },
  { id: 's18', name: 'Galaxie', color: 'galaxy', price: 12500, gain: 90 },
  { id: 's19', name: 'Néon', color: 'neon', price: 15500, gain: 100 },
  { id: 's20', name: 'Divin', color: 'divine', price: 21000, gain: 150 }
];

if (!gainByColor) {
  gainByColor = {};
  SKINS.forEach(s => gainByColor[s.color] = s.gain);
  localStorage.setItem('gainByColor', JSON.stringify(gainByColor));
}

/* persist */
function savePlayerState(){
  localStorage.setItem('coins', coins);
  localStorage.setItem('ownedColors', JSON.stringify(owned));
  localStorage.setItem('equippedColor', equipped);
}

/* update HUD */
function refreshHUD(){
  scoreEl.textContent = score;
  coinsEl.textContent = coins;
}
refreshHUD();

/* --------------------------
   Canvas 16:9 adaptation
   -------------------------- */
function fitCanvas16by9() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // On veut un rectangle 16:9 qui rentre dans le viewport (en tenant compte de header/footer)
  // calc max width/height disponibles
  const headerHeight = document.querySelector('header').offsetHeight || 64;
  const footerHeight = document.querySelector('footer').offsetHeight || 28;
  const availableH = vh - headerHeight - footerHeight - 40; // marge
  const availableW = vw - 12;

  const targetRatio = 16 / 9;
  let width = availableW;
  let height = Math.round(width / targetRatio);

  if (height > availableH) {
    height = availableH;
    width = Math.round(height * targetRatio);
  }

  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  canvas.width = width;
  canvas.height = height;

  // overlay landscape hint
  if (vw < vh) rotateOverlay.classList.remove('hidden');
  else rotateOverlay.classList.add('hidden');

  // grid: we keep 20x20 logical grid (square cells), so box is computed
  box = Math.floor(canvas.width / 20);
}
window.addEventListener('resize', fitCanvas16by9);
fitCanvas16by9();

/* --------------------------
   Game state
   -------------------------- */
let box = Math.floor(canvas.width / 20);
let gridCountX = Math.floor(canvas.width / box);
let gridCountY = Math.floor(canvas.height / box);
let snake = [{ x: 9 * box, y: 10 * box }];
let direction = null; // "LEFT","RIGHT","UP","DOWN"
let score = 0;
let gameOver = false;
let food = randomFood();

/* randomFood utilisant box & grid */
function randomFood(){
  gridCountX = Math.floor(canvas.width / box);
  gridCountY = Math.floor(canvas.height / box);
  return {
    x: Math.floor(Math.random() * gridCountX) * box,
    y: Math.floor(Math.random() * gridCountY) * box
  };
}

/* --------------------------
   Touch swipe handling
   -------------------------- */
let touchStartX = 0, touchStartY = 0;
canvas.addEventListener('touchstart', e => {
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
}, { passive: true });

canvas.addEventListener('touchend', e => {
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return; // petit tap ignoré
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && direction !== 'LEFT') direction = 'RIGHT';
    else if (dx < 0 && direction !== 'RIGHT') direction = 'LEFT';
  } else {
    if (dy > 0 && direction !== 'UP') direction = 'DOWN';
    else if (dy < 0 && direction !== 'DOWN') direction = 'UP';
  }
}, { passive: true });

/* Optional: also allow dragging while pressing */
let dragging = false;
canvas.addEventListener('touchmove', e => {
  // prevent scrolling
  e.preventDefault();
}, { passive: false });

/* --------------------------
   Drawing helpers
   -------------------------- */
function drawRoundedRect(x,y,w,h,r){
  const rad = r || 6;
  ctx.beginPath();
  ctx.moveTo(x+rad,y);
  ctx.arcTo(x+w,y,x+w,y+h,rad);
  ctx.arcTo(x+w,y+h,x,y+h,rad);
  ctx.arcTo(x,y+h,x,y,rad);
  ctx.arcTo(x,y,x+w,y,rad);
  ctx.closePath();
  ctx.fill();
}

/* draw food (apple/gem) */
function drawFood(){
  // stylised square with glow
  ctx.save();
  ctx.fillStyle = '#ff3b3b';
  ctx.shadowColor = '#ff6b6b';
  ctx.shadowBlur = 12;
  drawRoundedRect(food.x + box*0.1, food.y + box*0.1, box*0.8, box*0.8, 6);
  ctx.restore();
}

/* draw snake segments according to skin */
function drawSnake(){
  snake.forEach((seg,i) => {
    ctx.save();
    // special skins
    if (equipped === 'rainbow') {
      ctx.fillStyle = `hsl(${(i*30)%360}, 90%, 55%)`;
    } else if (equipped === 'fire') {
      ctx.fillStyle = `linear-gradient`; // fallback handled below
      ctx.fillStyle = `hsl(${20 + (i*6)%120},90%,55%)`;
    } else if (equipped === 'ice') {
      ctx.fillStyle = '#aaf0ff';
    } else if (equipped === 'galaxy') {
      ctx.fillStyle = `hsl(${(i*12)%360},80%,60%)`;
    } else if (equipped === 'plasma') {
      ctx.fillStyle = '#7f00ff';
    } else if (equipped === 'neon') {
      ctx.fillStyle = '#00ffea';
    } else if (equipped === 'divine') {
      ctx.fillStyle = '#ffd166';
    } else {
      // normal color codes like #00FF00 or named ones
      ctx.fillStyle = equipped;
    }

    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = (equipped === 'neon' || equipped === 'rainbow') ? 16 : 6;
    drawRoundedRect(seg.x + 2, seg.y + 2, box - 4, box - 4, 6);
    ctx.restore();
  });
}

/* --------------------------
   Game loop
   -------------------------- */
function draw(){
  if (gameOver) return;

  // clear
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // background grid subtle
  ctx.fillStyle = '#121212';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // draw food & snake
  drawFood();
  drawSnake();
}

/* movement & collision */
function gameTick(){
  if (gameOver) return;

  // initial direction: none -> don't move until swipe
  if (!direction) { draw(); return; }

  let head = { x: snake[0].x, y: snake[0].y };
  if (direction === 'LEFT') head.x -= box;
  if (direction === 'RIGHT') head.x += box;
  if (direction === 'UP') head.y -= box;
  if (direction === 'DOWN') head.y += box;

  // wall collision
  if (head.x < 0 || head.y < 0 || head.x >= canvas.width || head.y >= canvas.height) {
    triggerGameOver();
    return;
  }

  // eat
  if (head.x === food.x && head.y === food.y) {
    score++;
    // gain depending on skin
    const gain = gainByColor[equipped] || 2;
    coins += gain;

    // sound & vibration
    try {
      eatSound.currentTime = 0;
      if (!muted) eatSound.play().catch(()=>{/* ignore */});
    } catch(e){/* ignore */}
    if (navigator.vibrate) navigator.vibrate(80);

    // persist
    savePlayerState();
    refreshHUD();

    // new food
    food = randomFood();
  } else {
    snake.pop();
  }

  // self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    triggerGameOver();
    return;
  }

  snake.unshift(head);
  draw();
}

/* start/stop loop */
let tickInterval = 120; // ms
let loop = setInterval(gameTick, tickInterval);

/* --------------------------
   Game over handling
   -------------------------- */
function triggerGameOver(){
  gameOver = true;
  clearInterval(loop);
  // overlay message simple
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = `${Math.round(canvas.height*0.06)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('💀 GAME OVER', canvas.width/2, canvas.height/2 - 6);
  ctx.font = `${Math.round(canvas.height*0.04)}px sans-serif`;
  ctx.fillText(`Score : ${score}`, canvas.width/2, canvas.height/2 + 34);

  // show restart button
  restartBtn.classList.remove('hidden');

  // optional vibration long
  if (navigator.vibrate) navigator.vibrate([180]);
}

/* restart */
restartBtn.addEventListener('click', ()=>{
  // reset state
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = null;
  score = 0;
  gameOver = false;
  food = randomFood();
  restartBtn.classList.add('hidden');
  loop = setInterval(gameTick, tickInterval);
  refreshHUD();
});

/* --------------------------
   Initialization
   -------------------------- */
function init(){
  // recompute grid cell if needed
  box = Math.floor(canvas.width / 20) || 20;
  snake = [{ x: 9 * box, y: 10 * box }];
  food = randomFood();
  score = 0;
  gameOver = false;
  refreshHUD();
  draw();
}
init();

/* If orientation change, re-fit and re-init */
window.addEventListener('orientationchange', ()=>{
  fitCanvas16by9();
  init();
});
window.addEventListener('resize', ()=>{
  fitCanvas16by9();
  init();
});

/* --------------------------
   Expose some helpers for shop (optional)
   - allow shop.html to read SKINS, coins, owned, equipped
   -------------------------- */
window.SNAKE_GAME = {
  SKINS,
  getCoins: ()=>coins,
  setCoins: c=>{ coins = c; savePlayerState(); refreshHUD(); },
  getOwned: ()=>owned,
  buySkin: (color, price)=>{
    if (coins >= price && !owned.includes(color)) {
      coins -= price;
      owned.push(color);
      savePlayerState();
      refreshHUD();
      return true;
    }
    return false;
  },
  equipSkin: (color)=>{
    if (!owned.includes(color)) return false;
    equipped = color;
    savePlayerState();
    return true;
  },
  getEquipped: ()=>equipped,
  getGainMap: ()=>gainByColor
};

/* safety: if audio files missing, ignore errors but warn */
bgMusic.addEventListener('error', ()=>console.warn('bgMusic manquant : place sounds/background.mp3'));
eatSound.addEventListener('error', ()=>console.warn('eat sound manquant : place sounds/eat.mp3'));
