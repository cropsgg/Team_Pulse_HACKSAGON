import { useReadContract, useWriteContract, useAccount, useChainId } from 'wagmi';
import { getContractAddresses, CONTRACT_ABIS } from '@/lib/contracts/config';
import { useTransaction } from '@/hooks/useTransaction';
import type { Address } from 'viem';

export function useNGORegistry() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contracts = getContractAddresses(chainId);
  const { execute, ...transactionState } = useTransaction();

  // Read functions
  const { data: ngoProfile, isLoading: isLoadingProfile, refetch: refetchProfile } = useReadContract({
    address: contracts.NGORegistry as Address,
    abi: CONTRACT_ABIS.NGORegistry,
    functionName: 'getNGOProfile',
    args: [BigInt(1)], // Default to NGO ID 1, will be dynamic
    query: {
      enabled: !!contracts.NGORegistry,
    },
  });

  const { data: ngoIdByAddress, isLoading: isLoadingNGOId } = useReadContract({
    address: contracts.NGORegistry as Address,
    abi: CONTRACT_ABIS.NGORegistry,
    functionName: 'getNGOIdByAddress',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contracts.NGORegistry,
    },
  });

  const { data: canReceiveDonations } = useReadContract({
    address: contracts.NGORegistry as Address,
    abi: CONTRACT_ABIS.NGORegistry,
    functionName: 'canReceiveDonations',
    args: [BigInt(1)], // Default to NGO ID 1, will be dynamic
    query: {
      enabled: !!contracts.NGORegistry,
    },
  });

  const { data: totalNGOs } = useReadContract({
    address: contracts.NGORegistry as Address,
    abi: CONTRACT_ABIS.NGORegistry,
    functionName: 'getTotalNGOCount',
    query: {
      enabled: !!contracts.NGORegistry,
    },
  });

  // Write functions
  const { writeContractAsync } = useWriteContract();

  const registerNGO = async (ngoData: {
    profileHash: string;
    ngoAddress: Address;
  }) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.NGORegistry as Address,
        abi: CONTRACT_ABIS.NGORegistry,
        functionName: 'registerNGO',
        args: [ngoData.profileHash, ngoData.ngoAddress],
      });
      return hash;
    });
  };

  const updateReputation = async (reputationData: {
    ngoId: bigint;
    newScore: bigint;
  }) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.NGORegistry as Address,
        abi: CONTRACT_ABIS.NGORegistry,
        functionName: 'updateReputation',
        args: [reputationData.ngoId, reputationData.newScore],
      });
      return hash;
    });
  };

  // Admin functions
  const verifyNGO = async (verificationData: {
    ngoId: bigint;
    status: number; // NGOStatus enum
    initialReputation: bigint;
  }) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.NGORegistry as Address,
        abi: CONTRACT_ABIS.NGORegistry,
        functionName: 'verifyNGO',
        args: [verificationData.ngoId, verificationData.status, verificationData.initialReputation],
      });
      return hash;
    });
  };

  return {
    // Read data
    ngoProfile,
    ngoIdByAddress,
    canReceiveDonations: !!canReceiveDonations,
    totalNGOs,
    
    // Loading states
    isLoadingProfile,
    isLoadingNGOId,
    
    // Write functions
    registerNGO,
    updateReputation,
    verifyNGO,
    
    // Transaction state
    ...transactionState,
    
    // Utility
    refetchProfile,
    contractAddress: contracts.NGORegistry,
  };
}

// Helper types for NGORegistry
export type NGOProfile = {
  ngoAddress: Address;
  profileHash: string;
  status: number;
  createdAt: bigint;
  verifiedAt: bigint;
};

export type NGORegistrationData = {
  profileHash: string;
  ngoAddress: Address;
};

export type NGOVerificationData = {
  ngoId: bigint;
  status: number;
  initialReputation: bigint;
}; 