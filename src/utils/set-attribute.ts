import type { TCleanupFn } from '@/types';

/**
 * Sets an attribute on an element and returns a cleanup function
 * that removes the attribute.
 */
export function setAttribute(
  element: HTMLElement,
  { attribute, value }: { attribute: string; value: string },
): TCleanupFn {
  const previous = element.getAttribute(attribute);
  element.setAttribute(attribute, value);

  return function cleanup() {
    if (previous == null) {
      element.removeAttribute(attribute);
    } else {
      element.setAttribute(attribute, previous);
    }
  };
}
