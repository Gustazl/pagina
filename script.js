// script.js (module)
const jumpSound = document.getElementById('jumpSound');
const hitSound = document.getElementById('hitSound');
const deathSound = document.getElementById('deathSound');

const startScreen = document.getElementById('startScreen');
const nameInput = document.getElementById('nameInput');
const startBtn = document.getElementById('startBtn');

const gameDiv = document.getElementById('game');
const sky = document.getElementById('sky');
const ground = document.getElementById('ground');
const marioEl = document.getElementById('mario');
const obstaclesContainer = document.getElementById('obstaclesContainer');
const scoreEl = document.getElementById('score');
const phaseEl = document.getElementById('phase');
const rankingList = document.getElementById('rankingList');

let playerName = null;
let gameStarted = false;
let gameOver = false;

let score = 0;
let baseSpeed = 10;            // base obstacle speed (fast)
let speedMultiplier = 1.0;     // increases with score
let spawnIntervalMs = 1200;    // initial spawn interval
let lastSpawn = 0;

let gravity = 0.9;             // gravity for jump
let vy = 0;                    // mario vertical velocity
let marioBottom = 72;          // ground height in px (matches CSS)
let isJumping = false;

let obstacles = []; // {el, x, w, h}

// sky phases (cycle every 1000 points)
const skyPhases = [
  { css: "linear-gradient(to top, #87ceeb, #ffffff)", name: "Manhã" },
  { css: "linear-gradient(to top, #ff9966, #ff5e62)", name: "Pôr do sol" },
  { css: "linear-gradient(to top, #0f2027, #203a43, #2c5364)", name: "Noite" }
];
let currentSkyIdx = 0;

// ------ RANKING (localStorage) ------
function loadRanking() {
  const raw = localStorage.getItem('mr_ranking_v1');
  const arr = raw ? JSON.parse(raw) : [];
  // ensure descending
  arr.sort((a,b)=> b.score - a.score);
  rankingList.innerHTML = '';
  arr.slice(0,10).forEach(item=>{
    const li = document.createElement('li');
    li.textContent = `${item.name}: ${item.score}`;
    rankingList.appendChild(li);
  });
  return arr;
}

function saveToRanking(name, pts) {
  const raw = localStorage.getItem('mr_ranking_v1');
  const arr = raw ? JSON.parse(raw) : [];
  // add and keep unique by name: if name already present, we won't allow reuse (as requested)
  arr.push({ name, score: pts });
  // keep top 50 maybe
  arr.sort((a,b)=> b.score - a.score);
  localStorage.setItem('mr_ranking_v1', JSON.stringify(arr.slice(0,50)));
  loadRanking();
}

// check unique name on start
function isNameExists(name) {
  const raw = localStorage.getItem('mr_ranking_v1');
  if (!raw) return false;
  const arr = JSON.parse(raw);
  return arr.some(x=> x.name.toLowerCase() === name.toLowerCase());
}

// ------ UTIL ------
function clamp(v,min,max){ return v<min?min: v>max?max:v; }

// create an obstacle element and return object
function spawnObstacle() {
  const ob = document.createElement('div');
  ob.className = 'obstacle';
  // use image as background
  ob.style.backgroundImage = "url('https://i.imgur.com/rCrDOLe.png')";
  // random size within reasonable responsive bounds
  const vw = Math.max(window.innerWidth, 800);
  const widthPx = Math.round( (Math.random()*0.06 + 0.06) * vw ); // 6%..12% of vw
  ob.style.width = widthPx + 'px';
  ob.style.bottom = marioBottom + 'px';
  ob.style.left = (window.innerWidth + 20) + 'px';
  obstaclesContainer.appendChild(ob);

  const obj = { el: ob, x: window.innerWidth + 20, w: widthPx, passed:false };
  obstacles.push(obj);
}

// remove obstacle element
function removeObstacle(obj) {
  try{ obj.el.remove(); }catch(e){}
  obstacles = obstacles.filter(o=> o !== obj);
}

// update all positions per frame
function updateFrame(dt) {
  if (!gameStarted || gameOver) return;

  // increase difficulty gradually
  speedMultiplier = 1 + (score / 1500); // slower growth than linear; tuneable
  const speed = baseSpeed * speedMultiplier;

  // MOVE obstacles
  for (let i = obstacles.length-1; i>=0; i--) {
    const o = obstacles[i];
    o.x -= speed * (dt/16.67); // dt-normalized; ~60fps baseline
    o.el.style.left = o.x + 'px';

    // remove when offscreen
    if (o.x + o.w < -50) removeObstacle(o);

    // scoring when passes mario
    if (!o.passed && (o.x + o.w) < (marioEl.getBoundingClientRect().left) ) {
      o.passed = true;
      // small bonus points when pass
      score += 25;
    }

    // collision detection: use bounding boxes
    const mRect = marioEl.getBoundingClientRect();
    const oRect = o.el.getBoundingClientRect();
    if (mRect.right > oRect.left + 5 && mRect.left < oRect.right - 5 &&
        mRect.bottom > oRect.top + 10) {
      onCollision();
      return;
    }
  }

  // mario physics (vy, gravity), bottom anchored to ground
  vy += gravity * (dt/16.67);
  let bottomPx = parseFloat(marioEl.style.bottom || marioBottom+'px');
  bottomPx += vy * (dt/16.67);
  const floorY = marioBottom;
  if (bottomPx <= floorY) {
    bottomPx = floorY;
    vy = 0;
    isJumping = false;
  }
  marioEl.style.bottom = bottomPx + 'px';

  // increment score continuous
  score += Math.round( (dt/16.67) * 5 ); // roughly +5 per frame at 60fps => ~300 per second; adjust if too fast
  // clamp to avoid runaway in tests
  score = Math.max(0, Math.floor(score));

  // sky phase change every 1000 points
  const targetPhase = Math.floor(score / 1000) % skyPhases.length;
  if (targetPhase !== currentSkyIdx) {
    currentSkyIdx = targetPhase;
    sky.style.background = skyPhases[currentSkyIdx].css;
    phaseEl.textContent = `Fase: ${skyPhases[currentSkyIdx].name}`;
  }

  // update HUD
  scoreEl.textContent = `Score: ${score}`;

}

// on collision -> stop game and save
function onCollision() {
  if (gameOver) return;
  gameOver = true;

  // play hit + death
  try{ hitSound.currentTime = 0; hitSound.play(); }catch(e){}
  setTimeout(()=>{ try{ deathSound.play(); }catch(e){} }, 200);

  // flash mario to dead sprite briefly (use dead image)
  const prevSrc = marioEl.src;
  marioEl.src = 'https://i.imgur.com/rAD2ZZ2.png';

  // save to ranking under playerName (unique enforced at start)
  saveToRanking(playerName, score);

  // show game over dialog using prompt/alert simple for now
  setTimeout(()=> {
    alert(`Game Over — ${playerName}\nPontuação: ${score}`);
    // reload page to allow replay with new name if wanted
    window.location.reload();
  }, 600);
}

// jump handler
function tryJump() {
  if (!gameStarted || gameOver) return;
  if (isJumping) return;
  isJumping = true;
  vy = -18; // jump impulse stronger for faster game
  try{ jumpSound.currentTime = 0; jumpSound.play(); }catch(e){}
}

// main loop using RAF
let lastTime = null;
function rafLoop(ts) {
  if (!lastTime) lastTime = ts;
  const dt = ts - lastTime;
  lastTime = ts;

  updateFrame(dt);

  if (!gameOver) requestAnimationFrame(rafLoop);
}

// spawn controller
function spawnController(ts) {
  if (!gameStarted || gameOver) return;
  const now = Date.now();
  if (now - lastSpawn > spawnIntervalMs * (1 - Math.min(0.6, score/5000))) {
    spawnObstacle();
    lastSpawn = now;
  }
  // keep spawning check alive
  setTimeout(spawnController, 200);
}

// start game after valid name
function startGameFor(name) {
  playerName = name;
  // show game area
  startScreen.classList.add('hidden');
  gameDiv.classList.remove('hidden');
  // reset stats
  score = 0; gameOver = false; gameStarted = true;
  obstacles.forEach(o=> o.el.remove());
  obstacles = [];
  vy = 0; isJumping = false;
  // place mario to ground
  marioEl.style.bottom = marioBottom + 'px';
  marioEl.style.left = (window.innerWidth * 0.12) + 'px';
  // initial sky
  currentSkyIdx = 0;
  sky.style.background = skyPhases[currentSkyIdx].css;
  phaseEl.textContent = `Fase: ${skyPhases[currentSkyIdx].name}`;
  loadRanking(); // refresh ranking
  lastSpawn = Date.now() + 300;
  // start loops
  requestAnimationFrame(rafLoop);
  spawnController();
}

// BIND UI: start button & name input
startBtn.addEventListener('click', ()=>{
  const name = (nameInput.value||'').trim();
  if (!name) { alert('Digite um nome válido'); return; }
  if (isNameExists(name)) { alert('Nome já existente, utilize outro'); return; }
  startGameFor(name);
});
nameInput.addEventListener('keydown', (e)=>{
  if (e.key === 'Enter') {
    startBtn.click();
  }
});

// keyboard for jump: space
document.addEventListener('keydown', (e)=>{
  if (e.code === 'Space') {
    // if not started, do nothing; name required before starting
    if (!gameStarted) {
      // optional: if name present and space pressed, start
      const name = (nameInput.value||'').trim();
      if (name && !isNameExists(name)) {
        startBtn.click();
      }
      e.preventDefault();
      return;
    }
    // prevent page scroll
    e.preventDefault();
    tryJump();
  }
});

// make sure ranking is loaded initially
loadRanking();

// responsive: adjust mario size bottom when resize
window.addEventListener('resize', ()=>{
  // nothing heavy required; css uses vw for width
});
