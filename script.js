// ----------------- Firebase -----------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

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

// ----------------- Variáveis do jogo -----------------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let mario = { x: 50, y: 300, w: 40, h: 40, vy: 0, jumping: false };
let gravity = 0.6;
let obstacles = [];
let score = 0;
let gameOver = false;
let speed = 6;

// ----------------- Controles -----------------
document.addEventListener("keydown", (e) => {
  if ((e.code === "Space" || e.code === "ArrowUp") && !mario.jumping) {
    mario.vy = -12;
    mario.jumping = true;
  }
});

// ----------------- Loop do jogo -----------------
function drawBackground() {
  let stage = Math.floor(score / 500) % 3; 
  if (stage === 0) ctx.fillStyle = "#87ceeb"; // manhã
  else if (stage === 1) ctx.fillStyle = "#ffcc66"; // tarde
  else ctx.fillStyle = "#2c3e50"; // noite
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawMario() {
  ctx.fillStyle = "red";
  ctx.fillRect(mario.x, mario.y, mario.w, mario.h);
}

function drawObstacles() {
  ctx.fillStyle = "green";
  obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));
}

function updateMario() {
  mario.y += mario.vy;
  mario.vy += gravity;

  if (mario.y >= 300) {
    mario.y = 300;
    mario.jumping = false;
  }
}

function updateObstacles() {
  if (Math.random() < 0.02) {
    obstacles.push({ x: canvas.width, y: 320, w: 20, h: 40 });
  }
  obstacles.forEach(o => o.x -= speed);
  obstacles = obstacles.filter(o => o.x + o.w > 0);
}

function checkCollision() {
  for (let o of obstacles) {
    if (
      mario.x < o.x + o.w &&
      mario.x + mario.w > o.x &&
      mario.y < o.y + o.h &&
      mario.y + mario.h > o.y
    ) {
      endGame();
    }
  }
}

function drawScore() {
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Pontuação: " + score, 10, 20);
}

function gameLoop() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();
  updateMario();
  updateObstacles();
  drawMario();
  drawObstacles();
  checkCollision();

  score++;
  speed = 6 + Math.floor(score / 500); // dificuldade progressiva
  drawScore();

  requestAnimationFrame(gameLoop);
}

// ----------------- Fim de jogo -----------------
function endGame() {
  gameOver = true;
  document.getElementById("finalScore").textContent = score;
  document.getElementById("gameOver").classList.remove("hidden");
}

// ----------------- Ranking -----------------
document.getElementById("saveScoreBtn").addEventListener("click", async () => {
  const name = document.getElementById("playerName").value.trim();
  if (!name) return alert("Digite um nome!");

  const scoresRef = ref(db, "pontuacoes/" + name);
  const snapshot = await get(scoresRef);

  if (snapshot.exists()) {
    alert("Nome já existente, utilize outro.");
    return;
  }

  await set(scoresRef, { name, score, date: Date.now() });
  loadRanking();
});

async function loadRanking() {
  const scoresRef = ref(db, "pontuacoes");
  const snapshot = await get(scoresRef);
  if (!snapshot.exists()) return;

  const scores = Object.values(snapshot.val());
  scores.sort((a, b) => b.score - a.score);

  const list = document.getElementById("rankingList");
  list.innerHTML = "";
  scores.slice(0, 10).forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.name} - ${s.score}`;
    list.appendChild(li);
  });
}

// ----------------- Início -----------------
loadRanking();
gameLoop();
