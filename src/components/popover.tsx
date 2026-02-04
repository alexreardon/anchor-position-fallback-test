'use client';

import {
  type AriaRole,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type RefObject,
  useId,
  useLayoutEffect,
  useRef,
} from 'react';
import invariant from 'tiny-invariant';
import type { TCleanupFn } from '@/types';
import { combine } from '@/utils/combine';
import { css } from '@/utils/css';
import { mergeRefs } from '@/utils/merge-refs';
import { setAttribute } from '@/utils/set-attribute';
import { setStyle } from '@/utils/set-style';
import { tw } from '@/utils/tw';
import { supportsAnchorPositioning } from '@/utils/supports-anchor-positioning';
import { bindFallbackPositioning, type TFallbackStrategy } from '@/utils/fallback-positioning';

export type TPosition = 'inline-end' | 'block-end' | 'block-end-trigger-inline-start';
export type { TFallbackStrategy } from '@/utils/fallback-positioning';

type TLinkToTrigger = 'name' | 'description' | 'none';
type TMode = Exclude<HTMLAttributes<HTMLDivElement>['popover'], '' | undefined>;

const attribute = {
  name: 'aria-labelledby',
  description: 'aria-describedby',
  none: null,
} satisfies { [TKey in TLinkToTrigger]: string | null };

/**
 * CSS classes for native anchor positioning.
 * These are only applied when CSS Anchor Positioning is supported.
 */
const anchorPositionStyles: { [TKey in TPosition]: string } = {
  'inline-end': tw`[position-area:inline-end] start-1 [position-try-fallbacks:flip-inline]`,
  'block-end': tw`[position-area:block-end] top-1 [position-try-fallbacks:flip-block]`,
  'block-end-trigger-inline-start': tw`[position-area:block-end_span-inline-end] top-1`,
};

/**
 * Default styling for popovers.
 */
const defaultPopoverClassName = tw`m-0 rounded border border-gray-200 bg-white p-2 font-normal shadow-lg dark:border-gray-700 dark:bg-gray-800`;

/**
 * A popover component that can be used to power tooltips, dropdown menus,
 * and other floating UI elements.
 *
 * Uses CSS Anchor Positioning when available, with a JavaScript fallback
 * for browsers that don't support it.
 *
 * For nested popovers (like submenus), the nesting is determined by DOM structure:
 * - When a child popover element is inside a parent popover element, the browser
 *   recognizes them as nested.
 * - Pressing Escape closes only the topmost (innermost) popover.
 * - Light dismiss (clicking outside) closes the entire stack.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using#nested_popovers
 */
export function Popover({
  ref,
  triggerRef,
  position,
  children,
  linkToTrigger = 'description',
  role,
  mode = 'auto',
  testId,
  fallbackStrategy,
  className,
  onDismiss,
}: {
  ref?: Ref<HTMLDivElement>;
  triggerRef: RefObject<HTMLElement | null>;
  position: TPosition;
  children: ReactNode;
  /** How to link the popover to the trigger for accessibility. Defaults to 'description'. */
  linkToTrigger?: TLinkToTrigger;
  role?: AriaRole;
  /** Popover mode. Defaults to 'auto'. */
  mode?: TMode;
  testId?: string;
  /** Force usage of a specific JavaScript fallback strategy. If not set, uses native CSS Anchor Positioning when supported. */
  fallbackStrategy?: TFallbackStrategy;
  /** Custom className. If not provided, default popover styling is applied. */
  className?: string;
  onDismiss: () => void;
}) {
  const ourRef = useRef<HTMLDivElement | null>(null);
  const id = useId();

  useLayoutEffect(() => {
    const popover = ourRef.current;
    const trigger = triggerRef.current;
    invariant(popover && trigger);

    const cleanupFns: TCleanupFn[] = [];

    // Link the popover to the trigger for accessibility (if requested)
    const ariaAttribute = attribute[linkToTrigger];
    if (ariaAttribute) {
      cleanupFns.push(
        setAttribute(trigger, { attribute: ariaAttribute, value: id }),
      );
    }

    // Use native CSS Anchor Positioning if supported and no fallback strategy is forced
    const useNativePositioning = supportsAnchorPositioning() && !fallbackStrategy;

    if (useNativePositioning) {
      const existingAnchorName = trigger.style.getPropertyValue('anchor-name');
      const triggerAnchorName = existingAnchorName || `--anchor-name-${CSS.escape(id)}`;

      cleanupFns.push(
        setStyle(trigger, { property: 'anchor-name', value: triggerAnchorName }),
        setStyle(popover, { property: 'position-anchor', value: triggerAnchorName }),
      );

      // Add native anchor positioning classes
      popover.classList.add(...anchorPositionStyles[position].split(' ').filter(Boolean));
    } else {
      // Use JavaScript fallback for positioning
      const strategy = fallbackStrategy ?? 'update-on-change';
      cleanupFns.push(bindFallbackPositioning(popover, trigger, position, strategy));
    }

    // Show the popover.
    // The `source` option tells the browser which element triggered this popover,
    // which helps establish the ancestor relationship for nested popovers.
    // This is in addition to DOM nesting which is also checked.
    // See: https://html.spec.whatwg.org/multipage/popover.html#dom-htmlelement-showpopover
    (popover.showPopover as (options?: { source?: Element }) => void)({ source: trigger });

    return combine(...cleanupFns);
  }, [id, triggerRef, linkToTrigger, position, fallbackStrategy]);

  return (
    <div
      data-testid={testId}
      ref={mergeRefs(ref, ourRef)}
      role={role}
      id={id}
      popover={mode}
      onToggle={(event) => {
        if (event.newState === 'closed') {
          onDismiss();
        }
      }}
      className={css(className ?? defaultPopoverClassName)}
    >
      {children}
    </div>
  );
}
