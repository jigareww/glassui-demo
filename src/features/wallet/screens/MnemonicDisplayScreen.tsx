import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { toast } from '@shared/ui/Toast';

interface MnemonicDisplayScreenProps {
  mnemonic: string;
  onVerify: () => void;
  isDarkMode?: boolean;
}

export const MnemonicDisplayScreen: React.FC<MnemonicDisplayScreenProps> = memo(({
  mnemonic,
  onVerify,
  isDarkMode = true,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const words = mnemonic.split(' ');
  const textColor = isDarkMode ? '#ffffff' : '#111827';
  const subtextColor = isDarkMode ? '#9ca3af' : '#4b5563';

  const handleCopy = () => {
    // Custom clipboard share or standard copy
    Share.share({ message: mnemonic });
    toast.success('Mnemonic copied to clipboard');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Secret Recovery Phrase</Text>
        <Text style={[styles.subtitle, { color: subtextColor }]}>
          Write down or copy these 12 words in the exact order. Store them in a safe place offline.
        </Text>
      </View>

      <Card
        isDarkMode={isDarkMode}
        style={styles.phraseCard}
        contentStyle={styles.cardContent}
      >
        {!isRevealed ? (
          <TouchableOpacity
            style={styles.revealOverlay}
            activeOpacity={0.9}
            onPress={() => setIsRevealed(true)}
          >
            <Text style={styles.revealEmoji}>👁️‍🗨️</Text>
            <Text style={[styles.revealText, { color: textColor }]}>Tap to reveal recovery phrase</Text>
            <Text style={styles.revealSubtext}>Make sure no one is looking at your screen.</Text>
          </TouchableOpacity>
        ) : (
          <Animated.View entering={FadeIn} style={styles.grid}>
            {words.map((word, index) => (
              <View
                key={index}
                style={[
                  styles.wordPill,
                  isDarkMode ? styles.wordPillDark : styles.wordPillLight,
                ]}
              >
                <Text style={styles.wordIndex}>{index + 1}</Text>
                <Text style={[styles.wordText, { color: textColor }]}>{word}</Text>
              </View>
            ))}
          </Animated.View>
        )}
      </Card>

      <View style={styles.warningContainer}>
        <Text style={styles.warningTitle}>⚠️ WARNING</Text>
        <Text style={styles.warningText}>
          If you lose this phrase, you lose access to your funds forever. No one in the world can recover it for you.
        </Text>
      </View>

      <View style={styles.footer}>
        {isRevealed && (
          <>
            <TouchableOpacity onPress={handleCopy} style={styles.copyBtn} activeOpacity={0.7}>
              <Text style={[styles.copyBtnText, { color: isDarkMode ? '#60a5fa' : '#3b82f6' }]}>
                Share / Copy Phrase
              </Text>
            </TouchableOpacity>

            <Button
              title="I've written it down"
              onPress={onVerify}
              isDarkMode={isDarkMode}
              style={styles.continueBtn}
              showIcon={false}
            />
          </>
        )}
      </View>
    </View>
  );
});

MnemonicDisplayScreen.displayName = 'MnemonicDisplayScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  phraseCard: {
    width: '100%',
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    padding: 0,
    width: '100%',
    height: '100%',
  },
  revealOverlay: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 7, 20, 0.4)',
    padding: 24,
  },
  revealEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  revealText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  revealSubtext: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  wordPill: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 6,
    borderWidth: 1,
  },
  wordPillDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  wordPillLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  wordIndex: {
    color: '#3b82f6',
    fontWeight: '700',
    fontSize: 12,
    marginRight: 8,
    width: 16,
  },
  wordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  warningContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    marginVertical: 10,
  },
  warningTitle: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  warningText: {
    color: '#ef4444',
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  copyBtn: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  copyBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  continueBtn: {
    width: '100%',
    borderRadius: 14,
  },
});
export default MnemonicDisplayScreen;
