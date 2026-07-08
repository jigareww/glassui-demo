import { StyleSheet } from 'react-native';
import { TAB_BAR_HEIGHT, HORIZONTAL_PADDING } from './constants';

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 13,
    left: '50%',
    marginLeft: -175, // Half of 350 width to center perfectly
    width: 350,
    height: TAB_BAR_HEIGHT,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  borderDark: {
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  borderLight: {
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  content: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    paddingHorizontal: HORIZONTAL_PADDING,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  absoluteFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  glassOverlayDark: {
    backgroundColor: 'rgba(8, 17, 44, 0.35)',
  },
  glassOverlayLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});
export default styles;
