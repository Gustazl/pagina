// ==========================
//  CONFIGURAÇÃO DO FIREBASE
// ==========================
// Preencha para usar o banco. Se qualquer campo ficar "PLACEHOLDER", cai no localStorage automaticamente.
const FIREBASE_CONFIG = {
  apiKey: "PLACEHOLDER",
  authDomain: "PLACEHOLDER.firebaseapp.com",
  databaseURL: "https://PLACEHOLDER-default-rtdb.firebaseio.com",
  projectId: "PLACEHOLDER",
  storageBucket: "PLACEHOLDER.appspot.com",
  messagingSenderId: "PLACEHOLDER",
  appId: "PLACEHOLDER"
};

// Detecta se config está válido (bem simples: apiKey não pode ser PLACEHOLDER)
function hasValidFirebaseConfig(cfg) {
  return cfg && typeof cfg.apiKey === "string" && !/PLACEHOLDER/i.test(cfg.apiKey);
}

let db = null;
let useFirebase = false;

try {
  if (hasValidFirebaseConfig(FIREBASE_CONFIG) && window.firebase?.initializeApp) {
    const app = firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.database();
    useFirebase = true;
    console.log("✅ Firebase habilitado.");
  } else {
    console.log("ℹ️ Firebase desabilitado (usando localStorage).");
  }
} catch (e) {
  console.warn("⚠️ Falha ao iniciar Firebase. Fallback para localStorage.", e);
  useFirebase = false;
}

// ==========================
//  ELEMENTOS / VARIÁVEIS
// ==========================
const startScreen   = document.getElementById("start-screen");
const gameScreen    = document.getElementById("game-screen");
const rankingScreen = document.getElementById("ranking-screen");

const startBtn   = document.getElementById("startBtn");
const retryBtn   = document.getElementById("retryBtn");
const clearBtn   = document.getElementById("clearBtn");
const nameInput  = document.getElementById("playerName");
const nameError  = document.getElementById("nameError");

const gameBoard  = document.getElementById("gameBoard");
const mario      = document.getElementById("mario");
const pipe       = document.getElementById("pipe");

const pontosDisplay = document.getElementById("pontos");
const faseDisplay   = document.getElementById("fase");
const finalScoreEl  = document.getElementById("finalScore");
const rankingList   = document.getElementById("rankingList");

const sndJump   = document.getElementById("jump-sound");
const sndOver   = document.getElementById("gameover-sound");

// Estado do jogo
let playerName = "";
let pontos = 0;
let fase = 1;
let pontosInterval = null;
let loopColisao = null;
let clima = 'day'; // para alternar dia/noite

// ==========================
//  RANKING (Firebase + fallback)
// ==========================
const LS_KEY = "mr_ranking_v2";

async function saveScore(name, score) {
  if (useFirebase && db) {
    // Firebase Realtime Database
    const ref = db.ref("ranking").push();
    await ref.set({ nome: name, pontos: score, ts: Date.now() });
  } else {
    // Fallback localStorage
    const arr = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    arr.push({ nome: name, pontos: score, ts: Date.now() });
    arr.sort((a,b)=> b.pontos - a.pontos);
    localStorage.setItem(LS_KEY, JSON.stringify(arr.slice(0, 50)));
  }
}

function listenRanking(renderCb) {
  if (useFirebase && db) {
    db.ref("ranking").on("value", (snap) => {
      const val = snap.val();
      let list = [];
      if (val) list = Object.values(val);
      list.sort((a,b)=> b.pontos - a.pontos);
      renderCb(list.slice(0, 10));
    });
  } else {
    // localStorage: render imediato
    const arr = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    arr.sort((a,b)=> b.pontos - a.pontos);
    renderCb(arr.slice(0, 10));
  }
}

async function clearRanking() {
  if (useFirebase && db) {
    await db.ref("ranking").remove();
  } else {
    localStorage.removeItem(LS_KEY);
  }
}

// ==========================
//  CONTROLES DE TELA
// ==========================
startBtn.addEventListener("click", () => {
  const name = (nameInput.value || "").trim();
  if (!name) {
    nameError.textContent = "Digite um nome!";
    return;
  }
  nameError.textContent = "";
  playerName = name;

  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  iniciarJogo();
});

retryBtn.addEventListener("click", () => {
  rankingScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  nameInput.focus();
});

clearBtn.addEventListener("click", async () => {
  if (confirm("Tem certeza que deseja limpar o ranking?")) {
    await clearRanking();
    renderRanking([]); // esvazia
  }
});

// ==========================
//  JOGO
// ==========================
function iniciarJogo() {
  // Reset
  pontos = 0; fase = 1;
  pontosDisplay.textContent = "0";
  faseDisplay.textContent = "1";
  mario.src = "mario.gif";
  mario.style.width = "150px";
  mario.style.bottom = "0px";
  pipe.style.animation = "pipe-animation 1.5s infinite linear";

  // Pontuação e dificuldade
  pontosInterval = setInterval(() => {
    pontos += fase; // aumento mais rápido por fase
    pontosDisplay.textContent = pontos;

    if (pontos % 50 === 0) {
      fase += 1;
      faseDisplay.textContent = fase;

      // acelera cano suavemente (limite mínimo 0.3s)
      let newPipeSpeed = 1.5 - (fase * 0.1);
      if (newPipeSpeed < 0.3) newPipeSpeed = 0.3;
      pipe.style.animation = `pipe-animation ${newPipeSpeed}s infinite linear`;

      // acelera nuvens (ajuste pelo CSS usando durations diferentes)
      const cloudsA = document.querySelector(".clouds-a");
      const cloudsB = document.querySelector(".clouds-b");
      const spA = Math.max(12, 20 - fase); // nunca menos que 12s
      const spB = Math.max(16, 28 - fase); // nunca menos que 16s
      cloudsA && (cloudsA.style.animationDuration = `${spA}s`);
      cloudsB && (cloudsB.style.animationDuration = `${spB}s`);
    }

    // ciclo de clima (a cada 300 pontos muda)
    const mod = pontos % 300;
    if (mod === 0) toggleClima();
    // só chove à noite, de vez em quando
    if (clima === 'night' && Math.random() > 0.6) adicionarChuva();
  }, 1000);

  // Loop de colisão
  loopColisao = setInterval(() => {
    const pipePosition  = pipe.offsetLeft;
    const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');

    if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80) {
      encerrarJogo();
    }
  }, 10);
}

// Pulo
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') jump();
});
function jump() {
  if (!mario.classList.contains('jump')) {
    mario.classList.add('jump');
    try { sndJump.currentTime = 0; sndJump.play(); } catch {}
    setTimeout(() => mario.classList.remove('jump'), 500);
  }
}

function encerrarJogo() {
  // para loops
  clearInterval(pontosInterval);
  clearInterval(loopColisao);

  // congela posições
  const pipePosition  = pipe.offsetLeft;
  const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');

  pipe.style.animation = 'none';
  pipe.style.left = `${pipePosition}px`;

  mario.style.animation = 'none';
  mario.style.bottom = `${marioPosition}px`;

  // sprite de game over
  mario.src = 'game-over.png';
  mario.style.width = '110px';
  mario.style.marginLeft = '25px';

  try { sndOver.currentTime = 0; sndOver.play(); } catch {}

  finalScoreEl.textContent = `Sua pontuação: ${pontos}`;

  // salva e mostra ranking
  saveScore(playerName, pontos).then(() => {
    mostrarRanking();
  }).catch(() => {
    // mesmo se falhar, tenta mostrar ranking local
    mostrarRanking();
  });
}

function mostrarRanking() {
  gameScreen.classList.add("hidden");
  rankingScreen.classList.remove("hidden");

  listenRanking((lista) => renderRanking(lista));
}

function renderRanking(lista) {
  rankingList.innerHTML = "";
  (lista || []).forEach((item, idx) => {
    const li = document.createElement("li");
    // padroniza campos (firebase/localStorage)
    const nome  = item.nome ?? item.name ?? "Jogador";
    const pts   = item.pontos ?? item.score ?? 0;
    li.textContent = `${idx + 1}. ${nome} - ${pts}`;
    rankingList.appendChild(li);
  });
}

// ==========================
//  CLIMA (DIA/NOITE) + CHUVA
// ==========================
function toggleClima() {
  clima = (clima === 'day') ? 'night' : 'day';
  gameBoard.classList.remove('day','night');
  gameBoard.classList.add(clima);
}

function adicionarChuva() {
  // adiciona ~40 gotas, remove quando termina
  for (let i = 0; i < 40; i++) {
    const drop = document.createElement('div');
    drop.classList.add('rain');
    drop.style.left = Math.random() * window.innerWidth + 'px';
    drop.style.animationDuration = (0.5 + Math.random() * 0.7) + 's';
    gameBoard.appendChild(drop);
    drop.addEventListener('animationend', () => drop.remove());
  }
}

// Debug rápido pra saber se o JS está carregando
console.log("✅ script.js carregado.");
