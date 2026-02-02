'use client';

import { useEffect, useRef, useLayoutEffect } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import {
  useToastContext,
  setGlobalToastFunction,
  type Toast,
  type ToastPosition,
} from './toast-context';
import './toast.css';

const typeIcons = {
  default: null,
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const typeColors = {
  default: '',
  success: 'toast-success',
  error: 'toast-error',
  warning: 'toast-warning',
  info: 'toast-info',
};

function ToastItem({
  toast,
  index,
  total,
  position,
  onDismiss,
}: {
  toast: Toast;
  index: number;
  total: number;
  position: ToastPosition;
  onDismiss: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const Icon = typeIcons[toast.type];

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onDismiss]);

  // Calculate offset based on position in stack
  const isTop = position.startsWith('top');
  const offset = index * 60; // Each toast is ~56px + gap

  // Use a simple numeric view transition name
  const toastNum = toast.id.replace('toast-', '');

  return (
    <div
      ref={ref}
      className={`toast-item ${typeColors[toast.type]}`}
      style={{
        viewTransitionName: `toast${toastNum}`,
        '--toast-index': index,
        '--toast-offset': `${offset}px`,
      } as React.CSSProperties}
      data-position={position}
      data-index={index}
    >
      <div className="toast-content">
        {Icon && (
          <Icon className={`toast-icon toast-icon-${toast.type}`} />
        )}
        <div className="toast-text">
          <p className="toast-title">{toast.title}</p>
          {toast.description && (
            <p className="toast-description">{toast.description}</p>
          )}
        </div>
      </div>
      {toast.dismissible && (
        <button
          type="button"
          className="toast-close"
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss toast"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function Toaster() {
  const { toasts, position, addToast, dismissToast } = useToastContext();
  const containerRef = useRef<HTMLDivElement>(null);

  // Register global toast function
  useLayoutEffect(() => {
    setGlobalToastFunction(addToast);
  }, [addToast]);

  // Show/hide popover based on toasts
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (toasts.length > 0) {
      if (!container.matches(':popover-open')) {
        container.showPopover();
      }
    } else {
      if (container.matches(':popover-open')) {
        container.hidePopover();
      }
    }
  }, [toasts.length]);

  return (
    <div
      ref={containerRef}
      popover="manual"
      className="toaster-container"
      data-position={position}
    >
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          index={index}
          total={toasts.length}
          position={position}
          onDismiss={dismissToast}
        />
      ))}
    </div>
  );
}
