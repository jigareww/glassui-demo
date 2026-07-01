import { ReactNode } from 'react';
import { StyleProp, ViewStyle, TextStyle } from 'react-native';
import { RenderMode } from './Button.constants';

export interface ButtonProps {
  title?: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconColor?: string;
  isDarkMode?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  showIcon?: boolean;
  
  // Custom flags for simulator capability testing / debugging fallbacks
  disableLiquidGlass?: boolean;
  disableBlur?: boolean;
}

export interface RenderingContext {
  renderMode: RenderMode;
  isLiquidGlassAvailable: boolean;
  isBlurAvailable: boolean;
}
