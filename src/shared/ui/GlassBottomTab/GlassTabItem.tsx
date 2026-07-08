import React, { memo } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  SharedValue,
} from 'react-native-reanimated';
import * as Icons from 'lucide-react-native';
import { SPRING_CONFIG } from './constants';

interface GlassTabItemProps {
  iconName: string;
  index: number;
  activePosition: SharedValue<number>;
  tabWidth: number;
  isDarkMode?: boolean;
}

export const GlassTabItem: React.FC<GlassTabItemProps> = memo(({
  iconName,
  index,
  activePosition,
  tabWidth,
  isDarkMode = true,
}) => {
  const itemCenter = index * tabWidth + tabWidth / 2;

  // Derive distance from the active sliding capsule to the center of this tab
  const distance = useDerivedValue(() => {
    return Math.abs(activePosition.value - itemCenter);
  });

  const animatedStyle = useAnimatedStyle(() => {
    // Scale and Opacity adjustments based on proximity
    const maxDistance = tabWidth * 1.5;
    const proximity = Math.max(0, 1 - distance.value / maxDistance); // 0 to 1

    const scale = 0.85 + proximity * 0.3; // Ranges from 0.85 to 1.15
    const opacity = 0.55 + proximity * 0.45; // Ranges from 0.55 to 1.0

    // Add translation offset to match getTabCenter spacing
    let tx = 0;
    let ty = -1; // Move every icon upward by 1px
    if (index === 0) ty = -3.5; // Home icon gets shifted further (3.5px up in total)

    return {
      transform: [
        { scale: withSpring(scale, SPRING_CONFIG) },
        { translateX: tx },
        { translateY: ty },
      ],
      opacity: withSpring(opacity, SPRING_CONFIG),
    };
  });

  const iconColor = isDarkMode ? '#ffffff' : '#111827';

  // Render profile avatar if iconName is 'profile'
  if (iconName.toLowerCase() === 'profile') {
    return (
      <View style={[styles.container, { width: tabWidth }]}>
        <Animated.View style={animatedStyle}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
              }}
              style={styles.avatar}
            />
            {/* Red dot badge on the avatar (matches screenshot) */}
            <View style={[styles.badge, { borderColor: isDarkMode ? '#050714' : '#ffffff' }]} />
          </View>
        </Animated.View>
      </View>
    );
  }

  // Resolve Lucide Icon Component
  let IconComponent = (Icons as any)[iconName] || Icons.HelpCircle;

  // For solid home icon look
  if (iconName === 'Home') {
    IconComponent = Icons.Home;
  }

  const iconSize = (iconName === 'Play' || iconName === 'Send' || iconName === 'Search') ? 28 : 22;
  const strokeW = iconName === 'Home' ? 3.0 : 2.5;

  return (
    <View style={[styles.container, { width: tabWidth }]}>
      <Animated.View style={animatedStyle}>
        {iconName === 'Send' ? (
          /* Instagram Direct message icon: rotated paper-airplane with notification dot */
          <View style={styles.iconWithBadge}>
            <View style={{ transform: [{ rotate: '15deg' }] }}>
              <IconComponent size={iconSize} color={iconColor} strokeWidth={strokeW} />
            </View>
            <View style={[styles.badge, { borderColor: isDarkMode ? '#050714' : '#ffffff' }]} />
          </View>
        ) : (
          <IconComponent size={iconSize} color={iconColor} strokeWidth={strokeW} />
        )}
      </Animated.View>
    </View>
  );
});

GlassTabItem.displayName = 'GlassTabItem';

const styles = StyleSheet.create({
  container: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  avatarContainer: {
    position: 'relative',
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2.0,
    borderColor: '#ffffff',
  },
  iconWithBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    bottom: -1,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3b30', // Instagram bright red alert
    borderWidth: 1.5,
  },
});
export default GlassTabItem;
