import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface CardProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  isDarkMode?: boolean;
  
  // Custom flags for capability testing / overrides
  disableLiquidGlass?: boolean;
  disableBlur?: boolean;
  
  // Custom configurations for the glass appearance
  interactive?: boolean;
  effect?: 'clear' | 'regular' | 'none';
  contentStyle?: StyleProp<ViewStyle>;
}
