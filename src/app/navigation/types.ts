import { NavigatorScreenParams } from '@react-navigation/native';
import { Chain } from '@features/network';

export type AuthStackParamList = {
  Onboarding: undefined;
  SetPasscode: { importData?: any };
  ConfirmPasscode: { previousPin: string; importData?: any };
  UnlockPasscode: undefined;
  DisplayMnemonic: { mnemonic: string };
  VerifyMnemonic: { mnemonic: string };
  ImportWallet: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  TokenDetail: {
    token: any;
    balanceString: string;
    recipientAddress: string;
  };
  TransferToken: {
    token: any;
    activeChain: Chain;
    senderAddress: string;
    balanceString: string;
  };
  SwapTokens: {
    tokens: any[];
    activeChain: Chain;
  };
  Staking: {
    activeChain: Chain;
    balanceString: string;
  };
  NftGallery: undefined;
  WalletConnectSession: undefined;
  Receive: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
  Loading: undefined;
};
