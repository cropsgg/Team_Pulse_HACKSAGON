'use client';

import React from 'react';

interface Web3ProviderProps {
  children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  // Simplified Web3 provider for client-side only setup
  // This can be replaced with proper wagmi/connectkit setup later
  return (
    <div>
      {children}
    </div>
  );
} 