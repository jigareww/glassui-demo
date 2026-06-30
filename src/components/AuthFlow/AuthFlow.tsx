import React, { memo, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { GlassCard } from '../GlassCard';
import { GlassTextInput } from '../GlassTextInput';
import { GlassButton } from '../GlassButton';
import { styles } from './AuthFlow.styles';

export interface AuthFlowProps {
  isDarkMode?: boolean;
  onAuthSuccess: (email: string) => void;
}

type AuthView = 'login' | 'signup' | 'forgot';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

interface ToastMessage {
  id: string;
  message: string;
}

// Sub-component to render floating top toasts with premium sliding entering/exiting animations
const AnimatedToast: React.FC<{
  message: string;
  isDarkMode: boolean;
}> = memo(({ message, isDarkMode }) => {
  return (
    <Animated.View
      entering={SlideInRight.springify().damping(15).stiffness(120)}
      exiting={SlideOutLeft.duration(250)}
      style={styles.toastWrapper}
    >
      <GlassCard
        isDarkMode={isDarkMode}
        style={styles.toastCard}
        contentStyle={styles.toastContent}
      >
        <Text style={styles.toastText}>{message}</Text>
      </GlassCard>
    </Animated.View>
  );
});

AnimatedToast.displayName = 'AnimatedToast';

export const AuthFlow: React.FC<AuthFlowProps> = memo(({
  isDarkMode = false,
  onAuthSuccess,
}) => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Error configurations
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [activeToast, setActiveToast] = useState<ToastMessage | null>(null);
  const [toastQueue, setToastQueue] = useState<string[]>([]);

  // Effect to process toast notifications queue sequentially
  React.useEffect(() => {
    if (activeToast === null && toastQueue.length > 0) {
      const nextMessage = toastQueue[0];
      setToastQueue((prev) => prev.slice(1));
      
      const newToast = {
        id: Math.random().toString(36).substring(2, 9),
        message: nextMessage,
      };
      setActiveToast(newToast);

      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [activeToast, toastQueue]);

  // Queue up toast messages while ignoring duplicate active/queued messages
  const addToast = useCallback((message: string) => {
    setToastQueue((prevQueue) => {
      if (prevQueue.includes(message)) {
        return prevQueue;
      }
      
      let isActiveDuplicate = false;
      setActiveToast((currentActive) => {
        if (currentActive && currentActive.message === message) {
          isActiveDuplicate = true;
        }
        return currentActive;
      });

      if (isActiveDuplicate) {
        return prevQueue;
      }

      return [...prevQueue, message];
    });
  }, []);

  // Clear inputs & errors on screen toggling
  const switchView = useCallback((view: AuthView) => {
    setCurrentView(view);
    setFieldErrors({});
    setEmail('');
    setPassword('');
    setName('');
  }, []);

  // Text inputs change handlers that clear specific field warnings instantly
  const handleTextChange = useCallback((
    field: keyof FieldErrors,
    setter: (text: string) => void
  ) => (text: string) => {
    setter(text);
    setFieldErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  }, []);

  // Form Validations
  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    // 1. Validate Email
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address';
      }
    }

    // 2. Validate Name (Signup view only)
    if (currentView === 'signup' && !name.trim()) {
      errors.name = 'Full name is required';
    }

    // 3. Validate Password (Login and Signup views only)
    if (currentView !== 'forgot') {
      if (!password) {
        errors.password = 'Password is required';
      } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }

    setFieldErrors(errors);

    // If validations fail, trigger dynamic top toast stack
    if (Object.keys(errors).length > 0) {
      addToast('Please correct the highlighted fields');
      return false;
    }

    return true;
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate native API roundtrip (e.g. Firebase, REST request)
    setTimeout(() => {
      setIsLoading(false);
      if (currentView === 'forgot') {
        Alert.alert('Reset Password', `Reset password email sent to: ${email}`);
        switchView('login');
      } else {
        // Authenticate successfully
        onAuthSuccess(email.trim().toLowerCase());
      }
    }, 1500);
  };

  // Dynamic label helpers based on view state
  const viewLabels = useMemo(() => {
    switch (currentView) {
      case 'signup':
        return {
          title: 'Create Account',
          subtitle: 'Sign up to experience the Liquid Glass showcase',
          submit: 'Sign Up',
        };
      case 'forgot':
        return {
          title: 'Reset Password',
          subtitle: 'Enter your email to receive a password reset link',
          submit: 'Send Reset Link',
        };
      case 'login':
      default:
        return {
          title: 'Welcome Back',
          subtitle: 'Sign in to access your glassmorphism showcase',
          submit: 'Sign In',
        };
    }
  }, [currentView]);

  return (
    <View style={{ flex: 1, width: '100%' }}>
      {/* Toast Queue Overlay */}
      <View style={styles.toastContainer} pointerEvents="none">
        {activeToast && (
          <AnimatedToast
            key={activeToast.id}
            message={activeToast.message}
            isDarkMode={isDarkMode}
          />
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={{ flex: 1, width: '100%' }}
      >
        <ScrollView
          contentContainerStyle={{ alignItems: 'center', width: '100%', paddingVertical: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Branding Section with Outline Glass Svg Icon */}
          <View style={styles.header}>
            <View style={{ marginBottom: 16 }}>
              <Svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke={isDarkMode ? '#60a5fa' : '#3b82f6'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M2 17L12 22L22 17"
                  stroke={isDarkMode ? '#3b82f6' : '#1d4ed8'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M2 12L12 17L22 12"
                  stroke={isDarkMode ? '#60a5fa' : '#3b82f6'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.5"
                />
              </Svg>
            </View>
            <Text style={[styles.logo, isDarkMode ? styles.logoDark : styles.logoLight]}>
              NEO GLASS
            </Text>
            <Text style={[styles.subtitle, isDarkMode ? styles.subtitleDark : styles.subtitleLight]}>
              {viewLabels.subtitle}
            </Text>
          </View>

          {/* Form Container Card */}
          <GlassCard isDarkMode={isDarkMode} style={styles.card}>
            {/* Form Fields */}
            {currentView === 'signup' && (
              <View style={{ width: '100%', marginBottom: fieldErrors.name ? 8 : 16 }}>
                <GlassTextInput
                  label="Full Name"
                  placeholder="John Doe"
                  iconName="user"
                  value={name}
                  onChangeText={handleTextChange('name', setName)}
                  isDarkMode={isDarkMode}
                  editable={!isLoading}
                  autoCapitalize="words"
                />
                {fieldErrors.name && (
                  <Text style={styles.fieldErrorText}>{fieldErrors.name}</Text>
                )}
              </View>
            )}

            <View style={{ width: '100%', marginBottom: fieldErrors.email ? 8 : 16 }}>
              <GlassTextInput
                label="Email Address"
                placeholder="example@mail.com"
                iconName="email"
                value={email}
                onChangeText={handleTextChange('email', setEmail)}
                isDarkMode={isDarkMode}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
                autoCorrect={false}
              />
              {fieldErrors.email && (
                <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
              )}
            </View>

            {currentView !== 'forgot' && (
              <View style={{ width: '100%', marginBottom: fieldErrors.password ? 8 : 16 }}>
                <GlassTextInput
                  label="Password"
                  placeholder="••••••••"
                  iconName="lock"
                  value={password}
                  onChangeText={handleTextChange('password', setPassword)}
                  isDarkMode={isDarkMode}
                  secureTextEntry
                  editable={!isLoading}
                  autoCapitalize="none"
                />
                {fieldErrors.password && (
                  <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
                )}

                {currentView === 'login' && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => switchView('forgot')}
                    style={styles.forgotButton}
                    disabled={isLoading}
                  >
                    <Text style={[styles.forgotText, isDarkMode ? styles.forgotTextDark : styles.forgotTextLight]}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Action button */}
            <GlassButton
              title={viewLabels.submit}
              onPress={handleSubmit}
              isDarkMode={isDarkMode}
              loading={isLoading}
              style={styles.submitButton}
              disabled={isLoading}
            />
          </GlassCard>

          {/* Footer Navigation Links */}
          <View style={styles.footer}>
            {currentView === 'login' && (
              <>
                <Text style={[styles.footerText, isDarkMode ? styles.footerTextDark : styles.footerTextLight]}>
                  Don't have an account?
                </Text>
                <TouchableOpacity onPress={() => switchView('signup')} disabled={isLoading}>
                  <Text style={[styles.footerLink, isDarkMode ? styles.footerLinkDark : styles.footerLinkLight]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {currentView === 'signup' && (
              <>
                <Text style={[styles.footerText, isDarkMode ? styles.footerTextDark : styles.footerTextLight]}>
                  Already have an account?
                </Text>
                <TouchableOpacity onPress={() => switchView('login')} disabled={isLoading}>
                  <Text style={[styles.footerLink, isDarkMode ? styles.footerLinkDark : styles.footerLinkLight]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {currentView === 'forgot' && (
              <TouchableOpacity onPress={() => switchView('login')} disabled={isLoading}>
                <Text style={[styles.footerLink, isDarkMode ? styles.footerLinkDark : styles.footerLinkLight]}>
                  Back to Sign In
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
});

AuthFlow.displayName = 'AuthFlow';
