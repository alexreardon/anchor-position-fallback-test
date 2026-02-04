'use client';

import { useRef } from 'react';
import { ChevronRight, Info, Check } from 'lucide-react';
import { Popover } from '@/components/popover';
import { tw } from '@/utils/tw';

/**
 * Demo page for popover="auto" behavior.
 *
 * Key behaviors being demonstrated:
 * 1. Light dismiss - clicking outside closes all popovers
 * 2. Escape key - closes only the topmost popover (due to DOM nesting)
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

const menuClassName = tw`m-0 min-w-[180px] rounded-xl border border-gray-200 bg-white p-1 shadow-xl dark:border-gray-700 dark:bg-gray-800`;

/**
 * The main nested menu demo.
 * Structure:
 * - Level 1: File Menu
 *   - Level 2: Share Menu (inside File Menu)
 *     - Level 3: Social Menu (inside Share Menu)
 *
 * All popovers are always in the DOM. Browser controls visibility via popoverTargetElement.
 */
function NestedMenuDemo() {
  // Trigger refs
  const level1TriggerRef = useRef<HTMLButtonElement>(null);
  const level2TriggerRef = useRef<HTMLButtonElement>(null);
  const level3TriggerRef = useRef<HTMLButtonElement>(null);

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
      <Popover
        triggerRef={level1TriggerRef}
        position="block-end"
        autoShow={false}
        className={menuClassName}
        linkToTrigger="none"
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
        <Popover
          triggerRef={level2TriggerRef}
          position="inline-end"
          autoShow={false}
          className={menuClassName}
          linkToTrigger="none"
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
          <Popover
            triggerRef={level3TriggerRef}
            position="inline-end"
            autoShow={false}
            className={menuClassName}
            linkToTrigger="none"
          >
            <MenuHeader>Social (Level 3)</MenuHeader>
            <MenuItem>Twitter</MenuItem>
            <MenuItem>LinkedIn</MenuItem>
            <MenuItem>Facebook</MenuItem>
          </Popover>
        </Popover>

        <MenuDivider />
        <MenuItem>Export</MenuItem>
      </Popover>
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
