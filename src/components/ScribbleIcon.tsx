import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ScribbleIconProps {
  color: string;
  size?: number;
}

export const ScribbleIcon: React.FC<ScribbleIconProps> = ({ color, size = 22 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 15 C 7 11, 8 7, 10 7 C 12 7, 11 15, 13.5 15 C 15.5 15, 16.5 9, 19 7"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
