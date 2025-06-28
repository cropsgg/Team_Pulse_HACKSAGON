import { useReadContract, useWriteContract, useAccount, useChainId } from 'wagmi';
import { getContractAddresses, CONTRACT_ABIS } from '@/lib/contracts/config';
import { useTransaction } from '@/hooks/useTransaction';
import type { Address } from 'viem';

export function useDonationManager() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contracts = getContractAddresses(chainId);
  const { execute, ...transactionState } = useTransaction();

  // Read functions
  const { data: donation, isLoading: isLoadingDonation, refetch: refetchDonation } = useReadContract({
    address: contracts.DonationManager as Address,
    abi: CONTRACT_ABIS.DonationManager,
    functionName: 'getDonation',
    args: [BigInt(1)], // Default to donation ID 1, will be dynamic
    query: {
      enabled: !!contracts.DonationManager,
    },
  });

  const { data: donorHistory } = useReadContract({
    address: contracts.DonationManager as Address,
    abi: CONTRACT_ABIS.DonationManager,
    functionName: 'getDonorHistory',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contracts.DonationManager,
    },
  });

  const { data: ngoDonations } = useReadContract({
    address: contracts.DonationManager as Address,
    abi: CONTRACT_ABIS.DonationManager,
    functionName: 'getNGODonations',
    args: [BigInt(1)], // Default to NGO ID 1, will be dynamic
    query: {
      enabled: !!contracts.DonationManager,
    },
  });

  const { data: platformFeeBps } = useReadContract({
    address: contracts.DonationManager as Address,
    abi: CONTRACT_ABIS.DonationManager,
    functionName: 'platformFeeBps',
    query: {
      enabled: !!contracts.DonationManager,
    },
  });

  const { data: totalDonations } = useReadContract({
    address: contracts.DonationManager as Address,
    abi: CONTRACT_ABIS.DonationManager,
    functionName: 'totalDonations',
    query: {
      enabled: !!contracts.DonationManager,
    },
  });

  const { data: currentPrice } = useReadContract({
    address: contracts.DonationManager as Address,
    abi: CONTRACT_ABIS.DonationManager,
    functionName: 'getCurrentPrice',
    query: {
      enabled: !!contracts.DonationManager,
    },
  });

  // Write functions
  const { writeContractAsync } = useWriteContract();

  const donate = async (donationData: {
    ngoId: bigint;
    message: string;
    value: bigint;
  }) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.DonationManager as Address,
        abi: CONTRACT_ABIS.DonationManager,
        functionName: 'donate',
        args: [donationData.ngoId, donationData.message],
        value: donationData.value,
      });
      return hash;
    });
  };

  const releaseFunds = async (releaseData: {
    ngoId: bigint;
    amount: bigint;
    reason: string;
  }) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.DonationManager as Address,
        abi: CONTRACT_ABIS.DonationManager,
        functionName: 'releaseFunds',
        args: [releaseData.ngoId, releaseData.amount, releaseData.reason],
      });
      return hash;
    });
  };

  // Emergency functions
  const emergencyWithdraw = async (withdrawData: {
    ngoId: bigint;
    amount: bigint;
    recipient: Address;
    reason: string;
  }) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.DonationManager as Address,
        abi: CONTRACT_ABIS.DonationManager,
        functionName: 'emergencyWithdraw',
        args: [withdrawData.ngoId, withdrawData.amount, withdrawData.recipient, withdrawData.reason],
      });
      return hash;
    });
  };

  return {
    // Read data
    donation,
    donorHistory,
    ngoDonations,
    platformFeeBps,
    totalDonations,
    currentPrice,
    
    // Loading states
    isLoadingDonation,
    
    // Write functions
    donate,
    releaseFunds,
    emergencyWithdraw,
    
    // Transaction state
    ...transactionState,
    
    // Utility
    refetchDonation,
    contractAddress: contracts.DonationManager,
  };
}

// Helper types for DonationManager
export type Donation = {
  id: bigint;
  donor: Address;
  ngoId: bigint;
  amount: bigint;
  message: string;
  timestamp: bigint;
  claimed: boolean;
};

export type DonorStats = {
  totalDonated: bigint;
  donationCount: bigint;
  lastDonation: bigint;
};

export type NGOFundingStats = {
  totalReceived: bigint;
  totalReleased: bigint;
  pendingAmount: bigint;
  donationCount: bigint;
};

export type DonationData = {
  ngoId: bigint;
  message: string;
  value: bigint;
};

export type ReleaseData = {
  ngoId: bigint;
  amount: bigint;
  reason: string;
}; 