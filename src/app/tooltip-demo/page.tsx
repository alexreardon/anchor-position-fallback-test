'use client';

import { useRef, useState } from 'react';
import { Info, ChevronDown } from 'lucide-react';
import type { TPosition, TFallbackStrategy } from '@/components/popover';
import { Tooltip, useTooltip } from '@/components/tooltip';

const positions: { value: TPosition; label: string }[] = [
  { value: 'block-end', label: 'Bottom (block-end)' },
  { value: 'inline-end', label: 'Right (inline-end)' },
  { value: 'block-end-trigger-inline-start', label: 'Bottom Left (block-end-trigger-inline-start)' },
];

const fallbackStrategies: { value: TFallbackStrategy; label: string }[] = [
  { value: 'update-on-change', label: 'Update on change' },
  { value: 'update-each-frame', label: 'Update each frame' },
];

export default function TooltipDemoPage() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { isOpen, setIsOpen, triggerProps } = useTooltip();
  const [position, setPosition] = useState<TPosition>('block-end');
  const [forceFallback, setForceFallback] = useState(false);
  const [fallbackStrategy, setFallbackStrategy] = useState<TFallbackStrategy>('update-on-change');

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-8 overflow-auto bg-gray-50 p-8 dark:bg-gray-900">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Tooltip Demo
        </h1>

        <div className="flex flex-col gap-6">
          {/* Position selector */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="position-select"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Tooltip Position
            </label>
            <div className="relative">
              <select
                id="position-select"
                value={position}
                onChange={(e) => setPosition(e.target.value as TPosition)}
                className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                {positions.map((pos) => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Force fallback section */}
          <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={forceFallback}
                onChange={(e) => setForceFallback(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Force JavaScript fallback
              </span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Use fallback positioning even when CSS Anchor Positioning is supported
            </p>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="fallback-strategy-select"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Fallback Strategy
              </label>
              <div className="relative">
                <select
                  id="fallback-strategy-select"
                  value={fallbackStrategy}
                  onChange={(e) => setFallbackStrategy(e.target.value as TFallbackStrategy)}
                  disabled={!forceFallback}
                  className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                >
                  {fallbackStrategies.map((strategy) => (
                    <option key={strategy.value} value={strategy.value}>
                      {strategy.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Tooltip demo */}
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Hover or focus the button to see the tooltip
            </p>

            <button
              ref={buttonRef}
              type="button"
              {...triggerProps}
              className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Hover me
            </button>

            <Tooltip
              triggerRef={buttonRef}
              position={position}
              isOpen={isOpen}
              fallbackStrategy={forceFallback ? fallbackStrategy : undefined}
              onOpenChange={setIsOpen}
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Hello! I am a tooltip positioned at "{position}"
              </span>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
        <p className="max-w-md text-sm text-blue-700 dark:text-blue-300">
          This tooltip uses CSS Anchor Positioning when supported,
          with a JavaScript fallback for older browsers.
        </p>
      </div>
    </div>
  );
}
