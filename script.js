let score = 0;
let jumping = false;
let gameInterval;
let obstacleSpeed = 5;

// Céu (manhã → pôr do sol → noite)
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

// Função de pulo
function jump() {
  if (jumping) return;
  jumping = true;
  jumpSound.currentTime = 0;
  jumpSound.play();

  let jumpHeight = 0;
  let goingUp = true;

  const jumpInterval = setInterval(() => {
    if (goingUp) {
      jumpHeight += 5;
      if (jumpHeight >= 150) goingUp = false;
    } else {
      jumpHeight -= 5;
      if (jumpHeight <= 0) {
        clearInterval(jumpInterval);
        jumping = false;
      }
    }
    mario.style.bottom = (70 + jumpHeight) + "px";
  }, 20);
}

// Movimento do obstáculo
function moveObstacle() {
  let obstacleX = window.innerWidth;
  obstacle.style.right = "-80px";

  const obstacleInterval = setInterval(() => {
    obstacleX -= obstacleSpeed;
    obstacle.style.left = obstacleX + "px";

    // colisão
    let marioRect = mario.getBoundingClientRect();
    let obstacleRect = obstacle.getBoundingClientRect();

    if (
      marioRect.right > obstacleRect.left &&
      marioRect.left < obstacleRect.right &&
      marioRect.bottom > obstacleRect.top
    ) {
      clearInterval(obstacleInterval);
      clearInterval(gameInterval);

      // toca sons de colisão e derrota
      hitSound.play();
      setTimeout(() => deathSound.play(), 300);

      alert("💀 Game Over! Score final: " + score);
      window.location.reload();
    }

    if (obstacleX < -100) {
      obstacleX = window.innerWidth;
    }
  }, 20);
}

// Pontuação + mudança de céu
function startGame() {
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

window.onload = startGame;
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") jump();
});
