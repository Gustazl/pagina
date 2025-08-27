const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const clouds = document.querySelectorAll('.cloud');
const gameBoard = document.getElementById('gameBoard');

const jumpSound = document.getElementById('jump-sound');
const gameOverSound = document.getElementById('gameover-sound');
const backgroundMusic = document.getElementById('bg-music');

const pontosDisplay = document.getElementById('pontos');
const faseDisplay = document.getElementById('fase');

let pontos = 0;
let fase = 1;

// Toca música de fundo
backgroundMusic.volume = 0.3;
backgroundMusic.play();

// Função pular
const jump = () => {
    mario.classList.add('jump');
    jumpSound.currentTime = 0;
    jumpSound.play();
    setTimeout(() => mario.classList.remove('jump'), 500);
};

// Atualizar pontuação e fases
const pontosInterval = setInterval(() => {
    pontos += fase; 
    pontosDisplay.textContent = pontos;

    if (pontos % 50 === 0) {
        fase += 1;
        faseDisplay.textContent = fase;

        // Aceleração do cano
        let newPipeSpeed = 1.5 - (fase * 0.1);
        if (newPipeSpeed < 0.3) newPipeSpeed = 0.3;
        pipe.style.animationDuration = `${newPipeSpeed}s`;

        // Aceleração nuvens
        clouds.forEach((cloud, i) => {
            let speed = parseFloat(cloud.style.animationDuration) - 1;
            if (speed < 5) speed = 5;
            cloud.style.animationDuration = `${speed}s`;
        });
    }
}, 1000);

// Loop do jogo
const loop = setInterval(() => {
    const pipePosition = pipe.offsetLeft;
    const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');

    if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80) {
        // Congela cano
        pipe.style.animation = 'none';
        pipe.style.left = `${pipePosition}px`;

        // Congela Mario
        mario.style.animation = 'none';
        mario.style.bottom = `${marioPosition}px`;
        mario.src = './img/game-over.png';
        mario.style.width = '75px';
        mario.style.marginLeft = '50px'; 

        clearInterval(loop);
        clearInterval(pontosInterval);

        gameOverSound.play();
        backgroundMusic.pause();
    }
}, 10);

document.addEventListener('keydown', jump);

// Dia/Noite e chuva
let clima = 'day';

function mudarClima() {
    clima = clima === 'day' ? 'night' : 'day';
    gameBoard.className = `game-board ${clima}`;
}

function adicionarChuva() {
    if (clima !== 'night') return;
    for (let i = 0; i < 50; i++) {
        const drop = document.createElement('div');
        drop.classList.add('rain');
        drop.style.left = Math.random() * window.innerWidth + 'px';
        drop.style.animationDuration = 0.5 + Math.random() * 0.5 + 's';
        gameBoard.appendChild(drop);

        drop.addEventListener('animationend', () => drop.remove());
    }
}

// Alterna dia/noite a cada 30 segundos
setInterval(mudarClima, 30000);

// Adiciona chuva aleatória
setInterval(() => { if (Math.random() > 0.5) adicionarChuva(); }, 5000);
