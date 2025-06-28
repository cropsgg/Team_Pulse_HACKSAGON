// User and Authentication Types
export interface User {
  id: string; // Wallet address
  address: string;
  name: string;
  role: string[]; // Array of all roles
  verified: boolean;
  isVerified: boolean;
  walletAddress: string;
}

// Simplified enum - everyone gets all roles
export enum UserRole {
  DONOR = 'DONOR',
  VC = 'VC',
  FOUNDER = 'FOUNDER',
  NGO_ADMIN = 'NGO_ADMIN',
  ADMIN = 'ADMIN',
  VERIFIER = 'VERIFIER',
}

// Project Types
export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  type: ProjectType;
  category: ProjectCategory;
  status: ProjectStatus;
  creator: User;
  createdAt: string;
  updatedAt: string;
  
  // Media
  coverImage: string;
  images: string[];
  video?: string;
  documents: Document[];
  
  // Funding
  fundingGoal: number;
  currentFunding: number;
  currency: string;
  minContribution: number;
  maxContribution?: number;
  
  // Dates
  startDate: string;
  endDate: string;
  
  // Blockchain
  contractAddress?: string;
  tokenSymbol?: string;
  tokenAddress?: string;
  
  // Additional fields
  location?: Location;
  tags: string[];
  milestones: Milestone[];
  updates: ProjectUpdate[];
  faqs: FAQ[];
  
  // Analytics
  viewCount: number;
  shareCount: number;
  favoriteCount: number;
  
  // AI Analysis
  aiScore: number;
  aiAnalysis?: AIAnalysis;
  
  // Verification
  verified: boolean;
  verificationStatus: VerificationStatus;
}

export enum ProjectType {
  CHARITY = 'CHARITY',
  STARTUP = 'STARTUP',
  PERSONAL = 'PERSONAL',
  PRODUCT = 'PRODUCT',
}

export enum ProjectCategory {
  // Charity categories
  EDUCATION = 'EDUCATION',
  HEALTHCARE = 'HEALTHCARE',
  ENVIRONMENT = 'ENVIRONMENT',
  POVERTY = 'POVERTY',
  DISASTER_RELIEF = 'DISASTER_RELIEF',
  HUMAN_RIGHTS = 'HUMAN_RIGHTS',
  
  // Startup categories
  TECHNOLOGY = 'TECHNOLOGY',
  FINTECH = 'FINTECH',
  HEALTHCARE_TECH = 'HEALTHCARE_TECH',
  EDTECH = 'EDTECH',
  CLEANTECH = 'CLEANTECH',
  ECOMMERCE = 'ECOMMERCE',
  SAAS = 'SAAS',
  DEFI = 'DEFI',
  NFT = 'NFT',
  WEB3 = 'WEB3',
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  ACTIVE = 'ACTIVE',
  FUNDED = 'FUNDED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  SUSPENDED = 'SUSPENDED',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

export interface Location {
  country: string;
  state?: string;
  city?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  ipfsHash?: string;
  size: number;
  uploadedAt: string;
  verified: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface AIAnalysis {
  feasibilityScore: number;
  marketPotential: number;
  riskAssessment: number;
  impactPrediction: number;
  recommendations: string[];
  concerns: string[];
  analyzedAt: string;
}

// Milestone Types
export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  targetAmount: number;
  targetDate: string;
  completedAt?: string;
  status: MilestoneStatus;
  evidenceRequired: boolean;
  evidence: MilestoneEvidence[];
  verifications: MilestoneVerification[];
  order: number;
}

export enum MilestoneStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export interface MilestoneEvidence {
  id: string;
  type: 'image' | 'video' | 'document' | 'link';
  url: string;
  description: string;
  uploadedAt: string;
}

export interface MilestoneVerification {
  id: string;
  verifierId: string;
  verifier: User;
  status: 'approved' | 'rejected';
  comment?: string;
  verifiedAt: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  type: TransactionType;
  fromAddress: string;
  toAddress: string;
  amount: number;
  currency: string;
  txHash: string;
  blockNumber: number;
  gasUsed: number;
  gasPrice: number;
  status: TransactionStatus;
  timestamp: string;
  
  // Context
  projectId?: string;
  milestoneId?: string;
  proposalId?: string;
  
  // Metadata
  metadata?: Record<string, any>;
}

export enum TransactionType {
  DONATION = 'DONATION',
  INVESTMENT = 'INVESTMENT',
  MILESTONE_PAYOUT = 'MILESTONE_PAYOUT',
  REFUND = 'REFUND',
  DAO_VOTE = 'DAO_VOTE',
  TOKEN_MINT = 'TOKEN_MINT',
  TOKEN_TRANSFER = 'TOKEN_TRANSFER',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

// DAO and Governance Types
export interface Proposal {
  id: string;
  title: string;
  description: string;
  type: ProposalType;
  proposer: User;
  status: ProposalStatus;
  
  // Voting
  votingStartTime: string;
  votingEndTime: string;
  quorumRequired: number;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  totalVotes: number;
  
  // Execution
  executionPayload?: string;
  executedAt?: string;
  executionTx?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export enum ProposalType {
  FUNDING_DECISION = 'FUNDING_DECISION',
  PARAMETER_CHANGE = 'PARAMETER_CHANGE',
  MILESTONE_DISPUTE = 'MILESTONE_DISPUTE',
  PLATFORM_UPGRADE = 'PLATFORM_UPGRADE',
  FEE_ADJUSTMENT = 'FEE_ADJUSTMENT',
  GENERAL = 'GENERAL',
}

export enum ProposalStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SUCCEEDED = 'SUCCEEDED',
  DEFEATED = 'DEFEATED',
  QUEUED = 'QUEUED',
  EXECUTED = 'EXECUTED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export interface Vote {
  id: string;
  proposalId: string;
  voter: User;
  voterId: string;
  support: VoteSupport;
  weight: number;
  reason?: string;
  txHash: string;
  timestamp: string;
}

export enum VoteSupport {
  FOR = 'FOR',
  AGAINST = 'AGAINST',
  ABSTAIN = 'ABSTAIN',
}

// Investment and Portfolio Types
export interface Investment {
  id: string;
  investorId: string;
  investor: User;
  projectId: string;
  project: Project;
  
  // Investment details
  amount: number;
  currency: string;
  equityPercentage?: number;
  tokenAmount?: number;
  tokenAddress?: string;
  
  // Terms
  valuation?: number;
  liquidationPreference?: number;
  dividendRights?: boolean;
  votingRights?: boolean;
  
  // Dates
  investedAt: string;
  vestingStartDate?: string;
  vestingEndDate?: string;
  
  // Status
  status: InvestmentStatus;
  
  // Blockchain
  txHash: string;
  contractAddress?: string;
}

export enum InvestmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ACTIVE = 'ACTIVE',
  MATURED = 'MATURED',
  LIQUIDATED = 'LIQUIDATED',
  DEFAULTED = 'DEFAULTED',
}

export interface Portfolio {
  userId: string;
  totalInvested: number;
  totalDonated: number;
  activeInvestments: number;
  completedInvestments: number;
  portfolioValue: number;
  unrealizedGains: number;
  realizedGains: number;
  roi: number;
  diversificationScore: number;
  riskScore: number;
  
  // Holdings
  investments: Investment[];
  donations: Donation[];
  tokens: TokenHolding[];
}

export interface TokenHolding {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  balance: number;
  value: number;
  projectId?: string;
}

// Donation Types
export interface Donation {
  id: string;
  donorId: string;
  donor: User;
  projectId: string;
  project: Project;
  
  // Donation details
  amount: number;
  currency: string;
  anonymous: boolean;
  message?: string;
  
  // Tax
  taxDeductible: boolean;
  taxReceiptUrl?: string;
  
  // Dates
  donatedAt: string;
  
  // Blockchain
  txHash: string;
  
  // Status
  status: DonationStatus;
}

export enum DonationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REFUNDED = 'REFUNDED',
}

// Analytics and Metrics Types
export interface PlatformMetrics {
  totalProjects: number;
  totalFunding: number;
  totalDonations: number;
  totalInvestments: number;
  totalUsers: number;
  activeProjects: number;
  completedProjects: number;
  
  // Growth metrics
  monthlyActiveUsers: number;
  monthlyTransactionVolume: number;
  averageProjectSize: number;
  successRate: number;
  
  // Geographic data
  usersByCountry: Record<string, number>;
  fundingByCountry: Record<string, number>;
  
  // Category breakdown
  projectsByCategory: Record<string, number>;
  fundingByCategory: Record<string, number>;
}

export interface ProjectMetrics {
  projectId: string;
  views: number;
  uniqueViews: number;
  shares: number;
  favorites: number;
  conversionRate: number;
  averageDonation: number;
  totalContributors: number;
  repeatContributors: number;
  
  // Time series data
  dailyViews: TimeSeriesData[];
  dailyContributions: TimeSeriesData[];
  referralSources: Record<string, number>;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  type?: ProjectType[];
  category?: ProjectCategory[];
  status?: ProjectStatus[];
  location?: string[];
  fundingRange?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    start?: string;
    end?: string;
  };
  verified?: boolean;
  trending?: boolean;
  featured?: boolean;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Project Update Types
export interface ProjectUpdate {
  id: string;
  projectId: string;
  title: string;
  content: string;
  type: UpdateType;
  author: User;
  createdAt: string;
  
  // Media
  images?: string[];
  video?: string;
  
  // Engagement
  likes: number;
  comments: Comment[];
}

export enum UpdateType {
  MILESTONE = 'MILESTONE',
  GENERAL = 'GENERAL',
  FINANCIAL = 'FINANCIAL',
  MEDIA = 'MEDIA',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  replies: Comment[];
  parentId?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
  
  // Optional fields based on type
  projectId?: string;
  proposalId?: string;
  milestoneId?: string;
  actionUrl?: string;
}

export enum NotificationType {
  MILESTONE_COMPLETED = 'MILESTONE_COMPLETED',
  PROJECT_FUNDED = 'PROJECT_FUNDED',
  PROPOSAL_CREATED = 'PROPOSAL_CREATED',
  VOTE_CAST = 'VOTE_CAST',
  INVESTMENT_CONFIRMED = 'INVESTMENT_CONFIRMED',
  DONATION_RECEIVED = 'DONATION_RECEIVED',
  PROJECT_UPDATE = 'PROJECT_UPDATE',
  VERIFICATION_REQUIRED = 'VERIFICATION_REQUIRED',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form Types
export interface CreateProjectForm {
  title: string;
  description: string;
  longDescription: string;
  type: ProjectType;
  category: ProjectCategory;
  fundingGoal: number;
  currency: string;
  minContribution: number;
  maxContribution?: number;
  startDate: string;
  endDate: string;
  location?: Location;
  tags: string[];
  coverImage: File | string;
  images: (File | string)[];
  video?: string;
  documents: File[];
  milestones: MilestoneForm[];
  faqs: FAQ[];
}

export interface MilestoneForm {
  title: string;
  description: string;
  targetAmount: number;
  targetDate: string;
  evidenceRequired: boolean;
}

// Web3 Types
export interface WalletState {
  address?: string;
  chainId?: number;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  connector?: any;
}

export interface ContractCall {
  address: string;
  abi: any[];
  functionName: string;
  args?: any[];
  value?: bigint;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  userMessage?: string;
}

// Theme Types
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  fonts: {
    sans: string;
    mono: string;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Utility Types
export type Modify<T, R> = Omit<T, keyof R> & R;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Re-export common types
export type { ReactNode } from 'react'; 