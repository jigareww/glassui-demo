export const theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#1d4ed8',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    neutral: '#9ca3af',
    
    // Glass Tints
    glass: {
      lightTint: 'rgba(255, 255, 255, 0.45)',
      darkTint: 'rgba(10, 15, 30, 0.65)',
      lightSolid: '#ffffff',
      darkSolid: '#151b2e',
      borderLight: 'rgba(255, 255, 255, 0.55)',
      borderDark: 'rgba(255, 255, 255, 0.15)',
    },
    
    background: {
      light: '#f3f4f6',
      dark: '#050714',
    },
    text: {
      light: '#111827',
      dark: '#ffffff',
      mutedLight: '#4b5563',
      mutedDark: '#9ca3af',
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    capsule: 9999,
  },
  typography: {
    fontFamily: {
      system: 'System',
      monospace: 'monospace',
    },
    sizes: {
      caption: 12,
      body: 14,
      subheading: 15,
      title: 17,
      header: 24,
      logo: 28,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      heavy: '900' as const,
    }
  },
  shadows: {
    apple: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 0,
    },
    toast: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    }
  }
};
