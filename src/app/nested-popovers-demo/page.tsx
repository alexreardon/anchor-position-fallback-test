'use client';

import { useRef, useId, useLayoutEffect, useState } from 'react';
import {
  Layers,
  MousePointerClick,
  Info,
  Settings,
  User,
  Bell,
  ChevronRight,
  X,
  HelpCircle,
} from 'lucide-react';
import invariant from 'tiny-invariant';
import { supportsAnchorPositioning } from '@/utils/supports-anchor-positioning';
import { setStyle } from '@/utils/set-style';
import { combine } from '@/utils/combine';
import { bindFallbackPositioning } from '@/utils/fallback-positioning';
import { Tooltip, useTooltip } from '@/components/tooltip';

/**
 * A simple popover component for this demo that supports nested popovers.
 * Uses popover="auto" for automatic stacking and light dismissal.
 */
function DemoPopover({
  triggerRef,
  isOpen,
  onOpenChange,
  children,
  position = 'bottom',
}: {
  triggerRef: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: React.ReactNode;
  position?: 'bottom' | 'right';
}) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useLayoutEffect(() => {
    if (!isOpen) return;

    const popover = popoverRef.current;
    const trigger = triggerRef.current;
    invariant(popover && trigger);

    const cleanupFns: (() => void)[] = [];
    const useNative = supportsAnchorPositioning();

    if (useNative) {
      const existingAnchorName = trigger.style.getPropertyValue('anchor-name');
      const anchorName = existingAnchorName || `--nested-demo-anchor-${CSS.escape(id)}`;

      cleanupFns.push(
        setStyle(trigger, { property: 'anchor-name', value: anchorName }),
        setStyle(popover, { property: 'position-anchor', value: anchorName }),
      );
    } else {
      cleanupFns.push(
        bindFallbackPositioning(
          popover,
          trigger,
          position === 'right' ? 'inline-end' : 'block-end',
          'update-on-change',
        ),
      );
    }

    popover.showPopover();
    cleanupFns.push(() => popover.hidePopover());

    return combine(...cleanupFns);
  }, [isOpen, id, triggerRef, position]);

  if (!isOpen) return null;

  const positionStyles =
    position === 'right'
      ? {
          position: 'fixed' as const,
          inset: 'unset',
          top: 'anchor(top)',
          left: 'anchor(right)',
          translate: '8px 0',
        }
      : {
          position: 'fixed' as const,
          inset: 'unset',
          top: 'anchor(bottom)',
          left: 'anchor(center)',
          translate: '-50% 8px',
        };

  return (
    <div
      ref={popoverRef}
      popover="auto"
      onToggle={(e) => {
        if (e.newState === 'closed') onOpenChange(false);
      }}
      className="m-0 min-w-[200px] rounded-xl border border-gray-200 bg-white p-0 shadow-xl dark:border-gray-700 dark:bg-gray-800"
      style={positionStyles}
    >
      {children}
    </div>
  );
}

/**
 * Demo 1: Basic nested popover with tooltip inside
 */
function PopoverWithTooltipDemo() {
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isOpen: tooltipOpen, setIsOpen: setTooltipOpen, triggerProps } = useTooltip();

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Open the menu, then hover the help icon to see a tooltip inside the popover
      </p>

      <button
        ref={menuButtonRef}
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="inline-flex items-center gap-2 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/40"
      >
        <Settings className="h-4 w-4" />
        Open Settings Menu
      </button>

      <DemoPopover triggerRef={menuButtonRef} isOpen={menuOpen} onOpenChange={setMenuOpen}>
        <div className="p-2">
          <div className="mb-2 flex items-center justify-between px-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Settings</span>
            <button
              ref={helpButtonRef}
              type="button"
              {...triggerProps}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-1">
            {['Profile', 'Preferences', 'Notifications', 'Security'].map((item) => (
              <button
                key={item}
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <Tooltip
          triggerRef={helpButtonRef}
          position="inline-end"
          isOpen={tooltipOpen}
          onOpenChange={setTooltipOpen}
        >
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Need help? Click for documentation
          </span>
        </Tooltip>
      </DemoPopover>
    </div>
  );
}

/**
 * Demo 2: Deeply nested popovers (3 levels)
 */
function DeeplyNestedDemo() {
  const level1Ref = useRef<HTMLButtonElement>(null);
  const level2Ref = useRef<HTMLButtonElement>(null);
  const level3Ref = useRef<HTMLButtonElement>(null);

  const [level1Open, setLevel1Open] = useState(false);
  const [level2Open, setLevel2Open] = useState(false);
  const [level3Open, setLevel3Open] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Open nested submenus to see the stacking behavior. Click outside to dismiss all.
      </p>

      <button
        ref={level1Ref}
        type="button"
        onClick={() => setLevel1Open(!level1Open)}
        className="inline-flex items-center gap-2 rounded-lg bg-linear-to-br from-purple-500 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/25 transition-all hover:from-purple-600 hover:to-purple-700 hover:shadow-purple-500/40"
      >
        <User className="h-4 w-4" />
        Account Menu
      </button>

      <DemoPopover triggerRef={level1Ref} isOpen={level1Open} onOpenChange={setLevel1Open}>
        <div className="p-2">
          <div className="mb-2 px-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Level 1
            </span>
          </div>
          <div className="space-y-1">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <User className="h-4 w-4" />
              View Profile
            </button>
            <button
              ref={level2Ref}
              type="button"
              onClick={() => setLevel2Open(!level2Open)}
              className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <span className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <DemoPopover
          triggerRef={level2Ref}
          isOpen={level2Open}
          onOpenChange={setLevel2Open}
          position="right"
        >
          <div className="p-2">
            <div className="mb-2 px-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Level 2
              </span>
            </div>
            <div className="space-y-1">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Email Alerts
              </button>
              <button
                ref={level3Ref}
                type="button"
                onClick={() => setLevel3Open(!level3Open)}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <span>Push Notifications</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <DemoPopover
            triggerRef={level3Ref}
            isOpen={level3Open}
            onOpenChange={setLevel3Open}
            position="right"
          >
            <div className="p-2">
              <div className="mb-2 px-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Level 3
                </span>
              </div>
              <div className="space-y-1">
                {['Desktop', 'Mobile', 'Tablet'].map((device) => (
                  <label
                    key={device}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    {device}
                  </label>
                ))}
              </div>
            </div>
          </DemoPopover>
        </DemoPopover>
      </DemoPopover>
    </div>
  );
}

/**
 * Demo 3: Light dismissal demonstration
 */
function LightDismissalDemo() {
  const autoRef = useRef<HTMLButtonElement>(null);
  const manualRef = useRef<HTMLButtonElement>(null);
  const [autoOpen, setAutoOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Compare <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-gray-700">popover="auto"</code>{' '}
        (light dismiss) vs{' '}
        <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-gray-700">popover="manual"</code>
      </p>

      <div className="flex gap-4">
        <button
          ref={autoRef}
          type="button"
          onClick={() => setAutoOpen(!autoOpen)}
          className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
        >
          Auto (Light Dismiss)
        </button>

        <button
          ref={manualRef}
          type="button"
          onClick={() => setManualOpen(!manualOpen)}
          className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
        >
          Manual (Explicit Close)
        </button>
      </div>

      <DemoPopover triggerRef={autoRef} isOpen={autoOpen} onOpenChange={setAutoOpen}>
        <div className="p-4">
          <div className="mb-2 flex items-center gap-2 text-green-600 dark:text-green-400">
            <MousePointerClick className="h-4 w-4" />
            <span className="font-medium">popover="auto"</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click anywhere outside this popover to close it. This is "light dismissal" behavior.
          </p>
        </div>
      </DemoPopover>

      {manualOpen && <ManualPopover triggerRef={manualRef} onClose={() => setManualOpen(false)} />}
    </div>
  );
}

function ManualPopover({
  triggerRef,
  onClose,
}: {
  triggerRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useLayoutEffect(() => {
    const popover = popoverRef.current;
    const trigger = triggerRef.current;
    invariant(popover && trigger);

    const cleanupFns: (() => void)[] = [];
    const useNative = supportsAnchorPositioning();

    if (useNative) {
      const anchorName = `--manual-demo-anchor-${CSS.escape(id)}`;
      cleanupFns.push(
        setStyle(trigger, { property: 'anchor-name', value: anchorName }),
        setStyle(popover, { property: 'position-anchor', value: anchorName }),
      );
    } else {
      cleanupFns.push(bindFallbackPositioning(popover, trigger, 'block-end', 'update-on-change'));
    }

    popover.showPopover();
    cleanupFns.push(() => popover.hidePopover());

    return combine(...cleanupFns);
  }, [id, triggerRef]);

  return (
    <div
      ref={popoverRef}
      popover="manual"
      className="m-0 min-w-[200px] rounded-xl border border-gray-200 bg-white p-0 shadow-xl dark:border-gray-700 dark:bg-gray-800"
      style={{
        position: 'fixed',
        inset: 'unset',
        top: 'anchor(bottom)',
        left: 'anchor(center)',
        translate: '-50% 8px',
      }}
    >
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <X className="h-4 w-4" />
            <span className="font-medium">popover="manual"</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Clicking outside won't close this. You must use the X button.
        </p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Layers;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 inline-flex rounded-lg bg-blue-100 p-2.5 dark:bg-blue-500/20">
        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="mb-1.5 font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

export default function NestedPopoversPage() {
  return (
    <div className="flex min-h-full flex-col overflow-auto bg-linear-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="px-8 pb-8 pt-12 text-center">
        <h1 className="mb-3 text-4xl font-bold text-gray-900 dark:text-gray-100">
          Nested Popovers
        </h1>
        <p className="mx-auto max-w-xl leading-relaxed text-gray-500 dark:text-gray-400">
          Demonstrating the Popover API's automatic stacking behavior with{' '}
          <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm dark:bg-gray-700">
            popover="auto"
          </code>
          , light dismissal, and nested UI patterns like tooltips inside popovers.
        </p>
      </header>

      {/* Demo Section 1: Popover with Tooltip */}
      <section className="px-8 pb-12">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl border border-gray-200 bg-white/50 p-8 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-800/50">
            <h2 className="mb-6 text-center text-lg font-semibold text-gray-900 dark:text-gray-100">
              Popover with Tooltip Inside
            </h2>
            <PopoverWithTooltipDemo />
          </div>
        </div>
      </section>

      {/* Demo Section 2: Deeply Nested */}
      <section className="px-8 pb-12">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl border border-gray-200 bg-white/50 p-8 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-800/50">
            <h2 className="mb-6 text-center text-lg font-semibold text-gray-900 dark:text-gray-100">
              Deeply Nested Submenus (3 Levels)
            </h2>
            <DeeplyNestedDemo />
          </div>
        </div>
      </section>

      {/* Demo Section 3: Light Dismissal */}
      <section className="px-8 pb-12">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl border border-gray-200 bg-white/50 p-8 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-800/50">
            <h2 className="mb-6 text-center text-lg font-semibold text-gray-900 dark:text-gray-100">
              Light Dismissal Behavior
            </h2>
            <LightDismissalDemo />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 pb-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
            How It Works
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={Layers}
              title="Auto Stacking"
              description="With popover='auto', the browser automatically manages a stack of popovers. Child popovers stay above parents."
            />
            <FeatureCard
              icon={MousePointerClick}
              title="Light Dismissal"
              description="Clicking outside a popover='auto' element closes it and all its descendants. No JavaScript needed."
            />
            <FeatureCard
              icon={Info}
              title="Nested Patterns"
              description="Tooltips and submenus inside popovers work naturally. The popover stack handles z-index automatically."
            />
          </div>
        </div>
      </section>

      {/* Info Box */}
      <section className="px-8 pb-12">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-500/30 dark:bg-blue-500/10">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="mb-1 font-semibold text-blue-800 dark:text-blue-300">
                About popover="auto" Stacking
              </h3>
              <p className="text-sm leading-relaxed text-blue-700 dark:text-blue-300/90">
                When using <code className="font-mono">popover="auto"</code>, the browser maintains an
                internal stack. Opening a new popover while another is open doesn't automatically
                close the first one if the new popover is a descendant (nested inside). Light
                dismissal works by closing all popovers when clicking outside the entire stack.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
