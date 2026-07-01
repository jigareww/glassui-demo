import { useState, useCallback } from 'react';
import { LayoutAnimation } from 'react-native';
import { useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import {
  FieldErrors,
  validateEmail,
  validateName,
  validatePassword,
} from '../validation/authValidation';

export type AuthView = 'login' | 'signup' | 'forgot';

export const useAuthForm = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const contentOpacity = useSharedValue(1);

  const configureTransition = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const performSwitchState = useCallback((view: AuthView) => {
    configureTransition();
    setCurrentView(view);
    setFieldErrors({});
    setEmail('');
    setPassword('');
    setName('');
    contentOpacity.value = withTiming(1, { duration: 220 });
  }, [contentOpacity, configureTransition]);

  const switchView = useCallback((view: AuthView) => {
    contentOpacity.value = withTiming(0, { duration: 220 }, (isFinished) => {
      if (isFinished) {
        runOnJS(performSwitchState)(view);
      }
    });
  }, [contentOpacity, performSwitchState]);

  const handleTextChange = useCallback((
    field: keyof FieldErrors,
    setter: (text: string) => void
  ) => (text: string) => {
    setter(text);
    configureTransition();
    setFieldErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  }, [configureTransition]);

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;

    if (currentView === 'signup') {
      const nameErr = validateName(name);
      if (nameErr) errors.name = nameErr;
    }

    if (currentView !== 'forgot') {
      const passwordErr = validatePassword(password);
      if (passwordErr) errors.password = passwordErr;
    }

    configureTransition();
    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  return {
    currentView,
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    isLoading,
    setIsLoading,
    fieldErrors,
    setFieldErrors,
    contentOpacity,
    switchView,
    handleTextChange,
    validateForm,
    configureTransition,
  };
};
