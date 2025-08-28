// Importa Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, set, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAMwEcrs7DnNNuBAsJJq83LHpQILubCKUg",
  authDomain: "projeto-feira-d-ciencias-mario.firebaseapp.com",
  databaseURL: "https://projeto-feira-d-ciencias-mario-default-rtdb.firebaseio.com",
  projectId: "projeto-feira-d-ciencias-mario",
  storageBucket: "projeto-feira-d-ciencias-mario.appspot.com",
  messagingSenderId: "598294976090",
  appId: "1:598294976090:web:bd480d135fe947da1eaa63",
  measurementId: "G-3MP6ZD8JZH"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Elementos
const startScreen = document.getElementById("start-screen");
const gameBoard = document.getElementById("game-board");
const rankingScreen = document.getElementById("ranking-screen");
const mario = document.getElementById("mario");
const pipe = document.getElementById("pipe");
const scoreEl = document.getElementById("score");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const playerNameInput = document.getElementById("player-name");
const nameWarning = document.getElementById("name-warning");

let score = 0;
let gameInterval;
let playerName = "";

// Função para verificar se nome já existe
async function nomeJaExiste(nome) {
  const rankingRef = ref(db, "ranking");
  const snapshot = await get(rankingRef);
  if (snapshot.exists()) {
    const dados = snapshot.val();
    return Object.values(dados).some(item => item.nome === nome);
  }
  return false;
}

// Salvar no ranking
function salvarNoRanking(nome, pontos) {
  const rankingRef = ref(db, "ranking");
  const novoRegistro = push(rankingRef);

  set(novoRegistro, { nome, pontos });
}

// Mostrar ranking
async function carregarRanking() {
  const rankingRef = ref(db, "ranking");
  const snapshot = await get(rankingRef);
  const lista = document.getElementById("ranking-list");
  lista.innerHTML = "";

  if (snapshot.exists()) {
    const dados = snapshot.val();
    const rankingArray = Object.values(dados).sort((a, b) => b.pontos - a.pontos);

    rankingArray.forEach((item, index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}. ${item.nome} - ${item.pontos} pontos`;
      lista.appendChild(li);
    });
  }
}

// Iniciar jogo
startBtn.addEventListener("click", async () => {
  const nome = playerNameInput.value.trim();
  if (nome === "") {
    nameWarning.textContent = "Digite um nome!";
    return;
  }

  if (await nomeJaExiste(nome)) {
    nameWarning.textContent = "Esse nome já está no ranking!";
    return;
  }

  playerName = nome;
  nameWarning.textContent = "";

  startScreen.style.display = "none";
  gameBoard.style.display = "block";

  score = 0;
  scoreEl.textContent = "Pontuação: 0";

  // Pontuação automática
  gameInterval = setInterval(() => {
    score++;
    scoreEl.textContent = "Pontuação: " + score;
  }, 100);
});

// Pular
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    mario.classList.add("jump");

    setTimeout(() => {
      mario.classList.remove("jump");
    }, 500);
  }
});

// Verificar colisão
setInterval(() => {
  const pipePos = pipe.offsetLeft;
  const marioPos = +window.getComputedStyle(mario).bottom.replace("px", "");

  if (pipePos > 0 && pipePos < 120 && marioPos < 80) {
    clearInterval(gameInterval);

    salvarNoRanking(playerName, score);

    gameBoard.style.display = "none";
    rankingScreen.style.display = "block";
    carregarRanking();
  }
}, 10);

// Reiniciar
restartBtn.addEventListener("click", () => {
  rankingScreen.style.display = "none";
  startScreen.style.display = "block";
});
