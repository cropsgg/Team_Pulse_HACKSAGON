'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Eye, EyeOff, Mail, Lock, User, Wallet, 
  ArrowRight, Heart, Shield, Globe, CheckCircle, 
  AlertCircle 
} from 'lucide-react';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  walletAddress: string;
  acceptTerms: boolean;
}

export default function SignupPage() {
  const router = useRouter();
  const { signUp, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    walletAddress: '',
    acceptTerms: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Calculate password strength
  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    setPasswordStrength(strength);
  }, [formData.password]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 50) {
      newErrors.username = 'Username must be less than 50 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength < 3) {
      newErrors.password = 'Password is too weak. Include uppercase, lowercase, numbers, and symbols.';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Wallet address validation (optional but validate format if provided)
    if (formData.walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(formData.walletAddress)) {
      newErrors.walletAddress = 'Please enter a valid Ethereum wallet address';
    }
    
    // Terms acceptance
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const result = await signUp(
        formData.username,
        formData.email,
        formData.password,
        formData.walletAddress || undefined
      );
      
      if (result.success) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charity-50 via-white to-impact-50 dark:from-gray-900 dark:via-gray-800 dark:to-impact-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-impact-200/20 dark:bg-impact-600/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-charity-200/20 dark:bg-charity-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-gradient-to-r from-impact-100/10 to-charity-100/10 dark:from-impact-800/10 dark:to-charity-800/10 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:flex-1 flex-col justify-center px-8 xl:px-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-md"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-impact-500 to-charity-500 rounded-2xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-impact-600 to-charity-600 bg-clip-text text-transparent">
                ImpactChain
              </h1>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Join the charity revolution
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Create your account and start making transparent, verifiable donations that create real impact.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-impact-100 dark:bg-impact-900 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-impact-600 dark:text-impact-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300">100% transparent donations</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-charity-100 dark:bg-charity-900 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-charity-600 dark:text-charity-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300">Blockchain-secured transactions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-impact-100 dark:bg-impact-900 rounded-lg flex items-center justify-center">
                  <Globe className="w-4 h-4 text-impact-600 dark:text-impact-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300">Real-time impact tracking</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-12 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 dark:border-gray-700/20 shadow-2xl">
              <CardHeader className="space-y-1 pb-6">
                <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-impact-500 to-charity-500 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-impact-600 to-charity-600 bg-clip-text text-transparent">
                    ImpactChain
                  </h1>
                </div>
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
                  Create account
                </h2>
                <p className="text-center text-gray-600 dark:text-gray-400">
                  Start your impact journey today
                </p>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-4">
                    <div>
                      <Input
                        type="text"
                        placeholder="Choose a username"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        error={errors.username}
                        leftIcon={<User className="w-4 h-4" />}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        error={errors.email}
                        leftIcon={<Mail className="w-4 h-4" />}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        error={errors.password}
                        leftIcon={<Lock className="w-4 h-4" />}
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                        disabled={isLoading}
                      />
                      {formData.password && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                style={{ width: `${(passwordStrength / 5) * 100}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium ${
                              passwordStrength <= 2 ? 'text-red-500' : 
                              passwordStrength <= 3 ? 'text-yellow-500' : 'text-green-500'
                            }`}>
                              {getPasswordStrengthText()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        error={errors.confirmPassword}
                        leftIcon={<Lock className="w-4 h-4" />}
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <Input
                        type="text"
                        placeholder="Wallet address (optional)"
                        value={formData.walletAddress}
                        onChange={(e) => handleInputChange('walletAddress', e.target.value)}
                        error={errors.walletAddress}
                        leftIcon={<Wallet className="w-4 h-4" />}
                        disabled={isLoading}
                        description="Connect your wallet to enable blockchain donations"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                      className="mt-1 w-4 h-4 text-charity-600 border-gray-300 rounded focus:ring-charity-500"
                      disabled={isLoading}
                    />
                    <label htmlFor="acceptTerms" className="text-sm text-gray-600 dark:text-gray-400">
                      I agree to the{' '}
                      <Link href="/terms" className="text-charity-600 hover:text-charity-700 dark:text-charity-400">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-charity-600 hover:text-charity-700 dark:text-charity-400">
                        Privacy Policy
                      </Link>
                    </label>
                    {errors.acceptTerms && (
                      <div className="flex items-center gap-1 text-red-500 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.acceptTerms}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="impact"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                    loading={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create account'}
                    {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link
                      href="/login"
                      className="text-impact-600 hover:text-impact-700 dark:text-impact-400 dark:hover:text-impact-300 font-medium"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 