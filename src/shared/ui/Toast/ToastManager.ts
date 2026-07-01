import { toastObserver } from './ToastObserver';
import { ToastInstance, ToastOptions, ToastType } from './Toast.types';

const generateId = () => Math.random().toString(36).substring(2, 9);

class ToastManager {
  private createToast(message: string, type: ToastType, options?: ToastOptions): string {
    const id = generateId();
    const toast: ToastInstance = {
      id,
      message,
      type,
      options: options || {},
      createdAt: Date.now(),
    };
    toastObserver.notify({ type: 'add', toast });
    return id;
  }

  success(message: string, options?: ToastOptions): string {
    return this.createToast(message, 'success', options);
  }

  error(message: string, options?: ToastOptions): string {
    return this.createToast(message, 'error', options);
  }

  warning(message: string, options?: ToastOptions): string {
    return this.createToast(message, 'warning', options);
  }

  info(message: string, options?: ToastOptions): string {
    return this.createToast(message, 'info', options);
  }

  loading(message: string, options?: ToastOptions): string {
    return this.createToast(message, 'loading', {
      duration: 0,
      dismissible: false,
      ...options,
    });
  }

  custom(message: string, options?: ToastOptions): string {
    return this.createToast(message, 'custom', options);
  }

  dismiss(id: string) {
    toastObserver.notify({ type: 'dismiss', id });
  }

  dismissAll() {
    toastObserver.notify({ type: 'dismissAll' });
  }

  update(id: string, updates: Partial<Pick<ToastInstance, 'message' | 'type'> & { options: ToastOptions }>) {
    const toastUpdate: ToastInstance = {
      id,
      message: updates.message || '',
      type: updates.type || 'info',
      options: updates.options || {},
      createdAt: Date.now(),
    };
    toastObserver.notify({ type: 'update', toast: toastUpdate, id });
  }

  promise<T>(
    promise: Promise<T>,
    callbacks: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    },
    options?: ToastOptions
  ): Promise<T> {
    const id = this.loading(callbacks.loading, options);
    
    return promise
      .then((data) => {
        const successMsg =
          typeof callbacks.success === 'function'
            ? callbacks.success(data)
            : callbacks.success;
        
        this.update(id, {
          message: successMsg,
          type: 'success',
          options: {
            duration: 3000,
            dismissible: true,
            ...options,
          },
        });
        return data;
      })
      .catch((error) => {
        const errorMsg =
          typeof callbacks.error === 'function'
            ? callbacks.error(error)
            : callbacks.error;
        
        this.update(id, {
          message: errorMsg,
          type: 'error',
          options: {
            duration: 4000,
            dismissible: true,
            ...options,
          },
        });
        throw error;
      });
  }
}

export const toast = new ToastManager();
