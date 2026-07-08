import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

const AUTO_LOCK_TIMEOUT_MS = 30000; // 30 seconds auto-lock

interface UseAppShieldResult {
  isShielded: boolean;
  requestUnlock: () => void;
}

export const useAppShield = (onLockTriggered: () => void): UseAppShieldResult => {
  const [isShielded, setIsShielded] = useState(false);
  const backgroundTimeRef = useRef<number | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const current = appStateRef.current;

      // 1. App sent to background / switcher
      if (
        (current === 'active' && nextAppState === 'inactive') ||
        nextAppState === 'background'
      ) {
        setIsShielded(true);
        if (!backgroundTimeRef.current) {
          backgroundTimeRef.current = Date.now();
        }
      }

      // 2. App returned to foreground
      if (nextAppState === 'active') {
        const bgTime = backgroundTimeRef.current;
        if (bgTime) {
          const elapsed = Date.now() - bgTime;
          if (elapsed >= AUTO_LOCK_TIMEOUT_MS) {
            // Trigger auto-lock
            onLockTriggered();
          } else {
            // Unshield without locking since time window is small
            setIsShielded(false);
          }
        } else {
          setIsShielded(false);
        }
        // Reset background timer
        backgroundTimeRef.current = null;
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [onLockTriggered]);

  const requestUnlock = () => {
    setIsShielded(false);
  };

  return {
    isShielded,
    requestUnlock,
  };
};
export default useAppShield;
