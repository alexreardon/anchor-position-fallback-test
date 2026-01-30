import type { TCleanupFn } from '@/types';

/**
 * Combines multiple cleanup functions into one.
 * When called, the returned function will execute all cleanup functions.
 */
export function combine(...cleanupFns: TCleanupFn[]): TCleanupFn {
  return function cleanup() {
    for (const fn of cleanupFns) {
      fn();
    }
  };
}
