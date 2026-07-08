import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

interface QuickActionHubProps {
  isDarkMode: boolean;
  themeColor: string;
  onNavigate: (screen: 'transfer' | 'swap' | 'staking' | 'nfts' | 'walletconnect' | 'token-detail') => void;
}

const ActionIcon: React.FC<{ type: string; color: string }> = ({ type, color }) => {
  switch (type) {
    case 'send':
      return (
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Path d="M22 2L11 13" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'swap':
      return (
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Path d="M17 1l4 4-4 4" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M3 5h18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M7 23l-4-4 4-4" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M21 19H3" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'staking':
      return (
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'nfts':
      return (
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2.5" />
          <Path d="M21 15l-5-5L5 21" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'walletconnect':
      return (
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Path d="M5.5 8.5a6.5 6.5 0 0 1 13 0v4a6.5 6.5 0 0 1-13 0v-4z" stroke={color} strokeWidth="2.5" />
          <Path d="M12 3v3M12 18v3" stroke={color} strokeWidth="2.5" />
        </Svg>
      );
    case 'receive':
      return (
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Path d="M12 2v14M7 11l5 5 5-5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M4 22h16" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    default:
      return null;
  }
};

export const QuickActionHub: React.FC<QuickActionHubProps> = ({ isDarkMode, themeColor, onNavigate }) => {
  return (
    <View style={styles.container}>
      {/* Row 1 */}
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => onNavigate('transfer')}
          activeOpacity={0.7}
          style={styles.actionItem}
        >
          <View style={[styles.actionIconBg, isDarkMode ? styles.iconBgDark : styles.iconBgLight]}>
            <ActionIcon type="send" color={themeColor} />
          </View>
          <Text style={[styles.actionLabel, isDarkMode ? styles.textDark : styles.textLight]}>Send</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onNavigate('swap')}
          activeOpacity={0.7}
          style={styles.actionItem}
        >
          <View style={[styles.actionIconBg, isDarkMode ? styles.iconBgDark : styles.iconBgLight]}>
            <ActionIcon type="swap" color={themeColor} />
          </View>
          <Text style={[styles.actionLabel, isDarkMode ? styles.textDark : styles.textLight]}>Swap</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onNavigate('staking')}
          activeOpacity={0.7}
          style={styles.actionItem}
        >
          <View style={[styles.actionIconBg, isDarkMode ? styles.iconBgDark : styles.iconBgLight]}>
            <ActionIcon type="staking" color={themeColor} />
          </View>
          <Text style={[styles.actionLabel, isDarkMode ? styles.textDark : styles.textLight]}>Stake</Text>
        </TouchableOpacity>
      </View>

      {/* Row 2 */}
      <View style={[styles.row, styles.marginTop]}>
        <TouchableOpacity
          onPress={() => onNavigate('nfts')}
          activeOpacity={0.7}
          style={styles.actionItem}
        >
          <View style={[styles.actionIconBg, isDarkMode ? styles.iconBgDark : styles.iconBgLight]}>
            <ActionIcon type="nfts" color={themeColor} />
          </View>
          <Text style={[styles.actionLabel, isDarkMode ? styles.textDark : styles.textLight]}>NFTs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onNavigate('walletconnect')}
          activeOpacity={0.7}
          style={styles.actionItem}
        >
          <View style={[styles.actionIconBg, isDarkMode ? styles.iconBgDark : styles.iconBgLight]}>
            <ActionIcon type="walletconnect" color={themeColor} />
          </View>
          <Text style={[styles.actionLabel, isDarkMode ? styles.textDark : styles.textLight]}>dApps</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onNavigate('receive' as any)}
          activeOpacity={0.7}
          style={styles.actionItem}
        >
          <View style={[styles.actionIconBg, isDarkMode ? styles.iconBgDark : styles.iconBgLight]}>
            <ActionIcon type="receive" color={themeColor} />
          </View>
          <Text style={[styles.actionLabel, isDarkMode ? styles.textDark : styles.textLight]}>Receive</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 24,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  marginTop: {
    marginTop: 20,
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconBg: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBgLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  iconBgDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  textLight: {
    color: '#111827',
  },
  textDark: {
    color: '#ffffff',
  },
});
export default QuickActionHub;
