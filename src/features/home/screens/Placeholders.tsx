import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PlaceholderProps {
  title: string;
  isDarkMode?: boolean;
}

export const PlaceholderScreen: React.FC<PlaceholderProps> = ({ title, isDarkMode = true }) => {
  const textColor = isDarkMode ? '#ffffff' : '#111827';
  const subColor = isDarkMode ? '#9ca3af' : '#4b5563';

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: subColor }]}>
        This section is under construction. Check back soon for exciting updates!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export const ReelsScreen = (props: any) => <PlaceholderScreen title="Reels" {...props} />;
export const MessagesScreen = (props: any) => <PlaceholderScreen title="Messages" {...props} />;
export const SearchScreen = (props: any) => <PlaceholderScreen title="Search" {...props} />;
