import mongoose, { Schema, Document, Model } from 'mongoose';
import { EntityStatus } from '@/models/User.model';

// NGO Verification Status
export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

// NGO interface
export interface INGO extends Document {
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
  founder: mongoose.Types.ObjectId;
  admins: mongoose.Types.ObjectId[];
  logo?: string;
  coverImage?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
  categories: string[];
  verificationStatus: VerificationStatus;
  verificationDocuments: Array<{
    type: string;
    url: string;
    uploadedAt: Date;
    verifiedAt?: Date;
    verifiedBy?: mongoose.Types.ObjectId;
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
    screenedBy: string;
  };
  blockchainData?: {
    contractAddress?: string;
    tokenSymbol?: string;
    totalTokens?: number;
  };
  status: EntityStatus;
}

// NGO schema
const ngoSchema = new Schema<INGO>({
  name: {
    type: String,
    required: [true, 'NGO name is required'],
    trim: true,
    maxlength: [100, 'NGO name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  mission: {
    type: String,
    required: [true, 'Mission statement is required'],
    maxlength: [1000, 'Mission statement cannot exceed 1000 characters']
  },
  vision: {
    type: String,
    maxlength: [1000, 'Vision statement cannot exceed 1000 characters']
  },
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true
  },
  registrationCountry: {
    type: String,
    required: [true, 'Registration country is required'],
    maxlength: [2, 'Country code must be 2 characters']
  },
  registrationDate: {
    type: Date,
    required: [true, 'Registration date is required']
  },
  taxExemptionNumber: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please provide a valid website URL']
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required'],
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required']
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required']
    }
  },
  founder: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Founder is required']
  },
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  logo: {
    type: String
  },
  coverImage: {
    type: String
  },
  socialLinks: {
    twitter: String,
    facebook: String,
    linkedin: String,
    instagram: String
  },
  categories: [{
    type: String,
    enum: [
      'education',
      'healthcare',
      'environment',
      'poverty',
      'disaster_relief',
      'human_rights',
      'animal_welfare',
      'elderly_care',
      'child_welfare',
      'community_development',
      'technology',
      'arts_culture',
      'sports',
      'research',
      'other'
    ]
  }],
  verificationStatus: {
    type: String,
    enum: Object.values(VerificationStatus),
    default: VerificationStatus.PENDING
  },
  verificationDocuments: [{
    type: {
      type: String,
      required: true,
      enum: [
        'registration_certificate',
        'tax_exemption',
        'financial_statement',
        'board_resolution',
        'audit_report',
        'other'
      ]
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verifiedAt: Date,
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  reputationScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  impactMetrics: {
    livesImpacted: {
      type: Number,
      default: 0,
      min: 0
    },
    projectsCompleted: {
      type: Number,
      default: 0,
      min: 0
    },
    totalFundsRaised: {
      type: Number,
      default: 0,
      min: 0
    },
    averageProjectSuccess: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  aiScreeningResults: {
    feasibilityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    riskAssessment: String,
    redFlags: [String],
    screenedAt: Date,
    screenedBy: String
  },
  blockchainData: {
    contractAddress: String,
    tokenSymbol: String,
    totalTokens: Number
  },
  status: {
    type: String,
    enum: Object.values(EntityStatus),
    default: EntityStatus.PENDING
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
ngoSchema.index({ name: 'text', description: 'text', mission: 'text' });
ngoSchema.index({ registrationNumber: 1 });
ngoSchema.index({ registrationCountry: 1 });
ngoSchema.index({ verificationStatus: 1 });
ngoSchema.index({ status: 1 });
ngoSchema.index({ categories: 1 });
ngoSchema.index({ reputationScore: -1 });
ngoSchema.index({ founder: 1 });
ngoSchema.index({ 'address.country': 1 });
ngoSchema.index({ createdAt: -1 });

// Virtual for full address
ngoSchema.virtual('fullAddress').get(function(this: INGO) {
  return `${this.address.street}, ${this.address.city}, ${this.address.state}, ${this.address.country} ${this.address.postalCode}`;
});

// Virtual for verification completion percentage
ngoSchema.virtual('verificationProgress').get(function(this: INGO) {
  const requiredDocs = ['registration_certificate', 'tax_exemption', 'financial_statement'];
  const uploadedDocs = this.verificationDocuments.map(doc => doc.type);
  const completedDocs = requiredDocs.filter(doc => uploadedDocs.includes(doc));
  return Math.round((completedDocs.length / requiredDocs.length) * 100);
});

// Pre-save middleware
ngoSchema.pre('save', function(next) {
  // Add founder to admins if not already present
  if (this.isNew && this.founder && !this.admins.includes(this.founder)) {
    this.admins.push(this.founder);
  }
  next();
});

// Static methods
ngoSchema.statics.findVerified = function() {
  return this.find({ 
    verificationStatus: VerificationStatus.VERIFIED,
    status: EntityStatus.ACTIVE 
  });
};

ngoSchema.statics.findByCategory = function(category: string) {
  return this.find({ 
    categories: category,
    status: EntityStatus.ACTIVE 
  });
};

ngoSchema.statics.findByCountry = function(country: string) {
  return this.find({ 
    'address.country': country,
    status: EntityStatus.ACTIVE 
  });
};

ngoSchema.statics.searchNGOs = function(query: string) {
  return this.find({
    $text: { $search: query },
    status: EntityStatus.ACTIVE
  }).sort({ score: { $meta: 'textScore' } });
};

// Instance methods
ngoSchema.methods.addAdmin = function(userId: mongoose.Types.ObjectId) {
  if (!this.admins.includes(userId)) {
    this.admins.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

ngoSchema.methods.removeAdmin = function(userId: mongoose.Types.ObjectId) {
  this.admins = this.admins.filter(admin => !admin.equals(userId));
  return this.save();
};

ngoSchema.methods.updateImpactMetrics = function(metrics: Partial<INGO['impactMetrics']>) {
  Object.assign(this.impactMetrics, metrics);
  return this.save();
};

ngoSchema.methods.calculateReputationScore = function() {
  // Calculate reputation based on various factors
  let score = 0;
  
  // Verification status (40%)
  if (this.verificationStatus === VerificationStatus.VERIFIED) {
    score += 40;
  }
  
  // Project success rate (30%)
  score += (this.impactMetrics.averageProjectSuccess * 0.3);
  
  // Number of completed projects (20%)
  const projectPoints = Math.min(this.impactMetrics.projectsCompleted * 2, 20);
  score += projectPoints;
  
  // Lives impacted (10%)
  const impactPoints = Math.min(Math.log10(this.impactMetrics.livesImpacted + 1) * 2, 10);
  score += impactPoints;
  
  this.reputationScore = Math.round(Math.min(score, 100));
  return this.save();
};

// Export the model
export const NGO: Model<INGO> = mongoose.model<INGO>('NGO', ngoSchema); 