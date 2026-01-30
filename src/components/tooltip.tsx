'use client';

import { type ReactNode, type RefObject, useState } from 'react';
import { Popover, type TPosition } from './popover';

/**
 * A tooltip component built on top of Popover.
 * Shows on hover/focus of the trigger element.
 */
export function Tooltip({
  triggerRef,
  position,
  children,
  isOpen,
  forceFallback,
  onOpenChange,
}: {
  triggerRef: RefObject<HTMLElement | null>;
  position: TPosition;
  children: ReactNode;
  isOpen: boolean;
  /** Force usage of JavaScript fallback positioning even when CSS Anchor Positioning is supported */
  forceFallback?: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <Popover
      triggerRef={triggerRef}
      position={position}
      linkToTrigger="description"
      role="tooltip"
      mode="auto"
      forceFallback={forceFallback}
      onDismiss={() => onOpenChange(false)}
    >
      {children}
    </Popover>
  );
}

/**
 * Hook to manage tooltip open/close state based on hover and focus.
 */
export function useTooltip() {
  const [isOpen, setIsOpen] = useState(false);

  const triggerProps = {
    onMouseEnter: () => setIsOpen(true),
    onMouseLeave: () => setIsOpen(false),
    onFocus: () => setIsOpen(true),
    onBlur: () => setIsOpen(false),
  };

  return {
    isOpen,
    setIsOpen,
    triggerProps,
  };
}
