// Internal imports
import {
  getCustomProperty,
  setCustomProperty,
  incrementCustomProperty,
} from "./updateCustomProperty.js";

// Global variables
const SPEED = window.innerWidth > 768 ? 0.05 : 0.075;
const BACKGROUND_ELEMENT_INTERVAL_MIN = 2000;
const BACKGROUND_ELEMENT_INTERVAL_MAX = 5000;

// Elements
const backgroundElems = document.querySelector("[data-background-elements]");

// Variables
let nextBackgroundElementTime;
const backgroundElements = ["bat"];

// Setup background element
const setupBackgroundElement = () => {
  nextBackgroundElementTime = BACKGROUND_ELEMENT_INTERVAL_MIN;

  document
    .querySelectorAll("[data-background-element]")
    .forEach((backgroundElement) => backgroundElement.remove());
};

// Update background element
const updateBackgroundElement = (delta, speedScale) => {
  document
    .querySelectorAll("[data-background-element]")
    .forEach((backgroundElement) => {
      incrementCustomProperty(
        backgroundElement,
        "--left",
        delta * speedScale * SPEED * -1
      );

      if (getCustomProperty(backgroundElement, "--left") <= -100) {
        backgroundElement.remove();
      }
    });

  if (nextBackgroundElementTime <= 0) {
    createBackgroundElement();

    nextBackgroundElementTime =
      randomNumberBetween(
        BACKGROUND_ELEMENT_INTERVAL_MIN,
        BACKGROUND_ELEMENT_INTERVAL_MAX
      ) / speedScale;
  }

  nextBackgroundElementTime -= delta;
};

// Create background element
const createBackgroundElement = () => {
  const backgroundElement = document.createElement("img");

  let randomBackgroundElement =
    backgroundElements[Math.floor(Math.random() * backgroundElements.length)];

  backgroundElement.dataset.backgroundElement = true;
  backgroundElement.src = `./assets/images/${randomBackgroundElement}.gif`;
  backgroundElement.classList.add("background-element");
  backgroundElement.classList.add(randomBackgroundElement);

  setCustomProperty(backgroundElement, "--left", 100);

  const randomTop = randomNumberBetween(20, 23); // высота полета члена
  setCustomProperty(backgroundElement, "--top", randomTop);

  backgroundElems.append(backgroundElement);
};

// Random number between
const randomNumberBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Export
export { setupBackgroundElement, updateBackgroundElement };
