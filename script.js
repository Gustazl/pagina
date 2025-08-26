let score = 0;
let gameInterval;

// Fases do céu (ciclo infinito)
const skyPhases = [
  "linear-gradient(to top, #87ceeb, #ffffff)", // manhã
  "linear-gradient(to top, #ff9966, #ff5e62)", // pôr do sol
  "linear-gradient(to top, #0f2027, #203a43, #2c5364)", // noite
];

let currentPhase = 0;

function startGame() {
  gameInterval = setInterval(() => {
    score++;
    document.getElementById("score").textContent = "Score: " + score;

    // A cada 1000 pontos muda a cor do céu
    if (score % 1000 === 0) {
      currentPhase = (currentPhase + 1) % skyPhases.length;
      document.getElementById("sky").style.background = skyPhases[currentPhase];
    }
  }, 50);
}

window.onload = startGame;
