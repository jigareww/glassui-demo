import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../shared/ui/Card';

interface GlassPayCardProps {
  email: string;
  isDarkMode: boolean;
}

export const GlassPayCard: React.FC<GlassPayCardProps> = ({ email, isDarkMode }) => {
  const cardHolderName = email ? email.split('@')[0] : 'user';
  const textColor = isDarkMode ? '#ffffff' : '#111827';
  const labelColor = isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(17, 24, 39, 0.6)';
  const numberColor = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(17, 24, 39, 0.7)';
  const chipBg = isDarkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(17, 24, 39, 0.15)';

  return (
    <Card
      isDarkMode={isDarkMode}
      style={styles.balanceCard}
      contentStyle={styles.balanceCardContent}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardBrand, { color: textColor }]}>PayGlass</Text>
        <View style={[styles.cardChip, { backgroundColor: chipBg }]} />
      </View>
      <View>
        <Text style={[styles.cardLabel, { color: labelColor }]}>Available Balance</Text>
        <Text style={[styles.cardBalance, { color: textColor }]}>$12,480.50</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={[styles.cardNumber, { color: numberColor }]}>•••• 5689</Text>
        <Text style={[styles.cardHolder, { color: textColor, textTransform: 'capitalize' }]}>
          {cardHolderName}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    height: 200,
    width: '100%',
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  balanceCardContent: {
    padding: 24,
    height: '100%',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBrand: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  cardChip: {
    width: 36,
    height: 26,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  cardLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardBalance: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardNumber: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  cardHolder: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
