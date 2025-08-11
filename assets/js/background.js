// Internal imports
import {
  getCustomProperty,
  setCustomProperty,
} from "./updateCustomProperty.js";

// --- Parallax background without seams ---
// Use PX everywhere to avoid vw<->px rounding and wrap with a hard reset.

// px per ms (tweak as needed)
const SPEED = window.innerWidth > 768 ? 0.05 : 0.30;

// Elements
const backgroundElems = document.querySelectorAll("[data-background]");
let bgWidthPx = 0;

const setupBackground = () => {
  // Actual rendered width in px
  bgWidthPx = backgroundElems[0].getBoundingClientRect().width;

  // Start positions in PX (second with a tiny -1px overlap to hide any renderer gap)
  setCustomProperty(backgroundElems[0], "--left", 0);
  setCustomProperty(backgroundElems[1], "--left", bgWidthPx - 1);
};

// delta — ms
const updateBackground = (delta, speedScale) => {
  const shift = delta * speedScale * SPEED; // px to move this frame

  backgroundElems.forEach((bg) => {
    let left = getCustomProperty(bg, "--left"); // px

    // move to the left
    left -= shift;

    // hard wrap within [-bgWidthPx, bgWidthPx)
    if (left <= -bgWidthPx) left += bgWidthPx * 2;

    setCustomProperty(bg, "--left", left);
  });
};

export { setupBackground, updateBackground };
