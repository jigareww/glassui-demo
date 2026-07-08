import React from 'react';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertConfig {
  title: string;
  message: string;
  buttons?: AlertButton[];
  isDarkMode?: boolean;
  customView?: React.ReactNode;
  cancelable?: boolean;
}

export interface AlertInstance extends AlertConfig {
  id: string;
}
