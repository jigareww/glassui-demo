import React, { memo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { Layout, FadeIn } from 'react-native-reanimated';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { toast } from '@shared/ui/Toast';

interface MnemonicVerifyScreenProps {
  mnemonic: string;
  onSuccess: () => void;
  isDarkMode?: boolean;
}

export const MnemonicVerifyScreen: React.FC<MnemonicVerifyScreenProps> = memo(({
  mnemonic,
  onSuccess,
  isDarkMode = true,
}) => {
  const correctWords = mnemonic.split(' ');
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);

  const textColor = isDarkMode ? '#ffffff' : '#111827';
  const subtextColor = isDarkMode ? '#9ca3af' : '#4b5563';

  // Shuffle words once on mount
  useEffect(() => {
    const shuffle = [...correctWords].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffle);
  }, []);

  const handleSelectWord = (word: string) => {
    setIsError(false);
    const newSelection = [...selectedWords, word];
    setSelectedWords(newSelection);

    // Verify step-by-step correctness
    const currentLength = newSelection.length;
    for (let i = 0; i < currentLength; i++) {
      if (newSelection[i] !== correctWords[i]) {
        setIsError(true);
        break;
      }
    }
  };

  const handleRemoveWord = (index: number) => {
    setIsError(false);
    const word = selectedWords[index];
    const newSelection = selectedWords.filter((_, i) => i !== index);
    setSelectedWords(newSelection);

    // Re-verify the remaining selection
    let verifyError = false;
    for (let i = 0; i < newSelection.length; i++) {
      if (newSelection[i] !== correctWords[i]) {
        verifyError = true;
        break;
      }
    }
    setIsError(verifyError);
  };

  const handleConfirm = () => {
    if (selectedWords.join(' ') === mnemonic) {
      toast.success('Backup verification successful!');
      onSuccess();
    } else {
      toast.error('Verification failed. Please check the word order.');
      setIsError(true);
    }
  };

  const handleReset = () => {
    setSelectedWords([]);
    setIsError(false);
  };

  // Filter out already selected words from pool
  const poolWords = shuffledWords.filter(word => {
    const countInSelection = selectedWords.filter(w => w === word).length;
    const countInShuffled = shuffledWords.filter(w => w === word).length;
    // Handle duplicate words if any exist, although rare in BIP-39 mnemonic
    return countInSelection < countInShuffled;
  });

  const isComplete = selectedWords.length === correctWords.length && !isError;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Verify Secret Phrase</Text>
        <Text style={[styles.subtitle, { color: subtextColor }]}>
          Tap the words in the correct order to confirm you wrote them down safely.
        </Text>
      </View>

      {/* Selected Words Area */}
      <Card
        isDarkMode={isDarkMode}
        style={[
          styles.selectionCard,
          isError && styles.errorCardBorder,
        ]}
      >
        <View style={styles.selectionGrid}>
          {selectedWords.map((word, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.wordPillSelected,
                isDarkMode ? styles.pillDark : styles.pillLight,
              ]}
              onPress={() => handleRemoveWord(index)}
              activeOpacity={0.7}
            >
              <Text style={styles.wordIndex}>{index + 1}</Text>
              <Text style={[styles.wordText, { color: textColor }]}>{word}</Text>
            </TouchableOpacity>
          ))}
          {selectedWords.length === 0 && (
            <Text style={[styles.placeholderText, { color: subtextColor }]}>
              Selected words will appear here
            </Text>
          )}
        </View>
      </Card>

      {/* Pool of Available Words */}
      <View style={styles.poolContainer}>
        <View style={styles.poolHeader}>
          <Text style={[styles.poolLabel, { color: subtextColor }]}>Word Pool</Text>
          {selectedWords.length > 0 && (
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetBtn}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.poolGrid}>
          {poolWords.map((word, index) => (
            <TouchableOpacity
              key={word + index}
              style={[
                styles.wordPillPool,
                isDarkMode ? styles.pillDark : styles.pillLight,
              ]}
              onPress={() => handleSelectWord(word)}
              activeOpacity={0.7}
            >
              <Text style={[styles.wordText, { color: textColor }]}>{word}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Verify & Complete Setup"
          onPress={handleConfirm}
          isDarkMode={isDarkMode}
          disabled={!isComplete}
          style={styles.actionBtn}
          showIcon={false}
        />
      </View>
    </View>
  );
});

MnemonicVerifyScreen.displayName = 'MnemonicVerifyScreen';

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
  selectionCard: {
    width: '100%',
    minHeight: 140,
    justifyContent: 'flex-start',
    borderRadius: 20,
    padding: 12,
  },
  errorCardBorder: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
    borderWidth: 1.5,
  },
  selectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  placeholderText: {
    fontSize: 14,
    alignSelf: 'center',
    width: '100%',
    textAlign: 'center',
    marginTop: 40,
  },
  poolContainer: {
    width: '100%',
    flex: 1,
    marginTop: 20,
    justifyContent: 'flex-start',
  },
  poolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  poolLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resetBtn: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '700',
  },
  poolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  wordPillSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    margin: 4,
    borderWidth: 1,
  },
  wordPillPool: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    margin: 6,
    borderWidth: 1,
  },
  pillDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  wordIndex: {
    color: '#3b82f6',
    fontWeight: '700',
    fontSize: 11,
    marginRight: 6,
  },
  wordText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    width: '100%',
    marginBottom: 10,
  },
  actionBtn: {
    width: '100%',
    borderRadius: 14,
  },
});
export default MnemonicVerifyScreen;
