'use client';

import { useRef, useId, useLayoutEffect, useState, useEffect } from 'react';
import Link from 'next/link';
import { Anchor, Layers, Zap, ArrowRight, Code2, Info } from 'lucide-react';
import invariant from 'tiny-invariant';
import { supportsAnchorPositioning } from '@/utils/supports-anchor-positioning';
import { setStyle } from '@/utils/set-style';
import { combine } from '@/utils/combine';
import { bindFallbackPositioning } from '@/utils/fallback-positioning';

function LiveAnchorDemo() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();

  useLayoutEffect(() => {
    if (!isOpen) return;

    const popover = popoverRef.current;
    const trigger = triggerRef.current;
    invariant(popover && trigger);

    const cleanupFns: (() => void)[] = [];
    const useNative = supportsAnchorPositioning();

    if (useNative) {
      const anchorName = `--demo-anchor-${CSS.escape(id)}`;
      cleanupFns.push(
        setStyle(trigger, { property: 'anchor-name', value: anchorName }),
        setStyle(popover, { property: 'position-anchor', value: anchorName }),
      );
    } else {
      cleanupFns.push(
        bindFallbackPositioning(popover, trigger, 'block-end', 'update-on-change'),
      );
    }

    popover.showPopover();
    cleanupFns.push(() => popover.hidePopover());

    return combine(...cleanupFns);
  }, [isOpen, id]);

  return (
    <div className="relative flex flex-col items-center gap-4">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/40"
      >
        <Anchor className="h-4 w-4" />
        {isOpen ? 'Hide Popover' : 'Show Popover'}
      </button>
      {isOpen && (
        <div
          ref={popoverRef}
          id={id}
          popover="auto"
          onToggle={(e) => {
            if (e.newState === 'closed') setIsOpen(false);
          }}
          className="m-0 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800"
          style={{
            position: 'fixed',
            inset: 'unset',
            top: 'anchor(bottom)',
            left: 'anchor(center)',
            translate: '-50% 8px',
          }}
        >
          <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">Anchored to the button above!</span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Using CSS Anchor Positioning
          </p>
        </div>
      )}
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Anchor;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 inline-flex rounded-lg bg-blue-100 p-2.5 dark:bg-blue-500/20">
        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="mb-1.5 font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function BrowserSupportBadge() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setIsSupported(supportsAnchorPositioning());
  }, []);

  if (isSupported === null) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
        isSupported
          ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          isSupported ? 'bg-green-500' : 'bg-amber-500'
        }`}
      />
      {isSupported
        ? 'Your browser supports CSS Anchor Positioning'
        : 'Using JavaScript fallback'}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <header className="flex flex-col items-center px-8 pb-12 pt-16 text-center">
        <div className="mb-6 inline-flex rounded-full bg-blue-100 p-3 dark:bg-blue-500/20">
          <Anchor className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl">
          CSS Anchor Positioning
        </h1>
        <p className="mb-6 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
          Exploring the new CSS Anchor Positioning API for building popovers, tooltips,
          and dropdown menus with native browser support and JavaScript fallbacks.
        </p>
        <BrowserSupportBadge />
      </header>

      {/* Live Demo */}
      <section className="px-8 pb-16">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl border border-gray-200 bg-white/50 p-8 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-800/50">
            <h2 className="mb-6 text-center text-lg font-semibold text-gray-900 dark:text-gray-100">
              Try it out
            </h2>
            <LiveAnchorDemo />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 pb-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
            What's Explored Here
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={Anchor}
              title="Anchor Positioning"
              description="Position elements relative to any anchor element using pure CSS, no JavaScript calculations needed."
            />
            <FeatureCard
              icon={Layers}
              title="Top Layer Elements"
              description="Popovers and dialogs in the top layer with entry/exit animations using @starting-style."
            />
            <FeatureCard
              icon={Code2}
              title="Progressive Enhancement"
              description="JavaScript fallback positioning for browsers without CSS Anchor Positioning support."
            />
          </div>
        </div>
      </section>

      {/* Info Box */}
      <section className="px-8 pb-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-500/30 dark:bg-blue-500/10">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="mb-1 font-semibold text-blue-800 dark:text-blue-300">
                About This Project
              </h3>
              <p className="text-sm leading-relaxed text-blue-700 dark:text-blue-300/90">
                This is an experimental playground for exploring CSS Anchor Positioning.
                Use the sidebar to navigate between different demos showcasing tooltips,
                animations, and arrow positioning techniques.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA to explore */}
      <section className="px-8 pb-16">
        <div className="flex justify-center">
          <Link
            href="/tooltip-demo"
            className="group inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Explore the Demos
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
