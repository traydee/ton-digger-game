// Internal imports
import {
  getCustomProperty,
  setCustomProperty,
  incrementCustomProperty,
} from "./updateCustomProperty.js";

// Global variables
const SPEED = window.innerWidth > 768 ? 0.05 : 0.075;
const SERUM_INTERVAL_MIN = 5000;
const SERUM_INTERVAL_MAX = 10000;

// Elements
const worldElem = document.querySelector("[data-world]");

// Variables
let nextSerumTime;

// Setup serum
const setupSerum = () => {
  nextSerumTime = SERUM_INTERVAL_MIN;

  document.querySelectorAll("[data-serum]").forEach((serum) => serum.remove());
};

// Update serum
const updateSerum = (delta, speedScale) => {
  document.querySelectorAll("[data-serum]").forEach((serum) => {
    incrementCustomProperty(serum, "--left", delta * speedScale * SPEED * -1);

    if (getCustomProperty(serum, "--left") <= -100) {
      serum.remove();
    }
  });

  if (nextSerumTime <= 0) {
    createSerum();

    nextSerumTime =
      randomNumberBetween(SERUM_INTERVAL_MIN, SERUM_INTERVAL_MAX) / speedScale;
  }

  nextSerumTime -= delta;
};

// Get serum rects
const getSerumRects = () => {
  return [...document.querySelectorAll("[data-serum]")].map((serum) => {
    return serum.getBoundingClientRect();
  });
};

// Create serum
const createSerum = () => {
  const serum = document.createElement("img");

  serum.dataset.serum = true;
  serum.src = `./assets/images/serum.png`;
  serum.classList.add("serum");

  setCustomProperty(serum, "--left", 100);

  worldElem.append(serum);
};

// Random number between
const randomNumberBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Export
export { setupSerum, updateSerum, getSerumRects };
