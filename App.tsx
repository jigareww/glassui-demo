import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { GlassButton } from './src/components/GlassButton';
import { GlassCard } from './src/components/GlassCard';
import { AuthFlow } from './src/components/AuthFlow';
import { ToastProvider, toast } from './src/components/Toast';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Premium SVG icon vectors for home quick actions
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

interface DashboardProps {
  email: string;
}

function Dashboard({ email }: DashboardProps) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const themeColor = isDarkMode ? '#60a5fa' : '#3b82f6';
  const iconColor = isDarkMode ? '#ffffff' : '#000000';

  // Simulates loading state transition with Promise toast API
  const handlePromiseToast = () => {
    const mockPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.4 ? resolve('Data Synced') : reject(new Error('Timeout'));
      }, 2000);
    });

    toast.promise(
      mockPromise,
      {
        loading: 'Syncing account details...',
        success: 'Account details synced successfully!',
        error: 'Failed to sync: connection timeout',
      },
      { position: 'top-floating', showProgress: true }
    );
  };

  const handleActionToast = () => {
    toast.info('Document moved to trash.', {
      position: 'top-floating',
      duration: 5000,
      showProgress: true,
      action: {
        label: 'Undo',
        onPress: (id) => {
          toast.success('Document restored from trash!', { position: 'top-floating' });
          toast.dismiss(id);
        },
      },
    });
  };

  const handleMultiToasts = () => {
    toast.success('Success notification queued!', { position: 'top-floating', showProgress: true });
    setTimeout(() => {
      toast.warning('Warning notification queued!', { position: 'top-floating', showProgress: true });
    }, 100);
    setTimeout(() => {
      toast.error('Error notification queued!', { position: 'top-floating', showProgress: true });
    }, 200);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* 1. Glass Pay Balance Card */}
      <GlassCard
        isDarkMode={isDarkMode}
        style={styles.balanceCard}
        contentStyle={styles.balanceCardContent}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardBrand}>PayGlass</Text>
          <View style={styles.cardChip} />
        </View>
        <View>
          <Text style={styles.cardLabel}>Available Balance</Text>
          <Text style={styles.cardBalance}>$12,480.50</Text>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.cardNumber}>•••• 5689</Text>
          <Text style={styles.cardHolder}>{email.split('@')[0]}</Text>
        </View>
      </GlassCard>

      {/* 2. Quick Action Hub */}
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

      {/* 3. Recent Transactions */}
      <View style={[styles.showcaseWrapper, { marginTop: 24 }]}>
        <Text style={[styles.showcaseLabel, isDarkMode ? styles.subtitleDark : styles.subtitleLight]}>
          Recent Activity
        </Text>

        <GlassCard isDarkMode={isDarkMode} style={styles.transactionCard}>
          <View style={styles.transactionItem}>
            <View style={styles.transactionMeta}>
              <Text style={[styles.transactionMerchant, isDarkMode ? styles.textDark : styles.textLight]}>Apple Store</Text>
              <Text style={[styles.transactionDate, isDarkMode ? styles.subtitleDark : styles.subtitleLight]}>iPhone 16 Pro Max</Text>
            </View>
            <Text style={[styles.transactionAmount, styles.amountDebit]}>-$1,299.00</Text>
          </View>

          <View style={[styles.transactionItem, styles.transactionBorder]}>
            <View style={styles.transactionMeta}>
              <Text style={[styles.transactionMerchant, isDarkMode ? styles.textDark : styles.textLight]}>Salary Deposit</Text>
              <Text style={[styles.transactionDate, isDarkMode ? styles.subtitleDark : styles.subtitleLight]}>June 30, 2026</Text>
            </View>
            <Text style={[styles.transactionAmount, styles.amountCredit]}>+$4,500.00</Text>
          </View>

          <View style={[styles.transactionItem, styles.transactionBorder]}>
            <View style={styles.transactionMeta}>
              <Text style={[styles.transactionMerchant, isDarkMode ? styles.textDark : styles.textLight]}>Starbucks Coffee</Text>
              <Text style={[styles.transactionDate, isDarkMode ? styles.subtitleDark : styles.subtitleLight]}>Double Espresso</Text>
            </View>
            <Text style={[styles.transactionAmount, styles.amountDebit]}>-$5.75</Text>
          </View>
        </GlassCard>
      </View>

      {/* 4. Sandbox: Toast Test Panel */}
      <View style={[styles.showcaseWrapper, { marginTop: 24 }]}>
        <Text style={[styles.showcaseLabel, isDarkMode ? styles.subtitleDark : styles.subtitleLight]}>
          Notification Sandbox
        </Text>

        <GlassCard isDarkMode={isDarkMode} style={styles.transactionCard}>
          <Text style={[styles.cardTitleSection, isDarkMode ? styles.textDark : styles.textLight]}>
            Trigger Alerts
          </Text>

          <View style={styles.sandboxGrid}>
            <GlassButton
              title="Success Top-Floating"
              isDarkMode={isDarkMode}
              onPress={() => toast.success('Task created successfully!', { position: 'top-floating', showProgress: true })}
              style={styles.sandboxButton}
            />

            <GlassButton
              title="Error Top-Floating"
              isDarkMode={isDarkMode}
              onPress={() => toast.error('Failed to save draft changes.', { position: 'top-floating', showProgress: true })}
              style={styles.sandboxButton}
            />

            <GlassButton
              title="Bottom Warning Info"
              isDarkMode={isDarkMode}
              onPress={() => toast.warning('Low storage space warning.', { position: 'bottom', showProgress: true })}
              style={styles.sandboxButton}
            />

            <GlassButton
              title="Promise API Loader"
              isDarkMode={isDarkMode}
              onPress={handlePromiseToast}
              style={styles.sandboxButton}
            />

            <GlassButton
              title="Action Button Toast"
              isDarkMode={isDarkMode}
              onPress={handleActionToast}
              style={styles.sandboxButton}
            />

            <GlassButton
              title="Trigger Sequential Queue"
              isDarkMode={isDarkMode}
              onPress={handleMultiToasts}
              style={styles.sandboxButton}
            />
          </View>
        </GlassCard>
      </View>
    </ScrollView>
  );
}

function MainLayout() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [authenticatedEmail, setAuthenticatedEmail] = useState<string | null>(null);

  const handleSignOut = () => {
    setAuthenticatedEmail(null);
    toast.info('Signed out successfully.');
  };

  const handleAuthSuccess = (email: string) => {
    setAuthenticatedEmail(email);
    toast.success(`Welcome, ${email}!`);
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.bgDark : styles.bgLight]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      {/* Global floating background elements for system-wide glass refraction */}
      <View style={styles.globalBg} pointerEvents="none">
        {/* Top-Right Royal Blue Sphere */}
        <LinearGradient
          colors={isDarkMode ? ['#1e40af', '#1e1b4b'] : ['#60a5fa', '#93c5fd']}
          style={styles.globalSphereTop}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {/* Center-Left Violet/Pink Sphere */}
        <LinearGradient
          colors={isDarkMode ? ['#701a75', '#4a044e'] : ['#e9d5ff', '#f472b6']}
          style={styles.globalSphereMiddle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {/* Bottom-Left Teal/Green Arc */}
        <LinearGradient
          colors={isDarkMode ? ['#0f766e', '#115e59'] : ['#2dd4bf', '#5eead4']}
          style={styles.globalSphereBottom}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {!authenticatedEmail ? (
          /* Unauthenticated state: Render Glassmorphism Auth Flow */
          <View style={styles.authContainer}>
            <AuthFlow
              isDarkMode={isDarkMode}
              onAuthSuccess={handleAuthSuccess}
            />
          </View>
        ) : (
          /* Authenticated state: Render Glassmorphism Dashboard Showcase */
          <>
            {/* Authenticated Dashboard Header */}
            <View style={[styles.header, isDarkMode ? styles.borderDark : styles.borderLight]}>
              <View style={styles.headerTitleRow}>
                <Text style={[styles.title, isDarkMode ? styles.textDark : styles.textLight]}>
                  Home
                </Text>
                <TouchableOpacity
                  onPress={handleSignOut}
                  activeOpacity={0.7}
                  style={styles.signOutButton}
                >
                  <Text style={[styles.signOutText, isDarkMode ? styles.signOutTextDark : styles.signOutTextLight]}>
                    Sign Out
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.subtitle, isDarkMode ? styles.subtitleDark : styles.subtitleLight]}>
                Logged in as: <Text style={styles.boldText}>{authenticatedEmail}</Text>
              </Text>
            </View>

            <Dashboard email={authenticatedEmail} />
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToastProvider>
          <MainLayout />
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgDark: {
    backgroundColor: '#050714',
  },
  bgLight: {
    backgroundColor: '#f3f4f6',
  },
  safeArea: {
    flex: 1,
  },
  globalBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  globalSphereTop: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    top: '10%',
    right: '-10%',
    opacity: 0.85,
  },
  globalSphereMiddle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: '40%',
    left: '-10%',
    opacity: 0.75,
  },
  globalSphereBottom: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    bottom: '10%',
    left: '-15%',
    opacity: 0.9,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  borderDark: {
    borderBottomColor: '#1f2937',
  },
  borderLight: {
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  textDark: {
    color: '#ffffff',
  },
  textLight: {
    color: '#111827',
  },
  signOutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '700',
  },
  signOutTextDark: {
    color: '#f87171',
  },
  signOutTextLight: {
    color: '#ef4444',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  subtitleDark: {
    color: '#9ca3af',
  },
  subtitleLight: {
    color: '#4b5563',
  },
  boldText: {
    fontWeight: '700',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  showcaseWrapper: {
    gap: 12,
  },
  showcaseLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  mockupContainerDark: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  mockupContainerLight: {
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  buttonCenter: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  mockupButton: {
    width: '100%',
    maxWidth: 240,
    height: 56,
  },
  sandboxGrid: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  sandboxButton: {
    width: '100%',
    height: 52,
  },

  // 1. Balance Card Styles
  balanceCard: {
    width: '100%',
    borderRadius: 24,
    marginBottom: 20,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  balanceCardContent: {
    padding: 24,
    height: 200,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBrand: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  cardChip: {
    width: 36,
    height: 26,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.65)',
    marginBottom: 4,
  },
  cardBalance: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardNumber: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  cardHolder: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // 2. Action Hub Styles
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  actionItem: {
    alignItems: 'center',
    width: '22%',
  },
  actionIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconBgLight: {
    backgroundColor: '#ffffff',
  },
  iconBgDark: {
    backgroundColor: '#1f2937',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  // 3. Transactions Panel Styles
  transactionCard: {
    width: '100%',
    borderRadius: 24,
    padding: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    width: '100%',
  },
  transactionBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(156, 163, 175, 0.15)',
  },
  transactionMeta: {
    flexDirection: 'column',
  },
  transactionMerchant: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  amountDebit: {
    color: '#ef4444',
  },
  amountCredit: {
    color: '#10b981',
  },
  cardTitleSection: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
});

export default App;
