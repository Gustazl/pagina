const mario = document.getElementById("mario");
const obstacle = document.getElementById("obstacle");
const scoreDisplay = document.getElementById("score");
const gameScreen = document.getElementById("game");
const startScreen = document.getElementById("start-screen");
const rankingScreen = document.getElementById("ranking-screen");
const rankingList = document.getElementById("rankingList");
const playerNameInput = document.getElementById("playerName");
const startBtn = document.getElementById("startBtn");
const nameError = document.getElementById("nameError");

let score = 0;
let isJumping = false;
let gameInterval;
let obstacleSpeed = 10;
let playerName = "";

// Sons
const jumpSound = new Audio("https://cdn.pixabay.com/download/audio/2024/09/29/audio_3397905774.mp3?filename=jump-up-245782.mp3");
const hitSound = new Audio("https://www.myinstants.com/media/sounds/roblox-death-sound_1.mp3");
const defeatSound = new Audio("https://www.myinstants.com/media/sounds/super-mario-bros_2.mp3");

// Ranking
let ranking = JSON.parse(localStorage.getItem("ranking")) || [];

// Iniciar jogo
startBtn.addEventListener("click", () => {
  const name = playerNameInput.value.trim();
  if (!name) {
    nameError.textContent = "Digite um nome!";
    return;
  }
  if (ranking.some(r => r.name === name)) {
    nameError.textContent = "Nome já existente, utilize outro!";
    return;
  }
  playerName = name;
  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  startGame();
});

function startGame() {
  score = 0;
  obstacleSpeed = 10;
  mario.src = "https://i.imgur.com/QUcZYrn.gif";
  moveObstacle();
  gameInterval = setInterval(updateGame, 50);
  document.addEventListener("keydown", handleJump);
}

function handleJump(e) {
  if (e.code === "Space" && !isJumping) {
    jump();
  }
}

function jump() {
  isJumping = true;
  let position = 0;
  jumpSound.play();

  const upInterval = setInterval(() => {
    if (position >= 150) {
      clearInterval(upInterval);
      const downInterval = setInterval(() => {
        if (position <= 0) {
          clearInterval(downInterval);
          isJumping = false;
        } else {
          position -= 20;
          mario.style.bottom = 50 + position + "px";
        }
      }, 20);
    } else {
      position += 20;
      mario.style.bottom = 50 + position + "px";
    }
  }, 20);
}

function moveObstacle() {
  let obstaclePosition = window.innerWidth;

  const moveInterval = setInterval(() => {
    if (obstaclePosition < -80) {
      obstaclePosition = window.innerWidth;
      score += 100;
      scoreDisplay.textContent = "Pontuação: " + score;

      if (score % 500 === 0) obstacleSpeed += 2;
      if (score % 1000 === 0) changeBackground();
    }

    if (
      obstaclePosition < 180 &&
      obstaclePosition > 80 &&
      parseInt(mario.style.bottom) < 100
    ) {
      clearInterval(moveInterval);
      endGame();
    }

    obstacle.style.left = obstaclePosition + "px";
    obstaclePosition -= obstacleSpeed;
  }, 20);
}

function updateGame() {
  scoreDisplay.textContent = "Pontuação: " + score;
}

function endGame() {
  clearInterval(gameInterval);
  mario.src = "https://i.imgur.com/rAD2ZZ2.png";
  hitSound.play();
  defeatSound.play();

  ranking.push({ name: playerName, score });
  ranking.sort((a, b) => b.score - a.score);
  localStorage.setItem("ranking", JSON.stringify(ranking));

  showRanking();
}

function showRanking() {
  gameScreen.classList.add("hidden");
  rankingScreen.classList.remove("hidden");
  rankingList.innerHTML = "";
  ranking.forEach(r => {
    const li = document.createElement("li");
    li.textContent = `${r.name} - ${r.score}`;
    rankingList.appendChild(li);
  });
}

function restartGame() {
  rankingScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
}

function changeBackground() {
  const game = document.getElementById("game");
  const colors = [
    "linear-gradient(to bottom, #87ceeb, #ffffff)", // dia
    "linear-gradient(to bottom, #ff9966, #ffcc66)", // pôr do sol
    "linear-gradient(to bottom, #001f3f, #000000)", // noite
  ];
  let index = (score / 1000) % colors.length;
  game.style.background = colors[Math.floor(index)];
}
