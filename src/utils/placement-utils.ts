import { bindAll } from 'bind-event-listener';
import type { TCleanupFn } from '@/types';

/**
 * Base placement directions
 */
export type TBasePlacement = 'top' | 'right' | 'bottom' | 'left';

/**
 * Extended placement with alignment
 */
export type TPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

/**
 * Alignment within a placement
 */
export type TAlignment = 'start' | 'end' | 'center';

/**
 * Available space in each direction from the trigger
 */
export type TAvailableSpace = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

/**
 * Strategy for updating position
 */
export type TFallbackStrategy = 'update-on-change' | 'update-each-frame';

/**
 * Get available space around a trigger element
 */
export function getAvailableSpace(triggerRect: DOMRect): TAvailableSpace {
  return {
    top: triggerRect.top,
    right: window.innerWidth - triggerRect.right,
    bottom: window.innerHeight - triggerRect.bottom,
    left: triggerRect.left,
  };
}

/**
 * Get the base placement from a full placement
 */
export function getBasePlacement(placement: TPlacement): TBasePlacement {
  if (placement.startsWith('top')) return 'top';
  if (placement.startsWith('bottom')) return 'bottom';
  if (placement.startsWith('left')) return 'left';
  return 'right';
}

/**
 * Get the alignment from a full placement
 */
export function getAlignment(placement: TPlacement): TAlignment {
  if (placement.endsWith('-start')) return 'start';
  if (placement.endsWith('-end')) return 'end';
  return 'center';
}

/**
 * Build a full placement from base and alignment
 */
export function buildPlacement(base: TBasePlacement, alignment: TAlignment): TPlacement {
  if (alignment === 'center') return base;
  return `${base}-${alignment}` as TPlacement;
}

/**
 * Get the opposite base placement
 */
export function getOppositePlacement(placement: TBasePlacement): TBasePlacement {
  const opposites: Record<TBasePlacement, TBasePlacement> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  };
  return opposites[placement];
}

/**
 * Get the best base placement considering available space
 */
export function getBestBasePlacement(
  desired: TBasePlacement,
  available: TAvailableSpace,
  popoverRect: DOMRect,
  gap: number,
): TBasePlacement {
  const spaceNeeded = {
    top: popoverRect.height + gap,
    bottom: popoverRect.height + gap,
    left: popoverRect.width + gap,
    right: popoverRect.width + gap,
  };

  // If there's enough space for the desired placement, use it
  if (available[desired] >= spaceNeeded[desired]) {
    return desired;
  }

  // Otherwise, try the opposite placement
  const opposite = getOppositePlacement(desired);
  if (available[opposite] >= spaceNeeded[opposite]) {
    return opposite;
  }

  // If neither works, try perpendicular placements
  if (desired === 'top' || desired === 'bottom') {
    if (available.right >= spaceNeeded.right) return 'right';
    if (available.left >= spaceNeeded.left) return 'left';
  } else {
    if (available.bottom >= spaceNeeded.bottom) return 'bottom';
    if (available.top >= spaceNeeded.top) return 'top';
  }

  // Fall back to whichever has the most space
  const sorted = Object.entries(available).sort((a, b) => b[1] - a[1]);
  return sorted[0][0] as TBasePlacement;
}

/**
 * Bind positioning updates on scroll and resize events
 */
export function bindUpdateOnChange(
  updateFn: () => void,
): TCleanupFn {
  updateFn();

  return bindAll(window, [
    { type: 'scroll', listener: updateFn, options: { capture: true, passive: true } },
    { type: 'resize', listener: updateFn, options: { passive: true } },
  ]);
}

/**
 * Bind positioning updates on every animation frame
 */
export function bindUpdateEachFrame(
  updateFn: () => void,
): TCleanupFn {
  let frameId: number;
  let isRunning = true;

  function tick() {
    updateFn();
    if (isRunning) {
      frameId = requestAnimationFrame(tick);
    }
  }

  frameId = requestAnimationFrame(tick);

  return function cleanup() {
    isRunning = false;
    cancelAnimationFrame(frameId);
  };
}

/**
 * Bind positioning updates based on strategy
 */
export function bindPositionUpdates(
  updateFn: () => void,
  strategy: TFallbackStrategy,
): TCleanupFn {
  if (strategy === 'update-each-frame') {
    return bindUpdateEachFrame(updateFn);
  }
  return bindUpdateOnChange(updateFn);
}
