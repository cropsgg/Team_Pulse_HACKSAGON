'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectCreationForm } from '@/components/forms';
import { ProtectedRoute } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Rocket, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useChainId, useSwitchChain, useAccount } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { useStartupRegistry } from '@/hooks/contracts/useStartupRegistry';
import type { Address } from 'viem';

export default function CreateStartupPage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { registerStartup, isLoading: isRegistering } = useStartupRegistry();

  // Network validation
  const isOnBaseSepolia = chainId === baseSepolia.id;

  const handleSwitchToBaseSepolia = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first.');
      return;
    }

    try {
      await switchChain({ chainId: baseSepolia.id });
      toast.success('Switched to Base Sepolia network');
    } catch (error) {
      console.error('Failed to switch network:', error);
      toast.error('Failed to switch network. Please switch manually to Base Sepolia in your wallet.');
    }
  };

  const testStartupRegistration = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first.');
      return;
    }

    if (!isOnBaseSepolia) {
      toast.error('Please switch to Base Sepolia network first.');
      return;
    }

    try {
      const result = await registerStartup({
        founder: address as Address,
        valuationHash: `test-startup-${Date.now()}`,
        equityToken: '0x0000000000000000000000000000000000000000' as Address,
        targetFunding: BigInt(100000 * 1e18), // 100,000 ETH target
      });

      if (result?.success) {
        toast.success(
          `Test startup registered successfully! Transaction: ${result.txHash?.slice(0, 10)}...`,
          { duration: 10000 }
        );
      }
    } catch (error) {
      console.error('Startup registration test failed:', error);
      toast.error('Test registration failed. Please try again.');
    }
  };

  const handleSuccess = (project: any) => {
    toast.success('Startup project created successfully!');
    // Navigate to the project page or dashboard
    router.push(`/project/${project.id || 'new'}`);
  };

  const handleCancel = () => {
    router.back();
  };

  const fillTemplateData = () => {
    toast.success('Template feature coming soon! For now, please fill out the form manually.');
    // In a full implementation, this would pass template data to the ProjectCreationForm
  };

  return (
    <ProtectedRoute requiredPermissions={['create_startup_project']}>
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container-wide py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Rocket className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Startup</h1>
                    <p className="text-gray-600">Launch your venture on ImpactChain</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <TrendingUp className="h-4 w-4" />
                <span>ImpactChain Platform</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container-wide py-8">
          <div className="max-w-4xl mx-auto">
            {/* Network Warning */}
            {isConnected && !isOnBaseSepolia && (
              <Card className="mb-6 border-red-500/30 bg-red-500/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-red-500">Wrong Network Detected</h3>
                        <p className="text-sm text-red-300 mt-1">
                          You're connected to the wrong network. Please switch to <strong>Base Sepolia</strong> to register your startup on the blockchain.
                        </p>
                        <p className="text-xs text-red-400 mt-1">
                          Current network: {chainId === 8453 ? 'Base Mainnet' : `Chain ID ${chainId}`}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      onClick={handleSwitchToBaseSepolia}
                    >
                      Switch to Base Sepolia
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Base Sepolia Ready Banner */}
            {isConnected && isOnBaseSepolia && (
              <Card className="mb-6 border-green-500/30 bg-green-500/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <h3 className="font-semibold text-green-600">Ready for Blockchain Registration! 🚀</h3>
                        <p className="text-sm text-green-700 mt-1">
                          You're connected to Base Sepolia testnet. Your startup registration will be recorded on the blockchain.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-500/30 text-green-600 hover:bg-green-500/10"
                      onClick={testStartupRegistration}
                      disabled={isRegistering}
                    >
                      {isRegistering ? 'Testing...' : 'Test Registration'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <Rocket className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-blue-900">Creating a Startup Project</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Your startup will be reviewed by our investment committee. 
                    Once approved, accredited investors will be able to view and invest in your venture. 
                    Provide comprehensive business information for the best results.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-500/30 text-blue-600 hover:bg-blue-50"
                  onClick={fillTemplateData}
                >
                  Use Template
                </Button>
              </div>
            </div>

            {/* Project Creation Form */}
            <ProjectCreationForm
              projectType="startup"
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              className="bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white border-t border-gray-200 mt-12">
          <div className="container-wide py-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Rocket className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Innovation</h3>
                  <p className="text-sm text-gray-600">
                    Showcase your unique value proposition and how you're solving real problems.
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Growth Potential</h3>
                  <p className="text-sm text-gray-600">
                    Demonstrate clear market opportunity and scalable business model.
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Investment Ready</h3>
                  <p className="text-sm text-gray-600">
                    Provide financial projections and clear use of funds for investor confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
} 