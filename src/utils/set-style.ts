import type { TCleanupFn } from '@/types';

/**
 * Sets a CSS style property on an element and returns a cleanup function
 * that restores the previous value.
 */
export function setStyle(
  element: HTMLElement,
  { property, value }: { property: string; value: string },
): TCleanupFn {
  const previous = element.style.getPropertyValue(property);
  element.style.setProperty(property, value);

  return function cleanup() {
    if (previous === '') {
      element.style.removeProperty(property);
    } else {
      element.style.setProperty(property, previous);
    }
  };
}
