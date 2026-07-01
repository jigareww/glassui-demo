import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../shared/ui/Card';

interface RecentActivityProps {
  isDarkMode: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ isDarkMode }) => {
  return (
    <View style={styles.showcaseWrapper}>
      <Text style={[styles.showcaseLabel, isDarkMode ? styles.subtitleDark : styles.subtitleLight]}>
        Recent Activity
      </Text>

      <Card isDarkMode={isDarkMode} style={styles.transactionCard}>
        <View style={styles.transactionItem}>
          <View style={styles.transactionMeta}>
            <Text style={[styles.transactionMerchant, isDarkMode ? styles.textDark : styles.textLight]}>
              Apple Store
            </Text>
            <Text style={[styles.transactionDate, isDarkMode ? styles.subtitleDark : styles.subtitleLight]}>
              iPhone 16 Pro Max
            </Text>
          </View>
          <Text style={[styles.transactionAmount, styles.amountDebit]}>-$1,299.00</Text>
        </View>

        <View style={[styles.transactionItem, styles.transactionBorder]}>
          <View style={styles.transactionMeta}>
            <Text style={[styles.transactionMerchant, isDarkMode ? styles.textDark : styles.textLight]}>
              Salary Deposit
            </Text>
            <Text style={[styles.transactionDate, isDarkMode ? styles.subtitleDark : styles.subtitleLight]}>
              June 30, 2026
            </Text>
          </View>
          <Text style={[styles.transactionAmount, styles.amountCredit]}>+$4,500.00</Text>
        </View>

        <View style={[styles.transactionItem, styles.transactionBorder]}>
          <View style={styles.transactionMeta}>
            <Text style={[styles.transactionMerchant, isDarkMode ? styles.textDark : styles.textLight]}>
              Starbucks Coffee
            </Text>
            <Text style={[styles.transactionDate, isDarkMode ? styles.subtitleDark : styles.subtitleLight]}>
              Double Espresso
            </Text>
          </View>
          <Text style={[styles.transactionAmount, styles.amountDebit]}>-$5.75</Text>
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
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  transactionBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  transactionMeta: {
    flex: 1,
  },
  transactionMerchant: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  amountDebit: {
    color: '#ef4444',
  },
  amountCredit: {
    color: '#10b981',
  },
  textLight: {
    color: '#111827',
  },
  textDark: {
    color: '#ffffff',
  },
});
