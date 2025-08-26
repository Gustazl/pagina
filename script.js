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

// Variáveis do jogo
let canvas, ctx;
let mario = { x: 50, y: 150, width: 40, height: 40, jumping: false, vy: 0 };
let ground = 200;
let gravity = 0.6;
let obstacles = [];
let score = 0;
let gameOver = false;
let speed = 4;
let bgPhase = "manha";
let playerName = null;
let gameStarted = false;

// Elementos
const startScreen = document.getElementById("startScreen");
const inputName = document.getElementById("playerNameInput");
const canvasElement = document.getElementById("gameCanvas");
const rankingDiv = document.getElementById("ranking");

// Função para iniciar após nome
async function startGame() {
  playerName = inputName.value.trim();
  if (!playerName) {
    alert("Digite um nome válido!");
    return;
  }

  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, "ranking/" + playerName));
  if (snapshot.exists()) {
    alert("Nome já existente, utilize outro.");
    return;
  }

  // Oculta tela inicial e mostra canvas
  startScreen.style.display = "none";
  canvasElement.style.display = "block";

  carregarRanking();
  gameStarted = true;
}

// Inicializa canvas
function initGame() {
  canvas = canvasElement;
  ctx = canvas.getContext("2d");

  document.addEventListener("keydown", (e) => {
    if (!gameStarted && e.code === "Space") {
      startGame();
    } else if (gameStarted && e.code === "Space") {
      jump();
    }
  });

  setInterval(update, 20);
  setInterval(spawnObstacle, 2000);
}

// Pular
function jump() {
  if (!mario.jumping && !gameOver) {
    mario.jumping = true;
    mario.vy = -10;
  }
}

// Atualização do jogo
function update() {
  if (!gameStarted || gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Cenário automático
  if (score < 500) bgPhase = "manha";
  else if (score < 1000) bgPhase = "tarde";
  else bgPhase = "noite";

  if (bgPhase === "manha") ctx.fillStyle = "#87CEEB";
  if (bgPhase === "tarde") ctx.fillStyle = "#FFA500";
  if (bgPhase === "noite") ctx.fillStyle = "#191970";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Mario
  mario.y += mario.vy;
  if (mario.jumping) mario.vy += gravity;
  if (mario.y >= ground - mario.height) {
    mario.y = ground - mario.height;
    mario.jumping = false;
  }
  ctx.fillStyle = "red";
  ctx.fillRect(mario.x, mario.y, mario.width, mario.height);

  // Obstáculos
  for (let i = 0; i < obstacles.length; i++) {
    let o = obstacles[i];
    o.x -= speed;
    ctx.fillStyle = "green";
    ctx.fillRect(o.x, o.y, o.width, o.height);

    if (
      mario.x < o.x + o.width &&
      mario.x + mario.width > o.x &&
      mario.y < o.y + o.height &&
      mario.y + mario.height > o.y
    ) {
      endGame();
    }
  }
  obstacles = obstacles.filter(o => o.x + o.width > 0);

  // Score
  score++;
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Pontos: " + score, 20, 30);

  // Dificuldade progressiva
  speed = 4 + score / 200;
}

// Criar obstáculos
function spawnObstacle() {
  if (!gameStarted || gameOver) return;
  let height = 40;
  obstacles.push({ x: canvas.width, y: ground - height, width: 30, height: height });
}

// Fim do jogo
function endGame() {
  gameOver = true;
  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over!", canvas.width / 2 - 80, canvas.height / 2);
  if (playerName) salvarPontuacao(playerName, score);
}

// Salvar no Firebase
async function salvarPontuacao(nome, pontos) {
  await set(ref(db, "ranking/" + nome), { pontos: pontos });
  carregarRanking();
}

// Carregar ranking
async function carregarRanking() {
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, "ranking"));
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

// Inicia tudo
window.onload = () => {
  initGame();
};
