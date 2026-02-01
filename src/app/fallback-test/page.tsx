'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import type { TPosition, TFallbackStrategy } from '@/components/popover';
import { Tooltip, useTooltip } from '@/components/tooltip';

const positions: { value: TPosition; label: string }[] = [
  { value: 'block-end', label: 'Bottom' },
  { value: 'inline-end', label: 'Right' },
  { value: 'block-end-trigger-inline-start', label: 'Bottom Left' },
];

const fallbackStrategies: { value: TFallbackStrategy; label: string }[] = [
  { value: 'update-on-change', label: 'Update on change' },
  { value: 'update-each-frame', label: 'Update each frame' },
];

function TooltipButton({
  label,
  position,
  fallbackStrategy,
}: {
  label: string;
  position: TPosition;
  fallbackStrategy: TFallbackStrategy | undefined;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { isOpen, setIsOpen, triggerProps } = useTooltip();

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        {...triggerProps}
        className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {label}
      </button>
      <Tooltip
        triggerRef={buttonRef}
        position={position}
        isOpen={isOpen}
        fallbackStrategy={fallbackStrategy}
        onOpenChange={setIsOpen}
      >
        <span className="text-sm text-zinc-700 dark:text-zinc-300">
          Tooltip: {label} ({position})
        </span>
      </Tooltip>
    </>
  );
}

export default function FallbackTestPage() {
  const [position, setPosition] = useState<TPosition>('block-end');
  const [forceFallback, setForceFallback] = useState(true);
  const [fallbackStrategy, setFallbackStrategy] = useState<TFallbackStrategy>('update-on-change');

  const effectiveFallbackStrategy = forceFallback ? fallbackStrategy : undefined;

  return (
    <div className="min-h-[300vh] bg-zinc-50 p-8 dark:bg-zinc-900">
      {/* Fixed controls */}
      <div className="fixed top-4 right-4 z-50 rounded-lg border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Controls
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Position</span>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as TPosition)}
              className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
            >
              {positions.map((pos) => (
                <option key={pos.value} value={pos.value}>
                  {pos.label}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={forceFallback}
              onChange={(e) => setForceFallback(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-blue-600"
            />
            <span className="text-xs text-zinc-700 dark:text-zinc-300">
              Force fallback
            </span>
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Fallback Strategy</span>
            <select
              value={fallbackStrategy}
              onChange={(e) => setFallbackStrategy(e.target.value as TFallbackStrategy)}
              disabled={!forceFallback}
              className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
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
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Back to Demo
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Fallback Positioning Test
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Scroll the page and the container below to test tooltip positioning updates.
        </p>
      </div>

      {/* Top section with buttons */}
      <section className="mb-16">
        <h2 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
          Page Scroll Test
        </h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Hover over buttons while scrolling the page. The tooltips should follow.
        </p>
        <div className="flex flex-wrap gap-4">
          <TooltipButton label="Button 1" position={position} fallbackStrategy={effectiveFallbackStrategy} />
          <TooltipButton label="Button 2" position={position} fallbackStrategy={effectiveFallbackStrategy} />
          <TooltipButton label="Button 3" position={position} fallbackStrategy={effectiveFallbackStrategy} />
        </div>
      </section>

      {/* Scroll container section */}
      <section className="mb-16">
        <h2 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
          Scroll Container Test
        </h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Scroll inside this container while hovering buttons. Tooltips should update position.
        </p>
        <div className="h-64 overflow-auto rounded-lg border border-zinc-300 bg-white p-4 dark:border-zinc-600 dark:bg-zinc-800">
          <div className="h-[600px] space-y-8 p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-500">Top of container:</span>
              <TooltipButton label="Top Button" position={position} fallbackStrategy={effectiveFallbackStrategy} />
            </div>

            <div className="h-32" />

            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-500">Middle:</span>
              <TooltipButton label="Middle Button" position={position} fallbackStrategy={effectiveFallbackStrategy} />
            </div>

            <div className="h-32" />

            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-500">Lower middle:</span>
              <TooltipButton label="Lower Button" position={position} fallbackStrategy={effectiveFallbackStrategy} />
            </div>

            <div className="h-32" />

            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-500">Bottom of container:</span>
              <TooltipButton label="Bottom Button" position={position} fallbackStrategy={effectiveFallbackStrategy} />
            </div>
          </div>
        </div>
      </section>

      {/* Edge cases section */}
      <section className="mb-16">
        <h2 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
          Edge Positioning Test
        </h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Buttons near edges to test flip behavior and viewport constraints.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {/* Top row */}
          <div className="flex justify-start">
            <TooltipButton label="Top Left" position={position} fallbackStrategy={effectiveFallbackStrategy} />
          </div>
          <div className="flex justify-center">
            <TooltipButton label="Top Center" position={position} fallbackStrategy={effectiveFallbackStrategy} />
          </div>
          <div className="flex justify-end">
            <TooltipButton label="Top Right" position={position} fallbackStrategy={effectiveFallbackStrategy} />
          </div>

          {/* Middle row */}
          <div className="flex justify-start py-16">
            <TooltipButton label="Middle Left" position={position} fallbackStrategy={effectiveFallbackStrategy} />
          </div>
          <div className="flex justify-center py-16">
            <TooltipButton label="Center" position={position} fallbackStrategy={effectiveFallbackStrategy} />
          </div>
          <div className="flex justify-end py-16">
            <TooltipButton label="Middle Right" position={position} fallbackStrategy={effectiveFallbackStrategy} />
          </div>

          {/* Bottom row */}
          <div className="flex justify-start">
            <TooltipButton label="Bottom Left" position={position} fallbackStrategy={effectiveFallbackStrategy} />
          </div>
          <div className="flex justify-center">
            <TooltipButton label="Bottom Center" position={position} fallbackStrategy={effectiveFallbackStrategy} />
          </div>
          <div className="flex justify-end">
            <TooltipButton label="Bottom Right" position={position} fallbackStrategy={effectiveFallbackStrategy} />
          </div>
        </div>
      </section>

      {/* Spacer to enable more scrolling */}
      <div className="h-[100vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 dark:text-zinc-500 mb-4">
            More content to enable scrolling...
          </p>
          <TooltipButton label="Far Down Button" position={position} fallbackStrategy={effectiveFallbackStrategy} />
        </div>
      </div>

      {/* Nested scroll containers */}
      <section className="mb-16">
        <h2 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
          Nested Scroll Containers
        </h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Horizontal and vertical scroll containers nested together.
        </p>
        <div className="h-48 overflow-auto rounded-lg border border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800">
          <div className="w-[200%] p-4">
            <div className="flex gap-8">
              <div className="flex-shrink-0">
                <TooltipButton label="Nested 1" position={position} fallbackStrategy={effectiveFallbackStrategy} />
              </div>
              <div className="flex-shrink-0">
                <TooltipButton label="Nested 2" position={position} fallbackStrategy={effectiveFallbackStrategy} />
              </div>
              <div className="flex-shrink-0">
                <TooltipButton label="Nested 3" position={position} fallbackStrategy={effectiveFallbackStrategy} />
              </div>
              <div className="flex-shrink-0">
                <TooltipButton label="Nested 4" position={position} fallbackStrategy={effectiveFallbackStrategy} />
              </div>
              <div className="flex-shrink-0">
                <TooltipButton label="Nested 5" position={position} fallbackStrategy={effectiveFallbackStrategy} />
              </div>
              <div className="flex-shrink-0">
                <TooltipButton label="Nested 6" position={position} fallbackStrategy={effectiveFallbackStrategy} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final spacer */}
      <div className="h-32 flex items-end justify-center pb-8">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          End of test page
        </p>
      </div>
    </div>
  );
}
