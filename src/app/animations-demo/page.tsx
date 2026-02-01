'use client';

import Link from 'next/link';
import { useRef, useState, useId, useLayoutEffect, type ReactNode } from 'react';
import invariant from 'tiny-invariant';
import { combine } from '@/utils/combine';
import { setStyle } from '@/utils/set-style';
import { setAttribute } from '@/utils/set-attribute';
import { supportsAnchorPositioning } from '@/utils/supports-anchor-positioning';
import { bindFallbackPositioning } from '@/utils/fallback-positioning';

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
  { icon: '📋', label: 'Copy', shortcut: '⌘C' },
  { icon: '✂️', label: 'Cut', shortcut: '⌘X' },
  { icon: '📌', label: 'Paste', shortcut: '⌘V' },
  { icon: '🗑️', label: 'Delete', shortcut: '⌫' },
  { icon: '↩️', label: 'Undo', shortcut: '⌘Z' },
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

    // Link the popover to the trigger for accessibility
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

    // Cleanup expanded state
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
    <div className="demo-card">
      <div className="demo-header">
        <h3 className="demo-title">{animationInfo.name}</h3>
        <p className="demo-description">{animationInfo.description}</p>
      </div>
      <div className="demo-content">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="trigger-button"
          aria-haspopup="menu"
        >
          <span>Show dropdown</span>
          <svg
            className={`chevron ${isOpen ? 'open' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <AnimatedDropdown
          animation={animation}
          triggerRef={triggerRef}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <div className="menu-items">
            {menuItems.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className="menu-item"
                onClick={() => setIsOpen(false)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
                <span className="menu-shortcut">{item.shortcut}</span>
              </button>
            ))}
          </div>
        </AnimatedDropdown>
      </div>
    </div>
  );
}

export default function AnimationsDemoPage() {
  return (
    <div className="animations-page">
      <style>{animationStyles}</style>

      {/* Header */}
      <header className="page-header">
        <Link href="/" className="back-link">
          ← Back to Home
        </Link>
        <h1 className="page-title">Dropdown Animation Showcase</h1>
        <p className="page-subtitle">
          Explore various entrance and exit animations for top layer elements using
          CSS <code>@starting-style</code> and <code>transition-behavior: allow-discrete</code>
        </p>
      </header>

      {/* Animation grid */}
      <main className="demos-grid">
        {animations.map((animation) => (
          <DropdownDemo key={animation.id} animation={animation.id} />
        ))}
      </main>

      {/* Info section */}
      <footer className="page-footer">
        <div className="info-card">
          <h2>How it works</h2>
          <p>
            Modern CSS provides powerful tools for animating top layer elements (popovers, dialogs):
          </p>
          <ul>
            <li>
              <code>@starting-style</code> defines the initial state before the element appears
            </li>
            <li>
              <code>transition-behavior: allow-discrete</code> enables animating discrete properties like <code>display</code> and <code>overlay</code>
            </li>
            <li>
              The <code>:popover-open</code> pseudo-class targets the open state
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

const animationStyles = `
  /* ===== Page Layout ===== */
  .animations-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
    padding: 2rem;
  }

  @media (prefers-color-scheme: dark) {
    .animations-page {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
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
    max-width: 600px;
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
    min-height: 80px;
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

  .chevron {
    width: 1rem;
    height: 1rem;
    transition: transform 0.2s;
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  /* ===== Dropdown Menu Base ===== */
  .dropdown-menu {
    position: fixed;
    position-area: block-end;
    position-try-fallbacks: flip-block;
    margin: 0;
    margin-top: 0.5rem;
    padding: 0.5rem;
    min-width: 180px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    
    /* Required for top layer animations */
    transition-property: opacity, transform, filter, display, overlay;
    transition-duration: 0.25s;
    transition-timing-function: ease-out;
    transition-behavior: allow-discrete;
  }

  @media (prefers-color-scheme: dark) {
    .dropdown-menu {
      background: #1f2937;
      border-color: #374151;
    }
  }

  /* Exit state (closed) - common for most animations */
  .dropdown-menu:not(:popover-open) {
    opacity: 0;
  }

  .menu-items {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    background: transparent;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: box-shadow 0.2s ease-out;
    text-align: left;
    width: 100%;
    box-shadow: inset 0 0 0 0 rgba(59, 130, 246, 0);
  }

  .menu-item:hover {
    box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.15), inset 0 0 12px 0 rgba(59, 130, 246, 0.08);
  }

  @media (prefers-color-scheme: dark) {
    .menu-item:hover {
      box-shadow: inset 0 0 0 2px rgba(96, 165, 250, 0.25), inset 0 0 12px 0 rgba(96, 165, 250, 0.1);
    }
  }

  .menu-icon {
    font-size: 1rem;
  }

  .menu-label {
    flex: 1;
    font-size: 0.875rem;
    color: #374151;
  }

  @media (prefers-color-scheme: dark) {
    .menu-label {
      color: #e5e7eb;
    }
  }

  .menu-shortcut {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  /* ===== Animation: Fade ===== */
  .dropdown-fade {
    opacity: 1;
  }
  
  @starting-style {
    .dropdown-fade:popover-open {
      opacity: 0;
    }
  }
  
  .dropdown-fade:not(:popover-open) {
    opacity: 0;
  }

  /* ===== Animation: Scale ===== */
  .dropdown-scale {
    opacity: 1;
    transform: scale(1);
  }
  
  @starting-style {
    .dropdown-scale:popover-open {
      opacity: 0;
      transform: scale(0.9);
    }
  }
  
  .dropdown-scale:not(:popover-open) {
    opacity: 0;
    transform: scale(0.9);
  }

  /* ===== Animation: Slide Down ===== */
  .dropdown-slide-down {
    opacity: 1;
    transform: translateY(0);
  }
  
  @starting-style {
    .dropdown-slide-down:popover-open {
      opacity: 0;
      transform: translateY(-1rem);
    }
  }
  
  .dropdown-slide-down:not(:popover-open) {
    opacity: 0;
    transform: translateY(-1rem);
  }

  /* ===== Animation: Slide Up ===== */
  .dropdown-slide-up {
    opacity: 1;
    transform: translateY(0);
  }
  
  @starting-style {
    .dropdown-slide-up:popover-open {
      opacity: 0;
      transform: translateY(1rem);
    }
  }
  
  .dropdown-slide-up:not(:popover-open) {
    opacity: 0;
    transform: translateY(1rem);
  }

  /* ===== Animation: Slide Left ===== */
  .dropdown-slide-left {
    opacity: 1;
    transform: translateX(0);
  }
  
  @starting-style {
    .dropdown-slide-left:popover-open {
      opacity: 0;
      transform: translateX(1rem);
    }
  }
  
  .dropdown-slide-left:not(:popover-open) {
    opacity: 0;
    transform: translateX(1rem);
  }

  /* ===== Animation: Slide Right ===== */
  .dropdown-slide-right {
    opacity: 1;
    transform: translateX(0);
  }
  
  @starting-style {
    .dropdown-slide-right:popover-open {
      opacity: 0;
      transform: translateX(-1rem);
    }
  }
  
  .dropdown-slide-right:not(:popover-open) {
    opacity: 0;
    transform: translateX(-1rem);
  }

  /* ===== Animation: Flip ===== */
  .dropdown-flip {
    opacity: 1;
    transform: perspective(600px) rotateX(0deg);
    transform-origin: top center;
    transition-duration: 0.35s;
    transition-timing-function: ease-out;
  }
  
  @starting-style {
    .dropdown-flip:popover-open {
      opacity: 0;
      transform: perspective(600px) rotateX(-90deg);
    }
  }
  
  .dropdown-flip:not(:popover-open) {
    opacity: 0;
    transform: perspective(600px) rotateX(-90deg);
  }

  /* ===== Animation: Bounce ===== */
  .dropdown-bounce {
    opacity: 1;
    transform: scale(1) translateY(0);
    animation: bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: scale(0.3) translateY(-20px);
    }
    50% {
      transform: scale(1.05) translateY(0);
    }
    70% {
      transform: scale(0.95) translateY(0);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  
  @starting-style {
    .dropdown-bounce:popover-open {
      opacity: 0;
      transform: scale(0.3) translateY(-20px);
    }
  }
  
  .dropdown-bounce:not(:popover-open) {
    opacity: 0;
    transform: scale(0.8);
    transition-duration: 0.15s;
  }

  /* ===== Animation: Elastic ===== */
  .dropdown-elastic {
    opacity: 1;
    transform: scaleY(1);
    transform-origin: top center;
    transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
    transition-duration: 0.4s;
  }
  
  @starting-style {
    .dropdown-elastic:popover-open {
      opacity: 0;
      transform: scaleY(0);
    }
  }
  
  .dropdown-elastic:not(:popover-open) {
    opacity: 0;
    transform: scaleY(0);
    transition-duration: 0.2s;
    transition-timing-function: ease-in;
  }

  /* ===== Animation: Rotate ===== */
  .dropdown-rotate {
    opacity: 1;
    transform: rotate(0deg) scale(1);
    transition-duration: 0.35s;
    transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  @starting-style {
    .dropdown-rotate:popover-open {
      opacity: 0;
      transform: rotate(-180deg) scale(0.5);
    }
  }
  
  .dropdown-rotate:not(:popover-open) {
    opacity: 0;
    transform: rotate(180deg) scale(0.5);
    transition-duration: 0.25s;
    transition-timing-function: ease-in;
  }

  /* ===== Animation: Perspective Tilt ===== */
  .dropdown-perspective-tilt {
    opacity: 1;
    transform: perspective(800px) rotateY(0deg) rotateX(0deg);
    transform-origin: top left;
    transition-duration: 0.4s;
    transition-timing-function: ease-out;
  }
  
  @starting-style {
    .dropdown-perspective-tilt:popover-open {
      opacity: 0;
      transform: perspective(800px) rotateY(30deg) rotateX(-15deg);
    }
  }
  
  .dropdown-perspective-tilt:not(:popover-open) {
    opacity: 0;
    transform: perspective(800px) rotateY(30deg) rotateX(-15deg);
  }

  /* ===== Animation: Blur ===== */
  .dropdown-blur {
    opacity: 1;
    filter: blur(0);
    transform: scale(1);
    transition-duration: 0.3s;
  }
  
  @starting-style {
    .dropdown-blur:popover-open {
      opacity: 0;
      filter: blur(10px);
      transform: scale(1.1);
    }
  }
  
  .dropdown-blur:not(:popover-open) {
    opacity: 0;
    filter: blur(10px);
    transform: scale(1.1);
  }

  /* ===== Animation: Grow from Anchor ===== */
  .dropdown-grow-from-anchor {
    opacity: 1;
    transform: scaleX(1) scaleY(1);
    transform-origin: top center;
    transition-duration: 0.3s;
    transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  @starting-style {
    .dropdown-grow-from-anchor:popover-open {
      opacity: 0;
      transform: scaleX(0.5) scaleY(0);
    }
  }
  
  .dropdown-grow-from-anchor:not(:popover-open) {
    opacity: 0;
    transform: scaleX(0.5) scaleY(0);
    transition-duration: 0.2s;
    transition-timing-function: ease-in;
  }

  /* ===== Animation: Glitch ===== */
  .dropdown-glitch {
    opacity: 1;
    animation: glitchIn 0.4s steps(8);
  }
  
  @keyframes glitchIn {
    0% {
      opacity: 0;
      transform: translateX(-5px);
      clip-path: inset(0 0 100% 0);
    }
    10% {
      transform: translateX(5px);
      clip-path: inset(0 0 80% 0);
    }
    20% {
      transform: translateX(-3px);
      clip-path: inset(0 0 60% 0);
    }
    30% {
      transform: translateX(3px);
      clip-path: inset(0 0 40% 0);
    }
    40% {
      transform: translateX(-2px);
      clip-path: inset(0 0 20% 0);
    }
    50% {
      transform: translateX(2px);
      clip-path: inset(0 0 10% 0);
    }
    60% {
      transform: translateX(-1px);
    }
    70% {
      transform: translateX(1px);
    }
    80%, 100% {
      opacity: 1;
      transform: translateX(0);
      clip-path: inset(0 0 0 0);
    }
  }
  
  @starting-style {
    .dropdown-glitch:popover-open {
      opacity: 0;
      clip-path: inset(0 0 100% 0);
    }
  }
  
  .dropdown-glitch:not(:popover-open) {
    opacity: 0;
    clip-path: inset(0 0 100% 0);
    transition-duration: 0.15s;
  }

  /* ===== Animation: Swing ===== */
  .dropdown-swing {
    opacity: 1;
    transform: rotate(0deg);
    transform-origin: top center;
    animation: swingIn 0.6s ease-out;
  }
  
  @keyframes swingIn {
    0% {
      opacity: 0;
      transform: rotate(-30deg);
    }
    30% {
      transform: rotate(15deg);
    }
    50% {
      transform: rotate(-10deg);
    }
    70% {
      transform: rotate(5deg);
    }
    85% {
      transform: rotate(-2deg);
    }
    100% {
      opacity: 1;
      transform: rotate(0deg);
    }
  }
  
  @starting-style {
    .dropdown-swing:popover-open {
      opacity: 0;
      transform: rotate(-30deg);
    }
  }
  
  .dropdown-swing:not(:popover-open) {
    opacity: 0;
    transform: rotate(10deg);
    transition-duration: 0.2s;
  }

  /* ===== Animation: Unfold ===== */
  .dropdown-unfold {
    opacity: 1;
    transform: scaleY(1);
    transform-origin: top center;
    transition-duration: 0.35s;
    transition-timing-function: ease-out;
  }
  
  .dropdown-unfold .menu-items {
    animation: unfoldItems 0.5s ease-out forwards;
  }
  
  @keyframes unfoldItems {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  
  @starting-style {
    .dropdown-unfold:popover-open {
      opacity: 0.5;
      transform: scaleY(0.1);
    }
  }
  
  .dropdown-unfold:not(:popover-open) {
    opacity: 0;
    transform: scaleY(0.1);
    transition-duration: 0.2s;
  }

  /* ===== Footer ===== */
  .page-footer {
    max-width: 1200px;
    margin: 3rem auto 0;
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

  /* ===== Animation: Liquid Glass ===== */
  .dropdown-liquid-glass {
    opacity: 1;
    transform: scale(1) translateY(0);
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.1),
      inset 0 0 0 1px rgba(255, 255, 255, 0.2),
      inset 0 2px 4px rgba(255, 255, 255, 0.4);
    animation: liquidGlassIn 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  }

  @keyframes liquidGlassIn {
    0% {
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
      backdrop-filter: blur(0px) saturate(100%);
      -webkit-backdrop-filter: blur(0px) saturate(100%);
    }
    50% {
      backdrop-filter: blur(25px) saturate(200%);
      -webkit-backdrop-filter: blur(25px) saturate(200%);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
    }
  }

  @starting-style {
    .dropdown-liquid-glass:popover-open {
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
    }
  }

  .dropdown-liquid-glass:not(:popover-open) {
    opacity: 0;
    transform: scale(0.98) translateY(-5px);
    backdrop-filter: blur(0px);
    -webkit-backdrop-filter: blur(0px);
    transition-duration: 0.25s;
  }

  @media (prefers-color-scheme: dark) {
    .dropdown-liquid-glass {
      background: rgba(31, 41, 55, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.3),
        inset 0 0 0 1px rgba(255, 255, 255, 0.05),
        inset 0 2px 4px rgba(255, 255, 255, 0.1);
    }
  }

  /* ===== Animation: Liquid Morph ===== */
  .dropdown-liquid-morph {
    opacity: 1;
    border-radius: 0.75rem;
    animation: liquidMorphIn 0.6s ease-out;
  }

  @keyframes liquidMorphIn {
    0% {
      opacity: 0;
      border-radius: 50%;
      transform: scale(0.3);
      filter: blur(10px);
    }
    30% {
      border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
      transform: scale(0.7);
      filter: blur(5px);
    }
    50% {
      border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
      transform: scale(0.9);
      filter: blur(2px);
    }
    70% {
      border-radius: 40% 60% 50% 50% / 50% 50% 50% 50%;
      transform: scale(1.02);
      filter: blur(0px);
    }
    100% {
      opacity: 1;
      border-radius: 0.75rem;
      transform: scale(1);
      filter: blur(0px);
    }
  }

  @starting-style {
    .dropdown-liquid-morph:popover-open {
      opacity: 0;
      transform: scale(0.3);
      border-radius: 50%;
    }
  }

  .dropdown-liquid-morph:not(:popover-open) {
    opacity: 0;
    transform: scale(0.5);
    border-radius: 50%;
    filter: blur(5px);
    transition-duration: 0.2s;
  }

  /* ===== Animation: Prismatic ===== */
  .dropdown-prismatic {
    opacity: 1;
    transform: scale(1);
    position: relative;
    animation: prismaticIn 0.5s ease-out;
    box-shadow:
      -2px 0 8px rgba(255, 0, 0, 0.2),
      2px 0 8px rgba(0, 0, 255, 0.2),
      0 4px 16px rgba(0, 0, 0, 0.1);
  }

  .dropdown-prismatic::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
      135deg,
      rgba(255, 0, 0, 0.05) 0%,
      rgba(255, 255, 0, 0.05) 25%,
      rgba(0, 255, 0, 0.05) 50%,
      rgba(0, 255, 255, 0.05) 75%,
      rgba(0, 0, 255, 0.05) 100%
    );
    opacity: 0;
    animation: prismaticShimmer 3s ease-in-out infinite;
    pointer-events: none;
  }

  .dropdown-prismatic:popover-open::before {
    opacity: 1;
  }

  @keyframes prismaticIn {
    0% {
      opacity: 0;
      transform: scale(0.9) rotate(-2deg);
      box-shadow:
        -10px 0 20px rgba(255, 0, 0, 0.4),
        10px 0 20px rgba(0, 0, 255, 0.4),
        0 4px 16px rgba(0, 0, 0, 0.1);
    }
    50% {
      box-shadow:
        -5px 0 15px rgba(255, 0, 0, 0.3),
        5px 0 15px rgba(0, 0, 255, 0.3),
        0 4px 16px rgba(0, 0, 0, 0.1);
    }
    100% {
      opacity: 1;
      transform: scale(1) rotate(0deg);
      box-shadow:
        -2px 0 8px rgba(255, 0, 0, 0.2),
        2px 0 8px rgba(0, 0, 255, 0.2),
        0 4px 16px rgba(0, 0, 0, 0.1);
    }
  }

  @keyframes prismaticShimmer {
    0%, 100% {
      background-position: 0% 50%;
      filter: hue-rotate(0deg);
    }
    50% {
      background-position: 100% 50%;
      filter: hue-rotate(30deg);
    }
  }

  @starting-style {
    .dropdown-prismatic:popover-open {
      opacity: 0;
      transform: scale(0.9) rotate(-2deg);
    }
  }

  .dropdown-prismatic:not(:popover-open) {
    opacity: 0;
    transform: scale(0.95);
    box-shadow:
      -8px 0 16px rgba(255, 0, 0, 0.3),
      8px 0 16px rgba(0, 0, 255, 0.3),
      0 4px 16px rgba(0, 0, 0, 0.1);
    transition-duration: 0.2s;
  }
`;
