// Contract hooks exports
export { useRouter } from './useRouter';
export { useNGORegistry } from './useNGORegistry';
export { useDonationManager } from './useDonationManager';
export { useStartupRegistry } from './useStartupRegistry';
export { useMilestoneManager } from './useMilestoneManager';
export { useImpactGovernor } from './useImpactGovernor';
export { useEquityAllocator } from './useEquityAllocator';
export { useFeeManager } from './useFeeManager';
export { useImpactToken } from './useImpactToken';

// Re-export types
export type {
  AllModules,
  NGORegistrationData,
  StartupRegistrationData,
  DonationData,
} from './useRouter';

export type {
  NGOProfile,
  NGORegistrationData as NGORegistrationFormData,
  NGOVerificationData,
} from './useNGORegistry';

export type {
  Donation,
  DonorStats,
  NGOFundingStats,
  DonationData as DonationFormData,
  ReleaseData,
} from './useDonationManager';

export type {
  StartupProfile,
  FundingRound,
  VCProfile,
  StartupRegistrationData as StartupFormData,
  FundingRoundData,
  VoteData,
} from './useStartupRegistry';

export type {
  Milestone,
  VerificationRequest,
  MilestoneProof,
  MilestoneCreationData,
  ProofSubmissionData,
  VerificationRequestData,
  DisputeData,
} from './useMilestoneManager';

export type {
  Proposal,
  ProposalVote,
  ProposalCreationData,
  VoteData as GovernanceVoteData,
  ProposalExecutionData,
  ProposalState,
  VoteSupport,
} from './useImpactGovernor';

export type {
  EquityPosition,
  StartupEquityInfo,
  VestingSchedule,
  EquityAllocationData,
  EscrowData,
} from './useEquityAllocator';

export type {
  FeeUpdateData,
} from './useFeeManager';

export type {
  TransferData,
  DelegateData,
  ApproveData,
} from './useImpactToken';

// Transaction hook
export { useTransaction } from '../useTransaction';

// Contract events hook
export { useContractEvents, useContractEvent } from '../useContractEvents';
export type { ContractEvent } from '../useContractEvents';

// Contract configuration
export { 
  getContractAddresses, 
  CONTRACT_ABIS,
  BASE_MAINNET_CONTRACTS,
  BASE_SEPOLIA_CONTRACTS,
} from '../../lib/contracts/config';

export type {
  ContractName,
  ContractAddresses,
} from '../../lib/contracts/config'; 