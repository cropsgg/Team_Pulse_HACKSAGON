import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// User Role enum
export enum UserRole {
  VC = 'vc',
  STARTUP_FOUNDER = 'startup_founder',
  NGO_ADMIN = 'ngo_admin',
  INDIVIDUAL = 'individual',
  CSR_MANAGER = 'csr_manager',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

// Entity Status enum
export enum EntityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived'
}

// Language codes
export enum LanguageCode {
  EN = 'en',
  ES = 'es',
  FR = 'fr',
  DE = 'de',
  ZH = 'zh',
  HI = 'hi',
  AR = 'ar',
  PT = 'pt',
  RU = 'ru',
  JA = 'ja'
}

// KYC Status
export enum KYCStatus {
  NOT_STARTED = 'not_started',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// User interface
export interface IUser extends Document {
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
  kycStatus: KYCStatus;
  kycDocuments: Array<{
    type: string;
    url: string;
    uploadedAt: Date;
  }>;
  permissions: string[];
  metadata: Record<string, any>;
  
  // Virtual fields
  fullName: string;
  isLocked: boolean;
  
  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
  incLoginAttempts(): Promise<void>;
  generatePasswordResetToken(): string;
  generateEmailVerificationToken(): string;
  enable2FA(): string;
  verify2FA(token: string): boolean;
}

// User schema
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: [true, 'User role is required'],
    default: UserRole.INDIVIDUAL
  },
  profileImage: {
    type: String,
    default: null
  },
  walletAddress: {
    type: String,
    sparse: true, // Allows multiple null values
    match: [/^0x[a-fA-F0-9]{40}$/, 'Please enter a valid Ethereum wallet address']
  },
  phoneNumber: {
    type: String,
    sparse: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  country: {
    type: String,
    maxlength: [2, 'Country code must be 2 characters']
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  preferredLanguage: {
    type: String,
    enum: Object.values(LanguageCode),
    default: LanguageCode.EN
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  is2FAEnabled: {
    type: Boolean,
    default: false
  },
  twoFASecret: {
    type: String,
    select: false
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: Object.values(EntityStatus),
    default: EntityStatus.PENDING
  },
  kycStatus: {
    type: String,
    enum: Object.values(KYCStatus),
    default: KYCStatus.NOT_STARTED
  },
  kycDocuments: [{
    type: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  permissions: [{
    type: String
  }],
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ walletAddress: 1 }, { sparse: true });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function(this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function(this: IUser) {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware to set default permissions based on role
userSchema.pre('save', function(next) {
  if (!this.isModified('role') && this.permissions.length > 0) return next();
  
  const rolePermissions: Record<UserRole, string[]> = {
    [UserRole.SUPER_ADMIN]: ['*'],
    [UserRole.ADMIN]: [
      'users.read', 'users.update', 'users.delete',
      'projects.read', 'projects.update', 'projects.delete',
      'donations.read', 'analytics.read', 'reports.read'
    ],
    [UserRole.VC]: [
      'projects.read', 'projects.vote', 'projects.fund',
      'startups.read', 'analytics.read', 'voting.participate'
    ],
    [UserRole.STARTUP_FOUNDER]: [
      'projects.create', 'projects.update', 'projects.read',
      'milestones.create', 'milestones.update', 'funding.receive'
    ],
    [UserRole.NGO_ADMIN]: [
      'projects.create', 'projects.update', 'projects.read',
      'milestones.create', 'milestones.update', 'donations.receive'
    ],
    [UserRole.CSR_MANAGER]: [
      'csr.create', 'csr.update', 'csr.read',
      'projects.read', 'donations.create', 'analytics.read'
    ],
    [UserRole.INDIVIDUAL]: [
      'projects.read', 'donations.create', 'support.access'
    ]
  };
  
  this.permissions = rolePermissions[this.role] || [];
  next();
});

// Instance Methods

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate auth token
userSchema.methods.generateAuthToken = function(): string {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role,
    permissions: this.permissions
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function(): string {
  const payload = {
    id: this._id,
    type: 'refresh'
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    { expiresIn: '30d' }
  );
};

// Increment login attempts
userSchema.methods.incLoginAttempts = async function(): Promise<void> {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates: any = { $inc: { loginAttempts: 1 } };
  
  // If we're at max attempts and it's not locked yet, lock the account
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + lockTime) };
  }
  
  return this.updateOne(updates);
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return resetToken;
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function(): string {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  return verificationToken;
};

// Enable 2FA
userSchema.methods.enable2FA = function(): string {
  const secret = crypto.randomBytes(32).toString('base32');
  this.twoFASecret = secret;
  this.is2FAEnabled = true;
  return secret;
};

// Verify 2FA token
userSchema.methods.verify2FA = function(token: string): boolean {
  // This is a placeholder - implement proper TOTP verification
  // You would typically use a library like 'speakeasy' for this
  return true;
};

// Static Methods

// Find by email
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Find active users
userSchema.statics.findActive = function() {
  return this.find({ status: EntityStatus.ACTIVE });
};

// Find by role
userSchema.statics.findByRole = function(role: UserRole) {
  return this.find({ role, status: EntityStatus.ACTIVE });
};

// Clean up expired tokens
userSchema.statics.cleanupExpiredTokens = function() {
  const now = new Date();
  return this.updateMany(
    {
      $or: [
        { resetPasswordExpires: { $lt: now } },
        { emailVerificationExpires: { $lt: now } }
      ]
    },
    {
      $unset: {
        resetPasswordToken: 1,
        resetPasswordExpires: 1,
        emailVerificationToken: 1,
        emailVerificationExpires: 1
      }
    }
  );
};

// Export the model
export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema); 