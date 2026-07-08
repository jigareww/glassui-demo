import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { ChartPoint } from '../store/useTokenStore';

const { width: screenWidth } = Dimensions.get('window');

interface TokenPriceChartProps {
  data: ChartPoint[];
  width?: number;
  height?: number;
  isDarkMode?: boolean;
}

export const TokenPriceChart: React.FC<TokenPriceChartProps> = memo(({
  data,
  width = screenWidth - 48, // Padding 24 on each side
  height = 180,
  isDarkMode = true,
}) => {
  const chartDetails = useMemo(() => {
    if (data.length === 0) return { path: '', areaPath: '', minPrice: '0', maxPrice: '0' };

    const values = data.map((d) => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * width;
      // Invert Y coordinate so higher values appear at the top
      const y = height - ((point.value - minVal) / range) * (height - 20) - 10;
      return { x, y };
    });

    // Create Path String
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }

    // Create Area Path for under-line gradient fill
    const areaPath = `${path} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return {
      path,
      areaPath,
      minPrice: minVal.toFixed(2),
      maxPrice: maxVal.toFixed(2),
    };
  }, [data, width, height]);

  if (data.length === 0) {
    return (
      <View style={[styles.container, { height }, styles.center]}>
        <Text style={isDarkMode ? styles.textMutedDark : styles.textMutedLight}>
          No pricing history available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.priceBoundaryRow}>
        <Text style={[styles.boundaryText, isDarkMode ? styles.textMutedDark : styles.textMutedLight]}>
          High: ${chartDetails.maxPrice}
        </Text>
      </View>

      <Svg width={width} height={height}>
        <Defs>
          <SvgGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </SvgGradient>
        </Defs>

        {/* Gradient fill under the line */}
        <Path d={chartDetails.areaPath} fill="url(#chartGradient)" />

        {/* Main Line Path */}
        <Path
          d={chartDetails.path}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
        />
      </Svg>

      <View style={[styles.priceBoundaryRow, styles.alignBottom]}>
        <Text style={[styles.boundaryText, isDarkMode ? styles.textMutedDark : styles.textMutedLight]}>
          Low: ${chartDetails.minPrice}
        </Text>
      </View>
    </View>
  );
});

TokenPriceChart.displayName = 'TokenPriceChart';

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    width: '100%',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceBoundaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  alignBottom: {
    marginTop: 4,
    marginBottom: 0,
  },
  boundaryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  textMutedDark: {
    color: '#9ca3af',
  },
  textMutedLight: {
    color: '#4b5563',
  },
});
export default TokenPriceChart;
