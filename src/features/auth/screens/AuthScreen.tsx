import React, { memo, useMemo } from 'react';
import {
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import Animated, { useAnimatedStyle, FadeIn } from 'react-native-reanimated';
import { Card } from '../../../shared/ui/Card';
import { toast } from '../../../shared/ui/Toast';
import { AuthLogo } from '../components/AuthLogo';
import { useAuthForm } from '../hooks/useAuthForm';
import { LoginScreen } from './LoginScreen';
import { SignupScreen } from './SignupScreen';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';
import { styles } from './AuthScreen.styles';

export interface AuthScreenProps {
  isDarkMode?: boolean;
  onAuthSuccess: (email: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = memo(({
  isDarkMode = false,
  onAuthSuccess,
}) => {
  const {
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
    contentOpacity,
    switchView,
    handleTextChange,
    validateForm,
  } = useAuthForm();

  // Shared value to drive content cross-fading
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  // Handle Form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please correct the highlighted fields');
      return;
    }

    setIsLoading(true);

    // Simulate native API authentication lag
    setTimeout(() => {
      setIsLoading(false);
      if (currentView === 'forgot') {
        Alert.alert('Reset Password', `Reset password email sent to: ${email}`);
        switchView('login');
      } else {
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
        };
      case 'forgot':
        return {
          title: 'Reset Password',
          subtitle: 'Enter your email to receive a password reset link',
        };
      case 'login':
      default:
        return {
          title: 'Welcome Back',
          subtitle: 'Sign in to access your glassmorphism showcase',
        };
    }
  }, [currentView]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={{ flex: 1, width: '100%' }}
    >
      <ScrollView
        contentContainerStyle={{ alignItems: 'center', width: '100%', paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Branding Logo Section */}
        <AuthLogo isDarkMode={isDarkMode} subtitle={viewLabels.subtitle} />

        {/* Card containing dynamic forms wrapper */}
        <Animated.View
          entering={FadeIn.duration(450).delay(150)}
          style={{ width: '100%', alignItems: 'center' }}
        >
          <Card isDarkMode={isDarkMode} style={styles.card}>
            <Animated.View style={[{ width: '100%' }, contentStyle]}>
              {currentView === 'login' && (
                <LoginScreen
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  isLoading={isLoading}
                  fieldErrors={fieldErrors}
                  isDarkMode={isDarkMode}
                  handleTextChange={handleTextChange}
                  onForgotPassword={() => switchView('forgot')}
                  onSubmit={handleSubmit}
                />
              )}

              {currentView === 'signup' && (
                <SignupScreen
                  name={name}
                  setName={setName}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  isLoading={isLoading}
                  fieldErrors={fieldErrors}
                  isDarkMode={isDarkMode}
                  handleTextChange={handleTextChange}
                  onSubmit={handleSubmit}
                />
              )}

              {currentView === 'forgot' && (
                <ForgotPasswordScreen
                  email={email}
                  setEmail={setEmail}
                  isLoading={isLoading}
                  fieldErrors={fieldErrors}
                  isDarkMode={isDarkMode}
                  handleTextChange={handleTextChange}
                  onSubmit={handleSubmit}
                />
              )}
            </Animated.View>
          </Card>
        </Animated.View>

        {/* Footer Switching Links */}
        <Animated.View entering={FadeIn.duration(450).delay(250)} style={styles.footer}>
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
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

AuthScreen.displayName = 'AuthScreen';
