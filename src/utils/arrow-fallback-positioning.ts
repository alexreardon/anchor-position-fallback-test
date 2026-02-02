import type { TCleanupFn } from '@/types';
import {
  type TPlacement,
  type TFallbackStrategy,
  getAvailableSpace,
  getBasePlacement,
  getAlignment,
  buildPlacement,
  getBestBasePlacement,
  bindPositionUpdates,
} from './placement-utils';

export type { TPlacement as TArrowPlacement, TFallbackStrategy };

/**
 * Gap between the trigger and the popover in pixels (matches --tether-size)
 */
const GAP = 8;

/**
 * Apply placement using CSS positioning
 */
function applyPlacement(
  popover: HTMLElement,
  actualPlacement: TPlacement,
  triggerRect: DOMRect,
): void {
  const base = getBasePlacement(actualPlacement);
  const alignment = getAlignment(actualPlacement);

  // Reset previous positioning
  popover.style.top = '';
  popover.style.left = '';
  popover.style.right = '';
  popover.style.bottom = '';
  popover.style.transform = '';
  popover.style.position = 'fixed';

  // Apply based on base placement
  if (base === 'top') {
    popover.style.top = `${triggerRect.top - GAP}px`;
    if (alignment === 'start') {
      popover.style.left = `${triggerRect.left}px`;
      popover.style.transform = 'translateY(-100%)';
    } else if (alignment === 'end') {
      popover.style.left = `${triggerRect.right}px`;
      popover.style.transform = 'translate(-100%, -100%)';
    } else {
      popover.style.left = `${triggerRect.left + triggerRect.width / 2}px`;
      popover.style.transform = 'translate(-50%, -100%)';
    }
  } else if (base === 'bottom') {
    popover.style.top = `${triggerRect.bottom + GAP}px`;
    if (alignment === 'start') {
      popover.style.left = `${triggerRect.left}px`;
    } else if (alignment === 'end') {
      popover.style.left = `${triggerRect.right}px`;
      popover.style.transform = 'translateX(-100%)';
    } else {
      popover.style.left = `${triggerRect.left + triggerRect.width / 2}px`;
      popover.style.transform = 'translateX(-50%)';
    }
  } else if (base === 'left') {
    popover.style.left = `${triggerRect.left - GAP}px`;
    if (alignment === 'start') {
      popover.style.top = `${triggerRect.top}px`;
      popover.style.transform = 'translateX(-100%)';
    } else if (alignment === 'end') {
      popover.style.top = `${triggerRect.bottom}px`;
      popover.style.transform = 'translate(-100%, -100%)';
    } else {
      popover.style.top = `${triggerRect.top + triggerRect.height / 2}px`;
      popover.style.transform = 'translate(-100%, -50%)';
    }
  } else {
    // right
    popover.style.left = `${triggerRect.right + GAP}px`;
    if (alignment === 'start') {
      popover.style.top = `${triggerRect.top}px`;
    } else if (alignment === 'end') {
      popover.style.top = `${triggerRect.bottom}px`;
      popover.style.transform = 'translateY(-100%)';
    } else {
      popover.style.top = `${triggerRect.top + triggerRect.height / 2}px`;
      popover.style.transform = 'translateY(-50%)';
    }
  }
}

function calculateAndApplyPlacement(
  popover: HTMLElement,
  trigger: HTMLElement,
  desiredPlacement: TPlacement,
): void {
  const triggerRect = trigger.getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();
  const available = getAvailableSpace(triggerRect);

  const desiredBase = getBasePlacement(desiredPlacement);
  const alignment = getAlignment(desiredPlacement);

  const actualBase = getBestBasePlacement(desiredBase, available, popoverRect, GAP);
  const actualPlacement = buildPlacement(actualBase, alignment);

  applyPlacement(popover, actualPlacement, triggerRect);
}

/**
 * Provides JavaScript-based positioning as a fallback
 * for browsers that don't support CSS Anchor Positioning.
 */
export function bindArrowFallbackPositioning(
  popover: HTMLElement,
  trigger: HTMLElement,
  placement: TPlacement,
  strategy: TFallbackStrategy = 'update-on-change',
): TCleanupFn {
  return bindPositionUpdates(
    () => calculateAndApplyPlacement(popover, trigger, placement),
    strategy,
  );
}
