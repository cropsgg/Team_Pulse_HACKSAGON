import { useReadContract, useWriteContract, useAccount, useChainId } from 'wagmi';
import { getContractAddresses, CONTRACT_ABIS } from '@/lib/contracts/config';
import { useTransaction } from '@/hooks/useTransaction';
import type { Address } from 'viem';

export function useMilestoneManager() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contracts = getContractAddresses(chainId);
  const { execute, ...transactionState } = useTransaction();

  // Read functions
  const { data: milestone, isLoading: isLoadingMilestone, refetch: refetchMilestone } = useReadContract({
    address: contracts.MilestoneManager as Address,
    abi: CONTRACT_ABIS.MilestoneManager,
    functionName: 'getMilestone',
    args: [BigInt(1)], // Default to milestone ID 1, will be dynamic
    query: {
      enabled: !!contracts.MilestoneManager,
    },
  });

  const { data: projectMilestones, isLoading: isLoadingProjectMilestones } = useReadContract({
    address: contracts.MilestoneManager as Address,
    abi: CONTRACT_ABIS.MilestoneManager,
    functionName: 'getMilestonesForParent',
    args: [BigInt(1)], // Default to project ID 1, will be dynamic
    query: {
      enabled: !!contracts.MilestoneManager,
    },
  });

  const { data: totalMilestones } = useReadContract({
    address: contracts.MilestoneManager as Address,
    abi: CONTRACT_ABIS.MilestoneManager,
    functionName: 'totalMilestones',
    query: {
      enabled: !!contracts.MilestoneManager,
    },
  });

  const { data: completedMilestones } = useReadContract({
    address: contracts.MilestoneManager as Address,
    abi: CONTRACT_ABIS.MilestoneManager,
    functionName: 'completedMilestones',
    query: {
      enabled: !!contracts.MilestoneManager,
    },
  });

  const { data: verificationProofs } = useReadContract({
    address: contracts.MilestoneManager as Address,
    abi: CONTRACT_ABIS.MilestoneManager,
    functionName: 'getVerificationProofs',
    args: [BigInt(1)], // Default to milestone ID 1, will be dynamic
    query: {
      enabled: !!contracts.MilestoneManager,
    },
  });

  // Write functions
  const { writeContractAsync } = useWriteContract();

  const createMilestone = async (milestoneData: {
    parentId: bigint;
    goal: string;
    requiredAmount: bigint;
    deadline: bigint;
    verifier: Address;
    verificationsNeeded: bigint;
  }) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.MilestoneManager as Address,
        abi: CONTRACT_ABIS.MilestoneManager,
        functionName: 'createMilestone',
        args: [
          milestoneData.parentId,
          milestoneData.goal,
          milestoneData.requiredAmount,
          milestoneData.deadline,
          milestoneData.verifier,
          milestoneData.verificationsNeeded,
        ],
      });
      return hash;
    });
  };

  const submitVerificationProof = async (proofData: {
    milestoneId: bigint;
    proofHash: string;
  }) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.MilestoneManager as Address,
        abi: CONTRACT_ABIS.MilestoneManager,
        functionName: 'submitVerificationProof',
        args: [proofData.milestoneId, proofData.proofHash],
      });
      return hash;
    });
  };

  const verifyMilestone = async (verificationData: {
    milestoneId: bigint;
    approved: boolean;
    reason: string;
  }) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.MilestoneManager as Address,
        abi: CONTRACT_ABIS.MilestoneManager,
        functionName: 'verifyMilestone',
        args: [verificationData.milestoneId, verificationData.approved, verificationData.reason],
      });
      return hash;
    });
  };

  const batchVerifyMilestones = async (batchData: {
    milestoneIds: bigint[];
    approvals: boolean[];
    reason: string;
  }) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.MilestoneManager as Address,
        abi: CONTRACT_ABIS.MilestoneManager,
        functionName: 'batchVerifyMilestones',
        args: [batchData.milestoneIds, batchData.approvals, batchData.reason],
      });
      return hash;
    });
  };

  const emergencyCompleteMilestone = async (emergencyData: {
    milestoneId: bigint;
    reason: string;
  }) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.MilestoneManager as Address,
        abi: CONTRACT_ABIS.MilestoneManager,
        functionName: 'emergencyCompleteMilestone',
        args: [emergencyData.milestoneId, emergencyData.reason],
      });
      return hash;
    });
  };

  return {
    // Read data
    milestone,
    projectMilestones,
    totalMilestones,
    completedMilestones,
    verificationProofs,
    
    // Loading states
    isLoadingMilestone,
    isLoadingProjectMilestones,
    
    // Write functions
    createMilestone,
    submitVerificationProof,
    verifyMilestone,
    batchVerifyMilestones,
    emergencyCompleteMilestone,
    
    // Transaction state
    ...transactionState,
    
    // Utility
    refetchMilestone,
    contractAddress: contracts.MilestoneManager,
  };
}

// Helper types for MilestoneManager
export type Milestone = {
  id: bigint;
  projectId: bigint;
  title: string;
  description: string;
  requiredAmount: bigint;
  status: number; // MilestoneStatus enum
  verificationMethod: number; // VerificationMethod enum
  createdAt: bigint;
  deadline: bigint;
  completedAt: bigint;
};

export type VerificationRequest = {
  milestoneId: bigint;
  requestType: number; // VerificationMethod enum
  status: number; // VerificationStatus enum
  requestedAt: bigint;
  completedAt: bigint;
  result: boolean;
  feedback: string;
};

export type MilestoneProof = {
  proofHash: string;
  description: string;
  submittedAt: bigint;
  verified: boolean;
};

export type MilestoneCreationData = {
  projectId: bigint;
  title: string;
  description: string;
  requiredAmount: bigint;
  verificationMethod: number;
  deadline: bigint;
};

export type ProofSubmissionData = {
  milestoneId: bigint;
  proofHash: string;
  description: string;
};

export type VerificationRequestData = {
  milestoneId: bigint;
  fee: bigint;
};

export type DisputeData = {
  milestoneId: bigint;
  reason: string;
}; 