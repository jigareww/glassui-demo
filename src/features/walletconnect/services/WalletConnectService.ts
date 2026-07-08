export interface WCDappMetadata {
  name: string;
  url: string;
  icon: string;
  description: string;
}

export interface WCSessionProposal {
  id: string;
  dAppMetadata: WCDappMetadata;
  requiredNamespaces: {
    chains: string[];
    methods: string[];
    events: string[];
  };
}

export class WalletConnectService {
  /**
   * Parse WalletConnect standard URI string and extract session/pairing payload.
   */
  public static async parsePairingUri(uri: string): Promise<WCSessionProposal> {
    // Standard validation
    if (!uri.startsWith('wc:')) {
      throw new Error('Invalid WalletConnect URI scheme');
    }

    // Return mockup matching Uniswap dApp request payload
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'wc-proposal-' + Math.floor(Math.random() * 100000),
          dAppMetadata: {
            name: 'Uniswap Interface',
            url: 'https://app.uniswap.org',
            icon: 'https://placehold.co/100x100/png?text=Uniswap',
            description: 'Swap, earn, and build on the leading decentralized cryptocurrency protocol.',
          },
          requiredNamespaces: {
            chains: ['eip155:1', 'eip155:137'],
            methods: ['personal_sign', 'eth_sendTransaction', 'eth_signTypedData'],
            events: ['chainChanged', 'accountsChanged'],
          },
        });
      }, 1000);
    });
  }

  /**
   * Approve dApp session proposal.
   */
  public static async approveSession(proposal: WCSessionProposal, activeAddresses: string[]): Promise<boolean> {
    // In production, this stores the session keys and initializes WebSockets sign listeners.
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1200);
    });
  }
}
export default WalletConnectService;
