import React, { memo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card } from '@shared/ui/Card';
import { Input } from '@shared/ui/Input';
import { Button } from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { Token } from '../config/tokenList';
import { Chain } from '../../network/config/chains';
import { SwapService, SwapQuote } from '../services/SwapService';
import { useWalletStore } from '../../wallet/store/useWalletStore';

interface SwapTokensScreenProps {
  tokens: Token[];
  activeChain: Chain;
  onBack: () => void;
  isDarkMode?: boolean;
}

export const SwapTokensScreen: React.FC<SwapTokensScreenProps> = memo(({
  tokens,
  activeChain,
  onBack,
  isDarkMode = true,
}) => {
  const [inputToken, setInputToken] = useState<Token | null>(tokens[0] || null);
  const [outputToken, setOutputToken] = useState<Token | null>(tokens[1] || tokens[0] || null);

  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('0.00');
  const [slippage, setSlippage] = useState<number>(0.5); // Default 0.5%
  
  const [isQuoting, setIsQuoting] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  
  const [isSwapping, setIsSwapping] = useState(false);

  const getPrivateKey = useWalletStore((state) => state.getPrivateKey);

  const textColor = isDarkMode ? '#ffffff' : '#111827';
  const subtextColor = isDarkMode ? '#9ca3af' : '#4b5563';

  // Trigger Quote Query when inputAmount or tokens change
  useEffect(() => {
    const fetchQuote = async () => {
      const amt = inputAmount.trim();
      if (!amt || isNaN(parseFloat(amt)) || parseFloat(amt) <= 0 || !inputToken || !outputToken) {
        setOutputAmount('0.00');
        setQuote(null);
        return;
      }

      setIsQuoting(true);
      try {
        const res = await SwapService.getSwapQuote(
          inputToken.address,
          outputToken.address,
          amt,
          inputToken.decimals,
          slippage,
          activeChain
        );
        setQuote(res);
        setOutputAmount(res.outputAmount);
      } catch (err) {
        console.warn('[SwapScreen] Failed to fetch quote:', err);
      } finally {
        setIsQuoting(false);
      }
    };

    fetchQuote();
  }, [inputAmount, inputToken, outputToken, slippage, activeChain]);

  const handleSwap = async () => {
    if (!quote || !inputToken || !outputToken) return;

    setIsSwapping(true);
    try {
      const pk = await getPrivateKey(activeChain.type);
      if (!pk) {
        throw new Error('Key retrieval failed. Please unlock your device.');
      }

      const txHash = await SwapService.executeSwap(
        pk,
        inputToken.address,
        outputToken.address,
        inputAmount,
        quote,
        activeChain
      );

      toast.success('Swap completed successfully!');
      setInputAmount('');
      setOutputAmount('0.00');
      setQuote(null);
    } catch (e: any) {
      toast.error(e.message || 'Swap execution failed');
    } finally {
      setIsSwapping(false);
    }
  };

  const handleFlip = () => {
    const temp = inputToken;
    setInputToken(outputToken);
    setOutputToken(temp);
    setInputAmount('');
    setOutputAmount('0.00');
    setQuote(null);
  };

  const isFormValid = quote !== null && parseFloat(inputAmount) > 0 && !isSwapping;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: textColor }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Swap Tokens</Text>
        <View style={{ width: 60 }} />
      </View>

      <Card isDarkMode={isDarkMode} style={styles.swapCard}>
        {/* Input Pane */}
        <View style={[styles.tokenInputPane, isDarkMode ? styles.paneDark : styles.paneLight]}>
          <Text style={[styles.paneLabel, { color: subtextColor }]}>You Pay</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.tokenSelector}>
              <Text style={[styles.tokenSelectorText, { color: textColor }]}>
                {inputToken?.symbol || 'Select Token'}
              </Text>
            </TouchableOpacity>
            <Input
              placeholder="0.0"
              value={inputAmount}
              onChangeText={setInputAmount}
              isDarkMode={isDarkMode}
              keyboardType="numeric"
              style={styles.amountInput}
              containerStyle={styles.amountInputContainer}
              editable={!isSwapping}
            />
          </View>
        </View>

        {/* Flip Button */}
        <TouchableOpacity
          style={[styles.flipBtn, isDarkMode ? styles.flipBtnDark : styles.flipBtnLight]}
          onPress={handleFlip}
          activeOpacity={0.8}
        >
          <Text style={styles.flipEmoji}>⇅</Text>
        </TouchableOpacity>

        {/* Output Pane */}
        <View style={[styles.tokenInputPane, isDarkMode ? styles.paneDark : styles.paneLight]}>
          <Text style={[styles.paneLabel, { color: subtextColor }]}>You Receive</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.tokenSelector}>
              <Text style={[styles.tokenSelectorText, { color: textColor }]}>
                {outputToken?.symbol || 'Select Token'}
              </Text>
            </TouchableOpacity>
            {isQuoting ? (
              <ActivityIndicator size="small" color="#3b82f6" style={styles.loader} />
            ) : (
              <Text style={[styles.readOnlyAmount, { color: textColor }]}>{outputAmount}</Text>
            )}
          </View>
        </View>

        {/* Slippage choosing */}
        <View style={styles.slippageRow}>
          <Text style={[styles.slippageLabel, { color: subtextColor }]}>Slippage Tolerance</Text>
          <View style={styles.slippagePills}>
            {[0.5, 1.0, 3.0].map((val) => {
              const isActive = slippage === val;
              return (
                <TouchableOpacity
                  key={val}
                  style={[styles.slippagePill, isActive && styles.slippagePillActive]}
                  onPress={() => setSlippage(val)}
                >
                  <Text style={[styles.slippagePillText, isActive && styles.slippagePillTextActive]}>
                    {val}%
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quote / Route Info */}
        {quote && (
          <View style={[styles.routeBox, isDarkMode ? styles.paneDark : styles.paneLight]}>
            <View style={styles.routeRow}>
              <Text style={[styles.routeLabel, { color: subtextColor }]}>Price Impact</Text>
              <Text style={[styles.routeValue, { color: parseFloat(quote.priceImpact) > 2 ? '#ef4444' : '#10b981' }]}>
                {quote.priceImpact}
              </Text>
            </View>
            <View style={styles.routeRow}>
              <Text style={[styles.routeLabel, { color: subtextColor }]}>Route</Text>
              <Text style={[styles.routeValue, { color: textColor }]} numberOfLines={1}>
                {quote.route}
              </Text>
            </View>
            <View style={styles.routeRow}>
              <Text style={[styles.routeLabel, { color: subtextColor }]}>Est. Network Fee</Text>
              <Text style={[styles.routeValue, { color: textColor }]}>{quote.fee}</Text>
            </View>
          </View>
        )}

        <Button
          title={isSwapping ? 'Swapping...' : 'Confirm Swap'}
          onPress={handleSwap}
          isDarkMode={isDarkMode}
          disabled={!isFormValid}
          loading={isSwapping}
          style={styles.submitBtn}
          showIcon={false}
        />
      </Card>
    </View>
  );
});

SwapTokensScreen.displayName = 'SwapTokensScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 10,
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
  swapCard: {
    width: '100%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  tokenInputPane: {
    width: '100%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  paneDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  paneLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  paneLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tokenSelector: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  tokenSelectorText: {
    fontSize: 14,
    fontWeight: '800',
  },
  amountInputContainer: {
    flex: 1,
    borderBottomWidth: 0,
    marginLeft: 12,
  },
  amountInput: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'right',
    padding: 0,
  },
  readOnlyAmount: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'right',
  },
  loader: {
    paddingRight: 8,
  },
  flipBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    marginVertical: -14,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  flipBtnDark: {
    backgroundColor: '#151b2e',
    borderColor: '#3b82f6',
  },
  flipBtnLight: {
    backgroundColor: '#ffffff',
    borderColor: '#3b82f6',
  },
  flipEmoji: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  slippageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
    paddingHorizontal: 2,
  },
  slippageLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  slippagePills: {
    flexDirection: 'row',
  },
  slippagePill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginHorizontal: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  slippagePillActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3b82f6',
  },
  slippagePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
  },
  slippagePillTextActive: {
    color: '#3b82f6',
    fontWeight: '800',
  },
  routeBox: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  routeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  routeValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  submitBtn: {
    width: '100%',
    borderRadius: 14,
  },
});
export default SwapTokensScreen;
