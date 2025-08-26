let score = 0;
let jumping = false;
let gameInterval;
let obstacleSpeed = 10; // 🚀 Muito mais rápido
let playerName = "";

// Céu fases
const skyPhases = [
  "linear-gradient(to top, #87ceeb, #ffffff)", // manhã
  "linear-gradient(to top, #ff9966, #ff5e62)", // pôr do sol
  "linear-gradient(to top, #0f2027, #203a43, #2c5364)", // noite
];

let currentPhase = 0;
const mario = document.getElementById("mario");
const obstacle = document.getElementById("obstacle");
const sky = document.getElementById("sky");
const jumpSound = document.getElementById("jumpSound");
const deathSound = document.getElementById("deathSound");
const hitSound = document.getElementById("hitSound");
const rankingList = document.getElementById("rankingList");

// ====== Ranking (localStorage) ======
function loadRanking() {
  let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
  rankingList.innerHTML = "";
  ranking.slice(0, 5).forEach((p, i) => {
    let li = document.createElement("li");
    li.textContent = `${p.name}: ${p.score}`;
    rankingList.appendChild(li);
  });
}

function saveScore(name, score) {
  let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
  ranking.push({ name, score });
  ranking.sort((a, b) => b.score - a.score);
  localStorage.setItem("ranking", JSON.stringify(ranking));
  loadRanking();
}

// ====== Jogo ======
function jump() {
  if (jumping) return;
  jumping = true;
  jumpSound.currentTime = 0;
  jumpSound.play();

  let jumpHeight = 0;
  let goingUp = true;

  const jumpInterval = setInterval(() => {
    if (goingUp) {
      jumpHeight += 7;
      if (jumpHeight >= 150) goingUp = false;
    } else {
      jumpHeight -= 7;
      if (jumpHeight <= 0) {
        clearInterval(jumpInterval);
        jumping = false;
      }
    }
    mario.style.bottom = (70 + jumpHeight) + "px";
  }, 15);
}

function moveObstacle() {
  let obstacleX = window.innerWidth;
  obstacle.style.right = "-80px";

  const obstacleInterval = setInterval(() => {
    obstacleX -= obstacleSpeed;
    obstacle.style.left = obstacleX + "px";

    let marioRect = mario.getBoundingClientRect();
    let obstacleRect = obstacle.getBoundingClientRect();

    if (
      marioRect.right > obstacleRect.left &&
      marioRect.left < obstacleRect.right &&
      marioRect.bottom > obstacleRect.top
    ) {
      clearInterval(obstacleInterval);
      clearInterval(gameInterval);

      hitSound.play();
      setTimeout(() => deathSound.play(), 300);

      saveScore(playerName, score);
      alert("💀 Game Over! Score final: " + score);
      window.location.reload();
    }

    if (obstacleX < -100) {
      obstacleX = window.innerWidth;
    }
  }, 20);
}

function startGame() {
  document.getElementById("game").style.display = "block";
  document.getElementById("nameScreen").style.display = "none";
  loadRanking();

  gameInterval = setInterval(() => {
    score++;
    document.getElementById("score").textContent = "Score: " + score;

    if (score % 1000 === 0) {
      currentPhase = (currentPhase + 1) % skyPhases.length;
      sky.style.background = skyPhases[currentPhase];
    }
  }, 50);

  moveObstacle();
}

// ====== Entrada do nome ======
document.getElementById("startBtn").addEventListener("click", () => {
  const input = document.getElementById("playerName");
  if (input.value.trim() === "") {
    alert("Digite seu nome para jogar!");
    return;
  }
  playerName = input.value.trim();
  startGame();
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") jump();
});
