import { Platform } from 'react-native';

export const DEFAULT_DURATIONS = {
  success: 3000,
  error: 4000,
  warning: 3500,
  info: 3000,
  loading: 0, // 0 = persistent, requires manual dismiss or update
  custom: 3000,
} as const;

export const TOAST_SPRING_CONFIG = {
  mass: 1,
  damping: 18,
  stiffness: 140,
} as const;

export const TOAST_LAYOUT = {
  WIDTH_PCT: '90%',
  MAX_WIDTH: 360,
  MIN_HEIGHT: 56,
  BORDER_RADIUS: 24,
  TOP_OFFSET_IOS: 60,
  TOP_OFFSET_ANDROID: 40,
  BOTTOM_OFFSET_IOS: 40,
  BOTTOM_OFFSET_ANDROID: 30,
} as const;

export const TOAST_COLORS = {
  success: '#10B981', // Emerald green
  error: '#EF4444',   // Red
  warning: '#F59E0B', // Amber orange
  info: '#3B82F6',    // Blue
  loading: '#9CA3AF', // Gray
} as const;
