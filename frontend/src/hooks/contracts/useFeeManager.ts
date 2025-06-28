import { useReadContract, useWriteContract, useAccount, useChainId } from 'wagmi';
import { getContractAddresses, CONTRACT_ABIS } from '@/lib/contracts/config';
import { useTransaction } from '@/hooks/useTransaction';
import type { Address } from 'viem';

export function useFeeManager() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contracts = getContractAddresses(chainId);
  const { execute, ...transactionState } = useTransaction();

  // Read functions
  const { data: treasury } = useReadContract({
    address: contracts.FeeManager as Address,
    abi: CONTRACT_ABIS.FeeManager,
    functionName: 'treasury',
    query: {
      enabled: !!contracts.FeeManager,
    },
  });

  return {
    // Read data
    treasury,
    
    // Transaction state
    ...transactionState,
    
    // Utility
    contractAddress: contracts.FeeManager,
  };
}

// Helper types for FeeManager
export type FeeUpdateData = {
  newFee: bigint;
}; 