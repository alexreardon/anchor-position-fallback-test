'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type Toast = {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  dismissible?: boolean;
};

type ToastContextType = {
  toasts: Toast[];
  position: ToastPosition;
  setPosition: (position: ToastPosition) => void;
  addToast: (toast: Omit<Toast, 'id'>) => string;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

let toastIdCounter = 0;

export function ToastProvider({
  children,
  defaultPosition = 'bottom-right',
}: {
  children: ReactNode;
  defaultPosition?: ToastPosition;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [position, setPosition] = useState<ToastPosition>(defaultPosition);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: Toast = {
      id,
      duration: 4000,
      dismissible: true,
      ...toast,
    };

    // Use view transition if available
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        flushSync(() => {
          setToasts((prev) => [...prev, newToast]);
        });
      });
    } else {
      setToasts((prev) => [...prev, newToast]);
    }

    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    if (document.startViewTransition) {
      // Determine exit direction based on current position
      const translateX = position.includes('right') ? '120%' : position.includes('left') ? '-120%' : '0';
      const translateY = position.includes('center') ? (position.startsWith('top') ? '-100%' : '100%') : '0';

      // Simple numeric view transition name (matches toaster.tsx)
      const toastNum = id.replace('toast-', '');
      const viewTransitionName = `toast${toastNum}`;

      // Inject dynamic CSS for this specific toast's exit animation
      const styleId = `vt-exit-${toastNum}`;
      let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = `
        ::view-transition-old(${viewTransitionName}) {
          animation: slideOut${toastNum} 300ms cubic-bezier(0.32, 0, 0.67, 0) forwards;
        }
        ::view-transition-new(${viewTransitionName}) {
          animation: none;
        }
        @keyframes slideOut${toastNum} {
          0% {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateX(${translateX}) translateY(${translateY});
          }
        }
      `;

      const transition = document.startViewTransition(() => {
        flushSync(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        });
      });

      // Clean up injected style after transition
      transition.finished.then(() => {
        styleEl?.remove();
      }).catch(() => {
        styleEl?.remove();
      });
    } else {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }
  }, [position]);

  const dismissAll = useCallback(() => {
    if (document.startViewTransition && toasts.length > 0) {
      // Determine exit direction based on current position
      const translateX = position.includes('right') ? '120%' : position.includes('left') ? '-120%' : '0';
      const translateY = position.includes('center') ? (position.startsWith('top') ? '-100%' : '100%') : '0';

      // Inject CSS for all current toasts
      const styleId = 'vt-exit-all';
      let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }

      const toastStyles = toasts.map((toast, index) => {
        const toastNum = toast.id.replace('toast-', '');
        const viewTransitionName = `toast${toastNum}`;
        const delay = index * 50; // Stagger the exit
        return `
          ::view-transition-old(${viewTransitionName}) {
            animation: slideOutAll 300ms cubic-bezier(0.32, 0, 0.67, 0) ${delay}ms forwards;
          }
          ::view-transition-new(${viewTransitionName}) {
            animation: none;
          }
        `;
      }).join('\n');

      styleEl.textContent = `
        ${toastStyles}
        @keyframes slideOutAll {
          0% {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateX(${translateX}) translateY(${translateY});
          }
        }
      `;

      const transition = document.startViewTransition(() => {
        flushSync(() => {
          setToasts([]);
        });
      });

      transition.finished.then(() => {
        styleEl?.remove();
      }).catch(() => {
        styleEl?.remove();
      });
    } else {
      setToasts([]);
    }
  }, [position, toasts]);

  return (
    <ToastContext.Provider
      value={{ toasts, position, setPosition, addToast, dismissToast, dismissAll }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}

// Singleton toast function for use outside of React components
let globalAddToast: ((toast: Omit<Toast, 'id'>) => string) | null = null;

export function setGlobalToastFunction(fn: (toast: Omit<Toast, 'id'>) => string) {
  globalAddToast = fn;
}

export const toast = Object.assign(
  (title: string, options?: Partial<Omit<Toast, 'id' | 'title'>>) => {
    if (!globalAddToast) {
      console.warn('Toast not initialized. Make sure Toaster is rendered.');
      return '';
    }
    return globalAddToast({ title, type: 'default', ...options });
  },
  {
    success: (title: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'type'>>) => {
      if (!globalAddToast) return '';
      return globalAddToast({ title, type: 'success', ...options });
    },
    error: (title: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'type'>>) => {
      if (!globalAddToast) return '';
      return globalAddToast({ title, type: 'error', ...options });
    },
    warning: (title: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'type'>>) => {
      if (!globalAddToast) return '';
      return globalAddToast({ title, type: 'warning', ...options });
    },
    info: (title: string, options?: Partial<Omit<Toast, 'id' | 'title' | 'type'>>) => {
      if (!globalAddToast) return '';
      return globalAddToast({ title, type: 'info', ...options });
    },
  }
);
