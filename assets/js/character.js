// Internal imports
import {
  getCustomProperty,
  setCustomProperty,
  incrementCustomProperty,
} from "./updateCustomProperty.js";

// Global variables
let stopInactivityCheck = false;
const JUMP_SPEED = window.innerWidth > 768 ? 0.4 : 0.28;
const GRAVITY = window.innerWidth > 768 ? 0.0012 : 0.0007;

// Elements
const characterElem = document.querySelector("[data-character]");

// Variables
let isJumping;
let yVelocity;
let lastJumpTime = Date.now();
let inactivityTimeoutId = null;

// Setup character
const setupCharacter = () => {
  // Set variable initial values
  isJumping = false;
  yVelocity = 0;

  // Set custom properties
  if (window.innerWidth > 1024) {
    setCustomProperty(characterElem, "--bottom", 5.5);
  } else {
    setCustomProperty(characterElem, "--bottom", 3.5);
  }

  // Remove and add event listeners
  document.removeEventListener("keydown", onJump);
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") e.preventDefault();
  });

  // Universal mouse event blocking
  ["mousedown", "mouseup", "click", "pointerdown", "pointerup"].forEach((eventName) => {
    document.addEventListener(eventName, (e) => {
      if (!(e.pointerType === "touch")) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true); // capture phase
  });

  document.addEventListener("touchstart", (e) => {
    if (isJumping) return;
    lastJumpTime = Date.now();
    resetInactivityTimer();
    yVelocity = JUMP_SPEED;
    isJumping = true;
  });
  resetInactivityTimer();

  // Set character running image
  characterElem.src = "./assets/images/character-running.png";
  characterElem.style.transform = "scale(0.8)";
};

// Update character
const updateCharacter = (delta) => {
  handleRun();
  handleJump(delta);
};

// Get character rect
const getCharacterRect = () => {
  const rect = characterElem.getBoundingClientRect();
  const buffer = 10; // пиксели безопасности
  return {
    top: rect.top + buffer,
    bottom: rect.bottom - buffer,
    left: rect.left + buffer,
    right: rect.right - buffer,
    width: rect.width - buffer * 2,
    height: rect.height - buffer * 2,
  };
};

// Set character lose
const setCharacterLose = () => {
  characterElem.src = "./assets/images/character-standing.png";
  characterElem.style.transform = "scale(0.8)";
};

// Handle run
const handleRun = () => {
  // Check if jumping
  if (isJumping) {
    characterElem.src = "./assets/images/character-standing.png";
    characterElem.style.transform = "scale(0.8)";

    return;
  }
};

// Handle jump
const handleJump = (delta) => {
  // If not jumping return
  if (!isJumping) return;

  // Increment custom property
  incrementCustomProperty(characterElem, "--bottom", yVelocity * delta);

  // Check if the jump is finished
  if (window.innerWidth > 1024) {
    if (getCustomProperty(characterElem, "--bottom") <= 5.5) {
      setCustomProperty(characterElem, "--bottom", 5.5);

      isJumping = false;
      characterElem.src = "./assets/images/character-running.png";
      characterElem.style.transform = "scale(0.8)";
    }
  } else {
    if (getCustomProperty(characterElem, "--bottom") <= 5) {
      setCustomProperty(characterElem, "--bottom", 3.5);

      isJumping = false;
      characterElem.src = "./assets/images/character-running.png";
      characterElem.style.transform = "scale(0.8)";
    }
  }

  // Decrease y velocity
  yVelocity -= GRAVITY * delta;
};

// On jump
const onJump = (e) => {
  if (e.code !== "Space" || isJumping) return;

  lastJumpTime = Date.now();
  resetInactivityTimer();

  yVelocity = JUMP_SPEED;
  isJumping = true;
};

function resetInactivityTimer() {
  if (stopInactivityCheck) return;

  if (inactivityTimeoutId) clearTimeout(inactivityTimeoutId);
  inactivityTimeoutId = setTimeout(() => {
    if (stopInactivityCheck) return;
    if (Date.now() - lastJumpTime >= 4000) {
      location.reload();
    }
  }, 4000);
}

// Export
export {
  setupCharacter,
  updateCharacter,
  getCharacterRect,
  setCharacterLose,
  onJump,
  stopInactivityCheck,
};
