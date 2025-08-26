// script.js (compat Firebase, sem module imports)
// Coloque este arquivo na mesma pasta que index.html e style.css

window.addEventListener('load', () => {
  // ====== CONFIGURAÇÃO FIREBASE (já com seus valores) ======
  const firebaseConfig = {
    apiKey: "AIzaSyAMwEcrs7DnNNuBAsJJq83LHpQILubCKUg",
    authDomain: "projeto-feira-d-ciencias-mario.firebaseapp.com",
    databaseURL: "https://projeto-feira-d-ciencias-mario-default-rtdb.firebaseio.com",
    projectId: "projeto-feira-d-ciencias-mario",
    storageBucket: "projeto-feira-d-ciencias-mario.firebasestorage.app",
    messagingSenderId: "598294976090",
    appId: "1:598294976090:web:bd480d135fe947da1eaa63",
    measurementId: "G-3MP6ZD8JZH"
  };
  try {
    firebase.initializeApp(firebaseConfig);
  } catch (err) {
    console.warn('Firebase possivelmente já inicializado', err);
  }
  const db = firebase.database();

  // ====== ELEMENTOS ======
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const phaseDisplay = document.getElementById('phaseDisplay');
  const gameOverEl = document.getElementById('gameOver');
  const finalScoreEl = document.getElementById('finalScore');
  const playerNameInput = document.getElementById('playerName');
  const saveScoreBtn = document.getElementById('saveScoreBtn');
  const restartBtn = document.getElementById('restartBtn');
  const rankingList = document.getElementById('rankingList');
  const saveMsg = document.getElementById('saveMsg');

  // ====== JOGO - variáveis ======
  // canvas size já definido em HTML (800x400). Para garantir:
  canvas.width = 800;
  canvas.height = 400;

  const groundY = 320; // posição y do chão (topo do retângulo do mario)

  let mario = { x: 60, y: groundY - 40, w: 40, h: 40, vy: 0, jumping: false };
  let obstacles = [];
  let score = 0;
  let running = true;
  let lastSpawnTime = 0;
  let spawnInterval = 1200; // ms inicial entre obstaculos
  let lastTime = performance.now();

  // ====== funções de desenho ======
  function drawBackground() {
    const stage = Math.floor(score / 500) % 3;
    if (stage === 0) {
      // manhã
      ctx.fillStyle = '#87ceeb';
      phaseDisplay.textContent = 'Fase: Manhã';
    } else if (stage === 1) {
      // tarde
      ctx.fillStyle = '#ffcc66';
      phaseDisplay.textContent = 'Fase: Tarde';
    } else {
      // noite
      ctx.fillStyle = '#2c3e50';
      phaseDisplay.textContent = 'Fase: Noite';
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // chão simples
    ctx.fillStyle = '#2d7a2d';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
  }

  function drawMario() {
    ctx.fillStyle = '#d33'; // vermelho
    ctx.fillRect(mario.x, mario.y, mario.w, mario.h);
  }

  function drawObstacles() {
    ctx.fillStyle = '#106010';
    obstacles.forEach(o => {
      ctx.fillRect(o.x, o.y, o.w, o.h);
    });
  }

  // ====== física e atualização ======
  function updatePhysics(dt) {
    // gravidade
    mario.vy += 0.8;
    mario.y += mario.vy;
    if (mario.y > groundY - mario.h) {
      mario.y = groundY - mario.h;
      mario.vy = 0;
      mario.jumping = false;
    }

    // velocidade cresce com pontuação
    const speed = 6 + Math.floor(score / 500);

    // mover obstáculos
    for (let o of obstacles) {
      o.x -= speed;
    }
    // remover os que saíram
    obstacles = obstacles.filter(o => (o.x + o.w) > -10);

    // spawn baseado em tempo (ms)
    lastSpawnTime += dt;
    // diminui interval com pontuação (min 500ms)
    const minInterval = 600;
    const interval = Math.max(minInterval, spawnInterval - Math.floor(score / 100) * 30);
    if (lastSpawnTime > interval) {
      lastSpawnTime = 0;
      spawnObstacle(speed);
    }
  }

  function spawnObstacle(speed) {
    // obstáculo com variação de altura
    const h = 30 + Math.floor(Math.random() * 50); // 30..80
    const o = {
      x: canvas.width + 20,
      y: groundY - h,
      w: 24 + Math.floor(Math.random() * 20),
      h: h
    };
    obstacles.push(o);
  }

  function checkCollision() {
    for (let o of obstacles) {
      if (mario.x < o.x + o.w &&
          mario.x + mario.w > o.x &&
          mario.y < o.y + o.h &&
          mario.y + mario.h > o.y) {
        return true;
      }
    }
    return false;
  }

  // ====== loop principal ======
  function loop(now) {
    if (!running) return;
    const dt = now - lastTime;
    lastTime = now;

    // update
    score += Math.floor(dt * 0.02); // ajusta velocidade de ganho de pontos
    updatePhysics(dt);

    // desenhar
    drawBackground();
    drawMario();
    drawObstacles();

    // HUD
    scoreDisplay.textContent = score;

    // colisão?
    if (checkCollision()) {
      onGameOver();
      return;
    }

    requestAnimationFrame(loop);
  }

  // ====== controles ======
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      if (!mario.jumping) {
        mario.vy = -14;
        mario.jumping = true;
      }
      e.preventDefault();
    }
  });

  canvas.addEventListener('click', () => {
    if (!mario.jumping) {
      mario.vy = -14;
      mario.jumping = true;
    }
  });

  // ====== fim de jogo ======
  function onGameOver() {
    running = false;
    finalScoreEl.textContent = score;
    document.getElementById('scoreDisplay').textContent = score;
    gameOverEl.classList.remove('hidden');
    saveMsg.textContent = '';
  }

  restartBtn.addEventListener('click', () => {
    resetGame();
  });

  function resetGame() {
    // reset simples
    mario = { x: 60, y: groundY - 40, w: 40, h: 40, vy: 0, jumping: false };
    obstacles = [];
    score = 0;
    running = true;
    lastSpawnTime = 0;
    lastTime = performance.now();
    gameOverEl.classList.add('hidden');
    requestAnimationFrame(loop);
  }

  // ====== RANKING / FIREBASE ======
  // salva com chave = nome (não permite duplicados)
  saveScoreBtn.addEventListener('click', () => {
    const name = (playerNameInput.value || '').trim();
    if (!name) {
      saveMsg.textContent = 'Digite um nome antes de salvar.';
      return;
    }

    // referencia no caminho pontuacoes/<nome>
    const refPath = 'pontuacoes/' + sanitizeKey(name);
    const nodeRef = db.ref(refPath);

    // checa se já existe
    nodeRef.once('value')
      .then(snap => {
        if (snap.exists()) {
          saveMsg.textContent = 'Nome já existente, utilize outro.';
        } else {
          // grava
          nodeRef.set({ name: name, score: score, date: Date.now() })
            .then(() => {
              saveMsg.textContent = 'Pontuação salva com sucesso!';
              playerNameInput.value = '';
              loadRanking(); // atualizar ranking visível
            })
            .catch(err => {
              console.error('Erro ao salvar', err);
              saveMsg.textContent = 'Erro ao salvar (veja console).';
            });
        }
      })
      .catch(err => {
        console.error('Erro leitura firebase', err);
        saveMsg.textContent = 'Erro ao verificar nome (veja console).';
      });
  });

  // carrega e ordena todos os scores
  function loadRanking() {
    const allRef = db.ref('pontuacoes');
    allRef.once('value')
      .then(snap => {
        const val = snap.val();
        if (!val) {
          rankingList.innerHTML = '<li>(nenhuma pontuação)</li>';
          return;
        }
        const arr = Object.values(val);
        arr.sort((a,b) => (b.score || 0) - (a.score || 0));
        rankingList.innerHTML = '';
        arr.slice(0, 10).forEach(v => {
          const li = document.createElement('li');
          li.textContent = `${v.name} — ${v.score}`;
          rankingList.appendChild(li);
        });
      })
      .catch(err => {
        console.error('Erro ao carregar ranking', err);
        rankingList.innerHTML = '<li>Erro ao carregar ranking (veja console)</li>';
      });
  }

  function sanitizeKey(str) {
    // remove caracteres que não são recomendados em chaves de caminho
    return str.replace(/[.#$[\]/]/g, '_');
  }

  // iniciar
  loadRanking();
  lastTime = performance.now();
  requestAnimationFrame(loop);

  // debug util: abra o Console (F12) se algo falhar
  console.log('Jogo iniciado — abra o Console (F12) se houver erros.');
});
