import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { GlassPayCard } from '../components/GlassPayCard';
import { QuickActionHub } from '../components/QuickActionHub';
import { RecentActivity } from '../components/RecentActivity';
import { NotificationSandbox } from '../components/NotificationSandbox';

interface HomeScreenProps {
  email: string;
  isDarkMode: boolean;
  onSignOut: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = memo(({
  email,
  isDarkMode,
  onSignOut,
}) => {
  const themeColor = isDarkMode ? '#60a5fa' : '#3b82f6';

  return (
    <View style={{ flex: 1, width: '100%' }}>
      {/* Home Header */}
      <View style={[styles.header, isDarkMode ? styles.borderDark : styles.borderLight]}>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.title, isDarkMode ? styles.textDark : styles.textLight]}>
            Home
          </Text>
          <TouchableOpacity
            onPress={onSignOut}
            activeOpacity={0.7}
            style={styles.signOutButton}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.subtitle, isDarkMode ? styles.subtitleDark : styles.subtitleLight]}>
          Logged in as: <Text style={styles.boldText}>{email}</Text>
        </Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Glass Pay Balance Card */}
        <Animated.View entering={FadeIn.duration(400).delay(100)}>
          <GlassPayCard email={email} isDarkMode={isDarkMode} />
        </Animated.View>

        {/* 2. Quick Action Hub */}
        <Animated.View entering={FadeIn.duration(400).delay(200)}>
          <QuickActionHub isDarkMode={isDarkMode} themeColor={themeColor} />
        </Animated.View>

        {/* 3. Recent Transactions */}
        <Animated.View entering={FadeIn.duration(400).delay(300)}>
          <RecentActivity isDarkMode={isDarkMode} />
        </Animated.View>

        {/* 4. Sandbox: Toast Test Panel */}
        <Animated.View entering={FadeIn.duration(400).delay(400)}>
          <NotificationSandbox isDarkMode={isDarkMode} />
        </Animated.View>
      </ScrollView>
    </View>
  );
});

HomeScreen.displayName = 'HomeScreen';

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    width: '100%',
  },
  borderLight: {
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  borderDark: {
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  textLight: {
    color: '#111827',
  },
  textDark: {
    color: '#ffffff',
  },
  signOutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  signOutText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  subtitleLight: {
    color: '#4b5563',
  },
  subtitleDark: {
    color: '#9ca3af',
  },
  boldText: {
    fontWeight: '700',
  },
});
