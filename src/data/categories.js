/**
 * CATEGORY DATA
 * -------------
 * Order is fixed by the design reference (spec §8) and must not be re-sorted.
 *
 * `match` decides which vendors a category surfaces:
 *   - `categories` matches vendor.facts.category exactly
 *   - `keywords`   matches vendor.facts.specialty (case-insensitive substring)
 *
 * The tile list itself is frozen — the update spec (§26) forbids adding or
 * removing homepage category cards. Newer vendor categories are folded into the
 * existing eight tiles through `match.categories` instead, so every tile now
 * resolves vendors without the grid changing shape.
 *
 * Keyword matching is used sparingly, only where a vendor's *stated specialty*
 * places it somewhere its recorded category does not. Broad keywords like
 * "wedding" are deliberately absent: they would file a wedding photographer
 * under Wedding Decoration.
 */

export const CATEGORIES = [
  {
    id: 'wedding-decoration',
    label: 'Wedding Decoration',
    icon: 'arch',
    tone: 'pink',
    match: { categories: ['Decorators', 'Florists'] },
  },
  {
    id: 'catering-services',
    label: 'Catering Services',
    icon: 'dish',
    tone: 'lavender',
    match: { categories: ['Catering'] },
  },
  {
    id: 'event-entertainment',
    label: 'Event Entertainment',
    icon: 'music',
    tone: 'peach',
    // "Seasons entertainers" is recorded as a Decorator but states an
    // entertainment specialty, so it surfaces here on the keyword too.
    match: { categories: ['Entertainment', 'DJs', 'Live Bands'], keywords: ['entertain'] },
  },
  {
    id: 'birthday-parties',
    label: 'Birthday Parties',
    icon: 'cake',
    tone: 'yellow',
    match: { categories: ['Birthday Parties', 'Return Gifts'] },
  },
  {
    id: 'corporate-events',
    label: 'Corporate Events',
    icon: 'building',
    tone: 'sky',
    match: { categories: ['Corporate Events'] },
  },
  {
    id: 'photography-videography',
    label: 'Photography & Videography',
    icon: 'camera',
    tone: 'rose',
    match: { categories: ['Photography'] },
  },
  {
    id: 'mehendi-makeup',
    label: 'Mehendi & Makeup',
    icon: 'lotus',
    tone: 'peach',
    match: { categories: ['Mehendi & Makeup'] },
  },
  { id: 'venues', label: 'Venues', icon: 'pin', tone: 'mint', match: { categories: ['Venues'] } },
  { id: 'all-categories', label: 'All Categories', icon: 'grid', tone: 'blue', isAll: true, match: {} },
];

/** The nine tiles minus the "All Categories" shortcut — used by filter chips. */
export const FILTERABLE_CATEGORIES = CATEGORIES.filter((c) => !c.isAll);

export const getCategoryById = (id) => CATEGORIES.find((c) => c.id === id) ?? null;

/** True when `vendor` belongs in `category`. An `isAll` category matches everything. */
export const vendorMatchesCategory = (vendor, category) => {
  if (!category || category.isAll) return true;
  const { categories = [], keywords = [] } = category.match ?? {};
  if (categories.includes(vendor.facts.category)) return true;
  const specialty = vendor.facts.specialty.toLowerCase();
  return keywords.some((k) => specialty.includes(k.toLowerCase()));
};

/** Service locations offered in the demo. Hyderabad is the default (spec §6). */
export const LOCATIONS = ['Hyderabad', 'Bengaluru', 'Chennai', 'Vijayawada', 'Visakhapatnam'];
export const DEFAULT_LOCATION = 'Hyderabad';

/** Event types offered by the booking form (spec §16). */
export const EVENT_TYPES = [
  'Wedding',
  'Engagement',
  'Reception',
  'Birthday party',
  'Corporate event',
  'Housewarming',
  'Other celebration',
];

/** Sort options for vendor discovery (spec §12). */
export const SORT_OPTIONS = [
  { id: 'experience', label: 'Experience (high to low)' },
  { id: 'events', label: 'Events / scale (high to low)' },
  { id: 'name', label: 'Name (A to Z)' },
];
