// Internal imports
import {
  setCustomProperty,
} from "./updateCustomProperty.js";

// Global constants
const JUMP_SPEED = window.innerWidth > 768 ? 0.4 : 0.28;
const GRAVITY = window.innerWidth > 768 ? 0.0012 : 0.0007;
const MIN_BOTTOM = window.innerWidth > 1024 ? 5.5 : 3.5;

// Elements
const characterElem = document.querySelector("[data-character]");

// Internal state (не доступен извне!)
let isJumping = false;
let yVelocity = 0;
let currentBottom = MIN_BOTTOM;

// Setup character
const setupCharacter = () => {
  isJumping = false;
  yVelocity = 0;
  currentBottom = MIN_BOTTOM;

  setCustomProperty(characterElem, "--bottom", currentBottom);

  document.removeEventListener("keydown", onJump);
  document.addEventListener("keydown", onJump);

  characterElem.src = "./assets/images/character-running.png";
  characterElem.style.transform = "scale(0.8)";
};

// Update per frame
const updateCharacter = (delta) => {
  if (isJumping) {
    handleJump(delta);
  }
};

// Jump logic
const handleJump = (delta) => {
  // Применяем вертикальную скорость
  currentBottom += yVelocity * delta;

  // Гравитация
  yVelocity -= GRAVITY * delta;

  // Приземление
  if (currentBottom <= MIN_BOTTOM) {
    currentBottom = MIN_BOTTOM;
    isJumping = false;
    yVelocity = 0;
    characterElem.src = "./assets/images/character-running.png";
  } else {
    characterElem.src = "./assets/images/character-standing.png";
  }

  setCustomProperty(characterElem, "--bottom", currentBottom);
};

// Обработчик прыжка
const onJump = (e) => {
  if (e.code !== "Space" || isJumping) return;

  yVelocity = JUMP_SPEED;
  isJumping = true;
};

// Получение прямоугольника (для коллизий и столкновений)
const getCharacterRect = () => {
  const rect = characterElem.getBoundingClientRect();
  const buffer = 10; // защита от мелких соприкосновений
  return {
    top: rect.top + buffer,
    bottom: rect.bottom - buffer,
    left: rect.left + buffer,
    right: rect.right - buffer,
    width: rect.width - buffer * 2,
    height: rect.height - buffer * 2,
  };
};

// Смерть персонажа
const setCharacterLose = () => {
  characterElem.src = "./assets/images/character-standing.png";
  characterElem.style.transform = "scale(0.8)";
};

// Export
export {
  setupCharacter,
  updateCharacter,
  getCharacterRect,
  setCharacterLose,
  onJump,
};