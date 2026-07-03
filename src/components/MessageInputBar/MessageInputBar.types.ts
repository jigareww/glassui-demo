import { StyleProp, ViewStyle } from 'react-native';

export interface MessageInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSendPress?: () => void;
  onPlusPress?: () => void;
  placeholder?: string;
  isDarkMode?: boolean;
  style?: StyleProp<ViewStyle>;
}
