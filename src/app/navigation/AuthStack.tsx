import React, { useState } from 'react';
import { useColorScheme } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { toast } from '@shared/ui/Toast';
import {
  WalletOnboardingScreen,
  PasscodeScreen,
  MnemonicDisplayScreen,
  MnemonicVerifyScreen,
  ImportWalletScreen,
  KeyDerivationService,
  useWalletStore,
} from '@features/wallet';
import { useSecurityStore } from '../../features/security/store/useSecurityStore';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [tempMnemonic, setTempMnemonic] = useState<string>('');
  const [tempImportData, setTempImportData] = useState<any>(null);

  const { importHDWallet, importPrivateKeyWallet, importWatchWallet } = useWalletStore();
  const { setupPasscode, verifyPasscode, hasPasscode } = useSecurityStore();

  const finalizeImport = async (data: any, navigation: any) => {
    if (!data) return;
    try {
      if (data.type === 'mnemonic') {
        await importHDWallet('Imported Wallet', data.key);
      } else if (data.type === 'pk' && data.blockchain) {
        await importPrivateKeyWallet('Imported Key', data.key, data.blockchain);
      } else if (data.type === 'watch' && data.evmAddr && data.solAddr) {
        await importWatchWallet('Watch Wallet', data.evmAddr, data.solAddr);
      }
      toast.success('Wallet imported successfully!');
      // Assuming RootNavigator listens to wallet state, it will unmount AuthStack
    } catch (e: any) {
      toast.error(e.message || 'Import failed');
      navigation.navigate('Onboarding');
    }
  };

  const handlePasscodeSuccess = async (
    pin: string,
    mode: 'set' | 'confirm' | 'unlock',
    navigation: any,
    routeParams?: any
  ) => {
    if (mode === 'unlock') {
      const isValid = await verifyPasscode(pin);
      if (isValid) {
        toast.success('Wallet unlocked');
      } else {
        toast.error('Incorrect passcode');
      }
    } else if (mode === 'set') {
      navigation.navigate('ConfirmPasscode', { previousPin: pin, importData: routeParams?.importData });
    } else if (mode === 'confirm') {
      await setupPasscode(pin);

      const importData = routeParams?.importData;
      if (importData) {
        await finalizeImport(importData, navigation);
      } else {
        const newMnemonic = KeyDerivationService.generateMnemonic();
        setTempMnemonic(newMnemonic);
        navigation.navigate('DisplayMnemonic', { mnemonic: newMnemonic });
      }
    }
  };

  const handleMnemonicVerified = async (navigation: any) => {
    try {
      await importHDWallet('Main Wallet', tempMnemonic);
      toast.success('Wallet created and backed up!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to create wallet');
      navigation.navigate('Onboarding');
    }
  };

  return (
    <Stack.Navigator 
      initialRouteName={hasPasscode ? 'UnlockPasscode' : 'Onboarding'}
      screenOptions={{ 
        headerShown: false, 
        animation: 'fade',
        contentStyle: { backgroundColor: 'transparent' }
      }}
    >
      <Stack.Screen name="Onboarding">
        {(props) => (
          <WalletOnboardingScreen
            isDarkMode={isDarkMode}
            onCreateNew={() => props.navigation.navigate('SetPasscode', {})}
            onImport={() => props.navigation.navigate('ImportWallet')}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="SetPasscode">
        {(props) => (
          <PasscodeScreen
            mode="set"
            previousPin=""
            onSuccess={(pin) => handlePasscodeSuccess(pin, 'set', props.navigation, props.route.params)}
            isDarkMode={isDarkMode}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="ConfirmPasscode">
        {(props) => (
          <PasscodeScreen
            mode="confirm"
            previousPin={props.route.params.previousPin}
            onSuccess={(pin) => handlePasscodeSuccess(pin, 'confirm', props.navigation, props.route.params)}
            isDarkMode={isDarkMode}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="UnlockPasscode">
        {(props) => (
          <PasscodeScreen
            mode="unlock"
            previousPin=""
            onSuccess={(pin) => handlePasscodeSuccess(pin, 'unlock', props.navigation)}
            isDarkMode={isDarkMode}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="DisplayMnemonic">
        {(props) => (
          <MnemonicDisplayScreen
            mnemonic={props.route.params.mnemonic}
            onVerify={() => props.navigation.navigate('VerifyMnemonic', { mnemonic: props.route.params.mnemonic })}
            isDarkMode={isDarkMode}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="VerifyMnemonic">
        {(props) => (
          <MnemonicVerifyScreen
            mnemonic={props.route.params.mnemonic}
            onSuccess={() => handleMnemonicVerified(props.navigation)}
            isDarkMode={isDarkMode}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="ImportWallet">
        {(props) => (
          <ImportWalletScreen
            isDarkMode={isDarkMode}
            onImportMnemonic={(mnemonic) => {
              props.navigation.navigate('SetPasscode', { importData: { type: 'mnemonic', key: mnemonic } });
            }}
            onImportPrivateKey={(pk, blockchain) => {
              props.navigation.navigate('SetPasscode', { importData: { type: 'pk', key: pk, blockchain } });
            }}
            onImportWatch={(evm, sol) => {
              props.navigation.navigate('SetPasscode', { importData: { type: 'watch', key: '', evmAddr: evm, solAddr: sol } });
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
