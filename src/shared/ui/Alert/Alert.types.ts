
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
}

export interface AlertInstance extends AlertConfig {
  id: string;
}
