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
