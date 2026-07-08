import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@shared/ui/Toast';
import { AlertModal } from '@shared/ui/Alert';

interface AppProvidersProps {
  children: ReactNode;
}

// Instantiate the global Query Client for unified Web3 caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 10000, // 10 seconds stale threshold
      gcTime: 1000 * 60 * 5, // 5 minutes garbage collection
      refetchOnWindowFocus: false, // Prevent redundant requests on mobile app focus
    },
  },
});

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            {children}
            <AlertModal />
          </ToastProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
