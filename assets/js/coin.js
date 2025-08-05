// Internal imports
import {
  getCustomProperty,
  setCustomProperty,
  incrementCustomProperty,
} from "./updateCustomProperty.js";

// Global variables
const SPEED = window.innerWidth > 768 ? 0.05 : 0.075;
const COIN_INTERVAL_MIN = 3500;
const COIN_INTERVAL_MAX = 5000;

// Elements
const worldElem = document.querySelector("[data-world]");

// Variables
let nextCoinTime;

// Setup coin
const setupCoin = () => {
  nextCoinTime = COIN_INTERVAL_MIN;

  document.querySelectorAll("[data-coin]").forEach((coin) => coin.remove());
};

// Update coin
const updateCoin = (delta, speedScale) => {
  document.querySelectorAll("[data-coin]").forEach((coin) => {
    incrementCustomProperty(coin, "--left", delta * speedScale * SPEED * -1);

    if (getCustomProperty(coin, "--left") <= -100) {
      coin.remove();
    }
  });

  if (nextCoinTime <= 0) {
    createCoin();

    nextCoinTime =
      randomNumberBetween(COIN_INTERVAL_MIN, COIN_INTERVAL_MAX) / speedScale;
  }

  nextCoinTime -= delta;
};

// Get coin rects
const getCoinRects = () => {
  return [...document.querySelectorAll("[data-coin]")].map((coin) => {
    return coin.getBoundingClientRect();
  });
};

// Create coin
const createCoin = () => {
  const coin = document.createElement("img");

  coin.dataset.coin = true;
  coin.src = `./assets/images/gem.png`;
  coin.classList.add("coin");

  setCustomProperty(coin, "--left", 100);

  worldElem.append(coin);
};

// Random number between
const randomNumberBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Export
export { setupCoin, updateCoin, getCoinRects };
