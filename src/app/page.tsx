'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import type { TPosition } from '@/components/popover';
import { Tooltip, useTooltip } from '@/components/tooltip';

const positions: { value: TPosition; label: string }[] = [
  { value: 'block-end', label: 'Bottom (block-end)' },
  { value: 'inline-end', label: 'Right (inline-end)' },
  { value: 'block-end-trigger-inline-start', label: 'Bottom Left (block-end-trigger-inline-start)' },
];

export default function Home() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { isOpen, setIsOpen, triggerProps } = useTooltip();
  const [position, setPosition] = useState<TPosition>('block-end');
  const [forceFallback, setForceFallback] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-50 p-8 dark:bg-zinc-900">
      <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Popover Component Demo
        </h1>

        <div className="flex flex-col gap-6">
          {/* Position selector */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="position-select"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Tooltip Position
            </label>
            <select
              id="position-select"
              value={position}
              onChange={(e) => setPosition(e.target.value as TPosition)}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
            >
              {positions.map((pos) => (
                <option key={pos.value} value={pos.value}>
                  {pos.label}
                </option>
              ))}
            </select>
          </div>

          {/* Force fallback checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={forceFallback}
              onChange={(e) => setForceFallback(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-700"
            />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Force JavaScript fallback positioning
            </span>
          </label>

          {/* Tooltip demo */}
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Hover or focus the button to see the tooltip
            </p>

            <button
              ref={buttonRef}
              type="button"
              {...triggerProps}
              className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-800"
            >
              Hover me
            </button>

            <Tooltip
              triggerRef={buttonRef}
              position={position}
              isOpen={isOpen}
              forceFallback={forceFallback}
              onOpenChange={setIsOpen}
            >
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                Hello! I am a tooltip positioned at "{position}"
              </span>
            </Tooltip>
          </div>
        </div>
      </div>

      <p className="max-w-md text-center text-sm text-zinc-500 dark:text-zinc-400">
        This popover component uses CSS Anchor Positioning when supported,
        with a JavaScript fallback for older browsers.
      </p>

      <Link
        href="/fallback-test"
        className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        Go to Fallback Positioning Test Page →
      </Link>
    </div>
  );
}
