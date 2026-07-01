import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { styles } from "./AuthScreen.styles";

interface LoginScreenProps {
  email: string;
  setEmail: (text: string) => void;
  password: string;
  setPassword: (text: string) => void;
  isLoading: boolean;
  fieldErrors: { email?: string, password?: string };
  isDarkMode: boolean;
  handleTextChange: (
    field: "email" | "password",
    setter: (text: string) => void,
  ) => (text: string) => void;
  onForgotPassword: () => void;
  onSubmit: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  fieldErrors,
  isDarkMode,
  handleTextChange,
  onForgotPassword,
  onSubmit,
}) => {
  return (
    <View style={{ width: "100%" }}>
      <View style={{ width: "100%", marginBottom: fieldErrors.email ? 8 : 16 }}>
        <Input
          label="Email Address"
          placeholder="example@mail.com"
          iconName="email"
          value={email}
          onChangeText={handleTextChange("email", setEmail)}
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

      <View
        style={{ width: "100%", marginBottom: fieldErrors.password ? 8 : 16 }}
      >
        <Input
          label="Password"
          placeholder="••••••••"
          iconName="lock"
          value={password}
          onChangeText={handleTextChange("password", setPassword)}
          isDarkMode={isDarkMode}
          secureTextEntry
          editable={!isLoading}
          autoCapitalize="none"
        />
        {fieldErrors.password && (
          <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
        )}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onForgotPassword}
          style={styles.forgotButton}
          disabled={isLoading}
        >
          <Text
            style={[
              styles.forgotText,
              isDarkMode ? styles.forgotTextDark : styles.forgotTextLight,
            ]}
          >
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Sign In"
        onPress={onSubmit}
        isDarkMode={isDarkMode}
        loading={isLoading}
        style={styles.submitButton}
        disabled={isLoading}
        showIcon={false}
      />
    </View>
  );
};
