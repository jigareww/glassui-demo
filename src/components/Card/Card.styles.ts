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
    // @ts-ignore - boxShadow is supported in RN 0.86+ on Fabric
    // boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  },
  innerContainer: {
    ...absoluteFill,
    borderRadius: 24,
    overflow: 'hidden',
    zIndex: 1,
  },
  innerContainerDark: {},
  innerContainerLight: {},
  solidLight: {
    backgroundColor: '#ffffff',
  },
  solidDark: {
    backgroundColor: '#111827',
  },
  overlayLight: {
    backgroundColor: 'rgba(116, 116, 128, 0.08)',
  },
  overlayDark: {
    backgroundColor: 'rgba(8, 17, 44, 0.65)',
  },
  overlayLightAndroid: {
    backgroundColor: 'rgba(116, 116, 128, 0.08)',
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
