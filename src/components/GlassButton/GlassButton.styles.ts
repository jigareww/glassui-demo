import { StyleSheet, Platform } from 'react-native';
import { LAYOUT, COLORS } from './GlassButton.constants';

const absoluteFill = {
  position: 'absolute' as const,
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};

export const styles = StyleSheet.create({
  container: {
    height: LAYOUT.HEIGHT,
    borderRadius: LAYOUT.BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.PADDING_HORIZONTAL,
    flexDirection: 'row',
    // Apple soft HIG shadow system
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    ...Platform.select({
      ios: {
        elevation: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  innerContainer: {
    ...absoluteFill,
    borderRadius: LAYOUT.BORDER_RADIUS,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  solidContainer: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  borderOverlay: {
    borderRadius: LAYOUT.BORDER_RADIUS,
    borderWidth: 1.5, // Crisp high-definition border highlight
    borderColor: 'transparent',
  },
  borderOverlayAndroid: {
    borderRadius: LAYOUT.BORDER_RADIUS,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  androidSolidBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  overlayLight: {
    backgroundColor: COLORS.OVERLAY_LIGHT,
  },
  overlayDark: {
    backgroundColor: COLORS.OVERLAY_DARK,
  },
  overlayLightAndroid: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  overlayDarkAndroid: {
    backgroundColor: 'rgba(15, 20, 30, 0.75)',
  },
  solidLight: {
    backgroundColor: COLORS.SOLID_LIGHT,
  },
  solidDark: {
    backgroundColor: COLORS.SOLID_DARK,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    zIndex: 2,
    elevation: 2,
  },
  iconWrapper: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 17, // SF Pro style body size
    fontWeight: '600', // Semi-Bold
    lineHeight: 22, // Apple standard line-height for 17pt
    letterSpacing: -0.4, // SF Pro tracking parameter for 17pt font
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
    }),
    textAlign: 'center',
  },
  textLight: {
    color: COLORS.TEXT_LIGHT,
  },
  textDark: {
    color: COLORS.TEXT_DARK,
  },
  disabled: {
    opacity: 0.45,
  },
});
