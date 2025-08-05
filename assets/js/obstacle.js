// Internal imports
import {
  getCustomProperty,
  setCustomProperty,
  incrementCustomProperty,
} from "./updateCustomProperty.js";

// Global variables
const SPEED = window.innerWidth > 768 ? 0.05 : 0.075;
const OBSTACLE_INTERVAL_MIN = window.innerWidth > 1024 ? 500 : 1500;
const OBSTACLE_INTERVAL_MAX = window.innerWidth > 1024 ? 2000 : 3000;

// Elements
const worldElem = document.querySelector("[data-world]");

// Variables
let nextObstacleTime;
const obstacles = ["stone", "barrier"];

// Setup obstacle
const setupObstacle = () => {
  nextObstacleTime = OBSTACLE_INTERVAL_MIN;

  document
    .querySelectorAll("[data-obstacle]")
    .forEach((obstacle) => obstacle.remove());
};

// Update obstacle
const updateObstacle = (delta, speedScale) => {
  document.querySelectorAll("[data-obstacle]").forEach((obstacle) => {
    incrementCustomProperty(
      obstacle,
      "--left",
      delta * speedScale * SPEED * -1
    );

    if (getCustomProperty(obstacle, "--left") <= -100) {
      obstacle.remove();
    }
  });

  if (nextObstacleTime <= 0) {
    createObstacle();
    nextObstacleTime =
      randomNumberBetween(OBSTACLE_INTERVAL_MIN, OBSTACLE_INTERVAL_MAX) /
      speedScale;
  }

  nextObstacleTime -= delta;
};

// Get obstacle rects
const getObstacleRects = () => {
  return [...document.querySelectorAll("[data-obstacle]")].map((obstacle) => {
    return obstacle.getBoundingClientRect();
  });
};

// Create obstacle
const createObstacle = () => {
  const obstacle = document.createElement("img");

  let randomObstacle = obstacles[Math.floor(Math.random() * obstacles.length)];

  obstacle.dataset.obstacle = true;
  obstacle.src = `./assets/images/${randomObstacle}.png`;
  obstacle.classList.add("obstacle");
  obstacle.classList.add(randomObstacle);

  const spacing = Math.random() * (2.2 - 1.8) + 1.8;
  const OBSTACLE_WIDTH = 5;
  const obstacleDistance = spacing * OBSTACLE_WIDTH;
  setCustomProperty(obstacle, "--left", 100 + obstacleDistance);

  worldElem.append(obstacle);
};

// Random number between
const randomNumberBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Export
export { setupObstacle, updateObstacle, getObstacleRects };
