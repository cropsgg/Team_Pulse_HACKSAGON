'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  SlidersHorizontal,
  MapPin,
  Calendar,
  TrendingUp,
  Heart,
  Users,
  Target,
  Star,
  Globe,
  Zap,
  DollarSign,
  Building2,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Wallet,
  RefreshCw,
  Plus,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useChainId, useAccount } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { parseEther, formatEther } from 'viem';
import { useAuth } from '@/hooks/useAuth';
import { useDonationManager } from '@/hooks/contracts/useDonationManager';
import { useStartupRegistry } from '@/hooks/contracts/useStartupRegistry';
import { useNGORegistry } from '@/hooks/contracts/useNGORegistry';

// Types for stored projects
interface StoredProject {
  id: string;
  type: 'ngo' | 'startup';
  title: string;
  description: string;
  organizationName: string;
  fundingGoal: number;
  category: string;
  location?: string;
  beneficiaryCount?: number;
  txHash: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  createdAt: string;
  userAddress: string;
  profileHash?: string;
  chainId?: number;
  contractAddress?: string;
  // Donation/investment tracking
  totalRaised?: number;
  donationCount?: number;
  investors?: string[];
}

interface DonationRecord {
  id: string;
  projectId: string;
  donorAddress: string;
  amount: number;
  message: string;
  txHash: string;
  timestamp: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
}

const categories = [
  { id: 'all', name: 'All Projects', icon: Globe },
  { id: 'ngo', name: 'NGOs', icon: Heart },
  { id: 'startup', name: 'Startups', icon: TrendingUp },
  { id: 'verified', name: 'Verified', icon: CheckCircle },
];

export default function MarketplacePage() {
  const router = useRouter();
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const { user, isAuthenticated } = useAuth();
  
  // State management
  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<StoredProject[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Donation dialog state
  const [selectedProject, setSelectedProject] = useState<StoredProject | null>(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationMessage, setDonationMessage] = useState('');
  const [isDonating, setIsDonating] = useState(false);

  // Contract hooks
  const { 
    donate, 
    isLoading: isDonationLoading, 
    txHash: donationTxHash,
    isConfirmed: donationConfirmed,
    isError: donationError 
  } = useDonationManager();

  // Network validation
  const isOnSupportedNetwork = chainId === baseSepolia.id;

  // Load projects and donations from localStorage
  useEffect(() => {
    loadStoredData();
  }, []);

  // Filter projects based on category and search
  useEffect(() => {
    let filtered = projects;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'verified') {
        filtered = filtered.filter(p => p.status === 'CONFIRMED');
      } else {
        filtered = filtered.filter(p => p.type === selectedCategory);
      }
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.organizationName.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }
    
    setFilteredProjects(filtered);
  }, [projects, selectedCategory, searchQuery]);

  // Monitor donation confirmations
  useEffect(() => {
    if (donationConfirmed && donationTxHash && selectedProject) {
      toast.success(
        <>
          🎉 Donation confirmed!
          <br />
          <a 
            href={`https://sepolia.basescan.org/tx/${donationTxHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            View TX: {donationTxHash.slice(0, 10)}...{donationTxHash.slice(-6)}
          </a>
        </>,
        { duration: 10000 }
      );
      
      // Save donation record
      saveDonationRecord({
        projectId: selectedProject.id,
        amount: parseFloat(donationAmount),
        message: donationMessage,
        txHash: donationTxHash,
        status: 'CONFIRMED'
      });
      
      // Update project stats
      updateProjectStats(selectedProject.id, parseFloat(donationAmount));
      
      // Reset form
      setSelectedProject(null);
      setDonationAmount('');
      setDonationMessage('');
      setIsDonating(false);
    }
    
    if (donationError) {
      toast.error('Donation failed. Please try again.');
      setIsDonating(false);
    }
  }, [donationConfirmed, donationTxHash, donationError, selectedProject, donationAmount, donationMessage]);

  const loadStoredData = () => {
    setIsLoading(true);
    
    try {
      // Load projects
      const storedProjects = JSON.parse(localStorage.getItem('user-projects') || '[]');
      
      // Add demo projects if no projects exist
      const demoProjects: StoredProject[] = [
        {
          id: 'demo-clean-water-1',
          type: 'ngo',
          title: 'Clean Water for Rural Communities',
          description: 'Building sustainable water infrastructure and providing clean drinking water access to 5,000 people in remote villages across Kenya and Tanzania.',
          organizationName: 'Pure Water Foundation',
          fundingGoal: 25,
          category: 'environment',
          location: 'Kenya & Tanzania',
          beneficiaryCount: 5000,
          txHash: '0xdemo1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          status: 'CONFIRMED',
          createdAt: '2024-01-15T10:00:00Z',
          userAddress: '0xdemo123456789012345678901234567890Demo1234',
          profileHash: 'QmDemo1WaterProject123456789',
          chainId: baseSepolia.id,
          totalRaised: 8.5,
          donationCount: 42,
          investors: []
        },
        {
          id: 'demo-education-tech-1',
          type: 'startup',
          title: 'AI-Powered Learning Platform',
          description: 'Revolutionary EdTech platform using AI to personalize learning experiences for students in developing countries. Already serving 10,000+ students.',
          organizationName: 'EduTech Innovations',
          fundingGoal: 100,
          category: 'education',
          location: 'Global (HQ: Singapore)',
          txHash: '0xdemo2345678901bcdef2345678901bcdef2345678901bcdef2345678901bcdef123',
          status: 'CONFIRMED',
          createdAt: '2024-01-20T14:30:00Z',
          userAddress: '0xdemo234567890123456789012345678901Demo2345',
          profileHash: 'QmDemo2EducationStartup456789',
          chainId: baseSepolia.id,
          totalRaised: 45.2,
          donationCount: 28,
          investors: []
        },
        {
          id: 'demo-ocean-cleanup-1',
          type: 'ngo',
          title: 'Ocean Plastic Cleanup Initiative',
          description: 'Innovative ocean cleanup technology to remove plastic waste from oceans and convert it into useful products. Protecting marine life and cleaning our seas.',
          organizationName: 'Blue Ocean Guardians',
          fundingGoal: 50,
          category: 'environment',
          location: 'Pacific Ocean',
          beneficiaryCount: 1000000,
          txHash: '0xdemo3456789012cdef3456789012cdef3456789012cdef3456789012cdef234567',
          status: 'CONFIRMED',
          createdAt: '2024-01-18T09:15:00Z',
          userAddress: '0xdemo345678901234567890123456789012Demo3456',
          profileHash: 'QmDemo3OceanCleanup789012',
          chainId: baseSepolia.id,
          totalRaised: 23.7,
          donationCount: 67,
          investors: []
        },
        {
          id: 'demo-fintech-inclusion-1',
          type: 'startup',
          title: 'Mobile Banking for the Unbanked',
          description: 'Blockchain-based mobile banking solution providing financial services to 2 billion unbanked people worldwide. Already operational in 5 countries.',
          organizationName: 'InclusiveFin Technologies',
          fundingGoal: 200,
          category: 'fintech',
          location: 'Kenya, Nigeria, India, Brazil, Philippines',
          txHash: '0xdemo4567890123def4567890123def4567890123def4567890123def34567890',
          status: 'CONFIRMED',
          createdAt: '2024-01-12T16:45:00Z',
          userAddress: '0xdemo456789012345678901234567890123Demo4567',
          profileHash: 'QmDemo4FintechInclusion012345',
          chainId: baseSepolia.id,
          totalRaised: 78.9,
          donationCount: 35,
          investors: []
        },
        {
          id: 'demo-rural-healthcare-1',
          type: 'ngo',
          title: 'Mobile Healthcare Clinics',
          description: 'Bringing essential healthcare services to remote rural communities through mobile clinics equipped with telemedicine technology and basic medical supplies.',
          organizationName: 'Rural Health Alliance',
          fundingGoal: 40,
          category: 'healthcare',
          location: 'Rural India & Bangladesh',
          beneficiaryCount: 25000,
          txHash: '0xdemo5678901234ef5678901234ef5678901234ef5678901234ef456789012345',
          status: 'CONFIRMED',
          createdAt: '2024-01-25T11:20:00Z',
          userAddress: '0xdemo567890123456789012345678901234Demo5678',
          profileHash: 'QmDemo5HealthcareProject345678',
          chainId: baseSepolia.id,
          totalRaised: 15.3,
          donationCount: 89,
          investors: []
        },
        {
          id: 'demo-green-energy-1',
          type: 'startup',
          title: 'Solar Power for African Villages',
          description: 'Affordable solar power solutions for off-grid communities in Africa. Our micro-grid technology has already electrified 50+ villages.',
          organizationName: 'African Solar Solutions',
          fundingGoal: 150,
          category: 'cleantech',
          location: 'Sub-Saharan Africa',
          txHash: '0xdemo678901234567890123456789012345678901234567890123456789012345f',
          status: 'CONFIRMED',
          createdAt: '2024-01-10T08:30:00Z',
          userAddress: '0xdemo678901234567890123456789012345Demo6789',
          profileHash: 'QmDemo6SolarEnergyStartup567890',
          chainId: baseSepolia.id,
          totalRaised: 92.4,
          donationCount: 51,
          investors: []
        }
      ];

      // Combine stored projects with demo projects (avoid duplicates)
      const existingIds = new Set(storedProjects.map((p: any) => p.id));
      const newDemoProjects = demoProjects.filter(demo => !existingIds.has(demo.id));
      
      const allProjects = [...storedProjects, ...newDemoProjects].map((project: any) => ({
        ...project,
        totalRaised: project.totalRaised || 0,
        donationCount: project.donationCount || 0,
        investors: project.investors || []
      }));
      
      setProjects(allProjects);
      
      // Load donations
      const storedDonations = JSON.parse(localStorage.getItem('marketplace-donations') || '[]');
      setDonations(storedDonations);
      
      console.log('🎯 Loaded marketplace data:', {
        totalProjects: allProjects.length,
        userProjects: storedProjects.length,
        demoProjects: newDemoProjects.length,
        donations: storedDonations.length
      });
      
    } catch (error) {
      console.error('Error loading stored data:', error);
      toast.error('Error loading marketplace data');
    } finally {
      setIsLoading(false);
    }
  };

  const saveDonationRecord = (donation: Omit<DonationRecord, 'id' | 'donorAddress' | 'timestamp'>) => {
    if (!address) return;
    
    const newDonation: DonationRecord = {
      id: `donation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      donorAddress: address,
      timestamp: new Date().toISOString(),
      ...donation
    };
    
    const existingDonations = JSON.parse(localStorage.getItem('marketplace-donations') || '[]');
    existingDonations.push(newDonation);
    localStorage.setItem('marketplace-donations', JSON.stringify(existingDonations));
    setDonations(existingDonations);
  };

  const updateProjectStats = (projectId: string, donationAmount: number) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          totalRaised: (project.totalRaised || 0) + donationAmount,
          donationCount: (project.donationCount || 0) + 1,
          investors: [...(project.investors || []), address!].filter((addr, index, arr) => arr.indexOf(addr) === index)
        };
      }
      return project;
    });
    
    setProjects(updatedProjects);
    localStorage.setItem('user-projects', JSON.stringify(updatedProjects));
  };

  const handleDonate = async () => {
    if (!selectedProject || !donationAmount || !isAuthenticated || !address) {
      toast.error('Please fill in all fields and connect your wallet');
      return;
    }

    if (!isOnSupportedNetwork) {
      toast.error('Please switch to Base Sepolia network');
      return;
    }

    const amount = parseFloat(donationAmount);
    if (amount <= 0 || amount > 10) {
      toast.error('Donation amount must be between 0.001 and 10 ETH');
      return;
    }

    setIsDonating(true);

    try {
      // For demo purposes, we'll use NGO ID 1 for all NGOs
      // In production, you'd map project IDs to actual NGO IDs from the registry
      const ngoId = selectedProject.type === 'ngo' ? BigInt(1) : BigInt(1);
      
      console.log('💰 Submitting donation:', {
        projectId: selectedProject.id,
        ngoId: ngoId.toString(),
        amount: donationAmount + ' ETH',
        message: donationMessage,
        donor: address
      });

      await donate({
        ngoId,
        message: donationMessage || `Donation to ${selectedProject.title}`,
        value: parseEther(donationAmount),
      });

      // Save pending donation record
      saveDonationRecord({
        projectId: selectedProject.id,
        amount,
        message: donationMessage,
        txHash: 'pending',
        status: 'PENDING'
      });

      toast.success('Donation submitted! Waiting for confirmation...');
      
    } catch (error) {
      console.error('Donation error:', error);
      toast.error(`Donation failed: ${error}`);
      setIsDonating(false);
    }
  };

  const getProjectStats = (project: StoredProject) => {
    const projectDonations = donations.filter(d => d.projectId === project.id && d.status === 'CONFIRMED');
    const totalRaised = projectDonations.reduce((sum, d) => sum + d.amount, 0);
    const donorCount = new Set(projectDonations.map(d => d.donorAddress)).size;
    const progress = Math.round((totalRaised / project.fundingGoal) * 100);
    
    return { totalRaised, donorCount, progress, donations: projectDonations };
  };

  const getStatusBadge = (project: StoredProject) => {
    switch (project.status) {
      case 'CONFIRMED':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'PENDING':
        return <Badge variant="outline" className="text-orange-600 border-orange-600"><RefreshCw className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'FAILED':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <div className="container-wide py-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading marketplace...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="container-wide py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Impact Marketplace</h1>
              <p className="text-lg text-muted-foreground">
                Support verified NGOs and innovative startups through transparent blockchain donations
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Network Status */}
              {isOnSupportedNetwork ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Base Sepolia
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Wrong Network
                </Badge>
              )}
              
              {/* Wallet Status */}
              {isConnected && address ? (
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  <Wallet className="h-3 w-3 mr-1" />
                  {address.slice(0, 6)}...{address.slice(-4)}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  <Wallet className="h-3 w-3 mr-1" />
                  Connect Wallet
                </Badge>
              )}
              
              <Button 
                variant="outline"
                onClick={loadStoredData}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Projects</p>
                    <p className="text-2xl font-bold">{projects.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">NGOs</p>
                    <p className="text-2xl font-bold">{projects.filter(p => p.type === 'ngo').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Startups</p>
                    <p className="text-2xl font-bold">{projects.filter(p => p.type === 'startup').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Verified</p>
                    <p className="text-2xl font-bold">{projects.filter(p => p.status === 'CONFIRMED').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search projects, organizations, or causes..." 
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => router.push('/create/ngo')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add NGO
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/create/startup')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Startup
              </Button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const count = category.id === 'all' 
                ? projects.length 
                : category.id === 'verified'
                ? projects.filter(p => p.status === 'CONFIRMED').length
                : projects.filter(p => p.type === category.id).length;
                
              return (
                <Button
                  key={category.id}
                  variant={category.id === selectedCategory ? 'default' : 'outline'}
                  className="flex items-center gap-2"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                  <Badge variant="secondary" className="ml-1">
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search terms' : 'Be the first to create a project!'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => router.push('/create/ngo')}>
                <Heart className="h-4 w-4 mr-2" />
                Create NGO
              </Button>
              <Button variant="outline" onClick={() => router.push('/create/startup')}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Create Startup
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const stats = getProjectStats(project);
              const isOwn = user?.address && project.userAddress.toLowerCase() === user.address.toLowerCase();
              
              return (
                <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-purple-500/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge variant={project.type === 'ngo' ? 'secondary' : 'default'}>
                        {project.type === 'ngo' ? (
                          <Heart className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        )}
                        {project.type.toUpperCase()}
                      </Badge>
                      {getStatusBadge(project)}
                      {project.id.startsWith('demo-') && (
                        <Badge variant="outline" className="bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-500 text-yellow-800">
                          <Zap className="h-3 w-3 mr-1" />
                          Demo
                        </Badge>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="outline" className="bg-background/80 backdrop-blur">
                        <Users className="h-3 w-3 mr-1" />
                        {stats.donorCount} supporters
                      </Badge>
                    </div>
                    {isOwn && (
                      <div className="absolute bottom-3 left-3">
                        <Badge variant="outline" className="bg-green-100/80 text-green-800 border-green-600">
                          <Star className="h-3 w-3 mr-1" />
                          Your Project
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2 hover:text-foreground transition-colors">
                          {project.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          by {project.organizationName}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {project.description}
                    </p>

                    {/* Funding Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">{stats.totalRaised.toFixed(3)} ETH</span>
                        <span className="text-muted-foreground">{project.fundingGoal} ETH Goal</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(stats.progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{stats.progress}% funded</span>
                        <span>{stats.donorCount} donors</span>
                      </div>
                    </div>

                    {/* Project Meta */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {project.location || 'Global'}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Transaction Hash */}
                    {project.txHash !== 'pending' && (
                      <div className="flex items-center gap-2 mb-4 p-2 bg-muted/50 rounded">
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        <a 
                          href={`https://sepolia.basescan.org/tx/${project.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 underline truncate"
                        >
                          TX: {project.txHash.slice(0, 10)}...{project.txHash.slice(-6)}
                        </a>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            disabled={!isConnected || !isOnSupportedNetwork || project.status !== 'CONFIRMED'}
                            onClick={() => setSelectedProject(project)}
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            {project.type === 'ngo' ? 'Donate' : 'Invest'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>
                              {project.type === 'ngo' ? 'Make a Donation' : 'Make an Investment'}
                            </DialogTitle>
                            <DialogDescription>
                              Support {project.title} by {project.organizationName}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="amount">Amount (ETH)</Label>
                              <Input
                                id="amount"
                                type="number"
                                step="0.001"
                                min="0.001"
                                max="10"
                                placeholder="0.1"
                                value={donationAmount}
                                onChange={(e) => setDonationAmount(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="message">Message (optional)</Label>
                              <Textarea
                                id="message"
                                placeholder="Your message of support..."
                                value={donationMessage}
                                onChange={(e) => setDonationMessage(e.target.value)}
                                rows={3}
                              />
                            </div>
                            <div className="bg-muted p-3 rounded">
                              <p className="text-sm text-muted-foreground">
                                <strong>Network:</strong> Base Sepolia Testnet<br />
                                <strong>Recipient:</strong> {project.organizationName}<br />
                                <strong>Status:</strong> {getStatusBadge(project)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={handleDonate}
                                disabled={isDonating || isDonationLoading || !donationAmount}
                                className="flex-1"
                              >
                                {isDonating || isDonationLoading ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    {project.type === 'ngo' ? 'Donate' : 'Invest'} {donationAmount} ETH
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const stats = getProjectStats(project);
                          toast.info(
                            `📊 ${project.title}\n` +
                            `💰 Raised: ${stats.totalRaised.toFixed(3)} ETH\n` +
                            `👥 Donors: ${stats.donorCount}\n` +
                            `📈 Progress: ${stats.progress}%\n` +
                            `🏷️ Category: ${project.category}\n` +
                            `📍 Location: ${project.location || 'Global'}`,
                            { duration: 8000 }
                          );
                        }}
                      >
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="text-center mt-12">
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => router.push('/create/ngo')}>
              <Heart className="h-4 w-4 mr-2" />
              Launch Your NGO
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/create/startup')}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Launch Your Startup
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Join the transparent funding revolution powered by blockchain technology
          </p>
        </div>
      </div>
    </main>
  );
} 