// Get custom property
const getCustomProperty = (elem, prop) => {
  return parseFloat(getComputedStyle(elem).getPropertyValue(prop)) || 0;
};

// Set custom property
const setCustomProperty = (elem, prop, value) => {
  elem.style.setProperty(prop, value);
};

// Increment custom property
const incrementCustomProperty = (elem, prop, inc) => {
  setCustomProperty(elem, prop, getCustomProperty(elem, prop) + inc);
};

// Export
export { getCustomProperty, setCustomProperty, incrementCustomProperty };
