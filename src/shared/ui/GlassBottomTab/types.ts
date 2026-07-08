import React from 'react';

export interface GlassTab {
  id: string;
  label: string;
  icon: string; // Icon name (compatible with lucide-react-native)
}

export interface GlassBottomTabProps {
  tabs: GlassTab[];
  initialIndex?: number;
  onTabPress?: (index: number) => void;
  height?: number;
  backgroundOpacity?: number;
  blurAmount?: number;
  isDarkMode?: boolean;
}
