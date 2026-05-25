import '@testing-library/jest-dom/vitest'
import { toHaveNoViolations } from 'jest-axe'
import { expect } from 'vitest'

expect.extend(toHaveNoViolations)

// Global mocks for Radix UI in jsdom
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!globalThis.PointerEvent) {
  class MockPointerEvent extends MouseEvent {
    constructor(type: string, props: PointerEventInit = {}) {
      super(type, props)
    }
  }
  globalThis.PointerEvent = MockPointerEvent as unknown as typeof PointerEvent
}

// Global mocks for HTML elements
window.HTMLElement.prototype.scrollIntoView = function () {}
window.HTMLElement.prototype.hasPointerCapture = function () {
  return false
}
window.HTMLElement.prototype.setPointerCapture = function () {}
window.HTMLElement.prototype.releasePointerCapture = function () {}
