'use client';

import Link from 'next/link';
import { useRef, useState, useId, useLayoutEffect, type ReactNode } from 'react';
import invariant from 'tiny-invariant';
import { combine } from '@/utils/combine';
import { setStyle } from '@/utils/set-style';
import { setAttribute } from '@/utils/set-attribute';
import { supportsAnchorPositioning } from '@/utils/supports-anchor-positioning';
import {
  bindArrowFallbackPositioning,
  type TArrowPlacement,
  type TFallbackStrategy,
} from '@/utils/arrow-fallback-positioning';
import './arrow-popover.css';

type Placement = TArrowPlacement;

const placements: { id: Placement; name: string; description: string }[] = [
  { id: 'top', name: 'Top', description: 'Centered above the trigger' },
  { id: 'top-start', name: 'Top Start', description: 'Above, aligned to start' },
  { id: 'top-end', name: 'Top End', description: 'Above, aligned to end' },
  { id: 'bottom', name: 'Bottom', description: 'Centered below the trigger' },
  { id: 'bottom-start', name: 'Bottom Start', description: 'Below, aligned to start' },
  { id: 'bottom-end', name: 'Bottom End', description: 'Below, aligned to end' },
  { id: 'left', name: 'Left', description: 'Centered to the left' },
  { id: 'left-start', name: 'Left Start', description: 'Left, aligned to start' },
  { id: 'left-end', name: 'Left End', description: 'Left, aligned to end' },
  { id: 'right', name: 'Right', description: 'Centered to the right' },
  { id: 'right-start', name: 'Right Start', description: 'Right, aligned to start' },
  { id: 'right-end', name: 'Right End', description: 'Right, aligned to end' },
];

const fallbackStrategies: { value: TFallbackStrategy; label: string }[] = [
  { value: 'update-on-change', label: 'Update on change' },
  { value: 'update-each-frame', label: 'Update each frame' },
];

function ArrowPopover({
  placement,
  children,
  triggerRef,
  isOpen,
  onClose,
  fallbackStrategy,
}: {
  placement: Placement;
  children: ReactNode;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  onClose: () => void;
  fallbackStrategy: TFallbackStrategy | undefined;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useLayoutEffect(() => {
    if (!isOpen) return;

    const popover = popoverRef.current;
    const trigger = triggerRef.current;
    invariant(popover && trigger);

    const cleanupFns: (() => void)[] = [];

    cleanupFns.push(
      setAttribute(trigger, { attribute: 'aria-controls', value: id }),
      setAttribute(trigger, { attribute: 'aria-expanded', value: 'true' }),
    );

    const useNativePositioning = fallbackStrategy === undefined && supportsAnchorPositioning();

    if (useNativePositioning) {
      const existingAnchorName = trigger.style.getPropertyValue('anchor-name');
      const triggerAnchorName = existingAnchorName || `--anchor-${CSS.escape(id)}`;

      cleanupFns.push(
        setStyle(trigger, { property: 'anchor-name', value: triggerAnchorName }),
        setStyle(popover, { property: 'position-anchor', value: triggerAnchorName }),
      );
    } else {
      cleanupFns.push(
        bindArrowFallbackPositioning(
          popover,
          trigger,
          placement,
          fallbackStrategy ?? 'update-on-change',
        ),
      );
    }

    popover.showPopover();
    cleanupFns.push(() => popover.hidePopover());

    cleanupFns.push(() => {
      trigger.removeAttribute('aria-expanded');
    });

    return combine(...cleanupFns);
  }, [isOpen, id, triggerRef, placement, fallbackStrategy]);

  if (!isOpen) return null;

  const useFallback = fallbackStrategy !== undefined || !supportsAnchorPositioning();
  const className = useFallback
    ? 'arrow-popover arrow-popover-fallback'
    : `arrow-popover arrow-popover-${placement}`;

  return (
    <div
      ref={popoverRef}
      id={id}
      popover="auto"
      onToggle={(e) => {
        if (e.newState === 'closed') {
          onClose();
        }
      }}
      className={className}
    >
      {children}
    </div>
  );
}

function PlacementDemo({
  placement,
  fallbackStrategy,
}: {
  placement: Placement;
  fallbackStrategy: TFallbackStrategy | undefined;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const placementInfo = placements.find((p) => p.id === placement)!;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
        <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-100">
          {placementInfo.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{placementInfo.description}</p>
      </div>
      <div className="flex min-h-24 items-center justify-center p-6">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:from-blue-600 hover:to-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          aria-haspopup="true"
        >
          Click me
        </button>
        <ArrowPopover
          placement={placement}
          triggerRef={triggerRef}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          fallbackStrategy={fallbackStrategy}
        >
          <strong>Arrow Popover</strong>
          <p>Position: {placement}</p>
        </ArrowPopover>
      </div>
    </div>
  );
}

export default function ArrowsDemoPage() {
  const [forceFallback, setForceFallback] = useState(false);
  const [fallbackStrategy, setFallbackStrategy] = useState<TFallbackStrategy>('update-on-change');

  const effectiveFallbackStrategy = forceFallback ? fallbackStrategy : undefined;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-8 dark:from-slate-900 dark:to-slate-800">
      {/* Fixed Controls */}
      <div className="fixed right-4 top-4 z-50 min-w-52 rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Controls</h2>
        <div className="flex flex-col gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={forceFallback}
              onChange={(e) => setForceFallback(e.target.checked)}
              className="size-4 rounded border-gray-300 accent-blue-500"
            />
            <span>Force JS fallback</span>
          </label>
          <div
            className={`rounded border px-2 py-1.5 text-xs transition-colors ${
              forceFallback
                ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400'
                : 'border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-500'
            }`}
          >
            Arrows hidden in fallback mode
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Fallback Strategy</span>
            <select
              value={fallbackStrategy}
              onChange={(e) => setFallbackStrategy(e.target.value as TFallbackStrategy)}
              disabled={!forceFallback}
              className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              {fallbackStrategies.map((strategy) => (
                <option key={strategy.value} value={strategy.value}>
                  {strategy.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="mx-auto mb-12 max-w-5xl text-center">
        <Link
          href="/"
          className="mb-4 inline-block text-sm font-medium text-blue-500 transition-colors hover:text-blue-600"
        >
          ← Back to Home
        </Link>
        <h1 className="mb-3 text-4xl font-bold text-gray-900 dark:text-gray-100">
          Popover Arrows with CSS Anchor Positioning
        </h1>
        <p className="mx-auto max-w-2xl leading-relaxed text-gray-500 dark:text-gray-400">
          Arrows that automatically flip when the popover repositions, using the{' '}
          <code className="rounded bg-blue-500/10 px-1.5 py-0.5 text-sm text-blue-500">
            clip-path: inset() margin-box
          </code>{' '}
          technique. Arrows are hidden when CSS Anchor Positioning is not available.
        </p>
      </header>

      {/* Placement grid */}
      <main className="mx-auto grid max-w-5xl grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
        {placements.map((placement) => (
          <PlacementDemo
            key={placement.id}
            placement={placement.id}
            fallbackStrategy={effectiveFallbackStrategy}
          />
        ))}
      </main>

      {/* Info section */}
      <footer className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            How it works (CSS)
          </h2>
          <p className="mb-4 leading-relaxed text-gray-500 dark:text-gray-400">
            The CSS technique uses{' '}
            <code className="rounded bg-blue-500/10 px-1.5 py-0.5 text-sm text-blue-500">
              clip-path: inset() margin-box
            </code>{' '}
            to create auto-flipping arrows:
          </p>
          <ul className="space-y-2">
            {[
              <>
                Arrows pointing in <strong>all four directions</strong> are created using{' '}
                <code className="rounded bg-blue-500/10 px-1 py-0.5 text-xs text-blue-500">
                  ::before
                </code>{' '}
                and{' '}
                <code className="rounded bg-blue-500/10 px-1 py-0.5 text-xs text-blue-500">
                  ::after
                </code>
              </>,
              <>
                <code className="rounded bg-blue-500/10 px-1 py-0.5 text-xs text-blue-500">
                  clip-path: inset(1px) margin-box
                </code>{' '}
                clips based on the <strong>margin-box</strong>
              </>,
              'Margins control which arrow is visible — arrows "escape" the clip',
              <>
                <code className="rounded bg-blue-500/10 px-1 py-0.5 text-xs text-blue-500">
                  @position-try
                </code>{' '}
                changes margins when the popover flips
              </>,
            ].map((item, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                <span className="text-blue-500">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
            <strong>⚠️ Limitation:</strong> This technique requires{' '}
            <code className="rounded bg-amber-500/20 px-1 py-0.5 text-xs">box-shadow: none</code> on
            the popover.
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            JS Fallback Behavior
          </h2>
          <p className="mb-4 leading-relaxed text-gray-500 dark:text-gray-400">
            For browsers without CSS Anchor Positioning support:
          </p>
          <ul className="space-y-2">
            {[
              <>
                JavaScript calculates available space using{' '}
                <code className="rounded bg-blue-500/10 px-1 py-0.5 text-xs text-blue-500">
                  getBoundingClientRect()
                </code>
              </>,
              'Popover flips to the opposite side if there\'s not enough space',
              <>
                <strong>Arrows are hidden</strong> — the auto-flip technique requires{' '}
                <code className="rounded bg-blue-500/10 px-1 py-0.5 text-xs text-blue-500">
                  @position-try
                </code>
              </>,
              'Positioning still works correctly, just without the arrow',
            ].map((item, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                <span className="text-blue-500">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Position-Area Reference
          </h2>
          <p className="mb-4 leading-relaxed text-gray-500 dark:text-gray-400">
            Mapping placement names to{' '}
            <code className="rounded bg-blue-500/10 px-1.5 py-0.5 text-sm text-blue-500">
              position-area
            </code>{' '}
            values:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 text-left font-semibold text-gray-900 dark:text-gray-100">
                    Placement
                  </th>
                  <th className="py-2 text-left font-semibold text-gray-900 dark:text-gray-100">
                    position-area
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-500 dark:text-gray-400">
                {[
                  ['top', 'top center'],
                  ['bottom', 'bottom center'],
                  ['left', 'left center'],
                  ['right', 'right center'],
                  ['top-start', 'top span-right'],
                  ['right-start', 'right span-bottom'],
                ].map(([placement, area]) => (
                  <tr key={placement} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-2">{placement}</td>
                    <td className="py-2">
                      <code className="rounded bg-blue-500/10 px-1 py-0.5 text-xs text-blue-500">
                        {area}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </footer>
    </div>
  );
}
