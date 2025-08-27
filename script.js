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
const finalScore = document.getElementById("finalScore");
const rankingList = document.getElementById("rankingList");

// Sons
const jumpSound = new Audio("https://cdn.pixabay.com/download/audio/2024/09/29/audio_3397905774.mp3?filename=jump-up-245782.mp3");
const hitSound = new Audio("https://www.myinstants.com/media/sounds/roblox-death-sound_1.mp3");
const defeatSound = new Audio("https://www.myinstants.com/media/sounds/super-mario-bros_2.mp3");

// Variáveis
let playerName = "";
let score = 0;
let isJumping = false;
let gameInterval;
let obstacleSpeed = 10;
let ranking = JSON.parse(localStorage.getItem("ranking")) || [];

// Função iniciar jogo
startBtn.addEventListener("click", () => {
  const name = playerNameInput.value.trim();
  if (!name) { nameError.textContent = "Digite um nome!"; return; }
  if (ranking.some(r => r.name === name)) { nameError.textContent = "Nome já existente!"; return; }
  playerName = name;
  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  startGame();
});

function startGame() {
  score = 0;
  obstacleSpeed = 10;
  mario.src = "https://i.imgur.com/QUcZYrn.gif";
  document.addEventListener("keydown", handleJump);
  moveObstacle();
  gameInterval = setInterval(updateGame, 50);
}

function handleJump(e) {
  if (e.code === "Space" && !isJumping) { jump(); }
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
          mario.style.bottom = 40 + position + "px";
        }
      }, 20);
    } else {
      position += 20;
      mario.style.bottom = 40 + position + "px";
    }
  }, 20);
}

function moveObstacle() {
  let obstaclePosition = window.innerWidth;
  const moveInterval = setInterval(() => {
    if (obstaclePosition < -60) { 
      obstaclePosition = window.innerWidth; 
      score += 100; 
      scoreDisplay.textContent = "Pontuação: " + score; 
      if (score % 500 === 0) obstacleSpeed += 2; 
      if (score % 1000 === 0) changeBackground(); 
    }
    // Colisão
    if (
      obstaclePosition < 130 && obstaclePosition > 50 &&
      parseInt(mario.style.bottom) < 100
    ) { 
      clearInterval(moveInterval); 
      endGame(); 
    }
    obstacle.style.left = obstaclePosition + "px";
    obstaclePosition -= obstacleSpeed;
  }, 20);
}

function updateGame() { scoreDisplay.textContent = "Pontuação: " + score; }

function endGame() {
  clearInterval(gameInterval);
  mario.src = "https://i.imgur.com/rAD2ZZ2.png";
  hitSound.play();
  defeatSound.play();
  ranking.push({ name: playerName, score });
  ranking.sort((a, b) => b.score - a.score);
  localStorage.setItem("ranking", JSON.stringify(ranking.slice(0,5)));
  showGameOver();
}

function showGameOver() {
  gameScreen.classList.add("hidden");
  gameOverScreen.classList.remove("hidden");
  finalScore.textContent = `Pontuação final: ${score}`;
  rankingList.innerHTML = "";
  ranking.forEach(r => {
    const li = document.createElement("li");
    li.textContent = `${r.name} - ${r.score}`;
    rankingList.appendChild(li);
  });
}

// Reiniciar jogo
restartBtn.addEventListener("click", () => {
  gameOverScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  playerNameInput.value = "";
  nameError.textContent = "";
});

// Fundo dinâmico
function changeBackground() {
  const colors = [
    "linear-gradient(to bottom, #87ceeb, #ffffff)",
    "linear-gradient(to bottom, #ff9966, #ffcc66)",
    "linear-gradient(to bottom, #001f3f, #000000)"
  ];
  const index = Math.floor(score / 1000) % colors.length;
  document.getElementById("gameArea").style.background = colors[index];
}
