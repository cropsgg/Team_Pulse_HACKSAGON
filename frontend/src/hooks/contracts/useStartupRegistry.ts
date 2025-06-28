import { useReadContract, useWriteContract, useAccount, useChainId } from 'wagmi';
import { getContractAddresses, CONTRACT_ABIS } from '@/lib/contracts/config';
import { useTransaction } from '@/hooks/useTransaction';
import type { Address } from 'viem';

export function useStartupRegistry() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contracts = getContractAddresses(chainId);
  const { execute, ...transactionState } = useTransaction();

  // Read functions
  const { data: startupProfile, isLoading: isLoadingProfile, refetch: refetchProfile } = useReadContract({
    address: contracts.StartupRegistry as Address,
    abi: CONTRACT_ABIS.StartupRegistry,
    functionName: 'getStartupProfile',
    args: [BigInt(1)], // Default to startup ID 1, will be dynamic
    query: {
      enabled: !!contracts.StartupRegistry,
    },
  });

  const { data: fundingRound, isLoading: isLoadingFundingRound } = useReadContract({
    address: contracts.StartupRegistry as Address,
    abi: CONTRACT_ABIS.StartupRegistry,
    functionName: 'getFundingRound',
    args: [BigInt(1)], // Default to round ID 1, will be dynamic
    query: {
      enabled: !!contracts.StartupRegistry,
    },
  });

  const { data: vcStake } = useReadContract({
    address: contracts.StartupRegistry as Address,
    abi: CONTRACT_ABIS.StartupRegistry,
    functionName: 'vcStakes',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contracts.StartupRegistry,
    },
  });

  const { data: totalVCs } = useReadContract({
    address: contracts.StartupRegistry as Address,
    abi: CONTRACT_ABIS.StartupRegistry,
    functionName: 'totalVCs',
    query: {
      enabled: !!contracts.StartupRegistry,
    },
  });

  const { data: minimumVCStake } = useReadContract({
    address: contracts.StartupRegistry as Address,
    abi: CONTRACT_ABIS.StartupRegistry,
    functionName: 'minimumVCStake',
    query: {
      enabled: !!contracts.StartupRegistry,
    },
  });

  const { data: requiredVCVotePercentage } = useReadContract({
    address: contracts.StartupRegistry as Address,
    abi: CONTRACT_ABIS.StartupRegistry,
    functionName: 'REQUIRED_VC_VOTE_PERCENTAGE',
    query: {
      enabled: !!contracts.StartupRegistry,
    },
  });

  const { data: voteCounts } = useReadContract({
    address: contracts.StartupRegistry as Address,
    abi: CONTRACT_ABIS.StartupRegistry,
    functionName: 'getVoteCounts',
    args: [BigInt(1)], // Default to round ID 1, will be dynamic
    query: {
      enabled: !!contracts.StartupRegistry,
    },
  });

  const { data: vcVote } = useReadContract({
    address: contracts.StartupRegistry as Address,
    abi: CONTRACT_ABIS.StartupRegistry,
    functionName: 'getVCVote',
    args: [BigInt(1), address || '0x0'], // Default to round ID 1 and current address
    query: {
      enabled: !!address && !!contracts.StartupRegistry,
    },
  });

  // Write functions
  const { writeContractAsync } = useWriteContract();

  const registerStartup = async (startupData: {
    founder: Address;
    valuationHash: string;
    equityToken: Address;
    targetFunding: bigint;
  }) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.StartupRegistry as Address,
        abi: CONTRACT_ABIS.StartupRegistry,
        functionName: 'registerStartup',
        args: [startupData.founder, startupData.valuationHash, startupData.equityToken, startupData.targetFunding],
      });
      return hash;
    });
  };

  const createFundingRound = async (fundingData: {
    startupId: bigint;
    targetAmount: bigint;
    valuation: bigint;
    terms: string;
  }) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.StartupRegistry as Address,
        abi: CONTRACT_ABIS.StartupRegistry,
        functionName: 'createFundingRound',
        args: [fundingData.startupId, fundingData.targetAmount, fundingData.valuation, fundingData.terms],
      });
      return hash;
    });
  };

  const castVCVote = async (voteData: {
    roundId: bigint;
    support: boolean;
    reason: string;
  }) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.StartupRegistry as Address,
        abi: CONTRACT_ABIS.StartupRegistry,
        functionName: 'castVCVote',
        args: [voteData.roundId, voteData.support, voteData.reason],
      });
      return hash;
    });
  };

  const registerAsVC = async (stakeAmount: bigint) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.StartupRegistry as Address,
        abi: CONTRACT_ABIS.StartupRegistry,
        functionName: 'registerAsVC',
        args: [],
        value: stakeAmount,
      });
      return hash;
    });
  };

  const investInRound = async (investmentData: {
    roundId: bigint;
    amount: bigint;
  }) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.StartupRegistry as Address,
        abi: CONTRACT_ABIS.StartupRegistry,
        functionName: 'investInRound',
        args: [investmentData.roundId],
        value: investmentData.amount,
      });
      return hash;
    });
  };

  const concludeVoting = async (roundId: bigint) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.StartupRegistry as Address,
        abi: CONTRACT_ABIS.StartupRegistry,
        functionName: 'concludeVoting',
        args: [roundId],
      });
      return hash;
    });
  };

  return {
    // Read data
    startupProfile,
    fundingRound,
    vcStake,
    totalVCs,
    minimumVCStake,
    requiredVCVotePercentage,
    voteCounts,
    vcVote,
    
    // Loading states
    isLoadingProfile,
    isLoadingFundingRound,
    
    // Write functions
    registerStartup,
    createFundingRound,
    castVCVote,
    registerAsVC,
    investInRound,
    concludeVoting,
    
    // Transaction state
    ...transactionState,
    
    // Utility
    refetchProfile,
    contractAddress: contracts.StartupRegistry,
  };
}

// Helper types
export type StartupProfile = {
  founder: Address;
  valuationHash: string;
  equityToken: Address;
  targetFunding: bigint;
  status: number;
  createdAt: bigint;
  approvedAt: bigint;
};

// Helper types for StartupRegistry
export type FundingRound = {
  startupId: bigint;
  targetAmount: bigint;
  raisedAmount: bigint;
  startTime: bigint;
  endTime: bigint;
  isActive: boolean;
  votingPassed: boolean;
};

export type VCProfile = {
  stakedAmount: bigint;
  votingPower: bigint;
  totalVotes: bigint;
  isActive: boolean;
};

export type StartupRegistrationData = {
  founder: Address;
  valuationHash: string;
  equityToken: Address;
  targetFunding: bigint;
};

export type FundingRoundData = {
  startupId: bigint;
  targetAmount: bigint;
  valuationHash: string;
  durationDays: bigint;
};

export type VoteData = {
  startupId: bigint;
  approve: boolean;
  stake: bigint;
}; 