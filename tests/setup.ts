import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// ── Canvas API shim for jsdom ───────────────────────────────────────
// jsdom does not implement CanvasRenderingContext2D; component tests
// that draw on a <canvas> need a no-op stub. The mock returns a
// stable object so React's render passes don't bail out, and the
// drawing methods are spies in case a test wants to assert calls.
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  scale: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  drawImage: vi.fn(),
  // Properties the component sets after getContext():
  lineWidth: 0,
  lineCap: 'butt' as CanvasLineCap,
  lineJoin: 'miter' as CanvasLineJoin,
  strokeStyle: '#000',
})) as unknown as HTMLCanvasElement['getContext'];

HTMLCanvasElement.prototype.toDataURL = vi.fn(
  () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=',
);

// ── Pointer-capture shim ────────────────────────────────────────────
// jsdom does not implement these; Pavilion SignaturePad uses them
// during drawing. No-op is fine for tests.
if (typeof Element !== 'undefined') {
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = vi.fn();
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = vi.fn();
  }
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = vi.fn(() => false);
  }
}

// ── getBoundingClientRect default ───────────────────────────────────
// Some component code uses getBoundingClientRect() to compute draw
// coordinates relative to a canvas. jsdom returns all zeros by default;
// override to a non-zero rect so coordinate math works in tests.
const realGBCR = Element.prototype.getBoundingClientRect;
Element.prototype.getBoundingClientRect = function () {
  const real = realGBCR.call(this);
  if (real.width > 0 && real.height > 0) return real;
  return {
    width: 320,
    height: 180,
    top: 0,
    left: 0,
    right: 320,
    bottom: 180,
    x: 0,
    y: 0,
    toJSON() { return this; },
  } as DOMRect;
};
