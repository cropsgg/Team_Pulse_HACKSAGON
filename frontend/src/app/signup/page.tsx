'use client';

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Github, 
  Chrome,
  Sparkles,
  Shield,
  Zap,
  Building,
  Heart,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

type UserType = 'investor' | 'founder' | 'donor' | 'ngo';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
    description: '',
    agreeToTerms: false,
    subscribeNewsletter: true
  });
  const [isLoading, setIsLoading] = useState(false);

  const userTypes = [
    {
      type: 'investor' as UserType,
      title: 'Investor',
      description: 'Fund promising startups and impact projects',
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      type: 'founder' as UserType,
      title: 'Founder',
      description: 'Launch your startup and get funding',
      icon: Building,
      color: 'text-blue-400'
    },
    {
      type: 'donor' as UserType,
      title: 'Donor',
      description: 'Support charitable causes and NGOs',
      icon: Heart,
      color: 'text-pink-400'
    },
    {
      type: 'ngo' as UserType,
      title: 'NGO',
      description: 'Receive donations for your cause',
      icon: Shield,
      color: 'text-purple-400'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType) {
      alert('Please select your account type');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log('Signup attempt:', { ...formData, userType });
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Helmet>
        <title>Sign Up - ImpactChain</title>
        <meta name="description" content="Join ImpactChain to access transparent funding opportunities and make a positive impact." />
      </Helmet>
  

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6 py-12">
        <div className="w-full max-w-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <Badge variant="outline" className="mb-4">
              🚀 Join the Movement
            </Badge>
            <h1 className="text-3xl font-bold">Create Your Account</h1>
            <p className="text-muted-foreground">
              Join thousands making a positive impact through transparent funding
            </p>
          </div>

          {/* User Type Selection */}
          {!userType && (
            <Card className="border-gray-800">
              <CardHeader>
                <CardTitle className="text-center">Choose Your Account Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {userTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.type}
                        onClick={() => setUserType(type.type)}
                        className="p-6 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors text-left group"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <Icon className={`h-6 w-6 ${type.color}`} />
                          <h3 className="font-semibold text-lg">{type.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          {type.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Signup Form */}
          {userType && (
            <Card className="border-gray-800">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Sign Up</CardTitle>
                  <Badge variant="secondary">
                    {userTypes.find(t => t.type === userType)?.title}
                  </Badge>
                </div>
                <button
                  onClick={() => setUserType(null)}
                  className="text-sm text-primary hover:underline text-left"
                >
                  Change account type
                </button>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Organization Field */}
                  {(userType === 'founder' || userType === 'ngo') && (
                    <div className="space-y-2">
                      <Label htmlFor="organization">
                        {userType === 'founder' ? 'Company Name' : 'Organization Name'}
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="organization"
                          name="organization"
                          type="text"
                          placeholder={userType === 'founder' ? 'Your startup name' : 'Your NGO name'}
                          value={formData.organization}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Description Field */}
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      {userType === 'investor' ? 'Investment Focus' : 
                       userType === 'founder' ? 'About Your Startup' :
                       userType === 'donor' ? 'Causes You Support' : 'Mission Statement'}
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder={`Tell us about your ${userType === 'investor' ? 'investment interests' : 
                                                       userType === 'founder' ? 'startup' :
                                                       userType === 'donor' ? 'preferred causes' : 'mission'}...`}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* Password Fields */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        className="mt-1 rounded border-gray-700 bg-gray-800 text-primary focus:ring-primary"
                        required
                      />
                      <span className="text-sm text-muted-foreground">
                        I agree to the{' '}
                        <Link href="/terms" className="text-primary hover:underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="subscribeNewsletter"
                        checked={formData.subscribeNewsletter}
                        onChange={handleInputChange}
                        className="rounded border-gray-700 bg-gray-800 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-muted-foreground">
                        Subscribe to our newsletter for updates and insights
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Create Account</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full">
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Chrome className="h-4 w-4 mr-2" />
                    Google
                  </Button>
                </div>

                {/* Sign In Link */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:underline font-medium">
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Features */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <Shield className="h-6 w-6 text-gray-400 mx-auto" />
              <div className="text-xs text-muted-foreground">Secure</div>
            </div>
            <div className="space-y-2">
              <Zap className="h-6 w-6 text-gray-400 mx-auto" />
              <div className="text-xs text-muted-foreground">Fast</div>
            </div>
            <div className="space-y-2">
              <CheckCircle className="h-6 w-6 text-gray-400 mx-auto" />
              <div className="text-xs text-muted-foreground">Verified</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 