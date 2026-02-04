'use client';

import { useRef, useId, useEffect } from 'react';
import { ChevronRight, Info, Check } from 'lucide-react';
import invariant from 'tiny-invariant';
import { supportsAnchorPositioning } from '@/utils/supports-anchor-positioning';
import { setStyle } from '@/utils/set-style';
import { bindFallbackPositioning } from '@/utils/fallback-positioning';
import { combine } from '@/utils/combine';

/**
 * Demo page for popover="auto" behavior.
 *
 * Key behaviors being demonstrated:
 * 1. Light dismiss - clicking outside closes all popovers
 * 2. Escape key - should close only the topmost popover (if nesting works)
 * 3. Nested popovers - child popover inside parent popover in DOM
 *
 * NO React state for open/closed - browser controls everything via popover="auto"
 */

export default function PopoverAutoDemo() {
  return (
    <div className="flex min-h-full flex-col overflow-auto bg-linear-to-br from-gray-50 to-gray-100 p-8 dark:from-slate-900 dark:to-slate-800">
      <header className="mb-8 text-center">
        <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Popover Auto Demo
        </h1>
        <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
          Testing <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm dark:bg-gray-700">popover="auto"</code> behavior
          with nested dropdown menus. No React state - browser controls everything.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl space-y-8">
        {/* Main Demo */}
        <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Nested Dropdown Menus
          </h2>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Open the menu, then open submenus. Press Escape - it should only close the topmost menu.
            Click outside to close all menus (light dismiss).
          </p>
          <NestedMenuDemo />
        </section>

        {/* Expected Behaviors */}
        <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Expected Behaviors
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <BehaviorCard
              title="Light Dismiss"
              items={[
                'Click outside closes ALL open popovers',
                'This is expected behavior per spec',
              ]}
            />
            <BehaviorCard
              title="Escape Key"
              items={[
                'Should close only the TOPMOST popover',
                'Requires proper DOM nesting',
                'Child popover must be inside parent popover',
              ]}
            />
          </div>
        </section>

        {/* Info */}
        <section className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-500/30 dark:bg-blue-500/10">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <strong>DOM Structure:</strong> For nested popovers to work correctly, the child
            popover element must be a DOM descendant of the parent popover element.
            This demo renders child menus inside parent menus to achieve this.
          </div>
        </section>
      </main>
    </div>
  );
}

/**
 * Hook to set up anchor positioning between a trigger and popover.
 */
function useAnchorPositioning(
  triggerRef: React.RefObject<HTMLElement | null>,
  popoverRef: React.RefObject<HTMLElement | null>,
  position: 'bottom' | 'right'
) {
  const id = useId();

  useEffect(() => {
    const popover = popoverRef.current;
    const trigger = triggerRef.current;
    if (!popover || !trigger) return;

    const useNative = supportsAnchorPositioning();

    if (useNative) {
      const anchorName = `--menu-anchor-${CSS.escape(id)}`;
      return combine(
        setStyle(trigger, { property: 'anchor-name', value: anchorName }),
        setStyle(popover, { property: 'position-anchor', value: anchorName }),
      );
    } else {
      return bindFallbackPositioning(
        popover,
        trigger,
        position === 'right' ? 'inline-end' : 'block-end',
        'update-on-change'
      );
    }
  }, [id, triggerRef, popoverRef, position]);
}

/**
 * The main nested menu demo.
 * Structure:
 * - Level 1: File Menu
 *   - Level 2: Share Menu (inside File Menu)
 *     - Level 3: Social Menu (inside Share Menu)
 *
 * All popovers are always in the DOM. Browser controls visibility via popovertarget.
 */
function NestedMenuDemo() {
  // Level 1
  const level1Id = useId();
  const level1TriggerRef = useRef<HTMLButtonElement>(null);
  const level1PopoverRef = useRef<HTMLDivElement>(null);

  // Level 2
  const level2Id = useId();
  const level2TriggerRef = useRef<HTMLButtonElement>(null);
  const level2PopoverRef = useRef<HTMLDivElement>(null);

  // Level 3
  const level3Id = useId();
  const level3TriggerRef = useRef<HTMLButtonElement>(null);
  const level3PopoverRef = useRef<HTMLDivElement>(null);

  // Set up anchor positioning
  useAnchorPositioning(level1TriggerRef, level1PopoverRef, 'bottom');
  useAnchorPositioning(level2TriggerRef, level2PopoverRef, 'right');
  useAnchorPositioning(level3TriggerRef, level3PopoverRef, 'right');

  // Connect triggers to popovers via popoverTargetElement
  useEffect(() => {
    const level1Trigger = level1TriggerRef.current;
    const level1Popover = level1PopoverRef.current;
    const level2Trigger = level2TriggerRef.current;
    const level2Popover = level2PopoverRef.current;
    const level3Trigger = level3TriggerRef.current;
    const level3Popover = level3PopoverRef.current;

    invariant(level1Trigger && level1Popover);
    invariant(level2Trigger && level2Popover);
    invariant(level3Trigger && level3Popover);

    // Use popoverTargetElement to establish trigger relationships
    (level1Trigger as any).popoverTargetElement = level1Popover;
    (level2Trigger as any).popoverTargetElement = level2Popover;
    (level3Trigger as any).popoverTargetElement = level3Popover;

    return () => {
      (level1Trigger as any).popoverTargetElement = null;
      (level2Trigger as any).popoverTargetElement = null;
      (level3Trigger as any).popoverTargetElement = null;
    };
  }, []);

  const positionBottom = { top: 'anchor(bottom)', left: 'anchor(start)', translate: '0 4px' };
  const positionRight = { top: 'anchor(top)', left: 'anchor(right)', translate: '4px 0' };

  return (
    <div>
      {/* Level 1 Trigger */}
      <button
        ref={level1TriggerRef}
        type="button"
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        File Menu
        <ChevronRight className="h-4 w-4 rotate-90" />
      </button>

      {/* Level 1 Popover */}
      <div
        ref={level1PopoverRef}
        id={level1Id}
        popover="auto"
        className="m-0 min-w-[180px] rounded-xl border border-gray-200 bg-white p-1 shadow-xl dark:border-gray-700 dark:bg-gray-800"
        style={positionBottom}
      >
        <MenuHeader>File (Level 1)</MenuHeader>
        <MenuItem>New</MenuItem>
        <MenuItem>Open</MenuItem>
        <MenuItem>Save</MenuItem>
        <MenuDivider />

        {/* Level 2 Trigger - INSIDE Level 1 Popover */}
        <button
          ref={level2TriggerRef}
          type="button"
          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <span>Share</span>
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Level 2 Popover - INSIDE Level 1 Popover */}
        <div
          ref={level2PopoverRef}
          id={level2Id}
          popover="auto"
          className="m-0 min-w-[180px] rounded-xl border border-gray-200 bg-white p-1 shadow-xl dark:border-gray-700 dark:bg-gray-800"
          style={positionRight}
        >
          <MenuHeader>Share (Level 2)</MenuHeader>
          <MenuItem>Copy Link</MenuItem>
          <MenuItem>Email</MenuItem>
          <MenuDivider />

          {/* Level 3 Trigger - INSIDE Level 2 Popover */}
          <button
            ref={level3TriggerRef}
            type="button"
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <span>Social</span>
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Level 3 Popover - INSIDE Level 2 Popover */}
          <div
            ref={level3PopoverRef}
            id={level3Id}
            popover="auto"
            className="m-0 min-w-[180px] rounded-xl border border-gray-200 bg-white p-1 shadow-xl dark:border-gray-700 dark:bg-gray-800"
            style={positionRight}
          >
            <MenuHeader>Social (Level 3)</MenuHeader>
            <MenuItem>Twitter</MenuItem>
            <MenuItem>LinkedIn</MenuItem>
            <MenuItem>Facebook</MenuItem>
          </div>
        </div>

        <MenuDivider />
        <MenuItem>Export</MenuItem>
      </div>
    </div>
  );
}

/* Simple menu components */

function MenuHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
      {children}
    </div>
  );
}

function MenuItem({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
    >
      {children}
    </button>
  );
}

function MenuDivider() {
  return <div className="my-1 border-t border-gray-200 dark:border-gray-700" />;
}

function BehaviorCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">{title}</h3>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
