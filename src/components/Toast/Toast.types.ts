import { ReactNode } from 'react';
import { StyleProp, ViewStyle, TextStyle } from 'react-native';

export type ToastType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'loading'
  | 'custom';

export type ToastPosition = 'top' | 'bottom' | 'top-floating';

export interface ToastAction {
  label: string;
  onPress: (id: string) => void;
}

export interface ToastOptions {
  duration?: number;
  position?: ToastPosition;
  icon?: ReactNode;
  action?: ToastAction;
  onTap?: (id: string) => void;
  onDismiss?: (id: string) => void;
  showProgress?: boolean;
  dismissible?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  priority?: number;
}

export interface ToastInstance {
  id: string;
  message: string;
  type: ToastType;
  options: ToastOptions;
  createdAt: number;
}
