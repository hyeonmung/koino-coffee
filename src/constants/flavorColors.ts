/**
 * Maps each Flavor Family (src/data/seed/flavors.ts) to a muted, editorial color used to
 * tint individual flavor note text (e.g. "Mango", "Blackberry") wherever notes are shown.
 * A note that doesn't resolve to a known descriptor/family keeps the surrounding default
 * text color instead of guessing — consistent with the site's "never fabricate" principle.
 */
export const FLAVOR_FAMILY_COLOR: Record<string, string> = {
  'family-floral': '#B76E79',
  'family-citrus': '#B8901E',
  'family-berry': '#7A3B54',
  'family-stone-fruit': '#C1653F',
  'family-tropical': '#D2691E',
  'family-sweet': '#A9772F',
  'family-nutty': '#8B6A4F',
  'family-chocolate': '#5B3A29',
  'family-spice': '#A1452F',
  'family-herbal': '#62785A',
}
