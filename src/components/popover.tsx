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
import { bindFallbackPositioning } from '@/utils/fallback-positioning';

export type TPosition = 'inline-end' | 'block-end' | 'block-end-trigger-inline-start';

type TLinkToTrigger = 'name' | 'description';
type TMode = Exclude<HTMLAttributes<HTMLDivElement>['popover'], '' | undefined>;

const attribute = {
  name: 'aria-labelledby',
  description: 'aria-describedby',
} satisfies { [TKey in TLinkToTrigger]: string };

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
 * A popover component that can be used to power tooltips, dropdown menus,
 * and other floating UI elements.
 *
 * Uses CSS Anchor Positioning when available, with a JavaScript fallback
 * for browsers that don't support it.
 */
export function Popover({
  ref,
  triggerRef,
  position,
  children,
  linkToTrigger,
  role,
  mode,
  testId,
  forceFallback = false,
  onDismiss,
}: {
  ref?: Ref<HTMLDivElement>;
  triggerRef: RefObject<HTMLElement | null>;
  position: TPosition;
  children: ReactNode;
  linkToTrigger: TLinkToTrigger;
  role: AriaRole;
  mode: TMode;
  testId?: string;
  /** Force usage of JavaScript fallback positioning even when CSS Anchor Positioning is supported */
  forceFallback?: boolean;
  onDismiss: () => void;
}) {
  const ourRef = useRef<HTMLDivElement | null>(null);
  const id = useId();

  // Need to wait for React to render the content
  // into the element before showing it.
  // Otherwise, the popover element will show before
  // React has finished rendering the content into it.
  useLayoutEffect(() => {
    const popover = ourRef.current;
    const trigger = triggerRef.current;
    invariant(popover && trigger);

    const cleanupFns: TCleanupFn[] = [];

    // Link the popover to the trigger for accessibility
    cleanupFns.push(
      setAttribute(trigger, { attribute: attribute[linkToTrigger], value: id }),
    );

    // Check if CSS Anchor Positioning is supported (and not forced to use fallback)
    const useNativePositioning = supportsAnchorPositioning() && !forceFallback;

    if (useNativePositioning) {
      // If the trigger already has an anchor name, we should
      // use it and not override it.
      // If we override an existing anchor name then the positioning
      // of any existing popovers can be messed up.
      // Note: TypeScript doesn't have types for anchorName yet as it's a new CSS property
      const existingAnchorName = trigger.style.getPropertyValue('anchor-name');
      const triggerAnchorName = existingAnchorName || `--anchor-name-${CSS.escape(id)}`;

      // Once we set the anchor name on a trigger, we never change it.
      // This is to prevent the case where two popovers are using the same
      // trigger, and the first one opened closed - we don't want the second
      // popover to lose its anchor name.
      cleanupFns.push(
        setStyle(trigger, { property: 'anchor-name', value: triggerAnchorName }),
        setStyle(popover, { property: 'position-anchor', value: triggerAnchorName }),
      );

      // Add native anchor positioning classes
      popover.classList.add(...anchorPositionStyles[position].split(' ').filter(Boolean));
    } else {
      // Use JavaScript fallback for positioning
      cleanupFns.push(bindFallbackPositioning(popover, trigger, position));
    }

    // Show the popover
    popover.showPopover();
    cleanupFns.push(() => popover.hidePopover());

    return combine(...cleanupFns);
  }, [id, triggerRef, linkToTrigger, position, forceFallback]);

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
      className={css(
        'rounded border border-zinc-200 bg-white p-2 font-normal shadow-lg dark:border-zinc-700 dark:bg-zinc-800',
      )}
    >
      {children}
    </div>
  );
}
