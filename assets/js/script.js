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
const SPEED_SCALE_INCREASE = 0.00001;
let AUDIO_MUTED = true;

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
const infoBtn = document.querySelector("[data-info-btn]");
const infoScreenCloseBtn = document.querySelector(
  "[data-info-screen-close-btn]"
);
const leaderboardScreenElem = document.querySelector("[data-leaderboard-screen]");
const leaderboardCloseBtn = document.querySelector("[data-leaderboard-close-btn]");
const leaderboardList = document.querySelector("[data-leaderboard-list]");
const lifeScoreElem = document.querySelector('[data-life-score]');

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

startBtn.addEventListener("click", () => {
  if (!gameStarted) {
    // Make game started true
    gameStarted = true;

    // Handle start
    handleStart();
  }
});

restartBtn.addEventListener("click", () => {
  if (!gameStarted) {
    // Make game started true
    gameStarted = true;

    // Handle start
    handleStart();
  }
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

trophyBtn.addEventListener("click", async () => {
  leaderboardScreenElem.classList.remove("hide");
  leaderboardList.innerHTML = "<li>Загрузка...</li>";

  try {
    const response = await fetch("http://212.67.10.158:1234/api/leaderboard/");
    if (!response.ok) throw new Error("Ошибка: " + response.status);

    const data = await response.json();

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
  } catch (error) {
    leaderboardList.innerHTML = `
      <li>Пока никого нет</li>
      <li style="color: #b44;">⚠️ Сервер недоступен</li>
    `;
    console.error("Ошибка запроса /api/leaderboard/:", error);
  }
});

leaderboardCloseBtn.addEventListener("click", () => {
  leaderboardScreenElem.classList.add("hide");
});

// Закрытие по кнопке "✖"
leaderboardCloseBtn.addEventListener("click", () => {
  leaderboardScreenElem.classList.add("hide");
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
  // const telegramId = telegramUser?.id;
  const telegramId = 5744864118;

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
  return window.Telegram?.WebApp?.initData || "5744864118";
}

function sendGameSession(telegramId, secondsScore) {
  return fetch("http://212.67.10.158:1234/api/game_session/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      telegram_id: telegramId,
      duration_seconds: Math.floor(secondsScore),
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ошибка отправки: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Сессия успешно сохранена:", data);
    })
    .catch((error) => {
      console.error("Ошибка при отправке сессии:", error);
    });
}

async function fetchLivesAndRender() {
  const init_data = getInitData();

  try {
    const res = await fetch("http://212.67.10.158:1234/api/get_lives/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ init_data }) // как «у проверки подписки»
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Ожидаем { lives: number }
    const lives = Number(data?.lives ?? 0);
    lifeScoreElem.textContent = lives;
  } catch (err) {
    console.error("Не удалось получить жизни:", err);
    lifeScoreElem.textContent = "0"; // или "—"
  }
}

document.addEventListener("DOMContentLoaded", fetchLivesAndRender);

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
