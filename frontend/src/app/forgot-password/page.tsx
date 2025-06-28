'use client';

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  ArrowLeft, 
  CheckCircle, 
  Clock,
  Sparkles,
  Shield,
  Key
} from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      console.log('Password reset request for:', email);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Helmet>
        <title>Forgot Password - ImpactChain</title>
        <meta name="description" content="Reset your ImpactChain account password securely." />
      </Helmet>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Back to Login */}
          <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Link>

          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="text-center space-y-2">
                <Badge variant="outline" className="mb-4">
                  🔑 Password Reset
                </Badge>
                <h1 className="text-3xl font-bold">Forgot Password?</h1>
                <p className="text-muted-foreground">
                  No worries! Enter your email address and we'll send you a reset link
                </p>
              </div>

              {/* Reset Form */}
              <Card className="border-gray-800">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        We'll send a password reset link to this email address
                      </p>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading || !email}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending Reset Link...</span>
                        </div>
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>
                  </form>

                  {/* Alternative Actions */}
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-700" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>

                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Remember your password?{' '}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                          Sign in
                        </Link>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-primary hover:underline font-medium">
                          Sign up
                        </Link>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold">Check Your Email</h1>
                <p className="text-muted-foreground">
                  We've sent a password reset link to{' '}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>

              <Card className="border-gray-800">
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold">What's next?</h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-primary">1</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Check your email</p>
                          <p>Look for an email from ImpactChain in your inbox</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-primary">2</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Click the reset link</p>
                          <p>The link will expire in 24 hours for security</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-primary">3</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Create new password</p>
                          <p>Choose a strong, unique password for your account</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-xs text-muted-foreground text-center">
                      Didn't receive the email? Check your spam folder or{' '}
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="text-primary hover:underline"
                      >
                        try again
                      </button>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </>
          )}

          {/* Security Notice */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-xs text-muted-foreground bg-gray-800/50 px-3 py-2 rounded-lg">
              <Shield className="h-4 w-4" />
              <span>Secure password reset powered by blockchain technology</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 