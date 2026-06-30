export const RENDER_MODES = {
  LIQUID_GLASS: 'liquid-glass',
  BLUR: 'blur',
  SOLID: 'solid',
} as const;

export type RenderMode = typeof RENDER_MODES[keyof typeof RENDER_MODES];

export const COLORS = {
  SOLID_LIGHT: '#E5E7EB',
  SOLID_DARK: '#1F2937',
  BORDER_LIGHT: 'rgba(255, 255, 255, 0.5)',
  BORDER_DARK: 'rgba(255, 255, 255, 0.12)',
  OVERLAY_LIGHT: 'rgba(255, 255, 255, 0.45)',
  OVERLAY_DARK: 'rgba(10, 15, 30, 0.65)',
  TEXT_LIGHT: '#000000',
  TEXT_DARK: '#FFFFFF',
} as const;

export const ANIMATION = {
  SCALE_PRESSED: 0.97,
  SCALE_NORMAL: 1.0,
  DURATION_MS: 120,
} as const;

export const LAYOUT = {
  HEIGHT: 58,
  BORDER_RADIUS: 29,
  PADDING_HORIZONTAL: 24,
} as const;
