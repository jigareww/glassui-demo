import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  SharedValue,
} from "react-native-reanimated";
import LinearGradient from "react-native-linear-gradient";

interface GlassIndicatorProps {
  indicatorWidth: number;
  indicatorHeight?: number;
  translateX: SharedValue<number>;
  isDarkMode?: boolean;
}

export const GlassIndicator: React.FC<GlassIndicatorProps> = memo(
  ({ indicatorWidth, indicatorHeight = 44, translateX, isDarkMode = true }) => {
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: translateX.value - indicatorWidth / 2 }],
      };
    });

    return (
      <Animated.View
        style={[
          styles.container,
          {
            width: indicatorWidth,
            height: indicatorHeight,
            borderRadius: 18,
          },
          animatedStyle,
        ]}
      >
        {/* Dynamic Glass Glow Backdrops */}
        <View
          style={[
            StyleSheet.absoluteFill,
            isDarkMode ? styles.bgDark : styles.bgLight,
            { borderRadius: 18 },
          ]}
        />

        {/* Internal highlight borders */}
        <LinearGradient
          colors={
            isDarkMode
              ? [
                  "rgba(255, 255, 255, 0.25)",
                  "rgba(255, 255, 255, 0.02)",
                  "rgba(255, 255, 255, 0.05)",
                ]
              : [
                  "rgba(255, 255, 255, 0.45)",
                  "rgba(255, 255, 255, 0.05)",
                  "rgba(255, 255, 255, 0.15)",
                ]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            StyleSheet.absoluteFill,
            styles.borderOverlay,
            { borderRadius: 18 },
          ]}
          pointerEvents="none"
        />
      </Animated.View>
    );
  },
);

GlassIndicator.displayName = "GlassIndicator";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bgDark: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  bgLight: {
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  borderOverlay: {
    borderWidth: 1,
    borderColor: "transparent",
  },
});
export default GlassIndicator;
