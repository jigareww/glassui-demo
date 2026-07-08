import React, { memo, useState, useMemo } from "react";
import { View, Dimensions, Platform } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { BlurView } from "@react-native-community/blur";
import LinearGradient from "react-native-linear-gradient";

import { GlassBottomTabProps } from "./types";
import { styles } from "./styles";
import {
  SPRING_CONFIG,
  HORIZONTAL_PADDING,
  TAB_PILL_HEIGHT,
} from "./constants";
import { GlassIndicator } from "./GlassIndicator";
import { GlassTabItem } from "./GlassTabItem";

const CONTAINER_WIDTH = 350;
const TABS_CONTENT_WIDTH = CONTAINER_WIDTH - HORIZONTAL_PADDING * 2;

export const GlassBottomTab: React.FC<GlassBottomTabProps> = memo(
  ({
    tabs,
    initialIndex = 0,
    onTabPress,
    height = TAB_PILL_HEIGHT,
    isDarkMode = true,
  }) => {
    const [activeIndex, setActiveIndex] = useState(initialIndex);

    const totalTabs = tabs.length;
    const tabWidth = TABS_CONTENT_WIDTH / totalTabs;
    const indicatorWidth = tabWidth * 0.72 + 22;

    // Calculate the center position of a given tab index
    const getTabCenter = (index: number) => {
      "worklet";
      return HORIZONTAL_PADDING + index * tabWidth + tabWidth / 2;
    };

    // Shared value representing the continuous X coordinate of the active indicator
    const activePosition = useSharedValue(getTabCenter(initialIndex));

    // Handle Tab Activation via state updates
    const handleTabChange = (index: number) => {
      setActiveIndex(index);
      if (onTabPress) {
        onTabPress(index);
      }
    };

    // 1. Tap Gesture
    const tapGesture = Gesture.Tap().onStart((event) => {
      const touchX = event.x;
      // Calculate which tab was clicked
      const clickedIndex = Math.max(
        0,
        Math.min(
          totalTabs - 1,
          Math.floor((touchX - HORIZONTAL_PADDING) / tabWidth),
        ),
      );

      const targetCenter = getTabCenter(clickedIndex);
      activePosition.value = withSpring(targetCenter, SPRING_CONFIG);
      runOnJS(handleTabChange)(clickedIndex);
    });

    // 2. Pan (Drag) Gesture
    const panGesture = Gesture.Pan()
      .onUpdate((event) => {
        // Clamp position between first and last tab center coordinates
        const minX = getTabCenter(0);
        const maxX = getTabCenter(totalTabs - 1);
        const currentX = Math.max(minX, Math.min(maxX, event.x));

        activePosition.value = currentX;

        // Update active state in real-time as user drags over boundaries
        const dragIndex = Math.max(
          0,
          Math.min(
            totalTabs - 1,
            Math.floor((currentX - HORIZONTAL_PADDING) / tabWidth),
          ),
        );
        runOnJS(setActiveIndex)(dragIndex);
      })
      .onEnd(() => {
        // Snapping to the nearest tab center on drag release
        const currentX = activePosition.value;
        const snapIndex = Math.max(
          0,
          Math.min(
            totalTabs - 1,
            Math.floor((currentX - HORIZONTAL_PADDING) / tabWidth),
          ),
        );

        const targetCenter = getTabCenter(snapIndex);
        activePosition.value = withSpring(targetCenter, SPRING_CONFIG);
        runOnJS(handleTabChange)(snapIndex);
      });

    // Combine both Tap and Pan gestures
    const composedGesture = Gesture.Simultaneous(tapGesture, panGesture);

    // Handle fallback render layers for Apple Glass aesthetic
    const renderFallbackBackground = () => {
      if (Platform.OS === "ios") {
        return (
          <BlurView
            style={styles.absoluteFill}
            blurType={isDarkMode ? "dark" : "light"}
            blurAmount={55}
          />
        );
      }
      return (
        <View
          style={[
            styles.absoluteFill,
            isDarkMode ? styles.glassOverlayDark : styles.glassOverlayLight,
          ]}
        />
      );
    };

    return (
      <GestureDetector gesture={composedGesture}>
        <View
          style={[
            styles.container,
            isDarkMode ? styles.borderDark : styles.borderLight,
            { width: CONTAINER_WIDTH, height: height },
          ]}
        >
          {/* Apple Glass Background Layers */}
          {renderFallbackBackground()}

          {/* Gloss highlights */}
          <LinearGradient
            colors={
              isDarkMode
                ? [
                    "rgba(255, 255, 255, 0.35)",
                    "rgba(255, 255, 255, 0.02)",
                    "rgba(255, 255, 255, 0.06)",
                  ]
                : [
                    "rgba(255, 255, 255, 0.45)",
                    "rgba(255, 255, 255, 0.03)",
                    "rgba(255, 255, 255, 0.1)",
                  ]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.absoluteFill}
            pointerEvents="none"
          />

          <View style={styles.content}>
            {/* Active Glass Indicator */}
            <GlassIndicator
              indicatorWidth={indicatorWidth - 12}
              indicatorHeight={height - 12}
              translateX={activePosition}
              isDarkMode={isDarkMode}
            />

            {/* Render Tab Icons */}
            {tabs.map((tab, index) => (
              <GlassTabItem
                key={tab.id}
                iconName={tab.icon}
                index={index}
                activePosition={activePosition}
                tabWidth={tabWidth}
                isDarkMode={isDarkMode}
              />
            ))}
          </View>
        </View>
      </GestureDetector>
    );
  },
);

GlassBottomTab.displayName = "GlassBottomTab";
export default GlassBottomTab;
