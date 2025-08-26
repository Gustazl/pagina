import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAMwEcrs7DnNNuBAsJJq83LHpQILubCKUg",
  authDomain: "projeto-feira-d-ciencias-mario.firebaseapp.com",
  databaseURL: "https://projeto-feira-d-ciencias-mario-default-rtdb.firebaseio.com",
  projectId: "projeto-feira-d-ciencias-mario",
  storageBucket: "projeto-feira-d-ciencias-mario.firebasestorage.app",
  messagingSenderId: "598294976090",
  appId: "1:598294976090:web:bd480d135fe947da1eaa63",
  measurementId: "G-3MP6ZD8JZH"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Elementos e variáveis
const startScreen = document.getElementById("startScreen");
const inputName = document.getElementById("playerNameInput");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const rankingDiv = document.getElementById("ranking");

let playerName = null;
let gameStarted = false;
let gameOverFlag = false;
let score = 0;
let speed = 4;

// Mario
const marioImg = new Image();
marioImg.src = "https://i.imgur.com/QUcZYrn.gif";
const marioDeadImg = new Image();
marioDeadImg.src = "https://i.imgur.com/rAD2ZZ2.png";
let mario = { x: 50, y: 150, width: 40, height: 40, vy: 0, jumping: false };

// Obstáculos
const obstacleImg = new Image();
obstacleImg.src = "https://i.imgur.com/rCrDOLe.png";
let obstacles = [];

// Background
const bgImg = new Image();
bgImg.src = "https://i.imgur.com/US6zl37.png";

// Sons
const jumpSound = new Audio("https://cdn.pixabay.com/download/audio/2024/09/29/audio_3397905774.mp3?filename=jump-up-245782.mp3");
const hitSound = new Audio("https://www.myinstants.com/media/sounds/super-mario-bros_2.mp3");
const deathSound = new Audio("https://www.myinstants.com/media/sounds/roblox-death-sound_1.mp3");

let ground = 300;
let gravity = 0.6;

// --- Funções do jogo ---

// Iniciar o jogo
async function startGame() {
  playerName = inputName.value.trim();
  if (!playerName) { alert("Digite um nome válido!"); return; }

  const snapshot = await get(child(ref(db), "ranking/" + playerName));
  if (snapshot.exists()) { alert("Nome já existente, utilize outro."); return; }

  startScreen.style.display = "none";
  canvas.style.display = "block";
  gameStarted = true;
  requestAnimationFrame(gameLoop);
}

// Pular
function jump() {
  if (!mario.jumping && !gameOverFlag) {
    mario.vy = -12;
    mario.jumping = true;
    jumpSound.play();
  }
}

// Criar obstáculos
function spawnObstacle() {
  if (!gameStarted || gameOverFlag) return;
  obstacles.push({ x: canvas.width, y: ground - 40, width: 40, height: 40 });
}

// Checar colisão
function checkCollision(o) {
  return (
    mario.x < o.x + o.width &&
    mario.x + mario.width > o.x &&
    mario.y < o.y + o.height &&
    mario.y + mario.height > o.y
  );
}

// Salvar pontuação
async function saveScore() {
  await set(ref(db, "ranking/" + playerName), { pontos: score });
  loadRanking();
}

// Carregar ranking
async function loadRanking() {
  const snapshot = await get(ref(db, "ranking"));
  rankingDiv.innerHTML = "<h3>Ranking</h3>";
  if (snapshot.exists()) {
    let dados = snapshot.val();
    let lista = Object.entries(dados).sort((a, b) => b[1].pontos - a[1].pontos);
    lista.forEach(([nome, obj]) => {
      rankingDiv.innerHTML += `<p>${nome}: ${obj.pontos}</p>`;
    });
  } else {
    rankingDiv.innerHTML += "<p>Sem pontuações ainda.</p>";
  }
}

// Fim de jogo
function gameOver() {
  gameOverFlag = true;
  deathSound.play();
  marioImg.src = marioDeadImg.src;
  saveScore();
}

// --- Loop do jogo ---
function gameLoop() {
  if (!gameStarted) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  // Mario
  mario.vy += gravity;
  mario.y += mario.vy;
  if (mario.y >= ground - mario.height) {
    mario.y = ground - mario.height;
    mario.jumping = false;
  }
  ctx.drawImage(marioImg, mario.x, mario.y, mario.width, mario.height);

  // Obstáculos
  obstacles.forEach((o, i) => {
    o.x -= speed;
    ctx.drawImage(obstacleImg, o.x, o.y, o.width, o.height);

    if (checkCollision(o)) {
      hitSound.play();
      gameOver();
    }

    if (o.x + o.width < 0) obstacles.splice(i, 1);
  });

  // Score
  score++;
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Pontos: " + score, 20, 30);

  // Dificuldade progressiva
  speed = 4 + score / 200;

  if (!gameOverFlag) requestAnimationFrame(gameLoop);
}

// --- Eventos ---
document.addEventListener("keydown", (e) => {
  if (!gameStarted && e.code === "Space") startGame();
  else if (gameStarted && e.code === "Space") jump();
});

// Spawn de obstáculos
setInterval(spawnObstacle, 2000);

// --- Inicialização ---
window.onload = () => { loadRanking(); };
