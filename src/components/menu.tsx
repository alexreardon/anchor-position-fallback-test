'use client';

import { type ReactNode, type RefObject, useState } from 'react';
import { Popover, type TPosition, type TFallbackStrategy } from './popover';
import { tw } from '@/utils/tw';

export type { TPosition, TFallbackStrategy };

/**
 * Menu-specific styling for popovers.
 */
const menuClassName = tw`m-0 min-w-[180px] rounded-xl border border-gray-200 bg-white p-1 shadow-xl dark:border-gray-700 dark:bg-gray-800`;

/**
 * A dropdown menu component built on top of Popover.
 * Uses popover="auto" for automatic stacking and light dismissal.
 *
 * Uses CSS Anchor Positioning when available, with a JavaScript fallback
 * for browsers that don't support it.
 */
export function Menu({
  triggerRef,
  position = 'block-end',
  children,
  isOpen,
  fallbackStrategy,
  onOpenChange,
}: {
  triggerRef: RefObject<HTMLElement | null>;
  /** Position relative to the trigger. Defaults to 'block-end' (below). */
  position?: TPosition;
  children: ReactNode;
  isOpen: boolean;
  /** Force usage of a specific JavaScript fallback strategy */
  fallbackStrategy?: TFallbackStrategy;
  onOpenChange: (isOpen: boolean) => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <Popover
      triggerRef={triggerRef}
      position={position}
      linkToTrigger="name"
      role="menu"
      className={menuClassName}
      fallbackStrategy={fallbackStrategy}
      onDismiss={() => onOpenChange(false)}
    >
      {children}
    </Popover>
  );
}

/**
 * Hook to manage menu open/close state.
 * Provides a toggle function and props for the trigger button.
 */
export function useMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen((prev) => !prev);

  const triggerProps = {
    onClick: toggle,
    'aria-haspopup': 'menu' as const,
    'aria-expanded': isOpen,
  };

  return {
    isOpen,
    setIsOpen,
    toggle,
    triggerProps,
  };
}

/* Helper components for building menus */

export function MenuHeader({ children }: { children: ReactNode }) {
  return (
    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
      {children}
    </div>
  );
}

export function MenuItem({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
    >
      {children}
    </button>
  );
}

export function MenuDivider() {
  return <div className="my-1 border-t border-gray-200 dark:border-gray-700" />;
}
