'use client';

import { useRef, useState, useId, useLayoutEffect, type ReactNode } from 'react';
import invariant from 'tiny-invariant';
import { ChevronDown, Copy, Scissors, ClipboardPaste, Trash2, Undo2, ArrowRight, Info } from 'lucide-react';
import { combine } from '@/utils/combine';
import { setStyle } from '@/utils/set-style';
import { setAttribute } from '@/utils/set-attribute';
import { supportsAnchorPositioning } from '@/utils/supports-anchor-positioning';
import { bindFallbackPositioning } from '@/utils/fallback-positioning';
import './dropdown-animations.css';

type AnimationStyle =
  | 'fade'
  | 'scale'
  | 'slide-down'
  | 'slide-up'
  | 'slide-left'
  | 'slide-right'
  | 'flip'
  | 'bounce'
  | 'elastic'
  | 'rotate'
  | 'perspective-tilt'
  | 'blur'
  | 'grow-from-anchor'
  | 'glitch'
  | 'swing'
  | 'unfold'
  | 'liquid-glass'
  | 'liquid-morph'
  | 'prismatic';

const animations: { id: AnimationStyle; name: string; description: string }[] = [
  { id: 'fade', name: 'Fade', description: 'Simple opacity fade in/out' },
  { id: 'scale', name: 'Scale', description: 'Zoom in from center' },
  { id: 'slide-down', name: 'Slide Down', description: 'Slide in from above' },
  { id: 'slide-up', name: 'Slide Up', description: 'Slide in from below' },
  { id: 'slide-left', name: 'Slide Left', description: 'Slide in from right' },
  { id: 'slide-right', name: 'Slide Right', description: 'Slide in from left' },
  { id: 'flip', name: 'Flip', description: '3D card flip effect' },
  { id: 'bounce', name: 'Bounce', description: 'Bouncy spring entrance' },
  { id: 'elastic', name: 'Elastic', description: 'Elastic overshoot effect' },
  { id: 'rotate', name: 'Rotate', description: 'Spin in from rotation' },
  { id: 'perspective-tilt', name: 'Perspective Tilt', description: '3D tilt from edge' },
  { id: 'blur', name: 'Blur', description: 'Blur to sharp focus' },
  { id: 'grow-from-anchor', name: 'Grow from Anchor', description: 'Expand from trigger button' },
  { id: 'glitch', name: 'Glitch', description: 'Digital glitch effect' },
  { id: 'swing', name: 'Swing', description: 'Pendulum swing entrance' },
  { id: 'unfold', name: 'Unfold', description: 'Paper unfold effect' },
  { id: 'liquid-glass', name: 'Liquid Glass', description: 'Apple-style frosted glass with fluid motion' },
  { id: 'liquid-morph', name: 'Liquid Morph', description: 'Morphing blob-like appearance' },
  { id: 'prismatic', name: 'Prismatic', description: 'Light refraction with color separation' },
];

const menuItems = [
  { icon: Copy, label: 'Copy', shortcut: '⌘C' },
  { icon: Scissors, label: 'Cut', shortcut: '⌘X' },
  { icon: ClipboardPaste, label: 'Paste', shortcut: '⌘V' },
  { icon: Trash2, label: 'Delete', shortcut: '⌫' },
  { icon: Undo2, label: 'Undo', shortcut: '⌘Z' },
];

function AnimatedDropdown({
  animation,
  children,
  triggerRef,
  isOpen,
  onClose,
}: {
  animation: AnimationStyle;
  children: ReactNode;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  onClose: () => void;
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

    const useNativePositioning = supportsAnchorPositioning();

    if (useNativePositioning) {
      const existingAnchorName = trigger.style.getPropertyValue('anchor-name');
      const triggerAnchorName = existingAnchorName || `--anchor-${CSS.escape(id)}`;

      cleanupFns.push(
        setStyle(trigger, { property: 'anchor-name', value: triggerAnchorName }),
        setStyle(popover, { property: 'position-anchor', value: triggerAnchorName }),
      );
    } else {
      cleanupFns.push(
        bindFallbackPositioning(popover, trigger, 'block-end', 'update-on-change'),
      );
    }

    popover.showPopover();
    cleanupFns.push(() => popover.hidePopover());

    cleanupFns.push(() => {
      trigger.removeAttribute('aria-expanded');
    });

    return combine(...cleanupFns);
  }, [isOpen, id, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      id={id}
      role="menu"
      popover="auto"
      onToggle={(e) => {
        if (e.newState === 'closed') {
          onClose();
        }
      }}
      className={`dropdown-menu dropdown-${animation}`}
    >
      {children}
    </div>
  );
}

function DropdownDemo({ animation }: { animation: AnimationStyle }) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const animationInfo = animations.find((a) => a.id === animation)!;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
        <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-100">
          {animationInfo.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{animationInfo.description}</p>
      </div>
      <div className="flex min-h-20 items-center justify-center p-6">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:from-blue-600 hover:to-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          aria-haspopup="menu"
        >
          <span>Show dropdown</span>
          <ChevronDown className={`chevron ${isOpen ? 'open' : ''}`} />
        </button>
        <AnimatedDropdown
          animation={animation}
          triggerRef={triggerRef}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <div className="menu-items">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  className="menu-item"
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="menu-icon" />
                  <span className="menu-label">{item.label}</span>
                  <span className="menu-shortcut">{item.shortcut}</span>
                </button>
              );
            })}
          </div>
        </AnimatedDropdown>
      </div>
    </div>
  );
}

export default function AnimationsDemoPage() {
  return (
    <div className="min-h-full overflow-auto bg-linear-to-br from-gray-50 to-gray-100 p-8 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="mx-auto mb-12 max-w-5xl text-center">
        <h1 className="mb-3 text-4xl font-bold text-gray-900 dark:text-gray-100">
          Dropdown Animation Showcase
        </h1>
        <p className="mx-auto max-w-xl leading-relaxed text-gray-500 dark:text-gray-400">
          Explore various entrance and exit animations for top layer elements using CSS{' '}
          <code className="rounded bg-blue-500/10 px-1.5 py-0.5 text-sm text-blue-500">
            @starting-style
          </code>{' '}
          and{' '}
          <code className="rounded bg-blue-500/10 px-1.5 py-0.5 text-sm text-blue-500">
            transition-behavior: allow-discrete
          </code>
        </p>
      </header>

      {/* Animation grid */}
      <main className="mx-auto grid max-w-5xl grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
        {animations.map((animation) => (
          <DropdownDemo key={animation.id} animation={animation.id} />
        ))}
      </main>

      {/* Info section */}
      <footer className="mx-auto mt-12 max-w-5xl">
        <div className="flex items-start gap-3 rounded-2xl bg-white p-6 shadow-md dark:bg-gray-800">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
              How it works
            </h2>
            <p className="mb-4 leading-relaxed text-gray-500 dark:text-gray-400">
              Modern CSS provides powerful tools for animating top layer elements (popovers, dialogs):
            </p>
            <ul className="space-y-2">
              {[
                <>
                  <code className="rounded bg-blue-500/10 px-1 py-0.5 text-xs text-blue-500">
                    @starting-style
                  </code>{' '}
                  defines the initial state before the element appears
                </>,
                <>
                  <code className="rounded bg-blue-500/10 px-1 py-0.5 text-xs text-blue-500">
                    transition-behavior: allow-discrete
                  </code>{' '}
                  enables animating discrete properties like{' '}
                  <code className="rounded bg-blue-500/10 px-1 py-0.5 text-xs text-blue-500">
                    display
                  </code>{' '}
                  and{' '}
                  <code className="rounded bg-blue-500/10 px-1 py-0.5 text-xs text-blue-500">
                    overlay
                  </code>
                </>,
                <>
                  The{' '}
                  <code className="rounded bg-blue-500/10 px-1 py-0.5 text-xs text-blue-500">
                    :popover-open
                  </code>{' '}
                  pseudo-class targets the open state
                </>,
              ].map((item, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
