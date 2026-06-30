import { TextInputProps, StyleProp, ViewStyle } from 'react-native';

export interface GlassTextInputProps extends TextInputProps {
  label?: string;
  isDarkMode?: boolean;
  iconName?: 'email' | 'lock' | 'user';
  
  // Custom flags for capability testing / overrides
  disableLiquidGlass?: boolean;
  disableBlur?: boolean;
  
  // Custom configuration for the container styling
  containerStyle?: StyleProp<ViewStyle>;
}
