import { bindAll } from 'bind-event-listener';
import type { TCleanupFn } from '@/types';
import type { TPosition } from '@/components/popover';

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
  if (position === 'inline-end') {
    return getBestInlinePlacement(available);
  }

  // 'block-end' and 'block-end-trigger-inline-start'
  return getBestBlockPlacement(available);
}

/**
 * Apply placement using CSS transforms so we don't need to measure the popover.
 * The transform handles offsetting by the popover's own dimensions.
 */
function applyPlacementStyles(
  popover: HTMLElement,
  placement: TPlacement,
  position: TPosition,
  triggerRect: DOMRect,
): void {
  if (placement === 'top') {
    // Position at trigger's top edge, transform moves it up by its own height
    popover.style.top = `${triggerRect.top - GAP}px`;
    if (position === 'block-end-trigger-inline-start') {
      popover.style.left = `${triggerRect.left}px`;
      popover.style.transform = 'translateY(-100%)';
    } else {
      // Center horizontally: position at trigger center, transform centers it
      popover.style.left = `${triggerRect.left + triggerRect.width / 2}px`;
      popover.style.transform = 'translate(-50%, -100%)';
    }
    return;
  }

  if (placement === 'bottom') {
    popover.style.top = `${triggerRect.bottom + GAP}px`;
    if (position === 'block-end-trigger-inline-start') {
      popover.style.left = `${triggerRect.left}px`;
    } else {
      // Center horizontally
      popover.style.left = `${triggerRect.left + triggerRect.width / 2}px`;
      popover.style.transform = 'translateX(-50%)';
    }
    return;
  }

  if (placement === 'left') {
    // Position at trigger's left edge, transform moves it left by its own width
    popover.style.left = `${triggerRect.left - GAP}px`;
    // Center vertically: position at trigger center, transform centers it
    popover.style.top = `${triggerRect.top + triggerRect.height / 2}px`;
    popover.style.transform = 'translate(-100%, -50%)';
    return;
  }

  // placement === 'right'
  popover.style.left = `${triggerRect.right + GAP}px`;
  // Center vertically
  popover.style.top = `${triggerRect.top + triggerRect.height / 2}px`;
  popover.style.transform = 'translateY(-50%)';
}

function applyPlacement(
  popover: HTMLElement,
  trigger: HTMLElement,
  position: TPosition,
): void {
  const triggerRect = trigger.getBoundingClientRect();
  const available = getAvailableSpace(triggerRect);
  const placement = getPlacementFromPosition(position, available);

  // Reset any previous positioning
  popover.style.top = '';
  popover.style.left = '';
  popover.style.transform = '';

  // Apply fixed positioning relative to viewport
  popover.style.position = 'fixed';

  applyPlacementStyles(popover, placement, position, triggerRect);
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

  // Initial positioning (no need to wait - we use CSS transforms
  // so we don't need to measure the popover's dimensions)
  update();

  // Re-run on scroll and resize
  return bindAll(window, [
    { type: 'scroll', listener: update, options: { capture: true, passive: true } },
    { type: 'resize', listener: update, options: { passive: true } },
  ]);
}
