import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Card } from "../Card/Card";
import { MessageInputBarProps } from "./MessageInputBar.types";
import { styles } from "./MessageInputBar.styles";
import { Plus, Send } from "lucide-react-native";

export const MessageInputBar: React.FC<MessageInputBarProps> = ({
  value,
  onChangeText,
  onSendPress,
  onPlusPress,
  placeholder = "Type a message...",
  isDarkMode = false,
  style,
}) => {
  const isSendDisabled = !value.trim();

  return (
    <View style={[styles.container, style]}>
      {/* Plus Action Button */}
      <TouchableOpacity onPress={onPlusPress} activeOpacity={0.7}>
        <Card
          isDarkMode={isDarkMode}
          effect="none"
          style={styles.plusButton}
          contentStyle={{ justifyContent: "center", alignItems: "center", padding: 0, width: '100%', height: '100%' }}
        >
          <Plus size={22} color={isDarkMode ? "#000F2D" : "#000F2D"} />
        </Card>
      </TouchableOpacity>

      {/* Glass Message Input Container with inner Send button */}
      <Card
        isDarkMode={isDarkMode}
        style={styles.inputCard}
        contentStyle={styles.inputContent}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={
            isDarkMode ? "rgba(255, 255, 255, 0.35)" : "rgba(0, 0, 0, 0.35)"
          }
          style={[
            styles.textInput,
            isDarkMode ? styles.textInputDark : styles.textInputLight,
          ]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={onSendPress}
          disabled={isSendDisabled}
          activeOpacity={0.7}
          style={styles.sendIconWrapper}
        >
          <Send
            size={18}
            color={
              isSendDisabled
                ? isDarkMode
                  ? "rgba(255, 255, 255, 0.25)"
                  : "rgba(0, 0, 0, 0.25)"
                : isDarkMode
                ? "#60a5fa"
                : "#3b82f6"
            }
          />
        </TouchableOpacity>
      </Card>
    </View>
  );
};
