import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService, RegisterUserDto, LoginDto, PasswordResetDto, ResetPasswordDto, ChangePasswordDto } from '@/services/auth.service';
import { UserRole } from '@/models/User.model';
import { asyncHandler, sendSuccess, ValidationError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    permissions: string[];
  };
}

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Validation rules for registration
  static validateRegister = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),
    body('role')
      .isIn(Object.values(UserRole))
      .withMessage('Please provide a valid role'),
    body('phoneNumber')
      .optional()
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage('Please provide a valid phone number'),
    body('country')
      .optional()
      .isLength({ min: 2, max: 2 })
      .withMessage('Country code must be 2 characters'),
    body('walletAddress')
      .optional()
      .matches(/^0x[a-fA-F0-9]{40}$/)
      .withMessage('Please provide a valid Ethereum wallet address')
  ];

  // Validation rules for login
  static validateLogin = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    body('twoFAToken')
      .optional()
      .isLength({ min: 6, max: 6 })
      .withMessage('2FA token must be 6 characters')
  ];

  // Validation rules for password reset request
  static validatePasswordResetRequest = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email')
  ];

  // Validation rules for password reset
  static validatePasswordReset = [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Passwords do not match');
        }
        return true;
      })
  ];

  // Validation rules for password change
  static validatePasswordChange = [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Passwords do not match');
        }
        return true;
      })
  ];

  // Helper method to check validation results
  private checkValidation(req: Request): void {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(error => ({
        field: error.param,
        message: error.msg
      }));
      throw new ValidationError(formattedErrors);
    }
  }

  /**
   * Register a new user
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    this.checkValidation(req);

    const userData: RegisterUserDto = {
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      role: req.body.role,
      phoneNumber: req.body.phoneNumber,
      country: req.body.country,
      walletAddress: req.body.walletAddress
    };

    const result = await this.authService.register(userData);

    logger.info('User registration successful', {
      email: userData.email,
      role: userData.role,
      traceId: req.headers['x-trace-id']
    });

    sendSuccess(res, result, 'Registration successful. Please check your email for verification.', 201);
  });

  /**
   * Login user
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    this.checkValidation(req);

    const loginData: LoginDto = {
      email: req.body.email,
      password: req.body.password,
      twoFAToken: req.body.twoFAToken
    };

    const result = await this.authService.login(loginData);

    // Set secure HTTP-only cookie for refresh token
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    logger.info('User login successful', {
      email: loginData.email,
      userId: result.user._id,
      traceId: req.headers['x-trace-id']
    });

    sendSuccess(res, {
      user: result.user,
      token: result.token
    }, 'Login successful');
  });

  /**
   * Logout user
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    // TODO: Add token to blacklist for additional security

    logger.info('User logout successful', {
      userId: (req as AuthenticatedRequest).user?.id,
      traceId: req.headers['x-trace-id']
    });

    sendSuccess(res, null, 'Logout successful');
  });

  /**
   * Request password reset
   */
  requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
    this.checkValidation(req);

    const resetData: PasswordResetDto = {
      email: req.body.email
    };

    await this.authService.requestPasswordReset(resetData);

    logger.info('Password reset requested', {
      email: resetData.email,
      traceId: req.headers['x-trace-id']
    });

    sendSuccess(res, null, 'If an account with that email exists, a password reset link has been sent.');
  });

  /**
   * Reset password with token
   */
  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    this.checkValidation(req);

    const resetData: ResetPasswordDto = {
      token: req.body.token,
      newPassword: req.body.newPassword,
      confirmPassword: req.body.confirmPassword
    };

    await this.authService.resetPassword(resetData);

    logger.info('Password reset successful', {
      traceId: req.headers['x-trace-id']
    });

    sendSuccess(res, null, 'Password has been reset successfully. You can now login with your new password.');
  });

  /**
   * Change password for authenticated user
   */
  changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    this.checkValidation(req);

    const passwordData: ChangePasswordDto = {
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
      confirmPassword: req.body.confirmPassword
    };

    await this.authService.changePassword(req.user!.id, passwordData);

    logger.info('Password changed successfully', {
      userId: req.user!.id,
      traceId: req.headers['x-trace-id']
    });

    sendSuccess(res, null, 'Password has been changed successfully.');
  });

  /**
   * Verify email address
   */
  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;

    if (!token) {
      throw new ValidationError([{
        field: 'token',
        message: 'Verification token is required'
      }]);
    }

    await this.authService.verifyEmail(token);

    logger.info('Email verification successful', {
      token,
      traceId: req.headers['x-trace-id']
    });

    sendSuccess(res, null, 'Email has been verified successfully. Your account is now active.');
  });

  /**
   * Resend email verification
   */
  resendEmailVerification = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError([{
        field: 'email',
        message: 'Email is required'
      }]);
    }

    await this.authService.resendEmailVerification(email);

    logger.info('Email verification resent', {
      email,
      traceId: req.headers['x-trace-id']
    });

    sendSuccess(res, null, 'Verification email has been sent.');
  });

  /**
   * Get current user profile
   */
  getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await this.authService.getProfile(req.user!.id);

    sendSuccess(res, user, 'Profile retrieved successfully');
  });

  /**
   * Update user profile
   */
  updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const allowedFields = [
      'firstName',
      'lastName',
      'phoneNumber',
      'country',
      'timezone',
      'preferredLanguage',
      'profileImage'
    ];

    // Filter only allowed fields
    const updateData: any = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const user = await this.authService.updateProfile(req.user!.id, updateData);

    logger.info('Profile updated successfully', {
      userId: req.user!.id,
      updatedFields: Object.keys(updateData),
      traceId: req.headers['x-trace-id']
    });

    sendSuccess(res, user, 'Profile updated successfully');
  });

  /**
   * Enable 2FA for user
   */
  enable2FA = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await this.authService.enable2FA(req.user!.id);

    logger.info('2FA enabled successfully', {
      userId: req.user!.id,
      traceId: req.headers['x-trace-id']
    });

    sendSuccess(res, result, '2FA has been enabled successfully');
  });

  /**
   * Disable 2FA for user
   */
  disable2FA = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { password } = req.body;

    if (!password) {
      throw new ValidationError([{
        field: 'password',
        message: 'Password is required to disable 2FA'
      }]);
    }

    await this.authService.disable2FA(req.user!.id, password);

    logger.info('2FA disabled successfully', {
      userId: req.user!.id,
      traceId: req.headers['x-trace-id']
    });

    sendSuccess(res, null, '2FA has been disabled successfully');
  });

  /**
   * Refresh access token
   */
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    // TODO: Implement refresh token logic
    sendSuccess(res, null, 'Token refresh endpoint - to be implemented');
  });
} 