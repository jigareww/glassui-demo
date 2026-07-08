import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSecurityStore } from '../store/useSecurityStore';

/**
 * Hook to automatically lock the app when it goes to the background.
 * In a real production app, you might want to add a timeout (e.g., lock after 1 min).
 * For maximum security, we are locking immediately upon backgrounding.
 */
export const useAutoLock = () => {
  const appState = useRef(AppState.currentState);
  const lockApp = useSecurityStore((state) => state.lockApp);
  const hasPasscode = useSecurityStore((state) => state.hasPasscode);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // If the app goes to the background or becomes inactive (iOS app switcher)
      if (
        appState.current.match(/active/) &&
        (nextAppState === 'background' || nextAppState === 'inactive')
      ) {
        if (hasPasscode) {
          console.log('[AutoLockService] App backgrounded. Locking wallet for security.');
          lockApp();
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [hasPasscode, lockApp]);
};
