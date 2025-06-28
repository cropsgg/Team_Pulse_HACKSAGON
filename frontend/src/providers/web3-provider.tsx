'use client';

import React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base, baseSepolia, mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

// Get project ID from environment
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '';

// Create wagmi config
const config = getDefaultConfig({
  // Your dApps chains
  chains: [base, baseSepolia, mainnet],

  // Required API Keys
  walletConnectProjectId: projectId,

  // Required App Info
  appName: 'ImpactChain & CharityChain',
  appDescription: 'AI-Powered Decentralized Blockchain DAO for Funding and Charity',
  appUrl: 'https://impactchain.org',
  appIcon: 'https://impactchain.org/logo.png',

  // Optional - Override connectors
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ 
      projectId,
      metadata: {
        name: 'ImpactChain & CharityChain',
        description: 'AI-Powered Decentralized Blockchain DAO',
        url: 'https://impactchain.org',
        icons: ['https://impactchain.org/logo.png'],
      },
    }),
  ],

  // Optional - Override transports
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [mainnet.id]: http(),
  },
});

// Create a separate query client for wagmi
const wagmiQueryClient = new QueryClient();

interface Web3ProviderProps {
  children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={wagmiQueryClient}>
        <ConnectKitProvider
          theme="auto"
          mode="auto"
          options={{
            initialChainId: 0,
            embedGoogleFonts: true,
            language: 'en-US',
            hideQuestionMarkCTA: true,
            hideTooltips: false,
            hideRecentBadge: false,
            walletConnectName: 'WalletConnect',
            disclaimer: (
              <div style={{ 
                fontSize: '14px', 
                color: 'var(--ck-body-color-muted)',
                textAlign: 'center',
                padding: '16px'
              }}>
                By connecting your wallet, you agree to our{' '}
                <a 
                  href="/terms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'var(--ck-accent-color)' }}
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a 
                  href="/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'var(--ck-accent-color)' }}
                >
                  Privacy Policy
                </a>
                .
              </div>
            ),
          }}
          customTheme={{
            '--ck-font-family': 'Inter, system-ui, sans-serif',
            '--ck-border-radius': '8px',
            '--ck-primary-button-border-radius': '8px',
            '--ck-secondary-button-border-radius': '8px',
            '--ck-tertiary-button-border-radius': '8px',
            '--ck-focus-color': 'hsl(var(--ring))',
            '--ck-accent-color': 'hsl(var(--primary))',
            '--ck-accent-text-color': 'hsl(var(--primary-foreground))',
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Export config for use in other parts of the app
export { config }; 