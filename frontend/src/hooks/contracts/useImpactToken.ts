import { useReadContract, useWriteContract, useAccount, useChainId } from 'wagmi';
import { getContractAddresses, CONTRACT_ABIS } from '@/lib/contracts/config';
import { useTransaction } from '@/hooks/useTransaction';
import type { Address } from 'viem';

export function useImpactToken() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contracts = getContractAddresses(chainId);
  const { execute, ...transactionState } = useTransaction();

  // Read functions - Standard ERC20
  const { data: name } = useReadContract({
    address: contracts.ImpactToken as Address,
    abi: CONTRACT_ABIS.ImpactToken,
    functionName: 'name',
    query: {
      enabled: !!contracts.ImpactToken,
    },
  });

  const { data: symbol } = useReadContract({
    address: contracts.ImpactToken as Address,
    abi: CONTRACT_ABIS.ImpactToken,
    functionName: 'symbol',
    query: {
      enabled: !!contracts.ImpactToken,
    },
  });

  const { data: decimals } = useReadContract({
    address: contracts.ImpactToken as Address,
    abi: CONTRACT_ABIS.ImpactToken,
    functionName: 'decimals',
    query: {
      enabled: !!contracts.ImpactToken,
    },
  });

  const { data: totalSupply } = useReadContract({
    address: contracts.ImpactToken as Address,
    abi: CONTRACT_ABIS.ImpactToken,
    functionName: 'totalSupply',
    query: {
      enabled: !!contracts.ImpactToken,
    },
  });

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: contracts.ImpactToken as Address,
    abi: CONTRACT_ABIS.ImpactToken,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!contracts.ImpactToken && !!address,
    },
  });

  const { data: votingPower } = useReadContract({
    address: contracts.ImpactToken as Address,
    abi: CONTRACT_ABIS.ImpactToken,
    functionName: 'getVotes',
    args: address ? [address] : undefined,
    query: {
      enabled: !!contracts.ImpactToken && !!address,
    },
  });

  // Write functions
  const { writeContractAsync } = useWriteContract();

  const transfer = async (transferData: {
    to: Address;
    amount: bigint;
  }) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.ImpactToken as Address,
        abi: CONTRACT_ABIS.ImpactToken,
        functionName: 'transfer',
        args: [transferData.to, transferData.amount],
      });
      return hash;
    });
  };

  const delegate = async (delegateData: {
    delegatee: Address;
  }) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.ImpactToken as Address,
        abi: CONTRACT_ABIS.ImpactToken,
        functionName: 'delegate',
        args: [delegateData.delegatee],
      });
      return hash;
    });
  };

  const approve = async (approveData: {
    spender: Address;
    amount: bigint;
  }) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.ImpactToken as Address,
        abi: CONTRACT_ABIS.ImpactToken,
        functionName: 'approve',
        args: [approveData.spender, approveData.amount],
      });
      return hash;
    });
  };

  return {
    // Read data
    name,
    symbol,
    decimals,
    totalSupply,
    balance,
    votingPower,
    
    // Write functions
    transfer,
    delegate,
    approve,
    
    // Transaction state
    ...transactionState,
    
    // Utility
    refetchBalance,
    contractAddress: contracts.ImpactToken,
  };
}

// Helper types for ImpactToken
export type TransferData = {
  to: Address;
  amount: bigint;
};

export type DelegateData = {
  delegatee: Address;
};

export type ApproveData = {
  spender: Address;
  amount: bigint;
}; 