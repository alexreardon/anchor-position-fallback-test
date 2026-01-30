import type { Ref, RefCallback } from 'react';

/**
 * Merges multiple refs into a single callback ref.
 */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (value: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as { current: T | null }).current = value;
      }
    }
  };
}
