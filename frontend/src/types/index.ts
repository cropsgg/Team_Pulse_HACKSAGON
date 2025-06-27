export interface Campaign {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  image: string;
  category: CampaignCategory;
  goal: number;
  raised: number;
  backers: number;
  deadline: Date;
  creator: string;
  creatorName: string;
  tags: string[];
  status: CampaignStatus;
  milestones: Milestone[];
  location: Location;
  contractAddress?: string;
  escrowAddress?: string;
  kpis: KPI[];
  nftRewards?: NFTReward[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  deadline: Date;
  status: MilestoneStatus;
  completedAt?: Date;
  verificationHash?: string;
  evidence?: Evidence[];
}

export interface KPI {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  lastUpdated: Date;
  verified: boolean;
  evidence?: Evidence[];
}

export interface Evidence {
  type: 'image' | 'document' | 'satellite' | 'zkproof' | 'oracle';
  url: string;
  hash: string;
  timestamp: Date;
  verificationSource?: string;
}

export interface NFTReward {
  id: string;
  name: string;
  description: string;
  image: string;
  minDonation: number;
  supply: number;
  claimed: number;
  contractAddress: string;
  tokenId?: number;
}

export interface Donation {
  id: string;
  campaignId: string;
  donorAddress: string;
  donorName?: string;
  amount: number;
  currency: string;
  timestamp: Date;
  transactionHash: string;
  message?: string;
  isAnonymous: boolean;
  nftReward?: NFTReward;
}

export interface User {
  id: string;
  address: string;
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  totalDonated: number;
  totalCampaigns: number;
  reputation: number;
  badges: Badge[];
  preferences: UserPreferences;
  aiProfile?: AIProfile;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  image: string;
  tokenId: string;
  contractAddress: string;
  earnedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserPreferences {
  categories: CampaignCategory[];
  regions: string[];
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface AIProfile {
  donorCluster: 'altruistic' | 'strategic' | 'social' | 'impact-focused';
  recommendedCampaigns: string[];
  riskScore: number;
  churnProbability: number;
  lifetimeValue: number;
  lastUpdated: Date;
}

export interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  timeEstimate: number; // hours
  skills: string[];
  reward: number; // in tokens
  deadline: Date;
  status: TaskStatus;
  assignedTo?: string;
  completedAt?: Date;
  evidence?: Evidence[];
  campaignId?: string;
}

export interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  type: ProposalType;
  proposer: string;
  totalVotes: number;
  votesFor: number;
  votesAgainst: number;
  quorum: number;
  deadline: Date;
  status: ProposalStatus;
  executionData?: string;
  votes: Vote[];
}

export interface Vote {
  voter: string;
  choice: 'for' | 'against' | 'abstain';
  weight: number;
  timestamp: Date;
  reason?: string;
}

export interface DeFiVault {
  id: string;
  name: string;
  description: string;
  apy: number;
  tvl: number;
  minimumDeposit: number;
  lockPeriod: number; // days
  riskLevel: 'low' | 'medium' | 'high';
  protocol: string;
  contractAddress: string;
  deposits: VaultDeposit[];
}

export interface VaultDeposit {
  id: string;
  depositor: string;
  amount: number;
  depositedAt: Date;
  withdrawnAt?: Date;
  currentValue: number;
  yield: number;
  nftId?: string;
}

export interface Location {
  country: string;
  region: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface SatelliteData {
  date: Date;
  coordinates: {
    lat: number;
    lng: number;
  };
  changeDetected: boolean;
  confidenceScore: number;
  imageHash: string;
  oracleVerified: boolean;
}

export interface ZKProof {
  id: string;
  campaignId: string;
  kpiId: string;
  proofHash: string;
  publicInputs: any[];
  verificationKey: string;
  createdAt: Date;
  verified: boolean;
}

export interface CBDCVoucher {
  id: string;
  amount: number;
  currency: string;
  recipientPhone?: string;
  recipientEmail?: string;
  qrCode: string;
  expiresAt: Date;
  redeemedAt?: Date;
  campaignId: string;
  status: VoucherStatus;
}

export interface AIStory {
  id: string;
  campaignId: string;
  donorAddress: string;
  title: string;
  script: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration: number;
  generatedAt: Date;
  personalizations: string[];
}

// Enums
export type CampaignCategory = 
  | 'education'
  | 'healthcare'
  | 'environment'
  | 'poverty'
  | 'disaster-relief'
  | 'animal-welfare'
  | 'human-rights'
  | 'technology'
  | 'infrastructure'
  | 'arts-culture';

export type CampaignStatus = 
  | 'draft'
  | 'active'
  | 'funded'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type MilestoneStatus = 
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'failed';

export type TaskCategory = 
  | 'content-creation'
  | 'translation'
  | 'design'
  | 'development'
  | 'research'
  | 'verification'
  | 'community'
  | 'marketing';

export type TaskStatus = 
  | 'open'
  | 'assigned'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export type ProposalType = 
  | 'treasury'
  | 'governance'
  | 'protocol'
  | 'campaign-approval'
  | 'emergency';

export type ProposalStatus = 
  | 'active'
  | 'passed'
  | 'failed'
  | 'executed'
  | 'cancelled';

export type VoucherStatus = 
  | 'active'
  | 'redeemed'
  | 'expired'
  | 'cancelled';

// Blockchain types
export interface ContractEvent {
  event: string;
  transactionHash: string;
  blockNumber: number;
  args: any;
  timestamp: Date;
}

export interface SmartContract {
  address: string;
  abi: any[];
  chainId: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// Form types
export interface CreateCampaignForm {
  title: string;
  description: string;
  shortDescription: string;
  goal: number;
  deadline: Date;
  category: CampaignCategory;
  tags: string[];
  location: Partial<Location>;
  milestones: Omit<Milestone, 'id' | 'status'>[];
  kpis: Omit<KPI, 'id' | 'current' | 'lastUpdated' | 'verified'>[];
  image?: File;
}

export interface DonationForm {
  amount: number;
  currency: string;
  message?: string;
  isAnonymous: boolean;
  coverFees: boolean;
}

export interface VolunteerApplicationForm {
  taskId: string;
  motivation: string;
  experience: string;
  portfolio?: string;
  estimatedCompletion: Date;
} 