'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Edit, Calendar, DollarSign, RefreshCw, Heart, TrendingUp, Building2, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useAccount } from 'wagmi';

interface StoredProject {
  id: string;
  title: string;
  type: string;
  organizationName?: string;
  fundingGoal: number;
  currency?: string;
  status: string;
  createdAt: string;
  userAddress?: string;
  txHash?: string;
  creator?: {
    id?: string;
    address?: string;
    name?: string;
  };
  totalRaised?: number;
  donationCount?: number;
  description?: string;
  category?: string;
}

export default function DashboardPage() {
  const [userProjects, setUserProjects] = useState<StoredProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuth();
  const { address } = useAccount();

  const loadProjects = () => {
    try {
      setLoading(true);
      setError(null);
      
      const projects = JSON.parse(localStorage.getItem('user-projects') || '[]');
      console.log('📊 Loaded projects from localStorage:', projects);
      
      // Filter projects for current user if wallet is connected
      let filteredProjects = projects;
      if (address) {
        filteredProjects = projects.filter((project: any) => 
          project.userAddress?.toLowerCase() === address.toLowerCase() ||
          project.creator?.address?.toLowerCase() === address.toLowerCase()
        );
      }
      
      setUserProjects(filteredProjects);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects from storage');
      toast.error('Failed to load your projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [address]);

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case 'PENDING':
        return <Badge variant="outline" className="text-orange-600 border-orange-600"><RefreshCw className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'FAILED':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'ngo' ? (
      <Heart className="h-4 w-4 text-red-600" />
    ) : (
      <TrendingUp className="h-4 w-4 text-blue-600" />
    );
  };

  const formatCurrency = (amount: number, currency?: string) => {
    if (currency === 'ETH') return `${amount} ETH`;
    if (currency === 'USDC') return `$${amount.toLocaleString()} USDC`;
    return `${amount.toLocaleString()} ${currency || 'USD'}`;
  };

  const getProjectCreator = (project: StoredProject) => {
    // Handle different creator data structures
    if (project.creator?.name) {
      return project.creator.name;
    }
    if (project.userAddress) {
      return `${project.userAddress.slice(0, 6)}...${project.userAddress.slice(-4)}`;
    }
    if (project.creator?.address) {
      return `${project.creator.address.slice(0, 6)}...${project.creator.address.slice(-4)}`;
    }
    return 'Unknown Creator';
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container-wide py-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container-wide py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Manage your projects and track their progress
              </p>
              {address && (
                <p className="text-sm text-gray-500 mt-1">
                  Connected: {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={loadProjects}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        {!isAuthenticated && (
          <div className="mb-6">
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-900">Wallet Not Connected</p>
                    <p className="text-sm text-orange-700">Connect your wallet to see your projects and access all features.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/create/startup">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Plus className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Create Startup</h3>
                <p className="text-gray-600 text-sm">Launch your startup funding campaign</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/create/ngo">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Plus className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Create NGO Project</h3>
                <p className="text-gray-600 text-sm">Start a charitable cause</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/explore">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Eye className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Explore Projects</h3>
                <p className="text-gray-600 text-sm">Discover and support causes</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/governance">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Building2 className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Governance</h3>
                <p className="text-gray-600 text-sm">Participate in DAO voting</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">{userProjects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">NGO Projects</p>
                  <p className="text-2xl font-bold">{userProjects.filter(p => p.type === 'ngo').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Startups</p>
                  <p className="text-2xl font-bold">{userProjects.filter(p => p.type === 'startup').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                  <p className="text-2xl font-bold">{userProjects.filter(p => p.status === 'CONFIRMED').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Error Loading Projects</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Your Projects</CardTitle>
            <p className="text-gray-600">
              {userProjects.length === 0 
                ? isAuthenticated 
                  ? "You haven't created any projects yet. Start by creating your first project!"
                  : "Connect your wallet to see your projects"
                : `You have created ${userProjects.length} project${userProjects.length !== 1 ? 's' : ''}`
              }
            </p>
          </CardHeader>
          <CardContent>
            {userProjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Plus className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isAuthenticated ? 'No projects yet' : 'Connect your wallet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {isAuthenticated 
                    ? 'Create your first project to get started' 
                    : 'Connect your wallet to see and manage your projects'
                  }
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/create/startup">
                    <Button>Create Startup</Button>
                  </Link>
                  <Link href="/create/ngo">
                    <Button variant="outline">Create NGO Project</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-6">
                {userProjects.map((project) => (
                  <Card key={project.id} className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            {getTypeIcon(project.type)}
                            <h3 className="text-xl font-semibold text-gray-900">
                              {project.title}
                            </h3>
                            <Badge variant={project.type === 'startup' ? 'default' : 'secondary'}>
                              {project.type === 'startup' ? 'Startup' : 'NGO'}
                            </Badge>
                            {getStatusBadge(project.status)}
                          </div>

                          {project.organizationName && (
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Organization:</strong> {project.organizationName}
                            </p>
                          )}

                          {project.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {project.description}
                            </p>
                          )}

                          <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>Goal: {formatCurrency(project.fundingGoal, project.currency)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                            </div>
                            {project.totalRaised !== undefined && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4" />
                                <span>Raised: {formatCurrency(project.totalRaised, 'ETH')}</span>
                              </div>
                            )}
                          </div>

                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Creator:</span> {getProjectCreator(project)}
                            {project.txHash && project.txHash !== 'pending' && (
                              <a
                                href={`https://sepolia.basescan.org/tx/${project.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-3 text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
                              >
                                View TX <Eye className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 ml-6">
                          <Link href="/explore">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View in Marketplace
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" disabled>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 