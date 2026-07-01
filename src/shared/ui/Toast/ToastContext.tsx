import React, { createContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { ToastInstance } from './Toast.types';
import { toastObserver } from './ToastObserver';
import { ToastContainer } from './ToastContainer';

interface ToastContextType {
  toasts: ToastInstance[];
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastInstance[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => {
      const match = prev.find((t) => t.id === id);
      if (match && match.options.onDismiss) {
        match.options.onDismiss(id);
      }
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const dismissAll = useCallback(() => {
    setToasts((prev) => {
      prev.forEach((t) => {
        if (t.options.onDismiss) t.options.onDismiss(t.id);
      });
      return [];
    });
  }, []);

  useEffect(() => {
    const unsubscribe = toastObserver.subscribe((action) => {
      switch (action.type) {
        case 'add':
          if (action.toast) {
            const newToast = action.toast;
            
            setToasts((prev) => {
              const isDuplicate = prev.some(
                (t) => t.message === newToast.message && t.type === newToast.type
              );
              if (isDuplicate) {
                return prev;
              }

              const updated = [...prev, newToast];
              return updated.sort((a, b) => {
                const priorityA = a.options.priority || 0;
                const priorityB = b.options.priority || 0;
                if (priorityA !== priorityB) {
                  return priorityB - priorityA;
                }
                return a.createdAt - b.createdAt;
              });
            });
          }
          break;

        case 'dismiss':
          if (action.id) {
            dismiss(action.id);
          }
          break;

        case 'dismissAll':
          dismissAll();
          break;

        case 'update':
          if (action.id && action.toast) {
            const updateData = action.toast;
            setToasts((prev) =>
              prev.map((t) => {
                if (t.id === action.id) {
                  return {
                    ...t,
                    message: updateData.message || t.message,
                    type: updateData.type || t.type,
                    options: {
                      ...t.options,
                      ...updateData.options,
                    },
                  };
                }
                return t;
              })
            );
          }
          break;

        default:
          break;
      }
    });

    return unsubscribe;
  }, [dismiss, dismissAll]);

  const value = useMemo(() => ({
    toasts,
    dismiss,
    dismissAll,
  }), [toasts, dismiss, dismissAll]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};
