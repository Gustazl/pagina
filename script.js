// -------------------- Firebase Config --------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

// 🔹 Troque pelos dados do seu Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  databaseURL: "https://SEU_PROJETO.firebaseio.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_ID",
  appId: "SEU_APP_ID"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// -------------------- Variáveis Globais --------------------
let playerName = "";
let score = 0;
let gameInterval;

// -------------------- Seletores --------------------
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const rankingScreen = document.getElementById("ranking-screen");

const mario = document.getElementById("mario");
const pipe = document.getElementById("pipe");
const scoreText = document.getElementById("score");
const rankingList = document.getElementById("ranking-list");

// -------------------- Funções do Jogo --------------------
document.getElementById("start-btn").addEventListener("click", () => {
  const inputName = document.getElementById("player-name").value.trim();

  if (inputName === "") {
    alert("Digite seu nome!");
    return;
  }

  playerName = inputName;
  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  iniciarJogo();
});

document.getElementById("retry-btn").addEventListener("click", () => {
  rankingScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
});

// Mario pula
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    jump();
  }
});

function jump() {
  if (!mario.classList.contains("jump")) {
    mario.classList.add("jump");
    setTimeout(() => {
      mario.classList.remove("jump");
    }, 600);
  }
}

function iniciarJogo() {
  score = 0;
  scoreText.textContent = "Pontuação: 0";

  gameInterval = setInterval(() => {
    // posição dos elementos
    const pipePosition = pipe.offsetLeft;
    const marioPosition = +window.getComputedStyle(mario).bottom.replace("px", "");

    if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80) {
      gameOver();
    }

    score++;
    scoreText.textContent = "Pontuação: " + score;
  }, 50);
}

function gameOver() {
  clearInterval(gameInterval);

  // Salva no ranking
  salvarNoRanking(playerName, score);

  // Vai para tela de ranking
  gameScreen.classList.add("hidden");
  rankingScreen.classList.remove("hidden");

  carregarRanking();
}

// -------------------- Firebase Ranking --------------------
function salvarNoRanking(nome, pontos) {
  const rankingRef = ref(db, 'ranking');
  const novoRegistro = push(rankingRef);

  set(novoRegistro, {
    nome: nome,
    pontos: pontos
  }).then(() => {
    console.log("✅ Pontuação salva!");
  }).catch((err) => {
    console.error("❌ Erro:", err);
  });
}

function carregarRanking() {
  const rankingRef = ref(db, 'ranking');

  onValue(rankingRef, (snapshot) => {
    const dados = snapshot.val();
    rankingList.innerHTML = "";

    if (dados) {
      const rankingArray = Object.values(dados).sort((a, b) => b.pontos - a.pontos);

      rankingArray.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${item.nome} - ${item.pontos} pontos`;
        rankingList.appendChild(li);
      });
    }
  });
}
