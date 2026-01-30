import type { TCleanupFn } from '@/types';
import type { TPosition } from '@/components/popover';
import { combine } from './combine';

type TPlacement = 'top' | 'right' | 'bottom' | 'left';

type TAvailableSpace = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

/**
 * Gap between the trigger and the popover in pixels
 */
const GAP = 4;

function getAvailableSpace(triggerRect: DOMRect): TAvailableSpace {
  return {
    top: triggerRect.top,
    right: window.innerWidth - triggerRect.right,
    bottom: window.innerHeight - triggerRect.bottom,
    left: triggerRect.left,
  };
}

function getBestInlinePlacement(available: TAvailableSpace): TPlacement {
  return available.right >= available.left ? 'right' : 'left';
}

function getBestBlockPlacement(available: TAvailableSpace): TPlacement {
  return available.bottom >= available.top ? 'bottom' : 'top';
}

function getPlacementFromPosition(
  position: TPosition,
  available: TAvailableSpace,
): TPlacement {
  switch (position) {
    case 'inline-end':
      return getBestInlinePlacement(available);
    case 'block-end':
    case 'block-end-trigger-inline-start':
      return getBestBlockPlacement(available);
    default:
      return 'bottom';
  }
}

function applyPlacement(
  popover: HTMLElement,
  trigger: HTMLElement,
  position: TPosition,
): void {
  const triggerRect = trigger.getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();
  const available = getAvailableSpace(triggerRect);
  const placement = getPlacementFromPosition(position, available);

  // Reset any previous positioning
  popover.style.top = '';
  popover.style.left = '';
  popover.style.right = '';
  popover.style.bottom = '';

  // Apply fixed positioning relative to viewport
  popover.style.position = 'fixed';

  switch (placement) {
    case 'top': {
      popover.style.top = `${triggerRect.top - popoverRect.height - GAP}px`;
      if (position === 'block-end-trigger-inline-start') {
        popover.style.left = `${triggerRect.left}px`;
      } else {
        // Center horizontally relative to trigger
        const centerOffset = (triggerRect.width - popoverRect.width) / 2;
        popover.style.left = `${triggerRect.left + centerOffset}px`;
      }
      break;
    }
    case 'bottom': {
      popover.style.top = `${triggerRect.bottom + GAP}px`;
      if (position === 'block-end-trigger-inline-start') {
        popover.style.left = `${triggerRect.left}px`;
      } else {
        // Center horizontally relative to trigger
        const centerOffset = (triggerRect.width - popoverRect.width) / 2;
        popover.style.left = `${triggerRect.left + centerOffset}px`;
      }
      break;
    }
    case 'left': {
      popover.style.left = `${triggerRect.left - popoverRect.width - GAP}px`;
      // Center vertically relative to trigger
      const centerOffsetLeft = (triggerRect.height - popoverRect.height) / 2;
      popover.style.top = `${triggerRect.top + centerOffsetLeft}px`;
      break;
    }
    case 'right': {
      popover.style.left = `${triggerRect.right + GAP}px`;
      // Center vertically relative to trigger
      const centerOffsetRight = (triggerRect.height - popoverRect.height) / 2;
      popover.style.top = `${triggerRect.top + centerOffsetRight}px`;
      break;
    }
  }

  // Ensure the popover stays within viewport bounds
  const updatedRect = popover.getBoundingClientRect();
  if (updatedRect.left < 0) {
    popover.style.left = '0px';
  }
  if (updatedRect.right > window.innerWidth) {
    popover.style.left = `${window.innerWidth - updatedRect.width}px`;
  }
  if (updatedRect.top < 0) {
    popover.style.top = '0px';
  }
  if (updatedRect.bottom > window.innerHeight) {
    popover.style.top = `${window.innerHeight - updatedRect.height}px`;
  }
}

/**
 * Provides JavaScript-based positioning as a fallback for browsers
 * that don't support CSS Anchor Positioning.
 *
 * This runs the placement algorithm when the popover opens and
 * re-runs it on scroll and resize events.
 */
export function bindFallbackPositioning(
  popover: HTMLElement,
  trigger: HTMLElement,
  position: TPosition,
): TCleanupFn {
  function update() {
    applyPlacement(popover, trigger, position);
  }

  // Initial positioning
  update();

  // Re-run on scroll (using capture to catch all scroll events)
  function onScroll() {
    update();
  }
  window.addEventListener('scroll', onScroll, { capture: true, passive: true });

  // Re-run on resize
  function onResize() {
    update();
  }
  window.addEventListener('resize', onResize, { passive: true });

  return combine(
    () => window.removeEventListener('scroll', onScroll, { capture: true }),
    () => window.removeEventListener('resize', onResize),
  );
}
