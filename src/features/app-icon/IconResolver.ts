export type SubscriptionTier = 'normal' | 'premium' | 'gold';
export type Festival = 'diwali' | 'christmas' | 'holi' | 'halloween' | 'newyear' | null;

export const ICON_MAP: Record<string, { normal: string; premium: string; gold?: string }> = {
  default: {
    normal: 'default',
    premium: 'gold',
    gold: 'gold' // Fallback
  },
  diwali: {
    normal: 'diwali',
    premium: 'diwali-gold',
    gold: 'diwali-gold'
  },
  christmas: {
    normal: 'christmas',
    premium: 'christmas-gold',
    gold: 'christmas-gold'
  },
  holi: {
    normal: 'holi',
    premium: 'holi-gold',
    gold: 'holi-gold'
  },
  halloween: {
    normal: 'halloween',
    premium: 'halloween-gold',
    gold: 'halloween-gold'
  },
  newyear: {
    normal: 'newyear',
    premium: 'newyear-gold',
    gold: 'newyear-gold'
  }
};

/**
 * Resolves the target app icon identifier based on the user's business state.
 * @param subscription The user's subscription tier
 * @param festival The currently active festival, if any
 * @returns The strongly-typed string identifier for the target native icon
 */
export function resolveAppIcon(
  subscription: SubscriptionTier | string,
  festival: Festival | string | null
): string {
  // Normalize inputs
  const sub = (subscription || 'normal').toLowerCase();
  const fest = (festival || 'default').toLowerCase();

  // Validate the tier (treat anything unknown as normal)
  const isPremium = sub === 'premium' || sub === 'gold';
  const tierKey = isPremium ? 'premium' : 'normal';

  // Find the mapping, fallback to default if festival doesn't exist
  const mapping = ICON_MAP[fest] || ICON_MAP['default'];

  // Return the resolved icon name
  return mapping[tierKey] || mapping.normal || 'default';
}
