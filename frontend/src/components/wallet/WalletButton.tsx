'use client';

import { ConnectKitButton } from 'connectkit';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { Wallet, Network, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WalletButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function WalletButton({ className, variant = 'default', size = 'default' }: WalletButtonProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getNetworkBadge = () => {
    switch (chainId) {
      case base.id:
        return <Badge variant="success">Base</Badge>;
      case baseSepolia.id:
        return <Badge variant="secondary">Base Sepolia</Badge>;
      default:
        return <Badge variant="destructive">Unsupported Network</Badge>;
    }
  };

  const isWrongNetwork = chainId !== base.id && chainId !== baseSepolia.id;

  return (
    <ConnectKitButton.Custom>
      {({ isConnected: ckConnected, isConnecting, address: ckAddress, ensName, show, truncatedAddress, chain }) => {
        if (isConnecting) {
          return (
            <Button
              disabled
              variant={variant}
              size={size}
              className={className}
            >
              Connecting...
            </Button>
          );
        }

        if (!ckConnected) {
          return (
            <Button
              onClick={show}
              variant={variant}
              size={size}
              className={className}
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          );
        }

        if (isWrongNetwork) {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="destructive" size={size} className={className}>
                  <Network className="w-4 h-4 mr-2" />
                  Wrong Network
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => switchChain({ chainId: base.id })}
                >
                  Switch to Base
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => switchChain({ chainId: baseSepolia.id })}
                >
                  Switch to Base Sepolia
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={show}>
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={variant} size={size} className={className}>
                <div className="flex items-center gap-2">
                  {getNetworkBadge()}
                  <span>{ensName || truncatedAddress}</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Connected to {chain?.name}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(ckAddress || '')}
              >
                Copy Address
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open(`https://basescan.org/address/${ckAddress}`, '_blank')}
              >
                View on Basescan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => switchChain({ chainId: base.id })}
                disabled={chainId === base.id}
              >
                Switch to Base Mainnet
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => switchChain({ chainId: baseSepolia.id })}
                disabled={chainId === baseSepolia.id}
              >
                Switch to Base Sepolia
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={show}>
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }}
    </ConnectKitButton.Custom>
  );
}

// Network switcher component
export function NetworkSwitcher() {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Network className="w-4 h-4 mr-2" />
          {chainId === base.id ? 'Base' : chainId === baseSepolia.id ? 'Base Sepolia' : 'Unknown'}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => switchChain({ chainId: base.id })}
          disabled={chainId === base.id}
        >
          Base Mainnet
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => switchChain({ chainId: baseSepolia.id })}
          disabled={chainId === baseSepolia.id}
        >
          Base Sepolia (Testnet)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 