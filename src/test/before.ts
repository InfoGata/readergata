/* eslint-disable @typescript-eslint/no-empty-function */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock DOMMatrix for react-pdf / pdfjs-dist
class MockDOMMatrix {
  a = 1;
  b = 0;
  c = 0;
  d = 1;
  e = 0;
  f = 0;
  m11 = 1;
  m12 = 0;
  m13 = 0;
  m14 = 0;
  m21 = 0;
  m22 = 1;
  m23 = 0;
  m24 = 0;
  m31 = 0;
  m32 = 0;
  m33 = 1;
  m34 = 0;
  m41 = 0;
  m42 = 0;
  m43 = 0;
  m44 = 1;
  is2D = true;
  isIdentity = true;
  inverse() {
    return new MockDOMMatrix();
  }
  multiply() {
    return new MockDOMMatrix();
  }
  translate() {
    return new MockDOMMatrix();
  }
  scale() {
    return new MockDOMMatrix();
  }
  rotate() {
    return new MockDOMMatrix();
  }
  transformPoint() {
    return { x: 0, y: 0, z: 0, w: 1 };
  }
  toFloat32Array() {
    return new Float32Array(16);
  }
  toFloat64Array() {
    return new Float64Array(16);
  }
}
// @ts-expect-error - Mock for testing
globalThis.DOMMatrix = MockDOMMatrix;
