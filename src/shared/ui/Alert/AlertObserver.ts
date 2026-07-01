import { AlertConfig, AlertInstance } from './Alert.types';

type AlertListener = (alert: AlertInstance | null) => void;

class AlertObserver {
  private listeners: Set<AlertListener> = new Set();
  private currentAlert: AlertInstance | null = null;

  subscribe(listener: AlertListener): () => void {
    this.listeners.add(listener);
    // Emit current alert immediately to new subscriber
    listener(this.currentAlert);
    return () => {
      this.listeners.delete(listener);
    };
  }

  show(config: AlertConfig): string {
    const id = Math.random().toString(36).substring(2, 9);
    this.currentAlert = {
      ...config,
      id,
    };
    this.notify();
    return id;
  }

  dismiss() {
    this.currentAlert = null;
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.currentAlert));
  }
}

export const alertManager = new AlertObserver();

export const alert = {
  show: (config: AlertConfig) => alertManager.show(config),
  dismiss: () => alertManager.dismiss(),
};
