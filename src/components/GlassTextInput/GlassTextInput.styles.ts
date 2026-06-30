import { StyleSheet } from 'react-native';

const absoluteFill = {
  position: 'absolute' as const,
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};

export const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelLight: {
    color: '#4b5563',
  },
  labelDark: {
    color: '#9ca3af',
  },
  inputWrapper: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  inputWrapperLight: {
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  inputWrapperDark: {
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  inputWrapperFocusedLight: {
    borderColor: '#3b82f6',
  },
  inputWrapperFocusedDark: {
    borderColor: '#60a5fa',
  },
  // Sub-layer render background styles
  solidLight: {
    backgroundColor: '#ffffff',
  },
  solidDark: {
    backgroundColor: '#1f2937',
  },
  overlayLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
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
  innerContainer: {
    ...absoluteFill,
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 1,
  },
  borderOverlay: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconLeft: {
    marginRight: 12,
    zIndex: 2,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontWeight: '500',
    padding: 0, // Reset default padding
    zIndex: 2,
  },
  textInputLight: {
    color: '#111827',
  },
  textInputDark: {
    color: '#ffffff',
  },
  iconRight: {
    marginLeft: 10,
    padding: 4,
    zIndex: 2,
  },
});
