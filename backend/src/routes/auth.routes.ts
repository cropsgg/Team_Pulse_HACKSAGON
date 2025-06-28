import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { authenticate } from '@/middleware/auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();
const authController = new AuthController();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 reset attempts per hour
  message: {
    error: 'Too many password reset attempts, please try again later.',
  },
});

// Public routes
router.post('/register', AuthController.validateRegister, authController.register);
router.post('/login', authLimiter, AuthController.validateLogin, authController.login);
router.post('/logout', authController.logout);

// Password reset routes
router.post('/password-reset-request', resetLimiter, AuthController.validatePasswordResetRequest, authController.requestPasswordReset);
router.post('/password-reset', AuthController.validatePasswordReset, authController.resetPassword);

// Email verification routes
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authController.resendEmailVerification);

// Token refresh
router.post('/refresh-token', authController.refreshToken);

// Protected routes - require authentication
router.use(authenticate); // All routes below this middleware require authentication

// Profile routes
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);

// Password change (requires authentication)
router.put('/change-password', AuthController.validatePasswordChange, authController.changePassword);

// 2FA routes
router.post('/enable-2fa', authController.enable2FA);
router.post('/disable-2fa', authController.disable2FA);

export default router; 