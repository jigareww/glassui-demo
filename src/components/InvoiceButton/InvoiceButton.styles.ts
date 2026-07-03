import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    height: 44,
    minWidth: 120,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    flexDirection: 'row',
    // @ts-ignore - boxShadow is supported in RN 0.86+ on Fabric
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.12)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  labelLight: {
    color: '#3b82f6',
  },
  labelDark: {
    color: '#60a5fa',
  },
  disabledLabel: {
    color: 'rgba(156, 163, 175, 0.6)',
  },
});
