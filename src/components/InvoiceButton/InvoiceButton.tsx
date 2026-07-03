import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { Card } from "../Card/Card";
import { InvoiceButtonProps } from "./InvoiceButton.types";
import { styles } from "./InvoiceButton.styles";
import { FileText, Receipt, ShieldAlert } from "lucide-react-native";

export const InvoiceButton: React.FC<InvoiceButtonProps> = ({
  label,
  onPress,
  isDarkMode = false,
  disabled = false,
  style,
  labelStyle,
  iconName = "file-text",
}) => {
  const renderIcon = () => {
    const color = disabled
      ? isDarkMode
        ? "rgba(255, 255, 255, 0.3)"
        : "rgba(0, 0, 0, 0.3)"
      : isDarkMode
      ? "#ffffff"
      : "#1f2937";

    if (iconName === "none") return null;

    switch (iconName) {
      case "receipt":
        return <Receipt size={16} color={color} style={styles.icon} />;
      case "alert-circle":
        return <ShieldAlert size={16} color={color} style={styles.icon} />;
      case "file-text":
      default:
        return <FileText size={16} color={color} style={styles.icon} />;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.7}>
      <Card
        isDarkMode={isDarkMode}
        effect="none"
        style={[styles.container, style, disabled && { opacity: 0.5 }]}
        contentStyle={styles.content}
      >
        {renderIcon()}
        <Text
          style={[
            styles.label,
            isDarkMode ? styles.labelDark : styles.labelLight,
            disabled && styles.disabledLabel,
            labelStyle,
          ]}
        >
          {label}
        </Text>
      </Card>
    </TouchableOpacity>
  );
};
