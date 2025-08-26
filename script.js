const mario = document.getElementById("mario");
const obstacle = document.getElementById("obstacle");
const scoreSpan = document.getElementById("score");
const game = document.getElementById("game");

let score = 0;
let isJumping = false;
let isGameOver = false;
let backgroundColors = ["#87ceeb", "#ffa07a", "#2c3e50"];
let currentBackgroundIndex = 0;

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
  scoreSpan.textContent = score;

  if (score % 500 === 0) {
    changeBackground();
  }
}

function changeBackground() {
  currentBackgroundIndex = (currentBackgroundIndex + 1) % backgroundColors.length;
  document.body.style.backgroundColor = backgroundColors[currentBackgroundIndex];
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

