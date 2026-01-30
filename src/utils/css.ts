/**
 * Simple utility for combining CSS class names.
 * Filters out falsy values and joins with space.
 */
export function css(...classNames: (string | false | null | undefined)[]): string {
  return classNames.filter(Boolean).join(' ');
}
