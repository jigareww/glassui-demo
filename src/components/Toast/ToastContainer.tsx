import React, { memo } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ToastInstance, ToastPosition } from './Toast.types';
import { ToastItem } from './ToastItem';
import { TOAST_LAYOUT } from './Toast.constants';

interface ToastContainerProps {
  toasts: ToastInstance[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = memo(({ toasts, onDismiss }) => {
  const insets = useSafeAreaInsets();

  // Group active toasts by position
  const topToasts = toasts.filter((t) => t.options.position === 'top');
  const bottomToasts = toasts.filter((t) => t.options.position === 'bottom');
  const floatingToasts = toasts.filter(
    (t) => t.options.position === 'top-floating' || !t.options.position
  );

  const topOffset = Math.max(insets.top, Platform.OS === 'ios' ? TOAST_LAYOUT.TOP_OFFSET_IOS : TOAST_LAYOUT.TOP_OFFSET_ANDROID);
  const bottomOffset = Math.max(insets.bottom, Platform.OS === 'ios' ? TOAST_LAYOUT.BOTTOM_OFFSET_IOS : TOAST_LAYOUT.BOTTOM_OFFSET_ANDROID);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* 1. Top Stack Overlays */}
      {topToasts.length > 0 && (
        <View style={[styles.topContainer, { top: insets.top + 8 }]} pointerEvents="box-none">
          {topToasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
          ))}
        </View>
      )}

      {/* 2. Top-Floating Under Status Bar / Dynamic Island */}
      {floatingToasts.length > 0 && (
        <View style={[styles.floatingContainer, { top: topOffset }]} pointerEvents="box-none">
          {floatingToasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
          ))}
        </View>
      )}

      {/* 3. Bottom Safe Area Container (Stacks from bottom upwards) */}
      {bottomToasts.length > 0 && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'position' : undefined}
          style={[styles.bottomContainer, { bottom: bottomOffset }]}
          pointerEvents="box-none"
        >
          {bottomToasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
          ))}
        </KeyboardAvoidingView>
      )}
    </View>
  );
});

ToastContainer.displayName = 'ToastContainer';

const styles = StyleSheet.create({
  topContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    flexDirection: 'column',
  },
  floatingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    flexDirection: 'column',
  },
  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    flexDirection: 'column-reverse', // Stack from bottom upwards
  },
});
