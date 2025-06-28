'use client';

import React, { useState, useEffect } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { ConnectKitProvider } from 'connectkit';
import { base, baseSepolia } from 'wagmi/chains';
import { metaMask, walletConnect, coinbaseWallet, injected } from 'wagmi/connectors';

// Flag to prevent double initialization
let isConfigCreated = false;
let wagmiConfig: any = null;

// Create wagmi config only once
const createWagmiConfig = () => {
  if (isConfigCreated && wagmiConfig) {
    return wagmiConfig;
  }

  wagmiConfig = createConfig({
    chains: [base, baseSepolia],
    connectors: [
      metaMask(),
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default-project-id',
        metadata: {
          name: 'ImpactChain & CharityChain',
          description: 'AI-powered decentralized blockchain DAO platform for funding NGOs and startups',
          url: typeof window !== 'undefined' ? window.location.origin : 'https://impactchain.co',
          icons: ['https://impactchain.co/logo.png'],
        },
        showQrModal: false,
      }),
      coinbaseWallet({
        appName: 'ImpactChain & CharityChain',
        appLogoUrl: 'https://impactchain.co/logo.png',
      }),
      injected(),
    ],
    transports: {
      [base.id]: http(),
      [baseSepolia.id]: http(),
    },
    ssr: true,
  });

  isConfigCreated = true;
  return wagmiConfig;
};

interface Web3ProviderProps {
  children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [config, setConfig] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Only initialize Web3 on the client side
    if (typeof window !== 'undefined') {
      setIsClient(true);
      const wagmiConfig = createWagmiConfig();
      setConfig(wagmiConfig);
    }
  }, []);

  // Show loading state during SSR or before client hydration
  if (!isClient || !config) {
    return <div>{children}</div>;
  }

  return (
    <WagmiProvider config={config}>
      <ConnectKitProvider
        theme="auto"
        options={{
          embedGoogleFonts: true,
          enforceSupportedChains: true,
          initialChainId: base.id,
          hideBalance: false,
          hideTooltips: false,
          hideQuestionMarkCTA: false,
          hideNoWalletCTA: false,
          hideRecentBadge: false,
          walletConnectCTA: "link",
          bufferPolyfill: false,
        }}
      >
        {children}
      </ConnectKitProvider>
    </WagmiProvider>
  );
} 