import { Document, ObjectId } from 'mongoose';
import { Request } from 'express';

// Common types
export type EntityStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'archived';
export type UserRole = 'vc' | 'startup_founder' | 'ngo_admin' | 'individual' | 'csr_manager' | 'admin' | 'super_admin';
export type ProjectType = 'startup' | 'product' | 'charity' | 'individual_assistance' | 'csr_initiative';
export type ProjectStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'funded' | 'active' | 'completed' | 'failed' | 'cancelled';
export type DonationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type MilestoneStatus = 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed';
export type VoteType = 'approval' | 'funding' | 'milestone' | 'governance' | 'dispute';
export type VoteStatus = 'pending' | 'active' | 'passed' | 'rejected' | 'expired';
export type AIServiceType = 'screening' | 'verification' | 'translation' | 'qa_bot' | 'analytics' | 'prediction';
export type Currency = 'ETH' | 'USDC' | 'USDT' | 'DAI' | 'MATIC';
export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'hi' | 'ar' | 'pt' | 'ru' | 'ja';

// Base entity interface
export interface BaseEntity {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: ObjectId;
  updatedBy?: ObjectId;
  version: number;
  isDeleted: boolean;
  deletedAt?: Date;
}

// User related interfaces
export interface IUser extends BaseEntity {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profileImage?: string;
  walletAddress?: string;
  phoneNumber?: string;
  country?: string;
  timezone?: string;
  preferredLanguage: LanguageCode;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  is2FAEnabled: boolean;
  twoFASecret?: string;
  lastLoginAt?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  status: EntityStatus;
  kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected';
  kycDocuments?: Array<{
    type: string;
    url: string;
    uploadedAt: Date;
  }>;
  permissions: string[];
  metadata?: Record<string, any>;
}

export interface UserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
  isLocked(): boolean;
  incLoginAttempts(): Promise<void>;
}

// NGO related interfaces
export interface INGO extends BaseEntity {
  name: string;
  description: string;
  mission: string;
  vision?: string;
  registrationNumber: string;
  registrationCountry: string;
  registrationDate: Date;
  taxExemptionNumber?: string;
  website?: string;
  contactEmail: string;
  contactPhone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  founder: ObjectId; // Reference to User
  admins: ObjectId[]; // References to Users
  logo?: string;
  coverImage?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
  categories: string[]; // e.g., ['education', 'healthcare', 'environment']
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDocuments: Array<{
    type: string;
    url: string;
    uploadedAt: Date;
    verifiedAt?: Date;
    verifiedBy?: ObjectId;
  }>;
  reputationScore: number;
  impactMetrics: {
    livesImpacted: number;
    projectsCompleted: number;
    totalFundsRaised: number;
    averageProjectSuccess: number;
  };
  aiScreeningResults?: {
    feasibilityScore: number;
    riskAssessment: string;
    redFlags: string[];
    screenedAt: Date;
    screenedBy: string; // AI model version
  };
  blockchainData?: {
    contractAddress?: string;
    tokenSymbol?: string;
    totalTokens?: number;
  };
  status: EntityStatus;
}

// Startup related interfaces
export interface IStartup extends BaseEntity {
  name: string;
  description: string;
  tagline: string;
  industry: string;
  stage: 'idea' | 'prototype' | 'mvp' | 'early_revenue' | 'growth' | 'scale';
  foundedDate: Date;
  incorporationCountry: string;
  incorporationNumber?: string;
  website?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  founders: Array<{
    userId: ObjectId;
    role: string;
    equityPercentage: number;
    isActive: boolean;
  }>;
  team: Array<{
    userId?: ObjectId;
    name: string;
    role: string;
    bio?: string;
    linkedIn?: string;
    isFounder: boolean;
  }>;
  logo?: string;
  coverImage?: string;
  pitchDeck?: string;
  businessPlan?: string;
  financialProjections?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    github?: string;
  };
  valuation: {
    current: number;
    currency: Currency;
    lastUpdated: Date;
    methodology?: string;
  };
  funding: {
    totalRaised: number;
    currency: Currency;
    rounds: Array<{
      type: string;
      amount: number;
      currency: Currency;
      date: Date;
      investors: string[];
    }>;
    currentRound?: {
      type: string;
      targetAmount: number;
      raisedAmount: number;
      currency: Currency;
      deadline: Date;
      minimumInvestment: number;
    };
  };
  metrics: {
    revenue: number;
    users: number;
    growth: number;
    burnRate: number;
    runway: number; // months
  };
  aiScreeningResults?: {
    feasibilityScore: number;
    marketViabilityScore: number;
    teamScore: number;
    technologyScore: number;
    financialScore: number;
    overallScore: number;
    riskFactors: string[];
    opportunities: string[];
    screenedAt: Date;
    screenedBy: string;
  };
  verificationStatus: 'pending' | 'verified' | 'rejected';
  status: EntityStatus;
}

// Project related interfaces
export interface IProject extends BaseEntity {
  title: string;
  description: string;
  summary: string;
  category: string;
  subcategory?: string;
  type: ProjectType;
  
  // Reference to entity (NGO or Startup)
  entityId: ObjectId;
  entityType: 'ngo' | 'startup';
  
  // Basic info
  coverImage?: string;
  gallery?: string[];
  documents?: Array<{
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
  }>;
  
  // Funding details
  fundingGoal: {
    amount: number;
    currency: Currency;
  };
  fundingRaised: {
    amount: number;
    currency: Currency;
  };
  minimumFunding?: {
    amount: number;
    currency: Currency;
  };
  deadline: Date;
  
  // Equity details (for startups)
  equity?: {
    percentage: number;
    valuation: number;
    currency: Currency;
    vestingSchedule?: string;
    liquidationPreference?: string;
  };
  
  // Impact metrics
  impactGoals?: {
    beneficiaries: number;
    regions: string[];
    sdgGoals: number[]; // UN SDG goals
    customMetrics?: Array<{
      name: string;
      target: number;
      unit: string;
    }>;
  };
  
  // Milestones
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    targetDate: Date;
    fundingPercentage: number;
    deliverables: string[];
    status: MilestoneStatus;
  }>;
  
  // AI screening
  aiScreeningResults?: {
    feasibilityScore: number;
    impactScore: number;
    riskScore: number;
    innovationScore: number;
    sustainabilityScore: number;
    overallScore: number;
    recommendations: string[];
    concerns: string[];
    screenedAt: Date;
    screenedBy: string;
  };
  
  // Voting
  votingData?: {
    sessionId: ObjectId;
    votesFor: number;
    votesAgainst: number;
    totalVotes: number;
    threshold: number;
    endDate: Date;
    result?: 'passed' | 'rejected';
  };
  
  // Blockchain data
  blockchainData?: {
    contractAddress?: string;
    tokenAddress?: string;
    smartContractHash?: string;
    ipfsHash?: string;
  };
  
  status: ProjectStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  location?: {
    country: string;
    state?: string;
    city?: string;
    coordinates?: [number, number]; // [longitude, latitude]
  };
}

// Donation related interfaces
export interface IDonation extends BaseEntity {
  donorId: ObjectId; // Reference to User
  projectId: ObjectId; // Reference to Project
  amount: {
    value: number;
    currency: Currency;
  };
  usdEquivalent: number;
  conversionRate: number;
  
  // Payment details
  paymentMethod: 'crypto' | 'card' | 'bank_transfer' | 'paypal';
  transactionHash?: string;
  paymentIntentId?: string; // Stripe payment intent
  
  // Donation type
  type: 'one_time' | 'recurring' | 'milestone_based';
  recurringSchedule?: {
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    nextPaymentDate: Date;
    endDate?: Date;
    isActive: boolean;
  };
  
  // Impact tracking
  impactAllocation?: Array<{
    milestoneId: string;
    percentage: number;
    amount: number;
  }>;
  
  // Anonymity
  isAnonymous: boolean;
  publicNote?: string;
  privateNote?: string;
  
  // Tax deduction
  isEligibleForTaxDeduction: boolean;
  taxReceiptIssued: boolean;
  taxReceiptNumber?: string;
  taxReceiptUrl?: string;
  
  // Refund information
  refundable: boolean;
  refundDeadline?: Date;
  refundRequested?: {
    requestedAt: Date;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'processed';
  };
  
  status: DonationStatus;
  processedAt?: Date;
  failureReason?: string;
  
  // Blockchain verification
  blockchainVerification?: {
    verified: boolean;
    verifiedAt?: Date;
    blockNumber?: number;
    gasUsed?: number;
  };
}

// Milestone related interfaces
export interface IMilestone extends BaseEntity {
  projectId: ObjectId;
  title: string;
  description: string;
  targetDate: Date;
  completionDate?: Date;
  fundingPercentage: number;
  fundingAmount: {
    value: number;
    currency: Currency;
  };
  
  // Deliverables
  deliverables: Array<{
    title: string;
    description: string;
    isCompleted: boolean;
    completedAt?: Date;
    evidence?: Array<{
      type: 'image' | 'video' | 'document' | 'link';
      url: string;
      description?: string;
      uploadedAt: Date;
    }>;
  }>;
  
  // Verification
  verificationRequired: boolean;
  verificationCriteria?: string[];
  
  // AI verification
  aiVerification?: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    confidence: number;
    findings: Array<{
      criterion: string;
      status: 'passed' | 'failed' | 'warning';
      confidence: number;
      explanation: string;
    }>;
    overallAssessment: string;
    verifiedAt?: Date;
    reviewRequired: boolean;
  };
  
  // Manual verification
  manualVerification?: {
    verifiedBy: ObjectId;
    verifiedAt: Date;
    notes: string;
    approved: boolean;
  };
  
  // Voting (if required)
  votingData?: {
    sessionId: ObjectId;
    required: boolean;
    threshold: number;
    votesFor: number;
    votesAgainst: number;
    result?: 'approved' | 'rejected';
  };
  
  // Fund release
  fundReleaseData?: {
    releasedAmount: number;
    releasedAt: Date;
    transactionHash: string;
    releasedBy: ObjectId;
  };
  
  status: MilestoneStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Voting related interfaces
export interface IVotingSession extends BaseEntity {
  title: string;
  description: string;
  type: VoteType;
  
  // Reference entity
  entityId: ObjectId; // Project, Milestone, or Governance proposal
  entityType: 'project' | 'milestone' | 'governance' | 'dispute';
  
  // Voting parameters
  startDate: Date;
  endDate: Date;
  requiredQuorum: number; // Minimum number of votes
  passingThreshold: number; // Percentage needed to pass
  
  // Eligible voters
  eligibleVoters: Array<{
    userId: ObjectId;
    votingPower: number;
    role: UserRole;
  }>;
  
  // Votes
  votes: Array<{
    userId: ObjectId;
    vote: 'for' | 'against' | 'abstain';
    votingPower: number;
    reason?: string;
    votedAt: Date;
    ipAddress: string;
  }>;
  
  // Results
  results?: {
    totalVotes: number;
    votesFor: number;
    votesAgainst: number;
    abstentions: number;
    quorumReached: boolean;
    thresholdReached: boolean;
    outcome: 'passed' | 'rejected' | 'expired';
    finalizedAt: Date;
  };
  
  // Options (for multi-choice voting)
  options?: Array<{
    id: string;
    title: string;
    description: string;
    votes: number;
  }>;
  
  status: VoteStatus;
  isPublic: boolean;
  allowsVoteChange: boolean;
  requiresComment: boolean;
}

// CSR related interfaces
export interface ICSRProgram extends BaseEntity {
  name: string;
  description: string;
  companyId: ObjectId; // Reference to User (CSR manager)
  companyName: string;
  industry: string;
  
  // Budget
  totalBudget: {
    amount: number;
    currency: Currency;
  };
  allocatedBudget: {
    amount: number;
    currency: Currency;
  };
  spentBudget: {
    amount: number;
    currency: Currency;
  };
  
  // Focus areas
  focusAreas: string[];
  geographicFocus: string[];
  beneficiaryGroups: string[];
  
  // Supported projects
  supportedProjects: Array<{
    projectId: ObjectId;
    allocatedAmount: number;
    currency: Currency;
    allocatedAt: Date;
    status: 'allocated' | 'disbursed' | 'completed';
  }>;
  
  // Impact metrics
  impactMetrics: {
    beneficiariesReached: number;
    projectsSupported: number;
    communitiesImpacted: number;
    sdgGoalsAddressed: number[];
    customMetrics?: Array<{
      name: string;
      value: number;
      unit: string;
    }>;
  };
  
  // Reporting
  reportingSchedule: 'monthly' | 'quarterly' | 'annually';
  lastReportDate?: Date;
  nextReportDue: Date;
  
  status: EntityStatus;
  fiscalYear: string;
}

// Analytics related interfaces
export interface IAnalytics extends BaseEntity {
  type: 'donation' | 'project' | 'user' | 'impact' | 'financial' | 'ai' | 'blockchain';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  date: Date;
  
  // Metrics data
  metrics: {
    [key: string]: number | string | boolean | Date;
  };
  
  // Aggregated data
  aggregations?: {
    sum?: Record<string, number>;
    avg?: Record<string, number>;
    min?: Record<string, number>;
    max?: Record<string, number>;
    count?: Record<string, number>;
  };
  
  // Predictions (AI-generated)
  predictions?: {
    [key: string]: {
      value: number;
      confidence: number;
      model: string;
      predictedAt: Date;
    };
  };
  
  // Metadata
  source: string;
  version: string;
  processingTime?: number;
}

// AI Service related interfaces
export interface IAIService extends BaseEntity {
  name: string;
  type: AIServiceType;
  version: string;
  endpoint: string;
  
  // Model configuration
  modelConfig: {
    modelName: string;
    provider: string; // 'openai', 'huggingface', 'custom'
    parameters: Record<string, any>;
    maxTokens?: number;
    temperature?: number;
  };
  
  // Performance metrics
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    averageTokensUsed: number;
    accuracy?: number;
    uptime: number;
  };
  
  // Cost tracking
  costTracking: {
    totalCost: number;
    currency: string;
    costPerRequest: number;
    costPerToken: number;
    lastBillingDate: Date;
  };
  
  status: EntityStatus;
  isActive: boolean;
  lastHealthCheck: Date;
}

// QA Memory for support bot
export interface IQAMemory extends BaseEntity {
  question: string;
  answer: string;
  language: LanguageCode;
  category: string;
  tags: string[];
  
  // Metadata
  confidence: number;
  sourceType: 'manual' | 'ai_generated' | 'user_feedback';
  
  // Usage statistics
  timesUsed: number;
  helpfulVotes: number;
  unhelpfulVotes: number;
  lastUsed?: Date;
  
  // IPFS and blockchain storage
  ipfsHash?: string;
  blockchainHash?: string;
  isOnChain: boolean;
  
  // Embedding for vector search
  embedding?: number[];
  embeddingModel: string;
  
  status: EntityStatus;
}

// Request with user context
export interface AuthenticatedRequest extends Request {
  user?: UserDocument;
  traceId?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  meta?: Record<string, any>;
}

// File upload types
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
  url?: string;
  ipfsHash?: string;
}

// Blockchain transaction types
export interface BlockchainTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  gasUsed?: string;
  nonce: number;
  blockNumber?: number;
  blockHash?: string;
  timestamp?: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

// Notification types
export interface INotification extends BaseEntity {
  userId: ObjectId;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'milestone' | 'donation' | 'vote' | 'system';
  
  // Related entity
  entityId?: ObjectId;
  entityType?: 'project' | 'donation' | 'milestone' | 'vote' | 'user';
  
  // Status
  isRead: boolean;
  readAt?: Date;
  
  // Delivery
  channels: Array<'in_app' | 'email' | 'sms' | 'push'>;
  deliveryStatus: {
    in_app?: 'sent' | 'delivered' | 'read';
    email?: 'sent' | 'delivered' | 'bounced' | 'opened';
    sms?: 'sent' | 'delivered' | 'failed';
    push?: 'sent' | 'delivered' | 'opened';
  };
  
  // Action
  actionUrl?: string;
  actionLabel?: string;
  
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: Date;
} 