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

function getHorizontalPosition(
  position: TPosition,
  triggerRect: DOMRect,
  popoverRect: DOMRect,
): number {
  if (position === 'block-end-trigger-inline-start') {
    return triggerRect.left;
  }
  // Center horizontally relative to trigger
  const centerOffset = (triggerRect.width - popoverRect.width) / 2;
  return triggerRect.left + centerOffset;
}

function applyPlacementStyles(
  popover: HTMLElement,
  placement: TPlacement,
  position: TPosition,
  triggerRect: DOMRect,
  popoverRect: DOMRect,
): void {
  if (placement === 'top') {
    popover.style.top = `${triggerRect.top - popoverRect.height - GAP}px`;
    popover.style.left = `${getHorizontalPosition(position, triggerRect, popoverRect)}px`;
    return;
  }

  if (placement === 'bottom') {
    popover.style.top = `${triggerRect.bottom + GAP}px`;
    popover.style.left = `${getHorizontalPosition(position, triggerRect, popoverRect)}px`;
    return;
  }

  if (placement === 'left') {
    popover.style.left = `${triggerRect.left - popoverRect.width - GAP}px`;
    // Center vertically relative to trigger
    const centerOffset = (triggerRect.height - popoverRect.height) / 2;
    popover.style.top = `${triggerRect.top + centerOffset}px`;
    return;
  }

  // placement === 'right'
  popover.style.left = `${triggerRect.right + GAP}px`;
  // Center vertically relative to trigger
  const centerOffset = (triggerRect.height - popoverRect.height) / 2;
  popover.style.top = `${triggerRect.top + centerOffset}px`;
}

function constrainToViewport(popover: HTMLElement): void {
  const rect = popover.getBoundingClientRect();

  if (rect.left < 0) {
    popover.style.left = '0px';
  }
  if (rect.right > window.innerWidth) {
    popover.style.left = `${window.innerWidth - rect.width}px`;
  }
  if (rect.top < 0) {
    popover.style.top = '0px';
  }
  if (rect.bottom > window.innerHeight) {
    popover.style.top = `${window.innerHeight - rect.height}px`;
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

  applyPlacementStyles(popover, placement, position, triggerRect, popoverRect);
  constrainToViewport(popover);
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

  // Re-run on scroll and resize
  return bindAll(window, [
    { type: 'scroll', listener: update, options: { capture: true, passive: true } },
    { type: 'resize', listener: update, options: { passive: true } },
  ]);
}
