import React from 'react';
import { View, Text } from 'react-native';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { styles } from './AuthScreen.styles';

interface SignupScreenProps {
  name: string;
  setName: (text: string) => void;
  email: string;
  setEmail: (text: string) => void;
  password: string;
  setPassword: (text: string) => void;
  isLoading: boolean;
  fieldErrors: { name?: string; email?: string; password?: string };
  isDarkMode: boolean;
  handleTextChange: (
    field: 'name' | 'email' | 'password',
    setter: (text: string) => void
  ) => (text: string) => void;
  onSubmit: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  fieldErrors,
  isDarkMode,
  handleTextChange,
  onSubmit,
}) => {
  return (
    <View style={{ width: '100%' }}>
      <View style={{ width: '100%', marginBottom: fieldErrors.name ? 8 : 16 }}>
        <Input
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

      <View style={{ width: '100%', marginBottom: fieldErrors.password ? 8 : 16 }}>
        <Input
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
      </View>

      <Button
        title="Sign Up"
        onPress={onSubmit}
        isDarkMode={isDarkMode}
        loading={isLoading}
        style={styles.submitButton}
        disabled={isLoading}
      />
    </View>
  );
};
