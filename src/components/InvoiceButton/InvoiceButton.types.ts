import { GestureResponderEvent, StyleProp, ViewStyle, TextStyle } from 'react-native';

export interface InvoiceButtonProps {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
  isDarkMode?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  iconName?: string;
}
