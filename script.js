// Elementos
const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const playerNameInput = document.getElementById("playerName");
const nameError = document.getElementById("nameError");

const mario = document.getElementById("mario");
const obstacle = document.getElementById("obstacle");
const scoreDisplay = document.getElementById("score");
const finalScoreDisplay = document.getElementById("finalScore");
const rankingList = document.getElementById("rankingList");

let playerName = "";
let score = 0;
let gameInterval;
let obstacleInterval;
let gravity = false;

// Ranking no localStorage
let ranking = JSON.parse(localStorage.getItem("ranking")) || [];

// Sons
const jumpSound = new Audio("https://cdn.pixabay.com/download/audio/2024/09/29/audio_3397905774.mp3?filename=jump-up-245782.mp3");
const hitSound = new Audio("https://www.myinstants.com/media/sounds/roblox-death-sound_1.mp3");
const gameOverSound = new Audio("https://www.myinstants.com/media/sounds/super-mario-bros_2.mp3");

// Iniciar jogo
startBtn.onclick = () => {
  const name = playerNameInput.value.trim();
  if (!name) {
    nameError.textContent = "Digite um nome!";
    return;
  }
  if (ranking.find(r => r.name === name)) {
    nameError.textContent = "Nome já existente, utilize outro!";
    return;
  }

  playerName = name;
  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  startGame();
};

// Função de pulo
function jump() {
  if (gravity) return;
  gravity = true;
  mario.style.transition = "bottom 0.3s";
  mario.style.bottom = "150px";
  jumpSound.play();

  setTimeout(() => {
    mario.style.bottom = "40px";
    setTimeout(() => gravity = false, 300);
  }, 300);
}

// Detectar tecla espaço
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    jump();
  }
});

// Inicia jogo
function startGame() {
  score = 0;
  scoreDisplay.textContent = "Pontuação: 0";
  mario.src = "https://i.imgur.com/QUcZYrn.gif";
  obstacle.style.right = "-60px";

  // Loop de pontuação
  gameInterval = setInterval(() => {
    score++;
    scoreDisplay.textContent = "Pontuação: " + score;
    updateBackground();
  }, 100);

  // Loop do obstáculo
  obstacleInterval = setInterval(() => {
    obstacle.style.right = "-60px";
    const speed = Math.max(1000 - score * 2, 400); // mais rápido
    obstacle.animate([{ right: "-60px" }, { right: "100vw" }], {
      duration: speed,
      iterations: 1
    }).onfinish = () => {
      if (obstacle.style.right !== "-60px") {
        obstacle.style.right = "-60px";
      }
    };
  }, 1500);

  // Checar colisão
  setInterval(() => {
    const marioRect = mario.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    if (
      marioRect.right > obstacleRect.left &&
      marioRect.left < obstacleRect.right &&
      marioRect.bottom > obstacleRect.top
    ) {
      endGame();
    }
  }, 50);
}

// Atualiza background
function updateBackground() {
  const body = document.body;
  if (score % 300 < 100) {
    body.style.background = "linear-gradient(to top, #87ceeb, #ffffff)"; // dia
  } else if (score % 300 < 200) {
    body.style.background = "linear-gradient(to top, #ff9966, #ffcc99)"; // pôr do sol
  } else {
    body.style.background = "linear-gradient(to top, #001f3f, #000000)"; // noite
  }
}

// Finaliza jogo
function endGame() {
  clearInterval(gameInterval);
  clearInterval(obstacleInterval);
  hitSound.play();
  gameOverSound.play();
  mario.src = "https://i.imgur.com/rAD2ZZ2.png";
  finalScoreDisplay.textContent = `Sua pontuação: ${score}`;

  ranking.push({ name: playerName, score });
  ranking.sort((a, b) => b.score - a.score);
  localStorage.setItem("ranking", JSON.stringify(ranking));

  rankingList.innerHTML = "";
  ranking.slice(0, 5).forEach(r => {
    const li = document.createElement("li");
    li.textContent = `${r.name}: ${r.score}`;
    rankingList.appendChild(li);
  });

  gameScreen.classList.add("hidden");
  gameOverScreen.classList.remove("hidden");
}

// Reiniciar
restartBtn.onclick = () => {
  gameOverScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
};
