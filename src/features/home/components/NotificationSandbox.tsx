import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { toast } from '../../../shared/ui/Toast';
import { alert } from '../../../shared/ui/Alert';

interface NotificationSandboxProps {
  isDarkMode: boolean;
}

export const NotificationSandbox: React.FC<NotificationSandboxProps> = ({ isDarkMode }) => {
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
    <View style={styles.showcaseWrapper}>
      <Text style={[styles.showcaseLabel, isDarkMode ? styles.subtitleDark : styles.subtitleLight]}>
        Notification Sandbox
      </Text>

      <Card isDarkMode={isDarkMode} style={styles.transactionCard}>
        <Text style={[styles.cardTitleSection, isDarkMode ? styles.textDark : styles.textLight]}>
          Trigger Alerts
        </Text>

        <View style={styles.sandboxGrid}>
          <Button
            title="Success Top-Floating"
            isDarkMode={isDarkMode}
            onPress={() => toast.success('Task created successfully!', { position: 'top-floating', showProgress: true })}
            style={styles.sandboxButton}
          />

          <Button
            title="Error Top-Floating"
            isDarkMode={isDarkMode}
            onPress={() => toast.error('Failed to save draft changes.', { position: 'top-floating', showProgress: true })}
            style={styles.sandboxButton}
          />

          <Button
            title="Bottom Warning Info"
            isDarkMode={isDarkMode}
            onPress={() => toast.warning('Low storage space warning.', { position: 'bottom', showProgress: true })}
            style={styles.sandboxButton}
          />

          <Button
            title="Promise API Loader"
            isDarkMode={isDarkMode}
            onPress={handlePromiseToast}
            style={styles.sandboxButton}
          />

          <Button
            title="Action Button Toast"
            isDarkMode={isDarkMode}
            onPress={handleActionToast}
            style={styles.sandboxButton}
          />

          <Button
            title="Trigger Sequential Queue"
            isDarkMode={isDarkMode}
            onPress={handleMultiToasts}
            style={styles.sandboxButton}
          />

          <Button
            title="Custom Dialog Alert"
            isDarkMode={isDarkMode}
            onPress={() => alert.show({
              title: 'Sandbox Alert',
              message: 'This is a premium glassmorphic custom alert! Fully customizable colors, borders and actions.',
              buttons: [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Confirm', onPress: () => toast.success('Confirmed from Sandbox!') }
              ]
            })}
            style={styles.sandboxButton}
          />
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  showcaseWrapper: {
    width: '100%',
    marginTop: 24,
  },
  showcaseLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  subtitleLight: {
    color: '#374151',
  },
  subtitleDark: {
    color: '#9ca3af',
  },
  transactionCard: {
    borderRadius: 24,
  },
  cardTitleSection: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  sandboxGrid: {
    flexDirection: 'column',
    gap: 8,
    width: '100%',
  },
  sandboxButton: {
    width: '100%',
    height: 50,
    borderRadius: 14,
  },
  textLight: {
    color: '#111827',
  },
  textDark: {
    color: '#ffffff',
  },
});
