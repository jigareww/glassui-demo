import { StyleSheet } from 'react-native';

const absoluteFill = {
  position: 'absolute' as const,
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 24,
    // Outer card shadow settings
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  innerContainer: {
    ...absoluteFill,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    zIndex: 1,
  },
  innerContainerDark: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  innerContainerLight: {
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  // Sub-layer render styles
  solidLight: {
    backgroundColor: '#ffffff',
  },
  solidDark: {
    backgroundColor: '#111827',
  },
  overlayLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  overlayDark: {
    backgroundColor: 'rgba(8, 17, 44, 0.65)',
  },
  overlayLightAndroid: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  overlayDarkAndroid: {
    backgroundColor: 'rgba(15, 20, 35, 0.75)',
  },
  borderOverlay: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  content: {
    width: '100%',
    padding: 24,
    zIndex: 2,
  },
});
