import mongoose, { Schema, Document, Model } from 'mongoose';
import { EntityStatus } from '@/models/User.model';

// Project Type enum
export enum ProjectType {
  STARTUP = 'startup',
  PRODUCT = 'product',
  CHARITY = 'charity',
  INDIVIDUAL_ASSISTANCE = 'individual_assistance',
  CSR_INITIATIVE = 'csr_initiative'
}

// Project Status enum
export enum ProjectStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  FUNDED = 'funded',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Milestone Status enum
export enum MilestoneStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed'
}

// Currency enum
export enum Currency {
  ETH = 'ETH',
  USDC = 'USDC',
  USDT = 'USDT',
  DAI = 'DAI',
  MATIC = 'MATIC'
}

// Project interface
export interface IProject extends Document {
  title: string;
  description: string;
  summary: string;
  category: string;
  subcategory?: string;
  type: ProjectType;
  entityId: mongoose.Types.ObjectId;
  entityType: 'ngo' | 'startup';
  coverImage?: string;
  gallery?: string[];
  documents?: Array<{
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
  }>;
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
  equity?: {
    percentage: number;
    valuation: number;
    currency: Currency;
    vestingSchedule?: string;
    liquidationPreference?: string;
  };
  impactGoals?: {
    beneficiaries: number;
    regions: string[];
    sdgGoals: number[];
    customMetrics?: Array<{
      name: string;
      target: number;
      unit: string;
    }>;
  };
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    targetDate: Date;
    fundingPercentage: number;
    deliverables: string[];
    status: MilestoneStatus;
  }>;
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
  votingData?: {
    sessionId: mongoose.Types.ObjectId;
    votesFor: number;
    votesAgainst: number;
    totalVotes: number;
    threshold: number;
    endDate: Date;
    result?: 'passed' | 'rejected';
  };
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
    coordinates?: [number, number];
  };
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

// Project schema
const projectSchema = new Schema<IProject>({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  summary: {
    type: String,
    required: [true, 'Project summary is required'],
    maxlength: [500, 'Summary cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'technology',
      'healthcare',
      'education',
      'environment',
      'finance',
      'social_impact',
      'agriculture',
      'energy',
      'transportation',
      'manufacturing',
      'retail',
      'entertainment',
      'real_estate',
      'food_beverage',
      'other'
    ]
  },
  subcategory: {
    type: String,
    maxlength: [100, 'Subcategory cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: Object.values(ProjectType),
    required: [true, 'Project type is required']
  },
  entityId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Entity ID is required'],
    refPath: 'entityType'
  },
  entityType: {
    type: String,
    required: [true, 'Entity type is required'],
    enum: ['ngo', 'startup']
  },
  coverImage: {
    type: String
  },
  gallery: [{
    type: String
  }],
  documents: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['pitch_deck', 'business_plan', 'financial_projection', 'legal_document', 'technical_spec', 'other']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  fundingGoal: {
    amount: {
      type: Number,
      required: [true, 'Funding goal amount is required'],
      min: [0, 'Funding goal cannot be negative']
    },
    currency: {
      type: String,
      enum: Object.values(Currency),
      required: [true, 'Funding goal currency is required'],
      default: Currency.ETH
    }
  },
  fundingRaised: {
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Funding raised cannot be negative']
    },
    currency: {
      type: String,
      enum: Object.values(Currency),
      default: Currency.ETH
    }
  },
  minimumFunding: {
    amount: {
      type: Number,
      min: [0, 'Minimum funding cannot be negative']
    },
    currency: {
      type: String,
      enum: Object.values(Currency)
    }
  },
  deadline: {
    type: Date,
    required: [true, 'Project deadline is required'],
    validate: {
      validator: function(value: Date) {
        return value > new Date();
      },
      message: 'Deadline must be in the future'
    }
  },
  equity: {
    percentage: {
      type: Number,
      min: [0, 'Equity percentage cannot be negative'],
      max: [100, 'Equity percentage cannot exceed 100%']
    },
    valuation: {
      type: Number,
      min: [0, 'Valuation cannot be negative']
    },
    currency: {
      type: String,
      enum: Object.values(Currency)
    },
    vestingSchedule: String,
    liquidationPreference: String
  },
  impactGoals: {
    beneficiaries: {
      type: Number,
      min: [0, 'Beneficiaries cannot be negative']
    },
    regions: [String],
    sdgGoals: [{
      type: Number,
      min: 1,
      max: 17
    }],
    customMetrics: [{
      name: {
        type: String,
        required: true
      },
      target: {
        type: Number,
        required: true,
        min: 0
      },
      unit: {
        type: String,
        required: true
      }
    }]
  },
  milestones: [{
    id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
      maxlength: [200, 'Milestone title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: true,
      maxlength: [1000, 'Milestone description cannot exceed 1000 characters']
    },
    targetDate: {
      type: Date,
      required: true
    },
    fundingPercentage: {
      type: Number,
      required: true,
      min: [0, 'Funding percentage cannot be negative'],
      max: [100, 'Funding percentage cannot exceed 100%']
    },
    deliverables: [{
      type: String,
      required: true
    }],
    status: {
      type: String,
      enum: Object.values(MilestoneStatus),
      default: MilestoneStatus.PENDING
    }
  }],
  aiScreeningResults: {
    feasibilityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    impactScore: {
      type: Number,
      min: 0,
      max: 100
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100
    },
    innovationScore: {
      type: Number,
      min: 0,
      max: 100
    },
    sustainabilityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100
    },
    recommendations: [String],
    concerns: [String],
    screenedAt: Date,
    screenedBy: String
  },
  votingData: {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'VotingSession'
    },
    votesFor: {
      type: Number,
      default: 0
    },
    votesAgainst: {
      type: Number,
      default: 0
    },
    totalVotes: {
      type: Number,
      default: 0
    },
    threshold: {
      type: Number,
      min: 0,
      max: 100
    },
    endDate: Date,
    result: {
      type: String,
      enum: ['passed', 'rejected']
    }
  },
  blockchainData: {
    contractAddress: String,
    tokenAddress: String,
    smartContractHash: String,
    ipfsHash: String
  },
  status: {
    type: String,
    enum: Object.values(ProjectStatus),
    default: ProjectStatus.DRAFT
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  location: {
    country: {
      type: String,
      maxlength: [2, 'Country code must be 2 characters']
    },
    state: String,
    city: String,
    coordinates: {
      type: [Number],
      validate: {
        validator: function(coords: number[]) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Coordinates must be [longitude, latitude] with valid ranges'
      }
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
projectSchema.index({ title: 'text', description: 'text', summary: 'text' });
projectSchema.index({ type: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ entityId: 1, entityType: 1 });
projectSchema.index({ createdBy: 1 });
projectSchema.index({ deadline: 1 });
projectSchema.index({ 'fundingGoal.amount': 1 });
projectSchema.index({ 'fundingRaised.amount': 1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ 'location.country': 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ 'aiScreeningResults.overallScore': -1 });

// Compound indexes
projectSchema.index({ status: 1, type: 1 });
projectSchema.index({ category: 1, status: 1 });
projectSchema.index({ deadline: 1, status: 1 });

// Text search index
projectSchema.index({ 
  title: 'text', 
  description: 'text', 
  summary: 'text',
  tags: 'text'
});

// Geospatial index for location
projectSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual properties
projectSchema.virtual('fundingProgress').get(function(this: IProject) {
  if (this.fundingGoal.amount === 0) return 0;
  return Math.round((this.fundingRaised.amount / this.fundingGoal.amount) * 100);
});

projectSchema.virtual('daysRemaining').get(function(this: IProject) {
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

projectSchema.virtual('isExpired').get(function(this: IProject) {
  return new Date() > new Date(this.deadline);
});

projectSchema.virtual('milestonesCompleted').get(function(this: IProject) {
  return this.milestones.filter(m => m.status === MilestoneStatus.COMPLETED).length;
});

projectSchema.virtual('milestonesProgress').get(function(this: IProject) {
  if (this.milestones.length === 0) return 0;
  return Math.round((this.milestonesCompleted / this.milestones.length) * 100);
});

// Pre-save middleware
projectSchema.pre('save', function(next) {
  // Validate milestone funding percentages sum to 100%
  if (this.milestones.length > 0) {
    const totalPercentage = this.milestones.reduce((sum, milestone) => sum + milestone.fundingPercentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      return next(new Error('Milestone funding percentages must sum to 100%'));
    }
  }
  
  // Set updatedBy if user is provided in context
  if (this.isModified() && !this.isNew) {
    // This would be set by the service layer
    // this.updatedBy = contextUserId;
  }
  
  next();
});

// Static methods
projectSchema.statics.findActive = function() {
  return this.find({ 
    status: { $in: [ProjectStatus.APPROVED, ProjectStatus.FUNDED, ProjectStatus.ACTIVE] }
  });
};

projectSchema.statics.findByType = function(type: ProjectType) {
  return this.find({ type, status: { $ne: ProjectStatus.DRAFT } });
};

projectSchema.statics.findByCategory = function(category: string) {
  return this.find({ category, status: { $ne: ProjectStatus.DRAFT } });
};

projectSchema.statics.findFundingOpportunities = function() {
  return this.find({
    status: ProjectStatus.APPROVED,
    deadline: { $gt: new Date() },
    $expr: { $lt: ['$fundingRaised.amount', '$fundingGoal.amount'] }
  });
};

projectSchema.statics.searchProjects = function(query: string, filters: any = {}) {
  const searchQuery = {
    $text: { $search: query },
    status: { $ne: ProjectStatus.DRAFT },
    ...filters
  };
  
  return this.find(searchQuery).sort({ score: { $meta: 'textScore' } });
};

projectSchema.statics.findNearby = function(longitude: number, latitude: number, maxDistance: number = 50000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    status: { $ne: ProjectStatus.DRAFT }
  });
};

// Instance methods
projectSchema.methods.addMilestone = function(milestone: Partial<IProject['milestones'][0]>) {
  const newMilestone = {
    id: new mongoose.Types.ObjectId().toString(),
    ...milestone,
    status: MilestoneStatus.PENDING
  };
  
  this.milestones.push(newMilestone);
  return this.save();
};

projectSchema.methods.updateMilestone = function(milestoneId: string, updates: Partial<IProject['milestones'][0]>) {
  const milestone = this.milestones.id(milestoneId);
  if (!milestone) {
    throw new Error('Milestone not found');
  }
  
  Object.assign(milestone, updates);
  return this.save();
};

projectSchema.methods.calculateOverallScore = function() {
  if (!this.aiScreeningResults) return 0;
  
  const scores = this.aiScreeningResults;
  const weights = {
    feasibility: 0.25,
    impact: 0.25,
    innovation: 0.20,
    sustainability: 0.20,
    risk: -0.10 // Risk is negative
  };
  
  const overallScore = 
    (scores.feasibilityScore * weights.feasibility) +
    (scores.impactScore * weights.impact) +
    (scores.innovationScore * weights.innovation) +
    (scores.sustainabilityScore * weights.sustainability) +
    ((100 - scores.riskScore) * Math.abs(weights.risk)); // Invert risk score
  
  this.aiScreeningResults.overallScore = Math.round(Math.max(0, Math.min(100, overallScore)));
  return this.save();
};

projectSchema.methods.updateFunding = function(amount: number, currency: Currency = Currency.ETH) {
  this.fundingRaised.amount += amount;
  this.fundingRaised.currency = currency;
  
  // Update status based on funding progress
  if (this.fundingProgress >= 100 && this.status === ProjectStatus.APPROVED) {
    this.status = ProjectStatus.FUNDED;
  }
  
  return this.save();
};

projectSchema.methods.canReceiveFunding = function() {
  return this.status === ProjectStatus.APPROVED &&
         !this.isExpired &&
         this.fundingProgress < 100;
};

// Export the model
export const Project: Model<IProject> = mongoose.model<IProject>('Project', projectSchema); 