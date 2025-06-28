import crypto from 'crypto';
import { User, IUser, UserRole } from '@/models/User.model';
import { 
  AppError, 
  AuthenticationError, 
  ValidationError, 
  ConflictError,
  NotFoundError 
} from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { cacheService, CACHE_KEYS, CACHE_TTL } from '@/config/redis';
import { EmailService } from '@/services/email.service';

export interface RegisterUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  country?: string;
  walletAddress?: string;
}

export interface LoginDto {
  email: string;
  password: string;
  twoFAToken?: string;
}

export interface AuthResult {
  user: Partial<IUser>;
  token: string;
  refreshToken: string;
}

export interface PasswordResetDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export class AuthService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterUserDto): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Validate wallet address if provided
      if (userData.walletAddress) {
        const existingWallet = await User.findOne({ 
          walletAddress: userData.walletAddress 
        });
        if (existingWallet) {
          throw new ConflictError('This wallet address is already linked to another account');
        }
      }

      // Create new user
      const user = new User({
        ...userData,
        email: userData.email.toLowerCase()
      });

      // Generate email verification token
      const verificationToken = user.generateEmailVerificationToken();

      // Save user
      await user.save();

      // Send verification email
      await this.emailService.sendEmailVerification(
        user.email,
        user.firstName,
        verificationToken
      );

      logger.info('User registered successfully', {
        userId: user._id,
        email: user.email,
        role: user.role
      });

      // Generate tokens
      const token = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();

      // Cache user data
      await cacheService.set(
        CACHE_KEYS.USER(user._id.toString()),
        this.sanitizeUser(user),
        CACHE_TTL.MEDIUM
      );

      return {
        user: this.sanitizeUser(user),
        token,
        refreshToken
      };
    } catch (error) {
      logger.error('User registration failed:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(loginData: LoginDto): Promise<AuthResult> {
    try {
      // Find user with password
      const user = await User.findByEmail(loginData.email).select('+password +twoFASecret');
      
      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check if account is locked
      if (user.isLocked) {
        throw new AuthenticationError('Account is temporarily locked due to too many failed login attempts');
      }

      // Check if account is active
      if (user.status !== 'active' && user.status !== 'pending') {
        throw new AuthenticationError('Account is not active');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(loginData.password);
      if (!isPasswordValid) {
        await user.incLoginAttempts();
        throw new AuthenticationError('Invalid email or password');
      }

      // Check 2FA if enabled
      if (user.is2FAEnabled) {
        if (!loginData.twoFAToken) {
          throw new AuthenticationError('Two-factor authentication token required');
        }
        
        const is2FAValid = user.verify2FA(loginData.twoFAToken);
        if (!is2FAValid) {
          throw new AuthenticationError('Invalid two-factor authentication token');
        }
      }

      // Update last login and reset login attempts
      user.lastLoginAt = new Date();
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();

      logger.info('User logged in successfully', {
        userId: user._id,
        email: user.email,
        role: user.role
      });

      // Generate tokens
      const token = user.generateAuthToken();
      const refreshToken = user.generateRefreshToken();

      // Cache user data
      await cacheService.set(
        CACHE_KEYS.USER(user._id.toString()),
        this.sanitizeUser(user),
        CACHE_TTL.MEDIUM
      );

      return {
        user: this.sanitizeUser(user),
        token,
        refreshToken
      };
    } catch (error) {
      logger.error('User login failed:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(resetData: PasswordResetDto): Promise<void> {
    try {
      const user = await User.findByEmail(resetData.email);
      
      if (!user) {
        // Don't reveal if email exists for security
        logger.warn('Password reset requested for non-existent email', {
          email: resetData.email
        });
        return;
      }

      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      // Send reset email
      await this.emailService.sendPasswordReset(
        user.email,
        user.firstName,
        resetToken
      );

      logger.info('Password reset requested', {
        userId: user._id,
        email: user.email
      });
    } catch (error) {
      logger.error('Password reset request failed:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetData: ResetPasswordDto): Promise<void> {
    try {
      if (resetData.newPassword !== resetData.confirmPassword) {
        throw new ValidationError([{
          field: 'confirmPassword',
          message: 'Passwords do not match'
        }]);
      }

      // Hash the token
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetData.token)
        .digest('hex');

      // Find user with valid reset token
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new AuthenticationError('Invalid or expired reset token');
      }

      // Update password and clear reset token
      user.password = resetData.newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      user.loginAttempts = 0;
      user.lockUntil = undefined;

      await user.save();

      // Clear cached user data
      await cacheService.del(CACHE_KEYS.USER(user._id.toString()));

      logger.info('Password reset successfully', {
        userId: user._id,
        email: user.email
      });
    } catch (error) {
      logger.error('Password reset failed:', error);
      throw error;
    }
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(userId: string, passwordData: ChangePasswordDto): Promise<void> {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new ValidationError([{
          field: 'confirmPassword',
          message: 'Passwords do not match'
        }]);
      }

      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new NotFoundError('User');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(passwordData.currentPassword);
      if (!isCurrentPasswordValid) {
        throw new AuthenticationError('Current password is incorrect');
      }

      // Update password
      user.password = passwordData.newPassword;
      await user.save();

      // Clear cached user data
      await cacheService.del(CACHE_KEYS.USER(userId));

      logger.info('Password changed successfully', {
        userId: user._id,
        email: user.email
      });
    } catch (error) {
      logger.error('Password change failed:', error);
      throw error;
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      // Hash the token
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Find user with valid verification token
      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new AuthenticationError('Invalid or expired verification token');
      }

      // Update user
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      
      // Activate account if it was pending email verification
      if (user.status === 'pending') {
        user.status = 'active';
      }

      await user.save();

      // Clear cached user data
      await cacheService.del(CACHE_KEYS.USER(user._id.toString()));

      logger.info('Email verified successfully', {
        userId: user._id,
        email: user.email
      });
    } catch (error) {
      logger.error('Email verification failed:', error);
      throw error;
    }
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(email: string): Promise<void> {
    try {
      const user = await User.findByEmail(email);
      
      if (!user) {
        throw new NotFoundError('User');
      }

      if (user.isEmailVerified) {
        throw new AppError('Email is already verified', 400);
      }

      // Generate new verification token
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      // Send verification email
      await this.emailService.sendEmailVerification(
        user.email,
        user.firstName,
        verificationToken
      );

      logger.info('Email verification resent', {
        userId: user._id,
        email: user.email
      });
    } catch (error) {
      logger.error('Resending email verification failed:', error);
      throw error;
    }
  }

  /**
   * Enable 2FA for user
   */
  async enable2FA(userId: string): Promise<{ secret: string; qrCode: string }> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('User');
      }

      if (user.is2FAEnabled) {
        throw new AppError('Two-factor authentication is already enabled', 400);
      }

      // Generate 2FA secret
      const secret = user.enable2FA();
      await user.save();

      // Generate QR code (placeholder - implement with actual QR library)
      const qrCode = `data:image/png;base64,placeholder-qr-code`;

      // Clear cached user data
      await cacheService.del(CACHE_KEYS.USER(userId));

      logger.info('2FA enabled', {
        userId: user._id,
        email: user.email
      });

      return { secret, qrCode };
    } catch (error) {
      logger.error('Enabling 2FA failed:', error);
      throw error;
    }
  }

  /**
   * Disable 2FA for user
   */
  async disable2FA(userId: string, password: string): Promise<void> {
    try {
      const user = await User.findById(userId).select('+password +twoFASecret');
      if (!user) {
        throw new NotFoundError('User');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid password');
      }

      // Disable 2FA
      user.is2FAEnabled = false;
      user.twoFASecret = undefined;
      await user.save();

      // Clear cached user data
      await cacheService.del(CACHE_KEYS.USER(userId));

      logger.info('2FA disabled', {
        userId: user._id,
        email: user.email
      });
    } catch (error) {
      logger.error('Disabling 2FA failed:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<Partial<IUser>> {
    try {
      // Try to get from cache first
      const cachedUser = await cacheService.get(CACHE_KEYS.USER(userId));
      if (cachedUser) {
        return cachedUser;
      }

      // Get from database
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('User');
      }

      const sanitizedUser = this.sanitizeUser(user);

      // Cache for future requests
      await cacheService.set(
        CACHE_KEYS.USER(userId),
        sanitizedUser,
        CACHE_TTL.MEDIUM
      );

      return sanitizedUser;
    } catch (error) {
      logger.error('Getting user profile failed:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateData: Partial<IUser>): Promise<Partial<IUser>> {
    try {
      // Remove sensitive fields that shouldn't be updated through this method
      const sanitizedData = { ...updateData };
      delete sanitizedData.password;
      delete sanitizedData.role;
      delete sanitizedData.permissions;
      delete sanitizedData.status;
      delete sanitizedData.isEmailVerified;
      delete sanitizedData.is2FAEnabled;

      const user = await User.findByIdAndUpdate(
        userId,
        sanitizedData,
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new NotFoundError('User');
      }

      const sanitizedUser = this.sanitizeUser(user);

      // Update cache
      await cacheService.set(
        CACHE_KEYS.USER(userId),
        sanitizedUser,
        CACHE_TTL.MEDIUM
      );

      logger.info('User profile updated', {
        userId: user._id,
        email: user.email
      });

      return sanitizedUser;
    } catch (error) {
      logger.error('Updating user profile failed:', error);
      throw error;
    }
  }

  /**
   * Sanitize user object (remove sensitive data)
   */
  private sanitizeUser(user: IUser): Partial<IUser> {
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.twoFASecret;
    delete userObj.resetPasswordToken;
    delete userObj.resetPasswordExpires;
    delete userObj.emailVerificationToken;
    delete userObj.emailVerificationExpires;
    delete userObj.loginAttempts;
    delete userObj.lockUntil;
    
    return userObj;
  }
}

// Placeholder for EmailService
class EmailService {
  async sendEmailVerification(email: string, firstName: string, token: string): Promise<void> {
    // TODO: Implement email sending
    logger.info('Email verification sent', { email, token });
  }

  async sendPasswordReset(email: string, firstName: string, token: string): Promise<void> {
    // TODO: Implement password reset email
    logger.info('Password reset email sent', { email, token });
  }
} 