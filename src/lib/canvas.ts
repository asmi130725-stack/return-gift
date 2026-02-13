/**
 * Fixed canvas coordinate system
 * All image positions, sizes, and crops are stored in pixels relative to this canvas
 */

// Canvas dimensions - Single source of truth
export const CANVAS_WIDTH = 1200
export const CANVAS_HEIGHT = 1600 // 4:3 aspect ratio for scrapbook

// Default photo size when first added
export const DEFAULT_PHOTO_WIDTH = 300
export const DEFAULT_PHOTO_HEIGHT = 300

// Default positions for multiple photos (in pixels)
export const DEFAULT_POSITIONS = [
  { x: 100, y: 100 },   // Photo 0
  { x: 600, y: 200 },   // Photo 1
  { x: 200, y: 700 },   // Photo 2
  { x: 700, y: 900 },   // Photo 3
] as const

/**
 * Calculate scale factor to fit canvas in viewport
 */
export function getCanvasScale(containerWidth: number, containerHeight: number): number {
  const scaleX = containerWidth / CANVAS_WIDTH
  const scaleY = containerHeight / CANVAS_HEIGHT
  return Math.min(scaleX, scaleY, 1) // Never scale above 100%
}

/**
 * Convert screen coordinates to canvas coordinates
 */
export function screenToCanvas(
  screenX: number,
  screenY: number,
  canvasScale: number
): { x: number; y: number } {
  return {
    x: Math.round(screenX / canvasScale),
    y: Math.round(screenY / canvasScale),
  }
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Clamp position within canvas bounds
 */
export function clampToCanvas(x: number, y: number, width: number, height: number) {
  return {
    x: clamp(x, 0, CANVAS_WIDTH - width),
    y: clamp(y, 0, CANVAS_HEIGHT - height),
  }
}
