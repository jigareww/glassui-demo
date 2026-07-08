import { useRef, useEffect } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import { toast } from '@shared/ui/Toast';

export const useSecureClipboard = () => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const copyToClipboardSecurely = (text: string, label = 'Secret') => {
    // Clear any pending clear timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    Clipboard.setString(text);
    toast.success(`${label} copied to clipboard! Will clear in 60s.`);

    // Set auto-wipe cooldown timer
    timerRef.current = setTimeout(async () => {
      try {
        const currentClipText = await Clipboard.getString();
        if (currentClipText === text) {
          Clipboard.setString('');
          toast.info('Clipboard cleared for security.');
        }
      } catch (err) {
        console.warn('[useSecureClipboard] Auto-wipe failed:', err);
      }
    }, 60000); // 60 seconds
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    copyToClipboardSecurely,
  };
};
export default useSecureClipboard;
