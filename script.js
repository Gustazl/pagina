const mario = document.getElementById("mario");
const obstacle = document.getElementById("obstacle");
const scoreSpan = document.getElementById("score");
const phaseText = document.getElementById("phase");
const game = document.getElementById("game");

let score = 0;
let isJumping = false;
let isGameOver = false;
let currentPhase = 0;

const phases = [
  { color: "#87ceeb", name: "Manhã" },
  { color: "#ffa07a", name: "Tarde" },
  { color: "#2c3e50", name: "Noite" }
];

function jump() {
  if (isJumping || isGameOver) return;
  isJumping = true;
  mario.classList.add("jump");
  setTimeout(() => {
    mario.classList.remove("jump");
    isJumping = false;
  }, 500);
}

function updateScore() {
  if (isGameOver) return;
  score++;
  scoreSpan.innerHTML = `<b>${score}</b>`;

  let newPhaseIndex = Math.floor(score / 500) % phases.length;
  if (newPhaseIndex !== currentPhase) {
    changePhase(newPhaseIndex);
  }
}

function changePhase(index) {
  currentPhase = index;
  document.body.style.backgroundColor = phases[index].color;
  phaseText.innerHTML = `<b>Fase: ${phases[index].name}</b>`;
}

function checkCollision() {
  const marioRect = mario.getBoundingClientRect();
  const obstacleRect = obstacle.getBoundingClientRect();

  if (
    marioRect.right > obstacleRect.left &&
    marioRect.left < obstacleRect.right &&
    marioRect.bottom > obstacleRect.top
  ) {
    gameOver();
  }
}

function gameOver() {
  isGameOver = true;
  obstacle.style.animationPlayState = "paused";
  mario.src = "https://art.pixilart.com/sr22d8604663ca5.png"; // Mario derrotado
  alert("Game Over! Sua pontuação: " + score);
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    jump();
  }
});

setInterval(() => {
  if (!isGameOver) {
    updateScore();
    checkCollision();
  }
}, 50);
