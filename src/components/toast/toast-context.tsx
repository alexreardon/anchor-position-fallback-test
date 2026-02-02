'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

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
        setToasts((prev) => [...prev, newToast]);
      });
    } else {
      setToasts((prev) => [...prev, newToast]);
    }

    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      });
    } else {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }
  }, []);

  const dismissAll = useCallback(() => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setToasts([]);
      });
    } else {
      setToasts([]);
    }
  }, []);

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
