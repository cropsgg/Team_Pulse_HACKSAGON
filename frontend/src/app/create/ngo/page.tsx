'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectCreationForm } from '@/components/forms';
import { ProtectedRoute } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Building2, Heart, AlertTriangle, CheckCircle, Zap, FileText, Wallet, Network } from 'lucide-react';
import { toast } from 'sonner';
import { useChainId, useSwitchChain, useAccount } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { useAuth } from '@/hooks/useAuth';
import { useNGORegistry } from '@/hooks/contracts/useNGORegistry';
import { getContractAddresses } from '@/lib/contracts/config';

export default function CreateNGOPage() {
  const router = useRouter();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { address, isConnected } = useAccount();
  const { user, isAuthenticated } = useAuth();
  
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [isTestingRegistration, setIsTestingRegistration] = useState(false);
  
  // Get contract addresses for current chain
  const contracts = getContractAddresses(chainId);
  
  // Network validation
  const isOnSupportedNetwork = chainId === baseSepolia.id;
  const supportedNetworkName = isOnSupportedNetwork ? 'Base Sepolia' : 'Unsupported Network';
  
  // NGO Registry hook for test registration
  const { 
    registerNGO, 
    isLoading: isRegisteringNGO, 
    txHash: ngoTxHash,
    isConfirmed: ngoTxConfirmed,
    isError: ngoTxError,
    error: ngoError 
  } = useNGORegistry();

  const switchToSupportedNetwork = async () => {
    try {
      await switchChain({ chainId: baseSepolia.id });
      toast.success('Switched to Base Sepolia network');
    } catch (error) {
      console.error('Failed to switch network:', error);
      toast.error('Failed to switch network. Please switch manually to Base Sepolia in your wallet.');
    }
  };

  const handleSuccess = (project: any) => {
    toast.success('NGO project created successfully!');
    // Navigate to the project page or dashboard
    router.push(`/project/${project.id || 'new'}`);
  };

  const handleCancel = () => {
    router.back();
  };

  const handleTestRegistration = async () => {
    if (!isAuthenticated || !user?.address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!isOnSupportedNetwork) {
      toast.error('Please switch to Base Sepolia network first');
      return;
    }

    setIsTestingRegistration(true);
    
    try {
      const testNGOData = {
        title: 'Clean Water Initiative',
        description: 'A comprehensive project to provide clean water access to underserved communities in rural areas. Our initiative focuses on building sustainable water infrastructure, conducting water quality testing, and educating communities about water conservation practices.',
        category: 'environment',
        organizationName: 'Global Water Foundation',
        fundingGoal: 50000,
        beneficiaryCount: 1000,
        location: 'Kenya, East Africa'
      };

      // Create a test profile hash (in production, this would be an IPFS hash)
      const profileHash = `test-ngo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('🧪 Testing NGO registration with:', {
        profileHash,
        ngoAddress: user.address,
        testData: testNGOData,
        contractAddress: contracts.NGORegistry,
        chainId,
        network: supportedNetworkName
      });

      // Submit test registration
      await registerNGO({
        profileHash,
        ngoAddress: user.address as `0x${string}`,
      });

      // Store test project in localStorage
      const testProject = {
        id: `test-ngo-${Date.now()}`,
        type: 'ngo',
        ...testNGOData,
        profileHash,
        txHash: 'pending',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        userAddress: user.address,
        chainId,
        contractAddress: contracts.NGORegistry
      };

      const existingProjects = JSON.parse(localStorage.getItem('user-projects') || '[]');
      existingProjects.push(testProject);
      localStorage.setItem('user-projects', JSON.stringify(existingProjects));

      toast.success('Test NGO registration submitted! Check your wallet for confirmation.');
      
    } catch (error) {
      console.error('Test registration error:', error);
      toast.error(`Test registration failed: ${error}`);
    } finally {
      setIsTestingRegistration(false);
    }
  };

  // Monitor test registration confirmations
  useEffect(() => {
    if (ngoTxConfirmed && ngoTxHash) {
      toast.success(
        <>
          🎉 Test NGO registration confirmed!
          <br />
          <a 
            href={`https://sepolia.basescan.org/tx/${ngoTxHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            View TX: {ngoTxHash.slice(0, 10)}...{ngoTxHash.slice(-6)}
          </a>
        </>,
        { duration: 10000 }
      );
    }
    
    if (ngoTxError && ngoError) {
      toast.error(`Test registration failed: ${ngoError}`);
    }
  }, [ngoTxConfirmed, ngoTxHash, ngoTxError, ngoError]);

  return (
    <ProtectedRoute requiredPermissions={['create_ngo_project']}>
      <main className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="container-wide py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="text-gray-300 hover:text-gray-100 hover:bg-gray-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Heart className="h-5 w-5 text-gray-300" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-100">Create NGO Project</h1>
                    <p className="text-gray-400">Launch your charitable initiative on CharityChain</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Network Status */}
                {isOnSupportedNetwork ? (
                  <Badge variant="outline" className="text-gray-300 border-gray-600 bg-gray-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {supportedNetworkName}
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-red-400 bg-red-900/20 border-red-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Wrong Network
                  </Badge>
                )}
                
                {/* Wallet Status */}
                {isConnected && address ? (
                  <Badge variant="outline" className="text-gray-300 border-gray-600 bg-gray-800">
                    <Wallet className="h-3 w-3 mr-1" />
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-orange-400 border-orange-700 bg-orange-900/20">
                    <Wallet className="h-3 w-3 mr-1" />
                    Not Connected
                  </Badge>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Building2 className="h-4 w-4" />
                  <span>CharityChain Platform</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Network Warning Banner */}
        {!isOnSupportedNetwork && (
          <div className="bg-orange-900/20 border-b border-orange-800">
            <div className="container-wide py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                  <div>
                    <p className="text-sm font-medium text-orange-200">
                      Please switch to Base Sepolia network
                    </p>
                    <p className="text-xs text-orange-300">
                      NGO registration requires Base Sepolia testnet for blockchain transactions
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={switchToSupportedNetwork}
                  className="text-orange-400 border-orange-700 hover:bg-orange-900/30"
                >
                  <Network className="h-4 w-4 mr-2" />
                  Switch Network
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Ready Status Banner */}
        {isOnSupportedNetwork && isConnected && isAuthenticated && (
          <div className="bg-gray-800/50 border-b border-gray-700">
            <div className="container-wide py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-gray-300" />
                  <div>
                    <p className="text-sm font-medium text-gray-200">
                      Ready for NGO Registration
                    </p>
                    <p className="text-xs text-gray-400">
                      Connected to Base Sepolia • Contract: {contracts.NGORegistry?.slice(0, 10)}...{contracts.NGORegistry?.slice(-6)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestRegistration}
                    disabled={isTestingRegistration || isRegisteringNGO}
                    className="text-gray-300 border-gray-600 hover:bg-gray-700"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {isTestingRegistration || isRegisteringNGO ? 'Testing...' : 'Test Registration'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDebugInfo(!showDebugInfo)}
                    className="text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                  >
                    Debug
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info Panel */}
        {showDebugInfo && (
          <div className="bg-gray-800 border-b border-gray-700">
            <div className="container-wide py-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-100">Debug Information</CardTitle>
                  <CardDescription className="text-gray-400">Network and contract status for NGO registration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-gray-300">
                      <p><strong>Chain ID:</strong> {chainId}</p>
                      <p><strong>Network:</strong> {supportedNetworkName}</p>
                      <p><strong>Wallet:</strong> {address || 'Not connected'}</p>
                      <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="text-gray-300">
                      <p><strong>NGO Registry:</strong> {contracts.NGORegistry || 'Not available'}</p>
                      <p><strong>Network Valid:</strong> {isOnSupportedNetwork ? 'Yes' : 'No'}</p>
                      <p><strong>TX Hash:</strong> {ngoTxHash || 'None'}</p>
                      <p><strong>TX Confirmed:</strong> {ngoTxConfirmed ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="container-wide py-8">
          <div className="max-w-4xl mx-auto">
            {/* Info Banner */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-gray-300 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-100">Creating an NGO Project</h3>
                  <p className="text-sm text-gray-300 mt-1">
                    Your NGO will be registered on the blockchain for transparent and verifiable operations. 
                    Once registered, you can receive donations and track impact metrics on-chain. 
                    Make sure to provide complete and accurate information.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // This would trigger the ProjectCreationForm to populate with template data
                        toast.info('Template data loaded! Scroll down to see the form.');
                      }}
                      className="text-gray-300 border-gray-600 hover:bg-gray-700"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                    <span className="text-xs text-gray-400">Quick start with sample NGO data</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Creation Form */}
            <ProjectCreationForm
              projectType="ngo"
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              className="bg-gray-800 shadow-sm border border-gray-700"
            />
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gray-800 border-t border-gray-700 mt-12">
          <div className="container-wide py-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-semibold text-gray-100 mb-6 text-center">
                Why Register Your NGO on Blockchain?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Heart className="h-6 w-6 text-gray-300" />
                  </div>
                  <h3 className="font-medium text-gray-100 mb-2">Impact Focused</h3>
                  <p className="text-sm text-gray-400">
                    Track and verify your social impact metrics on-chain. Show donors exactly how their contributions make a difference.
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Building2 className="h-6 w-6 text-gray-300" />
                  </div>
                  <h3 className="font-medium text-gray-100 mb-2">Transparent</h3>
                  <p className="text-sm text-gray-400">
                    All donations and fund usage are recorded on blockchain, providing complete transparency to your supporters.
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-gray-300" />
                  </div>
                  <h3 className="font-medium text-gray-100 mb-2">Verified</h3>
                  <p className="text-sm text-gray-400">
                    Blockchain verification builds trust with donors and ensures your NGO meets platform standards.
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
