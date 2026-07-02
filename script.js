/* =========================================================================
   PROPOSAL SITE — SCRIPT
   Sections: 1. Background hearts & sparkles  2. "No" button dodge game
             3. "Yes" button → reveal answer scene  4. Confetti burst
             5. Floating heart explosion  6. Music toggle
   ========================================================================= */

/* ---------- 1. AMBIENT BACKGROUND: FLOATING HEARTS + SPARKLES ---------- */

const HEART_EMOJIS = ['❤️', '💕', '💗', '💖', '💓'];

function createFloatingHeart(container){
  const heart = document.createElement('span');
  heart.className = 'float-heart';
  heart.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];

  const startLeft = Math.random() * 100; // vw
  const size = 14 + Math.random() * 22; // px
  const duration = 10 + Math.random() * 10; // seconds, slow & gentle
  const delay = Math.random() * 12;
  const drift = (Math.random() * 80 - 40) + 'px';

  heart.style.left = startLeft + 'vw';
  heart.style.fontSize = size + 'px';
  heart.style.animationDuration = duration + 's';
  heart.style.animationDelay = delay + 's';
  heart.style.setProperty('--drift', drift);

  container.appendChild(heart);
}

function createSparkle(container){
  const sparkle = document.createElement('span');
  sparkle.className = 'sparkle';
  sparkle.style.left = Math.random() * 100 + 'vw';
  sparkle.style.top = Math.random() * 100 + 'vh';
  sparkle.style.animationDelay = (Math.random() * 3) + 's';
  sparkle.style.animationDuration = (2 + Math.random() * 2.4) + 's';
  container.appendChild(sparkle);
}

function initAmbientBackground(){
  const heartsContainer = document.getElementById('bgHearts');
  const sparklesContainer = document.getElementById('bgSparkles');

  const heartCount = window.innerWidth < 600 ? 14 : 24;
  for (let i = 0; i < heartCount; i++) createFloatingHeart(heartsContainer);

  const sparkleCount = window.innerWidth < 600 ? 20 : 35;
  for (let i = 0; i < sparkleCount; i++) createSparkle(sparklesContainer);

  // keep replenishing hearts as their animation cycles finish, for endless drift
  setInterval(() => {
    if (heartsContainer.childElementCount < heartCount + 6){
      createFloatingHeart(heartsContainer);
    }
  }, 2200);
}

initAmbientBackground();


/* ---------- 2. THE "NO" BUTTON DODGE GAME ---------- */

const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const buttonRow = document.getElementById('buttonRow');
const dodgeHint = document.getElementById('dodgeHint');

let dodgeAttempts = 0;
let yesScale = 1;
const MAX_YES_SCALE = 2.1;

const hints = [
  "Nice try 😏",
  "Not so fast!",
  "Getting shy, huh?",
  "You almost had it!",
  "Keep trying... or just say yes 💕",
  "It really doesn't want to be clicked.",
  "Okay this is getting silly 😂",
];

// Returns a random on-screen position that keeps the button fully visible.
function getRandomPosition(elWidth, elHeight){
  const padding = 16;
  const maxX = Math.max(padding, window.innerWidth - elWidth - padding);
  const maxY = Math.max(padding, window.innerHeight - elHeight - padding);
  const x = padding + Math.random() * (maxX - padding);
  const y = padding + Math.random() * (maxY - padding);
  return { x, y };
}

function dodge(){
  dodgeAttempts++;

  const rect = noBtn.getBoundingClientRect();

  // first dodge: switch the button to fixed positioning so it can roam freely
  if (!noBtn.classList.contains('dodging')){
    noBtn.classList.add('dodging');
    noBtn.style.left = rect.left + 'px';
    noBtn.style.top = rect.top + 'px';
  }

  // grow the Yes button a little more with every failed attempt
  yesScale = Math.min(MAX_YES_SCALE, 1 + dodgeAttempts * 0.14);
  yesBtn.style.transform = `scale(${yesScale})`;

  // attempt 3: shrink slightly
  let extraScale = 1;
  if (dodgeAttempts === 3) extraScale = 0.85;
  if (dodgeAttempts >= 4) extraScale = Math.max(0.55, 0.85 - (dodgeAttempts - 3) * 0.06);

  // speed increases with attempts (faster reposition transition)
  const speed = Math.max(0.1, 0.32 - dodgeAttempts * 0.03);
  noBtn.style.transition = `left ${speed}s cubic-bezier(.2,.8,.2,1), top ${speed}s cubic-bezier(.2,.8,.2,1), transform 0.25s ease`;

  // after enough attempts, the button flees off-screen for good
  if (dodgeAttempts >= 7){
    flyAway();
    return;
  }

  const { x, y } = getRandomPosition(noBtn.offsetWidth, noBtn.offsetHeight);
  noBtn.style.left = x + 'px';
  noBtn.style.top = y + 'px';
  noBtn.style.transform = `scale(${extraScale})`;

  dodgeHint.textContent = hints[Math.min(dodgeAttempts - 1, hints.length - 1)];
}

function flyAway(){
  noBtn.classList.add('fly-away');
  const flyX = Math.random() > 0.5 ? window.innerWidth + 200 : -300;
  const flyY = -300 - Math.random() * 200;
  noBtn.style.left = flyX + 'px';
  noBtn.style.top = flyY + 'px';
  noBtn.style.transform = 'scale(0.3) rotate(720deg)';
  dodgeHint.textContent = "The 'No' button ran away for good 😆 Guess it's a yes!";

  yesBtn.style.transform = `scale(${MAX_YES_SCALE})`;

  setTimeout(() => { noBtn.style.display = 'none'; }, 750);
}

// Works for both mouse (desktop) and touch (mobile) — pointer events cover both.
noBtn.addEventListener('pointerenter', (e) => {
  // On touch devices "enter" doesn't fire meaningfully before a tap, so this
  // mainly powers the desktop "dodge before you even click" behaviour.
  if (e.pointerType === 'mouse') dodge();
});
noBtn.addEventListener('click', (e) => {
  e.preventDefault();
  dodge();
});
noBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  dodge();
}, { passive: false });


/* ---------- 3. THE "YES" BUTTON: REVEAL THE ANSWER SCENE ---------- */

const questionScene = document.getElementById('questionScene');
const answerScene = document.getElementById('answerScene');

yesBtn.addEventListener('click', () => {
  celebrate();
});

function celebrate(){
  document.body.classList.add('celebrate');

  // fade the question away, then bring in the answer scene
  questionScene.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  questionScene.style.opacity = '0';
  questionScene.style.transform = 'scale(0.96)';

  setTimeout(() => {
    questionScene.hidden = true;
    answerScene.hidden = false;
    requestAnimationFrame(() => {
      revealBlocksInSequence();
    });
  }, 550);

  launchConfetti();
  launchHeartBurst();
}

// Reveals each message block one-by-one with a gentle fade + rise.
function revealBlocksInSequence(){
  const blocks = Array.from(document.querySelectorAll('.reveal-block'))
    .sort((a, b) => Number(a.dataset.order) - Number(b.dataset.order));

  blocks.forEach((block, i) => {
    setTimeout(() => {
      block.classList.add('is-visible');
    }, i * 900);
  });
}


/* ---------- 4. CONFETTI BURST (canvas) ---------- */

const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');
let confettiPieces = [];
let confettiAnimId = null;

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const CONFETTI_COLORS = ['#ff8fb3', '#e8688f', '#f3dcae', '#e3bd77', '#ffffff', '#ffd3e2'];

function launchConfetti(){
  const pieceCount = window.innerWidth < 600 ? 90 : 160;
  confettiPieces = [];

  for (let i = 0; i < pieceCount; i++){
    confettiPieces.push({
      x: canvas.width / 2 + (Math.random() * 400 - 200),
      y: canvas.height * 0.35 + (Math.random() * 100 - 50),
      vx: (Math.random() - 0.5) * 12,
      vy: -(Math.random() * 12 + 6),
      size: 6 + Math.random() * 6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 14,
      shape: Math.random() > 0.5 ? 'rect' : 'heart',
      gravity: 0.35 + Math.random() * 0.15,
      life: 0,
    });
  }

  if (!confettiAnimId) animateConfetti();
}

function drawConfettiHeart(x, y, size, color, rotation){
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.fillStyle = color;
  ctx.beginPath();
  const s = size / 2;
  ctx.moveTo(0, s);
  ctx.bezierCurveTo(-s, -s * 0.4, -s * 0.2, -s, 0, -s * 0.2);
  ctx.bezierCurveTo(s * 0.2, -s, s, -s * 0.4, 0, s);
  ctx.fill();
  ctx.restore();
}

function animateConfetti(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let stillAlive = false;

  confettiPieces.forEach((p) => {
    p.vy += p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.rotationSpeed;
    p.life++;

    if (p.y < canvas.height + 40 && p.life < 480){
      stillAlive = true;
      if (p.shape === 'heart'){
        drawConfettiHeart(p.x, p.y, p.size, p.color, p.rotation);
      } else {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
    }
  });

  if (stillAlive){
    confettiAnimId = requestAnimationFrame(animateConfetti);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiAnimId = null;
  }
}


/* ---------- 5. FLOATING HEART EXPLOSION ---------- */

function launchHeartBurst(){
  const container = document.getElementById('bgHearts');
  const burstCount = window.innerWidth < 600 ? 24 : 40;

  for (let i = 0; i < burstCount; i++){
    setTimeout(() => {
      const heart = document.createElement('span');
      heart.className = 'float-heart';
      heart.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
      heart.style.left = Math.random() * 100 + 'vw';
      heart.style.fontSize = (16 + Math.random() * 26) + 'px';
      heart.style.animationDuration = (5 + Math.random() * 5) + 's';
      heart.style.animationDelay = '0s';
      heart.style.setProperty('--drift', (Math.random() * 120 - 60) + 'px');
      heart.style.opacity = '0.85';
      container.appendChild(heart);

      // clean up after the animation finishes so the DOM doesn't grow forever
      heart.addEventListener('animationend', () => heart.remove());
    }, i * 60);
  }
}


/* ---------- 6. MUSIC TOGGLE ---------- */

const musicBtn = document.getElementById('musicBtn');
const bgMusic = document.getElementById('bgMusic');
const musicLabel = musicBtn.querySelector('.music-label');
const musicIcon = musicBtn.querySelector('.music-icon');

let isPlaying = false;

musicBtn.addEventListener('click', () => {
  if (!isPlaying){
    bgMusic.play().then(() => {
      isPlaying = true;
      musicBtn.classList.add('playing');
      musicLabel.textContent = 'Pause Music';
      musicIcon.textContent = '🎶';
    }).catch(() => {
      // Autoplay/file restrictions — let the person know gently instead of failing silently.
      musicLabel.textContent = 'Add music/song.mp3';
    });
  } else {
    bgMusic.pause();
    isPlaying = false;
    musicBtn.classList.remove('playing');
    musicLabel.textContent = 'Play Music';
    musicIcon.textContent = '🎵';
  }
});
