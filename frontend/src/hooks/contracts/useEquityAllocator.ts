import { useReadContract, useWriteContract, useAccount, useChainId } from 'wagmi';
import { getContractAddresses, CONTRACT_ABIS } from '@/lib/contracts/config';
import { useTransaction } from '@/hooks/useTransaction';
import type { Address } from 'viem';

export function useEquityAllocator() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contracts = getContractAddresses(chainId);
  const { execute, ...transactionState } = useTransaction();

  // Read functions
  const { data: maxCliffPeriod } = useReadContract({
    address: contracts.EquityAllocator as Address,
    abi: CONTRACT_ABIS.EquityAllocator,
    functionName: 'MAX_CLIFF_PERIOD',
    query: {
      enabled: !!contracts.EquityAllocator,
    },
  });

  const { data: maxVestingPeriod } = useReadContract({
    address: contracts.EquityAllocator as Address,
    abi: CONTRACT_ABIS.EquityAllocator,
    functionName: 'MAX_VESTING_PERIOD',
    query: {
      enabled: !!contracts.EquityAllocator,
    },
  });

  return {
    // Read data
    maxCliffPeriod,
    maxVestingPeriod,
    
    // Transaction state
    ...transactionState,
    
    // Utility
    contractAddress: contracts.EquityAllocator,
  };
}

// Helper types for EquityAllocator
export type EquityPosition = {
  shares: bigint;
  cliffEnd: bigint;
  vestingEnd: bigint;
  claimed: bigint;
  isActive: boolean;
};

export type StartupEquityInfo = {
  totalShares: bigint;
  allocatedShares: bigint;
  escrowedFunds: bigint;
  valuation: bigint;
};

export type VestingSchedule = {
  totalShares: bigint;
  cliffPeriod: bigint;
  vestingPeriod: bigint;
  startTime: bigint;
  claimed: bigint;
};

export type EquityAllocationData = {
  startupId: bigint;
  recipient: Address;
  shares: bigint;
  cliffPeriod: bigint;
  vestingPeriod: bigint;
};

export type EscrowData = {
  startupId: bigint;
  amount: bigint;
}; 