import { ToastInstance } from './Toast.types';

type ToastListener = (action: {
  type: 'add' | 'dismiss' | 'dismissAll' | 'update';
  toast?: ToastInstance;
  id?: string;
}) => void;

class ToastObserver {
  private listeners: Set<ToastListener> = new Set();

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify(action: {
    type: 'add' | 'dismiss' | 'dismissAll' | 'update';
    toast?: ToastInstance;
    id?: string;
  }) {
    this.listeners.forEach((listener) => listener(action));
  }
}

export const toastObserver = new ToastObserver();
