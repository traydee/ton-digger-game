// Internal imports
import { getCustomProperty, setCustomProperty, incrementCustomProperty } from "./updateCustomProperty.js";

// Breakpoint & ground
const DESKTOP_BP = 1024;
const IS_DESKTOP = window.innerWidth > DESKTOP_BP;
const GROUND_DESKTOP = 5.5;
const GROUND_MOBILE  = 3.5;
const GROUND_Y = IS_DESKTOP ? GROUND_DESKTOP : GROUND_MOBILE;

// Physics
const JUMP_SPEED = IS_DESKTOP ? 0.4 : 0.28;
const GRAVITY    = IS_DESKTOP ? 0.0012 : 0.0007;

// Elements
const characterElem = document.querySelector("[data-character]");

// State
let isJumping = false;
let yVelocity = 0;

// Setup character
const setupCharacter = () => {
  isJumping = false;
  yVelocity = 0;
  setCustomProperty(characterElem, "--bottom", GROUND_Y);

  // Перевешиваем keydown один раз
  document.removeEventListener("keydown", onJump);
  document.addEventListener("keydown", onJump, { passive: true });

  characterElem.src = "./assets/images/character-running.png";
  characterElem.style.transform = "scale(0.8)";
};

// Update character
const updateCharacter = (delta) => {
  handleRun();
  handleJump(delta);
};

// Collision rect с буфером
const getCharacterRect = () => {
  const rect = characterElem.getBoundingClientRect();
  const buffer = 10;
  const w = Math.max(0, rect.width  - buffer * 2);
  const h = Math.max(0, rect.height - buffer * 2);
  return {
    top: rect.top + buffer,
    bottom: rect.bottom - buffer,
    left: rect.left + buffer,
    right: rect.right - buffer,
    width: w,
    height: h,
  };
};

const setCharacterLose = () => {
  characterElem.src = "./assets/images/character-standing.png";
  characterElem.style.transform = "scale(0.8)";
};

const handleRun = () => {
  if (isJumping) {
    characterElem.src = "./assets/images/character-standing.png";
    characterElem.style.transform = "scale(0.8)";
    return;
  }
  // в состоянии бега картинка уже выставлена при приземлении
};

const handleJump = (delta) => {
  if (!isJumping) return;

  incrementCustomProperty(characterElem, "--bottom", yVelocity * delta);

  // ✔️ Фикс: приземляемся на реальную "землю" по брейкпоинту
  if (getCustomProperty(characterElem, "--bottom") <= GROUND_Y) {
    setCustomProperty(characterElem, "--bottom", GROUND_Y);
    isJumping = false;
    characterElem.src = "./assets/images/character-running.png";
    characterElem.style.transform = "scale(0.8)";
  }

  yVelocity -= GRAVITY * delta;
};

const onJump = (e) => {
  // Разрешим Space и ArrowUp
  const isKeyboard = e && (e.code === "Space" || e.code === "ArrowUp");
  const isSynthetic = e && e.code === "Space" && e.synthetic === true;
  if (!(isKeyboard || isSynthetic) || isJumping) return;

  yVelocity = JUMP_SPEED;
  isJumping = true;
};

// Export
export { setupCharacter, updateCharacter, getCharacterRect, setCharacterLose, onJump };

