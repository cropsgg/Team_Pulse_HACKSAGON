import { useReadContract, useWriteContract, useAccount, useChainId } from 'wagmi';
import { getContractAddresses, CONTRACT_ABIS } from '@/lib/contracts/config';
import { useTransaction } from '@/hooks/useTransaction';
import type { Address } from 'viem';
import { encodeAbiParameters, keccak256, toHex } from 'viem';

export function useImpactGovernor() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contracts = getContractAddresses(chainId);
  const { execute: executeTransaction, ...transactionState } = useTransaction();

  // Read functions
  const { data: proposal, isLoading: isLoadingProposal, refetch: refetchProposal } = useReadContract({
    address: contracts.ImpactGovernor as Address,
    abi: CONTRACT_ABIS.ImpactGovernor,
    functionName: 'proposalDeadline',
    args: [BigInt(1)], // Default to proposal ID 1, will be dynamic
    query: {
      enabled: !!contracts.ImpactGovernor,
    },
  });

  const { data: proposalState } = useReadContract({
    address: contracts.ImpactGovernor as Address,
    abi: CONTRACT_ABIS.ImpactGovernor,
    functionName: 'state',
    args: [BigInt(1)], // Default to proposal ID 1, will be dynamic
    query: {
      enabled: !!contracts.ImpactGovernor,
    },
  });

  const { data: votingDelay } = useReadContract({
    address: contracts.ImpactGovernor as Address,
    abi: CONTRACT_ABIS.ImpactGovernor,
    functionName: 'votingDelay',
    query: {
      enabled: !!contracts.ImpactGovernor,
    },
  });

  const { data: votingPeriod } = useReadContract({
    address: contracts.ImpactGovernor as Address,
    abi: CONTRACT_ABIS.ImpactGovernor,
    functionName: 'votingPeriod',
    query: {
      enabled: !!contracts.ImpactGovernor,
    },
  });

  const { data: quorum } = useReadContract({
    address: contracts.ImpactGovernor as Address,
    abi: CONTRACT_ABIS.ImpactGovernor,
    functionName: 'quorum',
    args: [BigInt(Date.now())], // Current timestamp
    query: {
      enabled: !!contracts.ImpactGovernor,
    },
  });

  const { data: proposalThreshold } = useReadContract({
    address: contracts.ImpactGovernor as Address,
    abi: CONTRACT_ABIS.ImpactGovernor,
    functionName: 'proposalThreshold',
    query: {
      enabled: !!contracts.ImpactGovernor,
    },
  });

  const { data: hasVoted } = useReadContract({
    address: contracts.ImpactGovernor as Address,
    abi: CONTRACT_ABIS.ImpactGovernor,
    functionName: 'hasVoted',
    args: [BigInt(1), address || '0x0'], // Default to proposal ID 1 and current user
    query: {
      enabled: !!contracts.ImpactGovernor && !!address,
    },
  });

  const { data: getVotes } = useReadContract({
    address: contracts.ImpactGovernor as Address,
    abi: CONTRACT_ABIS.ImpactGovernor,
    functionName: 'getVotes',
    args: [address || '0x0', BigInt(Date.now())], // Current user and timestamp
    query: {
      enabled: !!contracts.ImpactGovernor && !!address,
    },
  });

  // Write functions
  const { writeContractAsync } = useWriteContract();

  const propose = async (proposalData: {
    targets: Address[];
    values: bigint[];
    calldatas: `0x${string}`[];
    description: string;
  }) => {
    return executeTransaction(async () => {
      const hash = await writeContractAsync({
        address: contracts.ImpactGovernor as Address,
        abi: CONTRACT_ABIS.ImpactGovernor,
        functionName: 'propose',
        args: [
          proposalData.targets,
          proposalData.values,
          proposalData.calldatas,
          proposalData.description,
        ],
      });
      return hash;
    });
  };

  const castVote = async (voteData: {
    proposalId: bigint;
    support: number; // 0 = Against, 1 = For, 2 = Abstain
  }) => {
    return executeTransaction(async () => {
      const hash = await writeContractAsync({
        address: contracts.ImpactGovernor as Address,
        abi: CONTRACT_ABIS.ImpactGovernor,
        functionName: 'castVote',
        args: [voteData.proposalId, voteData.support],
      });
      return hash;
    });
  };

  const castVoteWithReason = async (voteData: {
    proposalId: bigint;
    support: number;
    reason: string;
  }) => {
    return executeTransaction(async () => {
      const hash = await writeContractAsync({
        address: contracts.ImpactGovernor as Address,
        abi: CONTRACT_ABIS.ImpactGovernor,
        functionName: 'castVoteWithReason',
        args: [voteData.proposalId, voteData.support, voteData.reason],
      });
      return hash;
    });
  };

  const queue = async (queueData: {
    targets: Address[];
    values: bigint[];
    calldatas: `0x${string}`[];
    descriptionHash: `0x${string}`;
  }) => {
    return executeTransaction(async () => {
      const hash = await writeContractAsync({
        address: contracts.ImpactGovernor as Address,
        abi: CONTRACT_ABIS.ImpactGovernor,
        functionName: 'queue',
        args: [
          queueData.targets,
          queueData.values,
          queueData.calldatas,
          queueData.descriptionHash,
        ],
      });
      return hash;
    });
  };

  const executeProposal = async (executeData: {
    targets: Address[];
    values: bigint[];
    calldatas: `0x${string}`[];
    descriptionHash: `0x${string}`;
  }) => {
    return executeTransaction(async () => {
      const hash = await writeContractAsync({
        address: contracts.ImpactGovernor as Address,
        abi: CONTRACT_ABIS.ImpactGovernor,
        functionName: 'execute',
        args: [
          executeData.targets,
          executeData.values,
          executeData.calldatas,
          executeData.descriptionHash,
        ],
      });
      return hash;
    });
  };

  const cancel = async (cancelData: {
    targets: Address[];
    values: bigint[];
    calldatas: `0x${string}`[];
    descriptionHash: `0x${string}`;
  }) => {
    return executeTransaction(async () => {
      const hash = await writeContractAsync({
        address: contracts.ImpactGovernor as Address,
        abi: CONTRACT_ABIS.ImpactGovernor,
        functionName: 'cancel',
        args: [
          cancelData.targets,
          cancelData.values,
          cancelData.calldatas,
          cancelData.descriptionHash,
        ],
      });
      return hash;
    });
  };

  // Helper function to generate proposal ID
  const getProposalId = (
    targets: Address[],
    values: bigint[],
    calldatas: `0x${string}`[],
    description: string
  ): `0x${string}` => {
    const descriptionHash = keccak256(toHex(description));
    const encoded = encodeAbiParameters(
      [
        { type: 'address[]', name: 'targets' },
        { type: 'uint256[]', name: 'values' },
        { type: 'bytes[]', name: 'calldatas' },
        { type: 'bytes32', name: 'descriptionHash' },
      ],
      [targets, values, calldatas, descriptionHash]
    );
    return keccak256(encoded);
  };

  return {
    // Read data
    proposal,
    proposalState,
    votingDelay,
    votingPeriod,
    quorum,
    proposalThreshold,
    hasVoted: !!hasVoted,
    userVotingPower: getVotes || BigInt(0),
    
    // Loading states
    isLoadingProposal,
    
    // Write functions
    propose,
    castVote,
    castVoteWithReason,
    queue,
    executeProposal,
    cancel,
    
    // Transaction state
    ...transactionState,
    
    // Utilities
    refetchProposal,
    getProposalId,
    contractAddress: contracts.ImpactGovernor,
  };
}

// Helper types for ImpactGovernor
export type Proposal = {
  id: bigint;
  proposer: Address;
  targets: Address[];
  values: bigint[];
  signatures: string[];
  calldatas: `0x${string}`[];
  startBlock: bigint;
  endBlock: bigint;
  description: string;
};

export type ProposalVote = {
  proposalId: bigint;
  voter: Address;
  support: number;
  votes: bigint;
  reason: string;
};

export type ProposalCreationData = {
  targets: Address[];
  values: bigint[];
  calldatas: `0x${string}`[];
  description: string;
};

export type VoteData = {
  proposalId: bigint;
  support: number; // 0 = Against, 1 = For, 2 = Abstain
  reason?: string;
};

export type ProposalExecutionData = {
  targets: Address[];
  values: bigint[];
  calldatas: `0x${string}`[];
  descriptionHash: `0x${string}`;
};

// Proposal states enum
export enum ProposalState {
  Pending,
  Active,
  Canceled,
  Defeated,
  Succeeded,
  Queued,
  Expired,
  Executed,
}

// Vote support enum
export enum VoteSupport {
  Against = 0,
  For = 1,
  Abstain = 2,
} 