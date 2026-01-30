/**
 * Tagged template literal for Tailwind CSS classes.
 * This is primarily used for editor intellisense/autocomplete support.
 */
export function tw(strings: TemplateStringsArray, ...values: string[]): string {
  return String.raw({ raw: strings }, ...values);
}
