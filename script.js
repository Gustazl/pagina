// === Firebase Config ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, query, orderByChild, limitToLast, get } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

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

// === Variáveis do jogo ===
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 300;

let mario = { x: 50, y: 200, width: 40, height: 40, vy: 0, jumping: false };
let obstacles = [];
let score = 0;
let gameOver = false;
let animationId;

// === Controles ===
document.addEventListener("keydown", e => {
  if ((e.code === "Space" || e.code === "ArrowUp") && !mario.jumping) {
    mario.vy = -12;
    mario.jumping = true;
  }
});

// === Loop do jogo ===
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Mario
  mario.y += mario.vy;
  mario.vy += 0.6; // gravidade
  if (mario.y > 200) {
    mario.y = 200;
    mario.jumping = false;
  }
  ctx.fillStyle = "red";
  ctx.fillRect(mario.x, mario.y, mario.width, mario.height);

  // Obstáculos
  if (Math.random() < 0.02) {
    obstacles.push({ x: 800, y: 220, width: 20, height: 40 });
  }
  obstacles.forEach(o => {
    o.x -= 6;
    ctx.fillStyle = "green";
    ctx.fillRect(o.x, o.y, o.width, o.height);

    // Colisão
    if (
      mario.x < o.x + o.width &&
      mario.x + mario.width > o.x &&
      mario.y < o.y + o.height &&
      mario.y + mario.height > o.y
    ) {
      endGame();
    }
  });

  // Score
  score++;
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + score, 10, 20);

  if (!gameOver) {
    animationId = requestAnimationFrame(gameLoop);
  }
}

function endGame() {
  gameOver = true;
  cancelAnimationFrame(animationId);
  document.getElementById("finalScore").innerText = score;
  document.getElementById("gameOverModal").classList.remove("hidden");
}

// === Salvar Score no Firebase ===
document.getElementById("saveScoreBtn").addEventListener("click", async () => {
  const name = document.getElementById("playerName").value || "Anônimo";
  const scoresRef = ref(db, "pontuacoes");
  await push(scoresRef, { name, score, date: Date.now() });
  loadRanking();
});

// === Carregar Ranking ===
async function loadRanking() {
  const scoresRef = query(ref(db, "pontuacoes"), orderByChild("score"), limitToLast(10));
  const snapshot = await get(scoresRef);
  const scores = [];
  snapshot.forEach(child => scores.push(child.val()));
  scores.sort((a, b) => b.score - a.score);

  const list = document.getElementById("rankingList");
  list.innerHTML = "";
  scores.forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.name} - ${s.score}`;
    list.appendChild(li);
  });
}

// === Iniciar Jogo ===
document.getElementById("startBtn").addEventListener("click", () => {
  document.getElementById("start-screen").classList.add("hidden");
  score = 0;
  gameOver = false;
  obstacles = [];
  gameLoop();
});

document.getElementById("restartBtn").addEventListener("click", () => {
  document.getElementById("gameOverModal").classList.add("hidden");
  score = 0;
  gameOver = false;
  obstacles = [];
  gameLoop();
});

// Carregar ranking ao abrir
loadRanking();
