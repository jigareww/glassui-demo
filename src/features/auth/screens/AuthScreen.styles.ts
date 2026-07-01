import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '90%',
    borderRadius: 24,
  },
  fieldErrorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  submitButton: {
    width: '100%',
    marginTop: 16,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 16,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
  },
  forgotTextLight: {
    color: '#3b82f6',
  },
  forgotTextDark: {
    color: '#60a5fa',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footerTextLight: {
    color: '#4b5563',
  },
  footerTextDark: {
    color: '#9ca3af',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  footerLinkLight: {
    color: '#3b82f6',
  },
  footerLinkDark: {
    color: '#60a5fa',
  },
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    gap: 8,
  },
  toastWrapper: {
    position: 'absolute',
    width: '90%',
    maxWidth: 340,
  },
  toastCard: {
    borderRadius: 20,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  toastContent: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  toastText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
