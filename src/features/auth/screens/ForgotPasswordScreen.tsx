import React from 'react';
import { View, Text } from 'react-native';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { styles } from './AuthScreen.styles';

interface ForgotPasswordScreenProps {
  email: string;
  setEmail: (text: string) => void;
  isLoading: boolean;
  fieldErrors: { email?: string };
  isDarkMode: boolean;
  handleTextChange: (field: 'email', setter: (text: string) => void) => (text: string) => void;
  onSubmit: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  email,
  setEmail,
  isLoading,
  fieldErrors,
  isDarkMode,
  handleTextChange,
  onSubmit,
}) => {
  return (
    <View style={{ width: '100%' }}>
      <View style={{ width: '100%', marginBottom: fieldErrors.email ? 8 : 16 }}>
        <Input
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

      <Button
        title="Send Reset Link"
        onPress={onSubmit}
        isDarkMode={isDarkMode}
        loading={isLoading}
        style={styles.submitButton}
        disabled={isLoading}
      />
    </View>
  );
};
