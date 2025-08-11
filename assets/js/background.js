// Internal imports
import {
  getCustomProperty,
  setCustomProperty,
  incrementCustomProperty,
} from "./updateCustomProperty.js";

// Global variables
const SPEED = window.innerWidth > 768 ? 0.005 : 0.03;

// Elements
const backgroundElems = document.querySelectorAll("[data-background]");
let backgroundWidthVW = 100;

const setupBackground = () => {
  const screenWidth = window.innerWidth;

  backgroundWidthVW = backgroundElems[0].getBoundingClientRect().width / screenWidth * 100;

  setCustomProperty(backgroundElems[0], "--left", 0);
  setCustomProperty(backgroundElems[1], "--left", backgroundWidthVW);
};

// Update background
const updateBackground = (delta, speedScale) => {
  backgroundElems.forEach((background) => {
    incrementCustomProperty(
      background,
      "--left",
      delta * speedScale * SPEED * -1
    );

    if (getCustomProperty(background, "--left") <= -backgroundWidthVW) {
      incrementCustomProperty(background, "--left", backgroundWidthVW * 2);
    }
  });
};

// Export
export { setupBackground, updateBackground };
