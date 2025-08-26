// Import Firebase SDK direto do CDN (para usar no GitHub Pages)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Configuração do Firebase (sua)
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

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 🎮 Variáveis do jogo
let canvas, ctx;
let mario = { x: 50, y: 150, width: 40, height: 40, jumping: false, vy: 0 };
let ground = 200;
let gravity = 0.6;
let obstacles = [];
let score = 0;
let gameOver = false;
let speed = 4; // aumenta com pontos
let bgPhase = "manha"; // manhã, tarde, noite

// Iniciar jogo
function initGame() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");

  document.addEventListener("keydown", jump);

  setInterval(update, 20);
  setInterval(spawnObstacle, 2000);
}

// Pular
function jump(e) {
  if (e.code === "Space" && !mario.jumping && !gameOver) {
    mario.jumping = true;
    mario.vy = -10;
  }
}

// Atualização do jogo
function update() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Fundo muda conforme pontos
  if (score < 500) bgPhase = "manha";
  else if (score < 1000) bgPhase = "tarde";
  else bgPhase = "noite";

  if (bgPhase === "manha") ctx.fillStyle = "#87CEEB"; // azul claro
  if (bgPhase === "tarde") ctx.fillStyle = "#FFA500"; // laranja
  if (bgPhase === "noite") ctx.fillStyle = "#191970"; // azul escuro
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

    // colisão
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
  if (score % 300 === 0) {
    speed += 0.5;
  }
}

// Criar obstáculo
function spawnObstacle() {
  if (gameOver) return;
  let height = 40;
  obstacles.push({ x: canvas.width, y: ground - height, width: 30, height: height });
}

// Fim do jogo
function endGame() {
  gameOver = true;
  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over!", canvas.width / 2 - 80, canvas.height / 2);

  setTimeout(() => {
    let nome = prompt("Digite seu nome:");
    if (nome) salvarPontuacao(nome, score);
  }, 100);
}

// Salvar no Firebase (sem nomes repetidos)
async function salvarPontuacao(nome, pontos) {
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, "ranking/" + nome));

  if (snapshot.exists()) {
    alert("Nome já existente, utilize outro.");
  } else {
    await set(ref(db, "ranking/" + nome), { pontos: pontos });
    alert("Pontuação salva!");
    carregarRanking();
  }
}

// Carregar ranking
async function carregarRanking() {
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, "ranking"));
  let rankingDiv = document.getElementById("ranking");
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

window.onload = () => {
  initGame();
  carregarRanking();
};
