// Internal imports
import {
  getCustomProperty,
  setCustomProperty,
  incrementCustomProperty,
} from "./updateCustomProperty.js";

// Global variables
const SPEED = window.innerWidth > 768 ? 0.05 : 0.075;

// Elements
const groundElems = document.querySelectorAll("[data-ground]");

// Setup ground
const setupGround = () => {
  setCustomProperty(groundElems[0], "--left", 0);
  setCustomProperty(groundElems[1], "--left", 100);
};

// Update ground
const updateGround = (delta, speedScale) => {
  groundElems.forEach((ground) => {
    incrementCustomProperty(ground, "--left", delta * speedScale * SPEED * -1);

    // Check and update --left of ground
    if (getCustomProperty(ground, "--left") <= -100) {
      incrementCustomProperty(ground, "--left", 200);
    }
  });
};

// Export
export { setupGround, updateGround };
