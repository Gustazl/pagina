// Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAMwEcrs7DnNNuBAsJJq83LHpQILubCKUg",
    authDomain: "projeto-feira-d-ciencias-mario.firebaseapp.com",
    databaseURL: "https://projeto-feira-d-ciencias-mario-default-rtdb.firebaseio.com",
    projectId: "projeto-feira-d-ciencias-mario",
    storageBucket: "projeto-feira-d-ciencias-mario.appspot.com",
    messagingSenderId: "598294976090",
    appId: "1:598294976090:web:bd480d135fe947da1eaa63",
    measurementId: "G-3MP6ZD8JZH"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Elementos
const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const clouds = document.querySelector('.clouds');
const gameBoard = document.getElementById('gameBoard');
const startMenu = document.getElementById('startMenu');
const startBtn = document.getElementById('startBtn');
const nameInput = document.getElementById('nameInput');
const playerNameDisplay = document.getElementById('playerName');
const pontosDisplay = document.getElementById('pontos');
const rankingList = document.getElementById('rankingList');

const jumpSound = document.getElementById('jump-sound');
const gameOverSound = document.getElementById('gameover-sound');

let pontos = 0;
let isJumping = false;
let gameInterval;

// Iniciar Jogo
startBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) { alert('Digite um nome!'); return; }

    // Verifica se o nome já existe
    database.ref('ranking/' + name).get().then(snapshot => {
        if (snapshot.exists()) {
            alert('Nome já existe! Ele será atualizado.');
        }
        // Salva ou atualiza nome
        database.ref('ranking/' + name).set({ pontos: 0 });
        playerNameDisplay.textContent = name;
        startMenu.style.display = 'none';
        startGame();
        loadRanking();
    });
});

// Função pular
const jump = () => {
    if (isJumping) return;
    isJumping = true;
    mario.classList.add('jump');
    jumpSound.currentTime = 0;
    jumpSound.play();
    setTimeout(() => {
        mario.classList.remove('jump');
        isJumping = false;
    }, 500);
};

document.addEventListener('keydown', jump);

// Loop do jogo
function startGame() {
    gameInterval = setInterval(() => {
        const pipePosition = pipe.offsetLeft;
        const marioPosition = +window.getComputedStyle(mario).bottom.replace('px','');

        // Colisão
        if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80) {
            gameOver();
        }

        // Pontos
        pontos++;
        pontosDisplay.textContent = pontos;

        // Atualiza no Firebase
        const name = playerNameDisplay.textContent;
        database.ref('ranking/' + name).set({ pontos: pontos });
    }, 100);
}

// Game Over
function gameOver() {
    clearInterval(gameInterval);
    mario.src = './img/game-over.png';
    mario.style.width = '75px';
    mario.style.marginLeft = '50px';
    pipe.style.animation = 'none';
    gameOverSound.play();
    loadRanking();
}

// Ranking
function loadRanking() {
    database.ref('ranking').get().then(snapshot => {
        rankingList.innerHTML = '';
        const data = snapshot.val();
        if (!data) return;
        const sorted = Object.entries(data).sort((a,b) => b[1].pontos - a[1].pontos);
        sorted.forEach(([name, info]) => {
            const li = document.createElement('li');
            li.textContent = `${name}: ${info.pontos}`;
            rankingList.appendChild(li);
        });
    });
}

// Clima dia/noite e chuva
let clima = 'day';
function mudarClima() {
    clima = clima === 'day' ? 'night' : 'day';
    gameBoard.className = 'game-board ' + clima;
}
function adicionarChuva() {
    if (clima !== 'night') return;
    for (let i=0;i<50;i++){
        const drop = document.createElement('div');
        drop.classList.add('rain');
        drop.style.left = Math.random() * window.innerWidth + 'px';
        drop.style.animationDuration = 0.5 + Math.random()*0.5 + 's';
        gameBoard.appendChild(drop);
        drop.addEventListener('animationend', ()=>drop.remove());
    }
}
setInterval(mudarClima, 30000);
setInterval(() => { if(Math.random()>0.5) adicionarChuva(); }, 5000);
