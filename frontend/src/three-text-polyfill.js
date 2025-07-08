// Temporary workaround for troika-three-text customDepthMaterial setter issue
// See: https://github.com/pmndrs/drei/issues/2403
// This polyfill re-defines the customDepthMaterial & customDistanceMaterial properties
// so that Three.js can assign to them without throwing.

import { Text } from "@react-three/drei";

function addWritableProperty(proto, propName) {
  // If a writable setter already exists do nothing
  const desc = Object.getOwnPropertyDescriptor(proto, propName);
  if (desc && typeof desc.set === "function") {
    return;
  }
  let value = null;
  Object.defineProperty(proto, propName, {
    get() {
      return value;
    },
    set(v) {
      value = v;
    },
    enumerable: true,
    configurable: true,
  });
}

if (Text && Text.prototype) {
  addWritableProperty(Text.prototype, "customDepthMaterial");
  addWritableProperty(Text.prototype, "customDistanceMaterial");
}
