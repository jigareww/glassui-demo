import React, { memo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Dimensions } from 'react-native';
import { Card } from '@shared/ui/Card';
import { Button } from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { Token } from '../config/tokenList';
import { useTokenStore, ChartPoint } from '../store/useTokenStore';
import { TokenPriceChart } from '../components/TokenPriceChart';

const { width: screenWidth } = Dimensions.get('window');

interface TokenDetailScreenProps {
  token: Token;
  balanceString: string;
  recipientAddress: string; // The current user's active wallet address for receiving funds
  onBack: () => void;
  onNavigateToSend: () => void;
  isDarkMode?: boolean;
}

type RangeType = '24H' | '1W' | '1M' | '1Y';

export const TokenDetailScreen: React.FC<TokenDetailScreenProps> = memo(({
  token,
  balanceString,
  recipientAddress,
  onBack,
  onNavigateToSend,
  isDarkMode = true,
}) => {
  const [activeRange, setActiveRange] = useState<RangeType>('24H');
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  const fetchPriceHistory = useTokenStore((state) => state.fetchPriceHistory);
  
  const textColor = isDarkMode ? '#ffffff' : '#111827';
  const subtextColor = isDarkMode ? '#9ca3af' : '#4b5563';

  // Load historical data whenever token or range changes
  useEffect(() => {
    const loadChart = async () => {
      const history = await fetchPriceHistory(token.id, activeRange);
      setChartData(history);
    };
    loadChart();
  }, [token.id, activeRange]);

  const handleShareAddress = () => {
    Share.share({ message: recipientAddress });
    toast.success('Address shared successfully');
  };

  const handleCopyAddress = () => {
    Share.share({ message: recipientAddress }); // Fallback share
    toast.success('Address copied');
  };

  const tokenLatestPrice = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
  const fiatBalance = parseFloat(balanceString) * tokenLatestPrice;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: textColor }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>{token.name}</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Balance Hub */}
      <View style={styles.balanceContainer}>
        <Text style={[styles.balanceText, { color: textColor }]}>
          {parseFloat(balanceString).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {token.symbol}
        </Text>
        <Text style={[styles.fiatBalanceText, { color: subtextColor }]}>
          ≈ ${fiatBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
        </Text>
      </View>

      {/* Interactive Chart Section */}
      <Card
        isDarkMode={isDarkMode}
        style={styles.chartCard}
        contentStyle={styles.chartCardContent}
      >
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: textColor }]}>Price Trend</Text>
          <View style={styles.rangeSelector}>
            {(['24H', '1W', '1M', '1Y'] as RangeType[]).map((r) => {
              const isActive = activeRange === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.rangeBtn, isActive && styles.rangeBtnActive]}
                  onPress={() => setActiveRange(r)}
                >
                  <Text style={[styles.rangeText, { color: isActive ? '#3b82f6' : subtextColor }]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TokenPriceChart
          data={chartData}
          width={screenWidth - 72}
          isDarkMode={isDarkMode}
        />
      </Card>

      {/* Transaction Action buttons */}
      <View style={styles.actionsContainer}>
        <Button
          title={`Send ${token.symbol}`}
          onPress={onNavigateToSend}
          isDarkMode={isDarkMode}
          style={styles.actionBtn}
          showIcon={false}
        />
        <Button
          title="Receive Funds"
          onPress={() => setShowReceiveModal(true)}
          isDarkMode={isDarkMode}
          style={styles.actionBtn}
          showIcon={false}
        />
      </View>

      {/* Receive Address Glass Overlay Modal */}
      {showReceiveModal && (
        <View style={styles.modalBackdrop}>
          <Card isDarkMode={isDarkMode} style={styles.modalCard}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Receive Tokens</Text>
            <Text style={[styles.modalSubtitle, { color: subtextColor }]}>
              Send only {token.symbol} and assets on the active blockchain network to this address.
            </Text>

            <View style={[styles.addressBox, isDarkMode ? styles.addressBoxDark : styles.addressBoxLight]}>
              <Text style={[styles.addressText, { color: textColor }]} numberOfLines={2}>
                {recipientAddress}
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={handleCopyAddress} style={styles.modalActionBtn}>
                <Text style={styles.copyBtnText}>Copy Address</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShareAddress} style={styles.modalActionBtn}>
                <Text style={styles.copyBtnText}>Share</Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Close"
              onPress={() => setShowReceiveModal(false)}
              isDarkMode={isDarkMode}
              style={styles.closeBtn}
              showIcon={false}
            />
          </Card>
        </View>
      )}
    </View>
  );
});

TokenDetailScreen.displayName = 'TokenDetailScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 10,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  backBtn: {
    paddingVertical: 8,
    width: 60,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  balanceContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  balanceText: {
    fontSize: 26,
    fontWeight: '800',
  },
  fiatBalanceText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  chartCard: {
    width: '100%',
    borderRadius: 20,
  },
  chartCardContent: {
    padding: 12,
    width: '100%',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  rangeSelector: {
    flexDirection: 'row',
  },
  rangeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 2,
    borderRadius: 6,
  },
  rangeBtnActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  rangeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  actionsContainer: {
    width: '100%',
    marginVertical: 10,
  },
  actionBtn: {
    width: '100%',
    marginVertical: 6,
    borderRadius: 14,
  },
  modalBackdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 7, 20, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 100,
  },
  modalCard: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  addressBox: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  addressBoxDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  addressBoxLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  addressText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  modalActionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  copyBtnText: {
    color: '#3b82f6',
    fontWeight: '800',
    fontSize: 13,
  },
  closeBtn: {
    width: '100%',
    borderRadius: 12,
  },
});
export default TokenDetailScreen;
