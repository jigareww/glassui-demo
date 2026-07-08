import React, { useState, useEffect } from "react";
import {
  View,
  StatusBar,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { alert } from "@shared/ui/Alert";
import { useWalletStore } from "@features/wallet";
import { useAppShield, ShieldOverlay } from "@features/security";
import TransferTokenScreen from "../../features/tokens/screens/TransferTokenScreen";
import NftGalleryScreen from "../../features/nfts/screens/NftGalleryScreen";
import { ReceiveScreen } from "../../features/wallet/screens/ReceiveScreen";
import JailbreakScanner from "../../features/security/services/JailbreakScanner";
import { useSecurityStore } from "../../features/security/store/useSecurityStore";
import { useAutoLock } from "../../features/security/services/AutoLockService";
import { AuthStack } from "./AuthStack";
import { AppStack } from "./AppStack";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // State
  const { initializeStore: initializeWallet, activeWalletId } =
    useWalletStore();
  const {
    initializeSecurity,
    hasPasscode,
    isLocked,
    isLoading: securityLoading,
  } = useSecurityStore();

  // App Shielding & Auto-locking
  const { isShielded } = useAppShield(() => {
    // When shield is triggered, we lock the app.
    // In a real Redux/Zustand setup, we'd update a global 'isLocked' state.
    // For now, we will rely on AuthStack rendering the unlock screen.
  });

  // Mount the global Auto-Lock monitor
  useAutoLock();

  useEffect(() => {
    const startup = async () => {
      // Jailbreak Scanner compromised system check
      if (JailbreakScanner.isDeviceCompromised()) {
        alert.show({
          title: "Security Compromise",
          message:
            "Jailbreak/Root detection warning. Private keys are vulnerable on this device. Proceed at your own risk.",
          buttons: [{ text: "Acknowledge", style: "cancel" }],
        });
      }

      try {
        await initializeSecurity();
        await initializeWallet();
      } catch (error) {
        console.error("[Startup] Failed to initialize state:", error);
      }

      // Sync Dynamic App Icon with Backend Configuration
      try {
        const { Platform } = require("react-native");
        const backendUrl =
          Platform.OS === "android"
            ? "http://10.0.2.2:3000"
            : "http://localhost:3000";

        // Real-world: Fetch using Authorization token.
        // We pass subscription=premium to simulate a logged-in premium user.
        // The festival is dynamically determined by the backend Admin Panel!
        const response = await fetch(`${backendUrl}/api/init?subscription=premium`);
        const json = await response.json();

        if (json.success && json.data) {
          const { subscription, festival } = json.data;

          const {
            resolveAppIcon,
          } = require("../../features/app-icon/IconResolver");
          const targetIcon = resolveAppIcon(subscription, festival);

          const AppIconModule = require("../../native/AppIconModule").default;
          const currentIcon = await AppIconModule.getCurrentIcon();

          if (currentIcon !== targetIcon) {
            console.log(
              `[AppIcon Sync] Business state resolved new icon: ${targetIcon}. Current: ${currentIcon}. Prompting user...`,
            );

            const { Image, View, Text } = require("react-native");
            const { ArrowRight } = require("lucide-react-native");

            const oldIconUrl =
              currentIcon === "default"
                ? null
                : `${backendUrl}/assets/${currentIcon}.png`;
            const newIconUrl =
              targetIcon === "default"
                ? null
                : `${backendUrl}/assets/${targetIcon}.png`;

            const customView = (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                }}
              >
                {oldIconUrl ? (
                  <View style={{ alignItems: "center" }}>
                    <Image
                      source={{ uri: oldIconUrl }}
                      style={{ width: 64, height: 64, borderRadius: 16 }}
                    />
                    <Text
                      style={{ fontSize: 10, color: "#9ca3af", marginTop: 4 }}
                    >
                      Current
                    </Text>
                  </View>
                ) : (
                  <View style={{ alignItems: "center" }}>
                    <Image
                      source={require("../../../assets/images/icon.png")}
                      style={{ width: 64, height: 64, borderRadius: 16 }}
                    />
                    <Text
                      style={{ fontSize: 10, color: "#9ca3af", marginTop: 4 }}
                    >
                      Current
                    </Text>
                  </View>
                )}

                <ArrowRight size={24} color="#60a5fa" />

                {newIconUrl ? (
                  <View style={{ alignItems: "center" }}>
                    <Image
                      source={{ uri: newIconUrl }}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        borderWidth: 2,
                        borderColor: "#10b981",
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#10b981",
                        marginTop: 4,
                        fontWeight: "bold",
                      }}
                    >
                      New
                    </Text>
                  </View>
                ) : (
                  <View style={{ alignItems: "center" }}>
                    <Image
                      source={require("../../../assets/images/icon.png")}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        borderWidth: 2,
                        borderColor: "#10b981",
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#10b981",
                        marginTop: 4,
                        fontWeight: "bold",
                      }}
                    >
                      New
                    </Text>
                  </View>
                )}
              </View>
            );

            const baseMessage = festival
              ? `Celebrate ${festival} with us! Update your home screen icon to the new ${targetIcon.toUpperCase()} theme?`
              : `Would you like to update your home screen icon to the new ${targetIcon.toUpperCase()} theme?`;

            const androidWarning =
              Platform.OS === "android"
                ? "\n\n(Note: Android requires the app to briefly close to apply the new icon)."
                : "";

            alert.show({
              title: "✨ New App Icon Available!",
              message: baseMessage + androidWarning,
              customView,
              cancelable: false,
              buttons: [
                { text: "Not Now", style: "cancel" },
                {
                  text: "Change Icon",
                  onPress: async () => {
                    try {
                      if (Platform.OS === "android") {
                        // On Android, the OS forcefully kills the app when the launcher component changes.
                        // We show a brief loading/toast state here (optional) and then change the icon.
                        setTimeout(async () => {
                          await AppIconModule.changeIcon(targetIcon);
                        }, 300);
                      } else {
                        await AppIconModule.changeIcon(targetIcon);
                      }
                      console.log(
                        `[AppIcon Sync] Successfully changed to ${targetIcon}`,
                      );
                    } catch (e) {
                      console.error("[AppIcon Sync] Failed to change icon", e);
                    }
                  },
                },
              ],
            });
          } else {
            console.log(
              `[AppIcon Sync] Icon is already up-to-date: ${currentIcon}`,
            );
          }
        }
      } catch (error) {
        console.warn("[Startup] Failed to sync app icon config:", error);
      }
    };
    startup();
  }, []);

  return (
    <View
      style={[styles.container, isDarkMode ? styles.bgDark : styles.bgLight]}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        translucent
        backgroundColor="transparent"
      />

      {/* Background Refraction Spheres (Kept the beautiful UI!) */}
      <View style={styles.globalBg} pointerEvents="none">
        <LinearGradient
          colors={isDarkMode ? ["#1e40af", "#1e1b4b"] : ["#60a5fa", "#93c5fd"]}
          style={styles.globalSphereTop}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={isDarkMode ? ["#701a75", "#4a044e"] : ["#e9d5ff", "#f472b6"]}
          style={styles.globalSphereMiddle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={isDarkMode ? ["#0f766e", "#115e59"] : ["#2dd4bf", "#5eead4"]}
          style={styles.globalSphereBottom}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {securityLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : (
          <NavigationContainer
            theme={{
              ...DefaultTheme,
              colors: {
                ...DefaultTheme.colors,
                background: "transparent",
              },
            }}
          >
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                animation: "fade",
                contentStyle: { backgroundColor: "transparent" },
              }}
            >
              {/* Dynamic Stack Rendering Based on Security & Wallet State */}
              {!hasPasscode || isLocked || !activeWalletId ? (
                <Stack.Screen name="Auth" component={AuthStack} />
              ) : (
                <Stack.Screen name="App" component={AppStack} />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        )}
      </SafeAreaView>

      {isShielded && <ShieldOverlay isDarkMode={isDarkMode} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgDark: { backgroundColor: "#050714" },
  bgLight: { backgroundColor: "#f3f4f6" },
  safeArea: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  globalBg: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: "hidden",
  },
  globalSphereTop: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    top: "10%",
    right: "-10%",
    opacity: 0.85,
  },
  globalSphereMiddle: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    top: "40%",
    left: "-10%",
    opacity: 0.75,
  },
  globalSphereBottom: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    bottom: "10%",
    left: "-15%",
    opacity: 0.9,
  },
});

export default RootNavigator;
