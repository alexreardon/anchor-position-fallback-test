/**
 * Checks if the browser supports CSS Anchor Positioning.
 */
export function supportsAnchorPositioning(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return CSS.supports('position-area', 'top');
}
