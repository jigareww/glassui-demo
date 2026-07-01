import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { toast } from '../../../shared/ui/Toast';

interface QuickActionHubProps {
  isDarkMode: boolean;
  themeColor: string;
}

const ActionIcon: React.FC<{ type: 'send' | 'request' | 'history' | 'settings'; color: string }> = ({ type, color }) => {
  switch (type) {
    case 'send':
      return (
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Path d="M22 2L11 13" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'request':
      return (
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M7 10l5 5 5-5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M12 15V3" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'history':
      return (
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Path d="M12 8v4l3 3" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'settings':
      return (
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
  }
};

export const QuickActionHub: React.FC<QuickActionHubProps> = ({ isDarkMode, themeColor }) => {
  return (
    <View style={styles.actionContainer}>
      <TouchableOpacity
        onPress={() => toast.success('Transfer screen initialized')}
        activeOpacity={0.7}
        style={styles.actionItem}
      >
        <View style={[styles.actionIconBg, isDarkMode ? styles.iconBgDark : styles.iconBgLight]}>
          <ActionIcon type="send" color={themeColor} />
        </View>
        <Text style={[styles.actionLabel, isDarkMode ? styles.textDark : styles.textLight]}>Send</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => toast.success('Request QR code generated')}
        activeOpacity={0.7}
        style={styles.actionItem}
      >
        <View style={[styles.actionIconBg, isDarkMode ? styles.iconBgDark : styles.iconBgLight]}>
          <ActionIcon type="request" color={themeColor} />
        </View>
        <Text style={[styles.actionLabel, isDarkMode ? styles.textDark : styles.textLight]}>Request</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => toast.info('Opening transactions list')}
        activeOpacity={0.7}
        style={styles.actionItem}
      >
        <View style={[styles.actionIconBg, isDarkMode ? styles.iconBgDark : styles.iconBgLight]}>
          <ActionIcon type="history" color={themeColor} />
        </View>
        <Text style={[styles.actionLabel, isDarkMode ? styles.textDark : styles.textLight]}>History</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => toast.success('Settings dashboard active')}
        activeOpacity={0.7}
        style={styles.actionItem}
      >
        <View style={[styles.actionIconBg, isDarkMode ? styles.iconBgDark : styles.iconBgLight]}>
          <ActionIcon type="settings" color={themeColor} />
        </View>
        <Text style={[styles.actionLabel, isDarkMode ? styles.textDark : styles.textLight]}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginTop: 24,
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
