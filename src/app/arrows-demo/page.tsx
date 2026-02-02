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

    // Link the popover to the trigger for accessibility
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
      // Use JS fallback positioning
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

    // Cleanup expanded state
    cleanupFns.push(() => {
      trigger.removeAttribute('aria-expanded');
    });

    return combine(...cleanupFns);
  }, [isOpen, id, triggerRef, placement, fallbackStrategy]);

  if (!isOpen) return null;

  // When using fallback, we don't use the placement class (CSS handles it via data-actual-placement)
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
    <div className="demo-card">
      <div className="demo-header">
        <h3 className="demo-title">{placementInfo.name}</h3>
        <p className="demo-description">{placementInfo.description}</p>
      </div>
      <div className="demo-content">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="trigger-button"
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
    <div className="arrows-page">
      <style>{arrowStyles}</style>

      {/* Fixed Controls */}
      <div className="fixed-controls">
        <h2 className="controls-title">Controls</h2>
        <div className="controls-content">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={forceFallback}
              onChange={(e) => setForceFallback(e.target.checked)}
              className="checkbox"
            />
            <span>Force JS fallback</span>
          </label>
          <div className="select-group">
            <span className="select-label">Fallback Strategy</span>
            <select
              value={fallbackStrategy}
              onChange={(e) => setFallbackStrategy(e.target.value as TFallbackStrategy)}
              disabled={!forceFallback}
              className="select"
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
      <header className="page-header">
        <Link href="/" className="back-link">
          ← Back to Home
        </Link>
        <h1 className="page-title">Popover Arrows with CSS Anchor Positioning</h1>
        <p className="page-subtitle">
          Arrows that automatically flip when the popover repositions, using the{' '}
          <code>clip-path: inset() margin-box</code> technique. Arrows are hidden when
          CSS Anchor Positioning is not available.
        </p>
      </header>

      {/* Placement grid */}
      <main className="demos-grid">
        {placements.map((placement) => (
          <PlacementDemo
            key={placement.id}
            placement={placement.id}
            fallbackStrategy={effectiveFallbackStrategy}
          />
        ))}
      </main>

      {/* Info section */}
      <footer className="page-footer">
        <div className="info-card">
          <h2>How it works (CSS)</h2>
          <p>
            The CSS technique uses <code>clip-path: inset() margin-box</code> to create
            auto-flipping arrows:
          </p>
          <ul>
            <li>
              Arrows pointing in <strong>all four directions</strong> are created using{' '}
              <code>::before</code> and <code>::after</code> pseudo-elements
            </li>
            <li>
              <code>clip-path: inset(1px) margin-box</code> clips based on the{' '}
              <strong>margin-box</strong>, not the border-box
            </li>
            <li>
              Margins control which arrow is visible — arrows extending into the margin area
              "escape" the clip
            </li>
            <li>
              <code>@position-try</code> can change margins, so the correct arrow appears
              when the popover flips
            </li>
          </ul>
          <div className="warning-box">
            <strong>⚠️ Limitation:</strong> This technique requires{' '}
            <code>box-shadow: none</code> on the popover, as box-shadow interferes with the
            margin-box clipping.
          </div>
        </div>

        <div className="info-card">
          <h2>JS Fallback Behavior</h2>
          <p>
            For browsers without CSS Anchor Positioning support:
          </p>
          <ul>
            <li>
              JavaScript calculates available space using{' '}
              <code>getBoundingClientRect()</code>
            </li>
            <li>
              Popover flips to the opposite side if there's not enough space
            </li>
            <li>
              <strong>Arrows are hidden</strong> — the auto-flip arrow technique requires
              CSS Anchor Positioning's <code>@position-try</code> rules
            </li>
            <li>
              Positioning still works correctly, just without the visual arrow indicator
            </li>
          </ul>
        </div>

        <div className="info-card">
          <h2>Position-Area Reference</h2>
          <p>
            Mapping common placement names to <code>position-area</code> values:
          </p>
          <div className="position-table-wrapper">
            <table className="position-table">
              <thead>
                <tr>
                  <th>Placement</th>
                  <th>position-area</th>
                  <th>Margin (arrow side)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>top</td>
                  <td>
                    <code>top center</code>
                  </td>
                  <td>margin-bottom</td>
                </tr>
                <tr>
                  <td>bottom</td>
                  <td>
                    <code>bottom center</code>
                  </td>
                  <td>margin-top</td>
                </tr>
                <tr>
                  <td>left</td>
                  <td>
                    <code>left center</code>
                  </td>
                  <td>margin-right</td>
                </tr>
                <tr>
                  <td>right</td>
                  <td>
                    <code>right center</code>
                  </td>
                  <td>margin-left</td>
                </tr>
                <tr>
                  <td>top-start</td>
                  <td>
                    <code>top span-right</code>
                  </td>
                  <td>margin-bottom</td>
                </tr>
                <tr>
                  <td>right-start</td>
                  <td>
                    <code>right span-bottom</code>
                  </td>
                  <td>margin-left</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </footer>
    </div>
  );
}

const arrowStyles = `
  /* ===== CSS Variables for Arrow Sizing ===== */
  :root {
    --tether-offset: 1px;
    --tether-size: 8px;
  }

  /* ===== Page Layout ===== */
  .arrows-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
    padding: 2rem;
  }

  @media (prefers-color-scheme: dark) {
    .arrows-page {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    }
  }

  /* ===== Fixed Controls ===== */
  .fixed-controls {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 50;
    background: white;
    border-radius: 0.75rem;
    padding: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 1px solid #e5e7eb;
    min-width: 200px;
  }

  @media (prefers-color-scheme: dark) {
    .fixed-controls {
      background: #1f2937;
      border-color: #374151;
    }
  }

  .controls-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.75rem;
  }

  @media (prefers-color-scheme: dark) {
    .controls-title {
      color: #f3f4f6;
    }
  }

  .controls-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.8125rem;
    color: #374151;
  }

  @media (prefers-color-scheme: dark) {
    .checkbox-label {
      color: #d1d5db;
    }
  }

  .checkbox {
    width: 1rem;
    height: 1rem;
    border-radius: 0.25rem;
    border: 1px solid #d1d5db;
    accent-color: #3b82f6;
  }

  .select-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .select-label {
    font-size: 0.75rem;
    color: #6b7280;
  }

  @media (prefers-color-scheme: dark) {
    .select-label {
      color: #9ca3af;
    }
  }

  .select {
    padding: 0.375rem 0.5rem;
    font-size: 0.8125rem;
    border-radius: 0.375rem;
    border: 1px solid #d1d5db;
    background: white;
    color: #1f2937;
  }

  .select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (prefers-color-scheme: dark) {
    .select {
      background: #374151;
      border-color: #4b5563;
      color: #f3f4f6;
    }
  }

  .page-header {
    max-width: 1200px;
    margin: 0 auto 3rem;
    text-align: center;
  }

  .back-link {
    display: inline-block;
    margin-bottom: 1rem;
    color: #3b82f6;
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s;
  }

  .back-link:hover {
    color: #2563eb;
  }

  .page-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.75rem;
  }

  @media (prefers-color-scheme: dark) {
    .page-title {
      color: #f3f4f6;
    }
  }

  .page-subtitle {
    font-size: 1rem;
    color: #6b7280;
    max-width: 700px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .page-subtitle code {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.875em;
  }

  @media (prefers-color-scheme: dark) {
    .page-subtitle {
      color: #9ca3af;
    }
  }

  /* ===== Demo Grid ===== */
  .demos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .demo-card {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: box-shadow 0.2s ease-out;
  }

  .demo-card:hover {
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  }

  @media (prefers-color-scheme: dark) {
    .demo-card {
      background: #1f2937;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    }

    .demo-card:hover {
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
    }
  }

  .demo-header {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #e5e7eb;
  }

  @media (prefers-color-scheme: dark) {
    .demo-header {
      border-bottom-color: #374151;
    }
  }

  .demo-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.25rem;
  }

  @media (prefers-color-scheme: dark) {
    .demo-title {
      color: #f3f4f6;
    }
  }

  .demo-description {
    font-size: 0.75rem;
    color: #6b7280;
  }

  @media (prefers-color-scheme: dark) {
    .demo-description {
      color: #9ca3af;
    }
  }

  .demo-content {
    padding: 1.5rem;
    display: flex;
    justify-content: center;
    min-height: 100px;
  }

  /* ===== Trigger Button ===== */
  .trigger-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background 0.2s;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
  }

  .trigger-button:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  }

  .trigger-button:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  /* ===== Arrow Popover Base Styles ===== */
  .arrow-popover {
    /* RESET - browsers add default styles that interfere */
    all: unset;

    /* Anchor positioning */
    position: absolute;
    inset: auto;

    /* THE KEY: clip based on margin-box */
    clip-path: inset(var(--tether-offset)) margin-box;

    /* IMPORTANT: box-shadow MUST be disabled for margin-box clipping to work */
    box-shadow: none;

    /* Visual styling */
    display: block;
    background: #16213e;
    border-radius: 8px;
    padding: 1rem;
    color: #f3f4f6;
    min-width: 150px;
    text-align: center;

    /* Animations */
    opacity: 1;
    transition-property: opacity, display, overlay;
    transition-duration: 0.2s;
    transition-timing-function: ease-out;
    transition-behavior: allow-discrete;
  }

  .arrow-popover strong {
    display: block;
    margin-bottom: 0.25rem;
    color: #60a5fa;
  }

  .arrow-popover p {
    margin: 0;
    font-size: 0.875rem;
    color: #9ca3af;
  }

  /* Entry animation */
  @starting-style {
    .arrow-popover:popover-open {
      opacity: 0;
    }
  }

  /* Exit state */
  .arrow-popover:not(:popover-open) {
    opacity: 0;
  }

  /* ===== Top/Bottom Arrows (::before - vertical hexagon) ===== */
  .arrow-popover::before {
    content: "";
    position: absolute;
    z-index: -1;
    background: inherit;
    left: 50%;
    transform: translateX(-50%);

    /* Hexagon shape with points at top and bottom */
    width: calc(var(--tether-size) * 2);
    height: calc(100% + var(--tether-size) * 2);
    top: calc(var(--tether-size) * -1);
    clip-path: polygon(
      0 var(--tether-size),
      50% 0,
      100% var(--tether-size),
      100% calc(100% - var(--tether-size)),
      50% 100%,
      0 calc(100% - var(--tether-size))
    );
  }

  /* ===== Left/Right Arrows (::after - horizontal hexagon) ===== */
  .arrow-popover::after {
    content: "";
    position: absolute;
    z-index: -1;
    background: inherit;
    top: 50%;
    transform: translateY(-50%);

    /* Hexagon shape with points at left and right */
    height: calc(var(--tether-size) * 2);
    width: calc(100% + var(--tether-size) * 2);
    left: calc(var(--tether-size) * -1);
    clip-path: polygon(
      var(--tether-size) 0,
      calc(100% - var(--tether-size)) 0,
      100% 50%,
      calc(100% - var(--tether-size)) 100%,
      var(--tether-size) 100%,
      0 50%
    );
  }

  /* ===== Position-Area Placements (CSS Anchor Positioning) ===== */

  /* --- TOP (centered above) --- */
  .arrow-popover-top {
    position-area: top center;
    margin: 0 0 var(--tether-size) 0;
    position-try-fallbacks: --bottom, --left, --right;
  }

  /* --- TOP-START (above, left-aligned) --- */
  .arrow-popover-top-start {
    position-area: top span-right;
    margin: 0 0 var(--tether-size) 0;
    position-try-fallbacks: --bottom-start, --left-start, --right-start;
  }
  .arrow-popover-top-start::before {
    left: 20%;
  }

  /* --- TOP-END (above, right-aligned) --- */
  .arrow-popover-top-end {
    position-area: top span-left;
    margin: 0 0 var(--tether-size) 0;
    position-try-fallbacks: --bottom-end, --left-end, --right-end;
  }
  .arrow-popover-top-end::before {
    left: 80%;
  }

  /* --- BOTTOM (centered below) --- */
  .arrow-popover-bottom {
    position-area: bottom center;
    margin: var(--tether-size) 0 0 0;
    position-try-fallbacks: --top, --left, --right;
  }

  /* --- BOTTOM-START (below, left-aligned) --- */
  .arrow-popover-bottom-start {
    position-area: bottom span-right;
    margin: var(--tether-size) 0 0 0;
    position-try-fallbacks: --top-start, --left-start, --right-start;
  }
  .arrow-popover-bottom-start::before {
    left: 20%;
  }

  /* --- BOTTOM-END (below, right-aligned) --- */
  .arrow-popover-bottom-end {
    position-area: bottom span-left;
    margin: var(--tether-size) 0 0 0;
    position-try-fallbacks: --top-end, --left-end, --right-end;
  }
  .arrow-popover-bottom-end::before {
    left: 80%;
  }

  /* --- LEFT (centered to the left) --- */
  .arrow-popover-left {
    position-area: left center;
    margin: 0 var(--tether-size) 0 0;
    position-try-fallbacks: --right, --top, --bottom;
  }

  /* --- LEFT-START (left, top-aligned) --- */
  .arrow-popover-left-start {
    position-area: left span-bottom;
    margin: 0 var(--tether-size) 0 0;
    position-try-fallbacks: --right-start, --top-start, --bottom-start;
  }
  .arrow-popover-left-start::after {
    top: 30%;
  }

  /* --- LEFT-END (left, bottom-aligned) --- */
  .arrow-popover-left-end {
    position-area: left span-top;
    margin: 0 var(--tether-size) 0 0;
    position-try-fallbacks: --right-end, --top-end, --bottom-end;
  }
  .arrow-popover-left-end::after {
    top: 70%;
  }

  /* --- RIGHT (centered to the right) --- */
  .arrow-popover-right {
    position-area: right center;
    margin: 0 0 0 var(--tether-size);
    position-try-fallbacks: --left, --top, --bottom;
  }

  /* --- RIGHT-START (right, top-aligned) --- */
  .arrow-popover-right-start {
    position-area: right span-bottom;
    margin: 0 0 0 var(--tether-size);
    position-try-fallbacks: --left-start, --top-start, --bottom-start;
  }
  .arrow-popover-right-start::after {
    top: 30%;
  }

  /* --- RIGHT-END (right, bottom-aligned) --- */
  .arrow-popover-right-end {
    position-area: right span-top;
    margin: 0 0 0 var(--tether-size);
    position-try-fallbacks: --left-end, --top-end, --bottom-end;
  }
  .arrow-popover-right-end::after {
    top: 70%;
  }

  /* ===== @position-try Fallbacks ===== */

  /* Centered fallbacks */
  @position-try --top {
    position-area: top center;
    margin: 0 0 var(--tether-size) 0;
  }

  @position-try --bottom {
    position-area: bottom center;
    margin: var(--tether-size) 0 0 0;
  }

  @position-try --left {
    position-area: left center;
    margin: 0 var(--tether-size) 0 0;
  }

  @position-try --right {
    position-area: right center;
    margin: 0 0 0 var(--tether-size);
  }

  /* Start-aligned fallbacks */
  @position-try --top-start {
    position-area: top span-right;
    margin: 0 0 var(--tether-size) 0;
  }

  @position-try --bottom-start {
    position-area: bottom span-right;
    margin: var(--tether-size) 0 0 0;
  }

  @position-try --left-start {
    position-area: left span-bottom;
    margin: 0 var(--tether-size) 0 0;
  }

  @position-try --right-start {
    position-area: right span-bottom;
    margin: 0 0 0 var(--tether-size);
  }

  /* End-aligned fallbacks */
  @position-try --top-end {
    position-area: top span-left;
    margin: 0 0 var(--tether-size) 0;
  }

  @position-try --bottom-end {
    position-area: bottom span-left;
    margin: var(--tether-size) 0 0 0;
  }

  @position-try --left-end {
    position-area: left span-top;
    margin: 0 var(--tether-size) 0 0;
  }

  @position-try --right-end {
    position-area: right span-top;
    margin: 0 0 0 var(--tether-size);
  }

  /* ===== JS Fallback Styles ===== */
  /* When using JS fallback, arrows are hidden (can't reliably flip them without CSS Anchor Positioning) */

  .arrow-popover-fallback {
    /* Don't use clip-path margin-box for fallback */
    clip-path: none;
  }

  /* Hide arrows in fallback mode */
  .arrow-popover-fallback::before,
  .arrow-popover-fallback::after {
    display: none;
  }

  /* ===== Footer ===== */
  .page-footer {
    max-width: 1200px;
    margin: 3rem auto 0;
    display: grid;
    gap: 1.5rem;
  }

  @media (min-width: 900px) {
    .page-footer {
      grid-template-columns: 1fr 1fr 1fr;
    }
  }

  .info-card {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  @media (prefers-color-scheme: dark) {
    .info-card {
      background: #1f2937;
    }
  }

  .info-card h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 1rem;
  }

  @media (prefers-color-scheme: dark) {
    .info-card h2 {
      color: #f3f4f6;
    }
  }

  .info-card p {
    color: #6b7280;
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  @media (prefers-color-scheme: dark) {
    .info-card p {
      color: #9ca3af;
    }
  }

  .info-card ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .info-card li {
    padding: 0.5rem 0;
    padding-left: 1.5rem;
    position: relative;
    color: #6b7280;
    line-height: 1.6;
  }

  @media (prefers-color-scheme: dark) {
    .info-card li {
      color: #9ca3af;
    }
  }

  .info-card li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: #3b82f6;
  }

  .info-card code {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.875em;
  }

  .warning-box {
    margin-top: 1rem;
    padding: 1rem;
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.3);
    border-radius: 0.5rem;
    color: #92400e;
    font-size: 0.875rem;
  }

  @media (prefers-color-scheme: dark) {
    .warning-box {
      background: rgba(251, 191, 36, 0.05);
      border-color: rgba(251, 191, 36, 0.2);
      color: #fbbf24;
    }
  }

  .warning-box code {
    background: rgba(251, 191, 36, 0.2);
    color: inherit;
  }

  /* ===== Position Table ===== */
  .position-table-wrapper {
    overflow-x: auto;
    margin-top: 1rem;
  }

  .position-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  .position-table th,
  .position-table td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
  }

  @media (prefers-color-scheme: dark) {
    .position-table th,
    .position-table td {
      border-bottom-color: #374151;
    }
  }

  .position-table th {
    font-weight: 600;
    color: #1f2937;
    background: #f9fafb;
  }

  @media (prefers-color-scheme: dark) {
    .position-table th {
      color: #f3f4f6;
      background: #374151;
    }
  }

  .position-table td {
    color: #6b7280;
  }

  @media (prefers-color-scheme: dark) {
    .position-table td {
      color: #9ca3af;
    }
  }
`;
