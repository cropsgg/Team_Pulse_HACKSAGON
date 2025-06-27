'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Heart, Shield, Globe } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const result = await signIn(formData.email, formData.password);
      
      if (result.success) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charity-50 via-white to-impact-50 dark:from-gray-900 dark:via-gray-800 dark:to-charity-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-charity-200/20 dark:bg-charity-600/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-impact-200/20 dark:bg-impact-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-charity-100/10 to-impact-100/10 dark:from-charity-800/10 dark:to-impact-800/10 rounded-full blur-3xl animate-pulse-glow" />
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
              <div className="w-12 h-12 bg-gradient-to-br from-charity-500 to-impact-500 rounded-2xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-charity-600 to-impact-600 bg-clip-text text-transparent">
                ImpactChain
              </h1>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome back to the future of charity
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Sign in to continue making a positive impact through transparent, blockchain-powered donations.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-charity-100 dark:bg-charity-900 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-charity-600 dark:text-charity-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300">Secure blockchain transactions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-impact-100 dark:bg-impact-900 rounded-lg flex items-center justify-center">
                  <Globe className="w-4 h-4 text-impact-600 dark:text-impact-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300">Global impact tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-charity-100 dark:bg-charity-900 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-charity-600 dark:text-charity-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300">AI-powered recommendations</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-12 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 dark:border-gray-700/20 shadow-2xl">
              <CardHeader className="space-y-1 pb-8">
                <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-charity-500 to-impact-500 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-charity-600 to-impact-600 bg-clip-text text-transparent">
                    ImpactChain
                  </h1>
                </div>
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
                  Sign in
                </h2>
                <p className="text-center text-gray-600 dark:text-gray-400">
                  Continue your impact journey
                </p>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
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
                        placeholder="Enter your password"
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
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-charity-600 hover:text-charity-700 dark:text-charity-400 dark:hover:text-charity-300"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    variant="charity"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                    loading={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                    {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link
                      href="/signup"
                      className="text-charity-600 hover:text-charity-700 dark:text-charity-400 dark:hover:text-charity-300 font-medium"
                    >
                      Sign up
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