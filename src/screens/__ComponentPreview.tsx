import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Keyboard,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, InvoiceButton, MessageInputBar } from "../components";

let renderCount = 0;

export const ComponentPreviewScreen: React.FC = () => {
  const [inputText1, setInputText1] = useState("");
  const [inputText2, setInputText2] = useState(
    "Payment receipt for design service",
  );
  const [activeInput, setActiveInput] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const insets = useSafeAreaInsets();

  renderCount++;
  console.log(
    `[ComponentPreview] Rendering Screen. Render Count: ${renderCount}`,
  );

  useEffect(() => {
    console.log(
      "[ComponentPreview] Mounting Screen. Registering keyboard listeners.",
    );

    const showSubscription = Keyboard.addListener("keyboardWillShow", (e) => {
      console.log(
        `[KeyboardEvent] keyboardWillShow: height = ${e.endCoordinates.height}`,
      );
    });
    const didShowSubscription = Keyboard.addListener("keyboardDidShow", (e) => {
      console.log(
        `[KeyboardEvent] keyboardDidShow: height = ${e.endCoordinates.height}`,
      );
    });
    const hideSubscription = Keyboard.addListener("keyboardWillHide", () => {
      console.log("[KeyboardEvent] keyboardWillHide");
    });
    const didHideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      console.log("[KeyboardEvent] keyboardDidHide");
    });

    return () => {
      console.log(
        "[ComponentPreview] Unmounting Screen. Cleaning up listeners.",
      );
      showSubscription.remove();
      didShowSubscription.remove();
      hideSubscription.remove();
      didHideSubscription.remove();
    };
  }, []);

  const handleActiveInputChange = (text: string) => {
    console.log(`[ComponentPreview] activeInput changed: "${text}"`);
    setActiveInput(text);
  };

  return (
    <LinearGradient
      colors={isDarkMode ? ["#fff", "#fff", "#fff"] : ["#fff", "#fff", "#fff"]}
      style={{ flex: 1 }}
    >
      <View style={[styles.root, { paddingTop: insets.top, flex: 1 }]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            style={[
              styles.header,
              isDarkMode ? styles.textDark : styles.textLight,
            ]}
          >
            UI Components Preview
          </Text>

          {/* Toggle Theme Control */}
          <InvoiceButton
            label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            onPress={() => setIsDarkMode(!isDarkMode)}
            isDarkMode={isDarkMode}
            iconName="receipt"
            style={styles.toggleButton}
          />

          {/* 1. Card Component Section */}
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode ? styles.textDark : styles.textLight,
            ]}
          >
            1. Card Component
          </Text>
          <View style={styles.sectionRow}>
            <Card isDarkMode={isDarkMode} style={styles.cardExample}>
              <Text
                style={[
                  styles.cardTitle,
                  isDarkMode ? styles.textDark : styles.textLight,
                ]}
              >
                Standard Card
              </Text>
              <Text
                style={[
                  styles.cardText,
                  isDarkMode
                    ? styles.textDarkSecondary
                    : styles.textLightSecondary,
                ]}
              >
                This is a premium glassmorphic blur card container that adapts
                automatically to themes.
              </Text>
            </Card>
          </View>

          {/* 2. InvoiceButton Component Section */}
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode ? styles.textDark : styles.textLight,
            ]}
          >
            2. Invoice Button Component
          </Text>
          <View style={styles.sectionRow}>
            <Text
              style={[
                styles.labelDesc,
                isDarkMode
                  ? styles.textDarkSecondary
                  : styles.textLightSecondary,
              ]}
            >
              Default Active:
            </Text>
            <InvoiceButton
              label="Download Invoice"
              onPress={() => {}}
              isDarkMode={isDarkMode}
              iconName="file-text"
            />
          </View>
          <View style={styles.sectionRow}>
            <Text
              style={[
                styles.labelDesc,
                isDarkMode
                  ? styles.textDarkSecondary
                  : styles.textLightSecondary,
              ]}
            >
              Receipt Variant:
            </Text>
            <InvoiceButton
              label="View Receipt"
              onPress={() => {}}
              isDarkMode={isDarkMode}
              iconName="receipt"
            />
          </View>
          <View style={styles.sectionRow}>
            <Text
              style={[
                styles.labelDesc,
                isDarkMode
                  ? styles.textDarkSecondary
                  : styles.textLightSecondary,
              ]}
            >
              Disabled State:
            </Text>
            <InvoiceButton
              label="Processing..."
              disabled
              isDarkMode={isDarkMode}
              iconName="file-text"
            />
          </View>

          {/* 3. MessageInputBar Component Section */}
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode ? styles.textDark : styles.textLight,
            ]}
          >
            3. Message Input Bar Component
          </Text>
          <Text
            style={[
              styles.labelDesc,
              isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary,
              { marginLeft: 16 },
            ]}
          >
            Placeholder State:
          </Text>
          <MessageInputBar
            value={inputText1}
            onChangeText={setInputText1}
            placeholder="Type your message here..."
            isDarkMode={isDarkMode}
            onPlusPress={() => {}}
            onSendPress={() => setInputText1("")}
            style={styles.inputExample}
          />

          <Text
            style={[
              styles.labelDesc,
              isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary,
              { marginLeft: 16, marginTop: 16 },
            ]}
          >
            Active / Typed State:
          </Text>
          <MessageInputBar
            value={inputText2}
            onChangeText={setInputText2}
            isDarkMode={isDarkMode}
            onPlusPress={() => {}}
            onSendPress={() => setInputText2("")}
            style={styles.inputExample}
          />
        </ScrollView>

        {/* Bottom Pinned Active Input Bar for Keyboard Testing */}
        <View
          style={[
            styles.bottomContainer,
            isDarkMode ? styles.borderDark : styles.borderLight,
            { paddingBottom: 24 },
          ]}
        >
          <Text
            style={[
              styles.bottomBarLabel,
              isDarkMode ? styles.textDarkSecondary : styles.textLightSecondary,
            ]}
          >
            Interactive Bottom Pinned Test Bar:
          </Text>
          <MessageInputBar
            value={activeInput}
            onChangeText={handleActiveInputChange}
            placeholder="Tap to test keyboard adjust..."
            isDarkMode={isDarkMode}
            onPlusPress={() => {}}
            onSendPress={() => setActiveInput("")}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bgLight: {
    backgroundColor: "#f3f4f6",
  },
  bgDark: {
    backgroundColor: "#0b0f19",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
  },
  toggleButton: {
    alignSelf: "center",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionRow: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  labelDesc: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  cardExample: {
    padding: 20,
    borderRadius: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputExample: {
    marginVertical: 4,
  },
  bottomContainer: {
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  borderLight: {
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  borderDark: {
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  bottomBarLabel: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  textLight: {
    color: "#111827",
  },
  textDark: {
    color: "#ffffff",
  },
  textLightSecondary: {
    color: "#4b5563",
  },
  textDarkSecondary: {
    color: "#9ca3af",
  },
});
