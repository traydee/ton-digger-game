// Internal imports
import { setupBackground, updateBackground } from "./background.js";
import {
  setupBackgroundElement,
  updateBackgroundElement,
} from "./backgroundElement.js";
import { setupGround, updateGround } from "./ground.js";
import {
  setupCharacter,
  updateCharacter,
  getCharacterRect,
  setCharacterLose,
  onJump,
} from "./character.js";
import { setupObstacle, updateObstacle, getObstacleRects } from "./obstacle.js";
import { setupCoin, updateCoin, getCoinRects } from "./coin.js";
import { setupSerum, updateSerum, getSerumRects } from "./serum.js";

// Global variables
const API_BASE_URL = "https://webtop.site";
const SPEED_SCALE_INCREASE = 0.00001;
let AUDIO_MUTED = true;

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6CLTHnd6PG12cxjWPLLD
+3XpnYz6jgl4V99kJyeuluHZtTt6rsk5lR49NuXsRtnQpgGSOyhVia6TaJeAilZM
TZ3tW0C1QNbY5u2Tt5ELEEAQMXsBmBseVo2Sh7qvRhOtxXrxWwCeUTuF16j7DQ08
sgxAGkXT8zz7AWbBQzr9+ZXh+zgjtZ0pk3VdQ0XRKIk/IiQgub/cmkNn9YYYZfPi
9nXsOd3a+uqaxXJKRxGPXAAut94L05kFQHWrmVF4MUHWNthHesijLjjkk23OQ7UX
RiLsmEPh6e5QgeYAdUqoIUiH+GnEetOmcsBuWhPgFHMI1EDoHcS16hbgIUObl5f9
twIDAQAB
-----END PUBLIC KEY-----`;

const qsPlatform = new URLSearchParams(location.search).get('tgWebAppPlatform') || '';
const getPlatform = () =>
  (window.Telegram?.WebApp?.platform || qsPlatform || 'unknown').toLowerCase();

(function earlyWebTgBlock() {
  const qsPlat  = (new URLSearchParams(location.search).get('tgWebAppPlatform') || '').toLowerCase();
  const refIsWeb = /\/\/web\.telegram\.org\//i.test(document.referrer || '');
  const wa      = window.Telegram && window.Telegram.WebApp;
  const plat    = (wa?.platform || qsPlat || '').toLowerCase();
  const isWeb   = plat === 'weba' || plat === 'webk' || refIsWeb;

  if (!isWeb) return;

  let sealed = false;
  const seal = () => {
    if (sealed) return;
    sealed = true;
    try { document.body.style.overflow = 'hidden'; } catch {}
    try {
      document.documentElement.innerHTML =
        '<div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#000;color:#fff;text-align:center;padding:24px;font:16px/1.4 system-ui">Игра недоступна в веб-версии Telegram.</div>';
    } catch {}
  };

  const closeOnce = () => {
    try { wa?.ready?.(); } catch {}
    try { wa?.close?.(); } catch {}

    setTimeout(() => {
      if (sealed) return;
      try { wa?.openTelegramLink?.('https://t.me/webtop_racing_bot'); } catch {}
      try { window.location.replace('about:blank'); } catch {}
      try { window.stop?.(); } catch {}
      seal();
    }, 150);
  };

  let tries = 0;
  const iv = setInterval(() => {
    if (sealed) return clearInterval(iv);
    if (wa && !window.Telegram?.WebApp) { clearInterval(iv); return seal(); }
    closeOnce();
    if (++tries >= 3) clearInterval(iv);
  }, 200);

  const stop = () => { try { clearInterval(iv); } catch {} seal(); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); }, { once: true });
  window.addEventListener('pagehide',   stop, { once: true });
  window.addEventListener('beforeunload', stop, { once: true });
})();

// Elements
const worldElem = document.querySelector("[data-world]");
const gemScoreElem = document.querySelector("[data-gem-score]");
const serumCollectedElem = document.querySelector("[data-serum-collected]");
const secondScoreElem = document.querySelector("[data-second-score]");
const loseCoinsScoreElem = document.querySelector("[data-lose-coins-score]");
const loseSecondsScoreElem = document.querySelector(
  "[data-lose-seconds-score]"
);
const startScreenElem = document.querySelector("[data-start-screen]");
const loseScreenElem = document.querySelector("[data-lose-screen]");
const infoScreenElem = document.querySelector("[data-info-screen]");
const startBtn = document.querySelector("[data-start-btn]");
const restartBtn = document.querySelector("[data-restart-btn]");
const shareBtn = document.querySelector("[data-share-btn]");
const serumBtn = document.querySelector("[data-serum-btn]");
const soundBtn = document.querySelector("[data-sound-btn]");
const trophyBtn = document.querySelector("[data-trophy-btn]");
const trophyBtnBoard = document.querySelector("[data-trophy-btn-board]");
const infoBtn = document.querySelector("[data-info-btn]");
const infoScreenCloseBtn = document.querySelector(
  "[data-info-screen-close-btn]"
);
const leaderboardScreenElem = document.querySelector("[data-leaderboard-screen]");
const leaderboardCloseBtn = document.querySelector("[data-leaderboard-close-btn]");
const leaderboardList = document.querySelector("[data-leaderboard-list]");
const lifeScoreElem = document.querySelector('[data-life-score]');
const fetchLivesScreen = document.querySelector('[data-fetchLives-screen]');
const fetchLivesCloseBtn = document.querySelector('[data-fetchLives-close-btn]');
const fetchLivesContent = document.querySelector('[data-fetchLives-content]');
const fetchSubscriptionScreen   = document.querySelector('[data-fetchSubscriptionAndRender-screen]');
const fetchSubscriptionCloseBtn = document.querySelector('[data-fetchSubscriptionAndRender-close-btn]');
const fetchSubscriptionBtn      = document.querySelector('[data-fetchSubscriptionAndRender-btn]');

// Initially set pisel to world scale
setPixelToWorldScale();

// Variables
let lastTime;
let speedScale;
let coinsScore;
let serumCollected;
let secondsScore;
let gameStarted = false;

// Loader
window.addEventListener("load", () => {
  document.querySelector(".loader").classList.add("loaded");
});

// Initial event listeners
window.addEventListener("resize", setPixelToWorldScale);

// Audios
const backgroundMusicAudio = new Audio("./assets/audios/background-music.mp3");
backgroundMusicAudio.loop = true;

const gameOverAudio = new Audio("./assets/audios/game-over.mp3");
const coinCollectedAudio = new Audio("./assets/audios/coin-collected.mp3");
const jumpAudio = new Audio("./assets/audios/jump.mp3");

// Event listeners
document.querySelectorAll("button").forEach((button) => {
  button.addEventListener("keyup", (e) => {
    e.preventDefault();
  });
});

// Соглашение 18+
const checkbox = document.getElementById("agree18");
// Следим за изменением состояния галочки
checkbox.addEventListener("change", () => {
  startBtn.disabled = !checkbox.checked;
});

startBtn.addEventListener("click", async () => {
  const checkbox = document.getElementById("agree18");
  if (!checkbox.checked) return;

  const okSub = await fetchSubscriptionAndRender();
  if (!okSub) return;

  startBtn.disabled = true;
  const lives = await fetchLivesAndRender();

  // Пытаемся зафиксировать ориентацию на портретной
  if (screen.orientation && screen.orientation.lock) {
    try {
      await screen.orientation.lock("portrait");
    } catch (e) {
      // Игнорируем ошибку, если браузер не поддерживает
    }
  }

  if (!Number.isFinite(lives) || lives <= 0) {
    startBtn.disabled = false; // остаёмся на старте
    return;
  }

  if (!gameStarted) {
    gameStarted = true;
    handleStart();
  }
  startBtn.disabled = false;
});


restartBtn.addEventListener("click", async () => {
  if (gameStarted) return;

  const checkbox = document.getElementById("agree18");
  if (checkbox && !checkbox.checked) return;

  const okSub = await fetchSubscriptionAndRender();
  if (!okSub) return;

  restartBtn.disabled = true;

  const lives = await fetchLivesAndRender();
  if (!Number.isFinite(lives) || lives <= 0) {
    restartBtn.disabled = false; // остаёмся на экране проигрыша
    return;
  }

  gameStarted = true;
  handleStart();

  restartBtn.disabled = false;
});

shareBtn.addEventListener("click", () => {
  window.open(
    `https://twitter.com/intent/tweet?text=I've played Ton Mole Game! @Ton_mole %0aGems Collected: ${Math.floor(
      coinsScore
    )} %0aSurvived: ${Math.floor(secondsScore)}s %0aIt's your turn now 🔥`,
    "_blank"
  );
});

serumBtn.addEventListener("click", () => {
  if (gameStarted) {
    if (serumCollected > 0) {
      serumCollected--;

      document.querySelectorAll("[data-obstacle]").forEach((obstacle) => {
        obstacle.remove();
      });

      serumCollectedElem.textContent = `${Math.floor(serumCollected)}`;

      if (serumCollected < 1) {
        serumBtn.classList.remove("active");
      }
    }
  }
});

soundBtn.addEventListener("click", () => {
  // Updated audio muted variable
  AUDIO_MUTED = !AUDIO_MUTED;

  // Play pause audios
  if (AUDIO_MUTED) {
    backgroundMusicAudio.pause();
  } else {
    backgroundMusicAudio.play();
  }

  // Toggle sound btn image
  if (AUDIO_MUTED) {
    soundBtn.innerHTML =
      '<img src="./assets/images/btn-sound-off.png" alt="" />';
  } else {
    soundBtn.innerHTML = '<img src="./assets/images/btn-sound.png" alt="" />';
  }
});


function openLeaderboard() {
  leaderboardScreenElem.classList.remove("hide");
  leaderboardList.innerHTML = "<li>Загрузка...</li>";

  fetch(`${API_BASE_URL}/api/leaderboard/`)
    .then(response => {
      if (!response.ok) throw new Error("Ошибка: " + response.status);
      return response.json();
    })
    .then(data => {
      leaderboardList.innerHTML = "";
      if (!data || data.length === 0) {
        leaderboardList.innerHTML = `
          <li>Пока никого нет</li>
          <li style="color: #b44;">⚠️ Сервер вернул пустой список</li>
        `;
        return;
      }
      data.forEach((entry, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${entry.first_name} (${entry.username}) — ${entry.max_seconds}s`;
        li.style.color = "#fff";
        leaderboardList.appendChild(li);
      });
    })
    .catch(error => {
      leaderboardList.innerHTML = `
        <li>Пока никого нет</li>
        <li style="color: #b44;">⚠️ Сервер недоступен</li>
      `;
      console.error("Ошибка запроса /api/leaderboard/:", error);
    });
}

// навешиваем обработчики на обе кнопки
trophyBtn?.addEventListener("click", openLeaderboard);
trophyBtnBoard?.addEventListener("click", openLeaderboard);

leaderboardCloseBtn.addEventListener("click", () => {
  leaderboardScreenElem.classList.add("hide");
});

fetchLivesCloseBtn.addEventListener("click", () => {
  hideNoLivesModal();
});

infoBtn.addEventListener("click", () => {
  infoScreenElem.classList.remove("hide");
});

infoScreenCloseBtn.addEventListener("click", () => {
  infoScreenElem.classList.add("hide");
});

document.addEventListener("keydown", (e) => {
  e.preventDefault();

  if (e.code !== "Tab") return;

  if (gameStarted) {
    if (serumCollected > 0) {
      serumCollected--;

      document.querySelectorAll("[data-obstacle]").forEach((obstacle) => {
        obstacle.remove();
      });

      serumCollectedElem.textContent = `${Math.floor(serumCollected)}`;

      if (serumCollected < 1) {
        serumBtn.classList.remove("active");
      }
    }
  }
});

document.addEventListener("keydown", (e) => {
  if (e.code !== "KeyM") return;

  // Updated audio muted variable
  AUDIO_MUTED = !AUDIO_MUTED;

  // Play pause audios
  if (AUDIO_MUTED) {
    backgroundMusicAudio.pause();
  } else {
    backgroundMusicAudio.play();
  }

  // Toggle sound btn image
  if (AUDIO_MUTED) {
    soundBtn.innerHTML =
      '<img src="./assets/images/btn-sound-off.png" alt="" />';
  } else {
    soundBtn.innerHTML = '<img src="./assets/images/btn-sound.png" alt="" />';
  }
});

document.addEventListener("keydown", (e) => {
  if (e.code !== "Space") return;

  if (gameStarted) {
    // Play jump audio
    if (!AUDIO_MUTED) {
      jumpAudio.play();
    }
  }
});

// Update
function update(time) {
  if (gameStarted) {
    // Check if the last time is null
    if (lastTime === null) {
      lastTime = time;

      window.requestAnimationFrame(update);

      return;
    }

    // Delta
    const delta = time - lastTime;

    // Updates
    updateBackground(delta, speedScale);
    updateBackgroundElement(delta, speedScale);
    updateGround(delta, speedScale);
    updateCharacter(delta);
    updateObstacle(delta, speedScale);
    updateCoin(delta, speedScale);
    updateSerum(delta, speedScale);
    updateSpeedScale(delta);
    updateSecondsScore(delta);

    // Check lose
    if (checkLose()) return handleLose();

    // Check coin collected
    if (checkCoinCollected()) {
      handleCoinCollected();
    }

    // Check serum collected
    if (checkSerumCollected()) {
      handleSerumCollected();
    }

    // Set variable initial values
    lastTime = time;

    // Check serum collected
    if (serumCollected > 0) {
      serumBtn.classList.add("active");
    } else {
      serumBtn.classList.remove("active");
    }

    // Request animation frame
    window.requestAnimationFrame(update);
  }
}

// Check lose
const checkLose = () => {
  const characterRect = getCharacterRect();

  return getObstacleRects().some((rect) => isCollision(rect, characterRect));
};

// Is collision
const isCollision = (rect1, rect2) => {
  return (
    rect1.left < rect2.right &&
    rect1.top < rect2.bottom &&
    rect1.right > rect2.left &&
    rect1.bottom > rect2.top
  );
};

// Check coin collected
const checkCoinCollected = () => {
  const characterRect = getCharacterRect();

  return getCoinRects().some((rect) => isCoinCollected(rect, characterRect));
};

// Is coin collected
const isCoinCollected = (rect1, rect2) => {
  return (
    rect1.left < rect2.right &&
    rect1.top < rect2.bottom &&
    rect1.right > rect2.left &&
    rect1.bottom > rect2.top
  );
};

// Check serum collected
const checkSerumCollected = () => {
  const characterRect = getCharacterRect();

  return getSerumRects().some((rect) => isSerumCollected(rect, characterRect));
};

// Is serum collected
const isSerumCollected = (rect1, rect2) => {
  return (
    rect1.left < rect2.right &&
    rect1.top < rect2.bottom &&
    rect1.right > rect2.left &&
    rect1.bottom > rect2.top
  );
};

// Update speed scale
function updateSpeedScale(delta) {
  speedScale += delta * SPEED_SCALE_INCREASE;
}

// Update seconds score
function updateSecondsScore(delta) {
  secondsScore += delta * 0.001;

  secondScoreElem.textContent = Math.floor(secondsScore);
}

// Handle start
function handleStart() {
  if (gameStarted) {
    // Play background music audio
    if (!AUDIO_MUTED) {
      backgroundMusicAudio.play();
    }

    // Prepare audios
    gameOverAudio.play();
    gameOverAudio.pause();
    coinCollectedAudio.play();
    coinCollectedAudio.pause();
    jumpAudio.play();
    jumpAudio.pause();

    // Update variables
    lastTime = null;
    speedScale = 1;
    coinsScore = 0;
    serumCollected = 0;
    secondsScore = 0;

    // To reset coins score in DOM
    gemScoreElem.textContent = Math.floor(coinsScore);

    // To reset serum collected in DOM
    serumBtn.classList.remove("active");
    serumCollectedElem.textContent = `${Math.floor(serumCollected)}`;

    // Setups
    setupBackground();
    setupBackgroundElement();
    setupGround();
    setupCharacter();
    setupObstacle();
    setupCoin();
    setupSerum();

    // Add hide class to start and lose screen element
    startScreenElem.classList.add("hide");
    loseScreenElem.classList.add("hide");

    // Request animation frame
    window.requestAnimationFrame(update);

    // Request full screen
    const documentElem = document.documentElement;

    if (documentElem.requestFullscreen) {
      documentElem.requestFullscreen();
    } else if (documentElem.msRequestFullscreen) {
      documentElem.msRequestFullscreen();
    } else if (documentElem.mozRequestFullScreen) {
      documentElem.mozRequestFullScreen();
    } else if (documentElem.webkitRequestFullscreen) {
      documentElem.webkitRequestFullscreen();
    }
  }
}

// Handle lose
const handleLose = () => {
  gameStarted = false;

  if (!AUDIO_MUTED) {
    gameOverAudio.play();
  }

  setCharacterLose();

  // Получаем Telegram ID (если WebApp)
  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const telegramId = telegramUser?.id;
  // const telegramId = 5744864118;

  // Отправляем результаты, если есть telegram_id
  if (telegramId) {
    // после записи сессии обновим жизни
    sendGameSession(telegramId, secondsScore)
      .finally(() => fetchLivesAndRender());
  } else {
    console.warn("Telegram WebApp не доступен или пользователь не найден");
    fetchLivesAndRender();
  }

  setTimeout(() => {
    loseCoinsScoreElem.textContent = `Gems Used: ${Math.floor(coinsScore)}`;
    loseSecondsScoreElem.textContent = `Survived: ${Math.floor(secondsScore)}s`;
    loseScreenElem.classList.remove("hide");
  }, 100);
};

// Handle coin collected
const handleCoinCollected = () => {
  // Play coin collected audio
  if (!AUDIO_MUTED) {
    coinCollectedAudio.play();
  }

  // Remove all other coins from DOM
  document.querySelectorAll("[data-coin]").forEach((coin) => coin.remove());

  // Update coins score
  coinsScore++;

  gemScoreElem.textContent = Math.floor(coinsScore);
};

// Handle serum collected
const handleSerumCollected = () => {
  // Play serum collected audio
  if (!AUDIO_MUTED) {
    coinCollectedAudio.play();
  }

  // Remove all other serum from DOM
  document.querySelectorAll("[data-serum]").forEach((serum) => serum.remove());

  // Update serum collected
  serumCollected++;

  serumCollectedElem.textContent = `${Math.floor(serumCollected)}`;

  serumBtn.classList.add("active");
};

// Set pixel to world scale
function setPixelToWorldScale() {
  worldElem.style.width = "100vw";
  worldElem.style.height = "100svh";
}

// Set body height
const setBodyHeight = () => {
  document.querySelector("body").style.minHeight = window.innerHeight + "px";
};

// Check device width
let deviceWidth = window.matchMedia("(max-width: 1024px)");

if (deviceWidth.matches) {
  // Event listeners
  window.addEventListener("resize", setBodyHeight);

  // Set height
  setBodyHeight();
}

function getInitData() {
  return window.Telegram?.WebApp?.initData || "";
}

function encryptData(data) {
  const jsEncrypt = new JSEncrypt();
  jsEncrypt.setPublicKey(publicKey);
  return jsEncrypt.encrypt(JSON.stringify(data));
}

async function sendGameSession(telegramId, duration) {
  const platform  = getPlatform();
  const payload = {
    telegram_id: telegramId,
    duration_seconds: Math.floor(duration),
    timestamp: Date.now(),
    nonce: crypto.randomUUID(),
  };

  const encrypted = encryptData(payload);

  const response = await fetch(`${API_BASE_URL}/api/game_session/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'x-tg-platform': platform
    },
    body: JSON.stringify({ data: encrypted }),
  });

  const res = await response.json();
  console.log(res);
}

async function fetchLivesAndRender() {
  const init_data = getInitData();
  const platform  = getPlatform();

  try {
    const res = await fetch(`${API_BASE_URL}/api/get_lives/`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'x-tg-platform': platform },
      body: JSON.stringify({ init_data })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Ожидаем { lives: number }
    const lives = Number(data?.lives ?? 0);
    lifeScoreElem.textContent = lives;

    if (!Number.isFinite(lives) || lives <= 0) {
      showNoLivesModal();
    } else {
      hideNoLivesModal();
    }

    return lives;
  } catch (err) {
    console.error("Не удалось получить жизни:", err);
    lifeScoreElem.textContent = "0"; // или "—"
    showNoLivesModal();
    return 0;
  }
}

function showNoLivesModal() {
  if (!fetchLivesScreen) return;

  if (fetchLivesContent) fetchLivesContent.innerHTML = html;

  fetchLivesScreen.classList.remove('hide');
  document.body.style.overflow = 'hidden';
  if (typeof startBtn !== 'undefined' && startBtn) startBtn.disabled = true;

  // повесь свою логику:
  const inviteBtn = document.getElementById('fetchLivesInvite');
  const tasksBtn  = document.getElementById('fetchLivesTasks');
  if (inviteBtn) inviteBtn.onclick = () => { /* TODO */ };
  if (tasksBtn)  tasksBtn.onclick  = () => { /* TODO */ };
}

function hideNoLivesModal() {
  if (!fetchLivesScreen) return;
  fetchLivesScreen.classList.add('hide');
  document.body.style.overflow = '';

  const checkbox = document.getElementById('agree18');
  if (typeof startBtn !== 'undefined' && startBtn) {
    startBtn.disabled = !(checkbox && checkbox.checked);
  }
}

// document.addEventListener("DOMContentLoaded", fetchLivesAndRender);
document.addEventListener('DOMContentLoaded', async () => {
  const okSub = await fetchSubscriptionAndRender();
  if (okSub) await fetchLivesAndRender();
});

document.querySelectorAll(".fetchLives-btn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    e.preventDefault();

    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!tgUser || !tgUser.id) return;

    const link = `https://t.me/webtop_racing_bot?start=${tgUser.id}`;
    const comment = `Привет! Заходи в игру WEBCAM-RACING, выигрывай денежные призы и бесплатное продвижение на Stripchat, Chaturbate, бесплатные лайки Chaturbate и курс от ТОП модели!`;

    const shareLink = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(comment)}`;
    window.Telegram.WebApp.openTelegramLink(shareLink);
  });
});

async function fetchSubscriptionAndRender() {
  const init_data = getInitData();
  const platform  = getPlatform();

  try {
    const res = await fetch(`${API_BASE_URL}/api/check_subscription/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tg-platform': platform },
      body: JSON.stringify({ init_data }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const isSubscribed = Boolean(data?.is_subscribed);
    // const isSubscribed = true;
    if (!isSubscribed) {
      showNoSubscriptionModal();
    } else {
      hideNoSubscriptionModal();
    }
    return isSubscribed;
  } catch (err) {
    console.error('Не удалось проверить подписку:', err);
    showNoSubscriptionModal();
    return false;
  }
}

function showNoSubscriptionModal() {
  if (!fetchSubscriptionScreen) {
    alert('Сначала подпишитесь в Telegram, затем вернитесь и нажмите «Я подписался».');
    return;
  }
  fetchSubscriptionScreen.classList.remove('hide');
  document.body.style.overflow = 'hidden';
  if (typeof startBtn !== 'undefined' && startBtn) startBtn.disabled = true;
}

function hideNoSubscriptionModal() {
  if (!fetchSubscriptionScreen) return;
  fetchSubscriptionScreen.classList.add('hide');
  document.body.style.overflow = '';

  const checkbox = document.getElementById('agree18');
  if (typeof startBtn !== 'undefined' && startBtn) {
    startBtn.disabled = !(checkbox && checkbox.checked);
  }
}

fetchSubscriptionCloseBtn?.addEventListener('click', () => {
  hideNoSubscriptionModal();
});

fetchSubscriptionBtn?.addEventListener('click', async () => {
  const ok = await fetchSubscriptionAndRender();
  if (ok) hideNoSubscriptionModal();
});

fetchSubscriptionBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  const tg = window.Telegram?.WebApp;
  const url = `https://t.me/webtop_racing_bot?start=`;

  if (tg?.openTelegramLink) {
    tg.openTelegramLink(url); 
  } else {
    window.open(url, '_blank'); 
  }
});

(function () {
  const blocker = document.getElementById('access-blocker');
  const allowTablet = new URLSearchParams(location.search).get('allowTablet') === '1';

  const qsPlatform = (new URLSearchParams(location.search).get('tgWebAppPlatform') || '').toLowerCase();
  const refIsWeb   = /\/\/web\.telegram\.org\//i.test(document.referrer || '');

  function isTablet() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isIpad = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroidTablet = /Android/.test(ua) && !/Mobile/.test(ua);
    const isGenericTablet = /Tablet|PlayBook/.test(ua);
    const bigTouch = ('ontouchstart' in window) && Math.min(screen.width, screen.height) >= 768;
    return (isIpad || isAndroidTablet || isGenericTablet || bigTouch) && !/Mobile/.test(ua);
  }

  function isTelegramWeb() {
    const wa = window.Telegram?.WebApp;
    const platform = (wa?.platform || qsPlatform || '').toLowerCase();
    return platform === 'weba' || platform === 'webk' || refIsWeb;
  }

  function applyAccessState() {
    const isLandscape = window.matchMedia('(orientation: landscape)').matches;
    const tablet = !allowTablet && isTablet();
    const webTG  = isTelegramWeb();          

    const shouldBlock = tablet || isLandscape || webTG; 
    blocker.style.display = shouldBlock ? 'flex' : 'none';
    // Make the blocker unremovable through devtools
    if (shouldBlock) {
      blocker.setAttribute("style", "display: flex !important;");
      Object.freeze(blocker.style);
      const observer = new MutationObserver(() => {
        blocker.setAttribute("style", "display: flex !important;");
      });
      observer.observe(blocker, { attributes: true, attributeFilter: ['style'] });
    }
    document.documentElement.style.overflow = shouldBlock ? 'hidden' : '';
    document.body.style.overflow = shouldBlock ? 'hidden' : '';

    blocker.textContent = webTG
      ? 'Игра недоступна в веб-версии Telegram.'
      : (tablet
          ? 'Игра недоступна на планшетах 🙏'
          : 'Поверните устройство в портретный режим 📱');

    if (typeof startBtn !== 'undefined' && startBtn) {
      const agree = document.getElementById('agree18');
      startBtn.disabled = shouldBlock || !(agree && agree.checked);
    }
  }

  const t0 = Date.now();
  const int = setInterval(() => {
    applyAccessState();
    if (window.Telegram?.WebApp || Date.now() - t0 > 2000) clearInterval(int);
  }, 100);

  window.addEventListener('orientationchange', applyAccessState);
  window.addEventListener('resize', applyAccessState);
  applyAccessState();
})();

// Detect tab change
$(window).blur(function () {
  if (gameStarted) return handleLose();
});

$(".world").click(function () {
  if (window.innerWidth <= 768) {
    if (gameStarted) {
      // Play jump audio
      if (!AUDIO_MUTED) {
        jumpAudio.play();
      }

      onJump({ code: "Space" });
    }
  }
});
