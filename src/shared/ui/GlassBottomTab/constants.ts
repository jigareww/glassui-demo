import { WithSpringConfig } from 'react-native-reanimated';

export const TAB_BAR_HEIGHT = 64;
export const HORIZONTAL_PADDING = 2;
export const TAB_PILL_HEIGHT = 64;

// Custom spring configuration for elastic, premium iOS-style feel
export const SPRING_CONFIG: WithSpringConfig = {
  damping: 18,
  stiffness: 150,
  mass: 0.8,
  overshootClamping: false,
};
export default SPRING_CONFIG;
