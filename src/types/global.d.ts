/**
 * Extend the global HTMLElement interface with the latest Popover API types.
 * This patches missing type definitions for newer spec features.
 */

interface ShowPopoverOptions {
  /** The element that triggered this popover, used to establish nesting relationships. */
  source?: Element;
}

interface HTMLElement {
  /**
   * Shows the popover element.
   * @param options - Optional configuration including source element for nesting.
   * @see https://html.spec.whatwg.org/multipage/popover.html#dom-htmlelement-showpopover
   */
  showPopover(options?: ShowPopoverOptions): void;
}
