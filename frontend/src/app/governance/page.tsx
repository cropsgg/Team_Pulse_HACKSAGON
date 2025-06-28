'use client';

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Vote, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  MessageCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Loader2,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { useAccount, useChainId } from 'wagmi';
import { useImpactGovernor } from '@/hooks/contracts/useImpactGovernor';
import { toast } from '@/hooks/use-toast';
import { getContractAddresses } from '@/lib/contracts/config';
import type { Address } from 'viem';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';


const proposals = [
  {
    id: 1,
    title: 'Increase Funding Threshold for Startups',
    description: 'Proposal to increase the maximum funding threshold for startup projects from ₹50L to ₹1Cr to accommodate larger scale ventures.',
    author: 'ImpactChain Foundation',
    status: 'active',
    votes: { for: 1247, against: 234, abstain: 45 },
    totalVotes: 1526,
    timeLeft: '3 days',
    category: 'Policy',
    minVotes: 2000,
    created: '2024-01-15'
  },
  {
    id: 2,
    title: 'New AI Evaluation Criteria',
    description: 'Implement enhanced AI evaluation criteria including environmental impact assessment and social sustainability scoring.',
    author: 'Tech Committee',
    status: 'active',
    votes: { for: 892, against: 156, abstain: 78 },
    totalVotes: 1126,
    timeLeft: '5 days',
    category: 'Technology',
    minVotes: 1500,
    created: '2024-01-12'
  },
  {
    id: 3,
    title: 'Charity Verification Process Update',
    description: 'Streamline the charity verification process to reduce approval time from 14 days to 7 days while maintaining security standards.',
    author: 'Governance Council',
    status: 'passed',
    votes: { for: 2156, against: 345, abstain: 123 },
    totalVotes: 2624,
    timeLeft: 'Ended',
    category: 'Process',
    minVotes: 2000,
    created: '2024-01-08'
  },
  {
    id: 4,
    title: 'Treasury Allocation for Marketing',
    description: 'Allocate 2% of treasury funds for marketing and community outreach initiatives to increase platform adoption.',
    author: 'Marketing Committee',
    status: 'rejected',
    votes: { for: 678, against: 1567, abstain: 234 },
    totalVotes: 2479,
    timeLeft: 'Ended',
    category: 'Finance',
    minVotes: 2000,
    created: '2024-01-05'
  }
];

const governanceStats = [
  { label: 'Total Proposals', value: '47', icon: Vote },
  { label: 'Active Voters', value: '3.2K', icon: Users },
  { label: 'Total Votes Cast', value: '156K', icon: CheckCircle },
  { label: 'Proposal Success Rate', value: '73%', icon: TrendingUp }
];

export default function GovernancePage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contracts = getContractAddresses(chainId);
  const { 
    castVote, 
    castVoteWithReason,
    propose,
    userVotingPower,
    hasVoted,
    isLoading: isGovernanceLoading,
    quorum,
    votingDelay,
    votingPeriod,
    proposalThreshold
  } = useImpactGovernor();

  // State for real proposals from blockchain
  const [realProposals, setRealProposals] = useState<any[]>([]);
  const [isLoadingProposals, setIsLoadingProposals] = useState(false);

  // Voting state management
  const [votingStates, setVotingStates] = useState<Record<number, {
    isVoting: boolean;
    hasUserVoted: boolean;
  }>>({});

  // Dialog state for voting with reason
  const [voteDialog, setVoteDialog] = useState<{
    isOpen: boolean;
    proposalId: number | null;
    support: number | null;
    reason: string;
  }>({
    isOpen: false,
    proposalId: null,
    support: null,
    reason: ''
  });

  // Fetch real proposals from blockchain
  const fetchRealProposals = async () => {
    if (!isConnected || chainId !== baseSepolia.id) return;
    
    setIsLoadingProposals(true);
    try {
      // Note: This is a simplified example. In a real implementation,
      // you would fetch proposals using graph queries or contract events
      console.log('Fetching real proposals from blockchain...');
      
      // For now, we'll show a message that real proposals will appear here
      // In a full implementation, you'd use:
      // - The Graph Protocol to query ProposalCreated events
      // - Direct contract calls to get proposal details
      // - IPFS to fetch proposal descriptions
      
      setRealProposals([]); // Will be populated with real blockchain data
    } catch (error) {
      console.error('Error fetching real proposals:', error);
    } finally {
      setIsLoadingProposals(false);
    }
  };

  // Fetch proposals on component mount and when network changes
  useEffect(() => {
    fetchRealProposals();
  }, [isConnected, chainId]);

  // Combine demo proposals with real proposals
  const allProposals = [
    ...realProposals, // Real proposals from blockchain first
    ...proposals // Demo proposals for reference
  ];

  // Handle voting with blockchain transaction
  const handleVote = async (proposalId: number, support: number, reason?: string) => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to vote.",
        variant: "destructive"
      });
      return;
    }

    // Check if this is a demo proposal (IDs 1-4 without blockchain flag)
    const proposal = allProposals.find(p => p.id === proposalId);
    const isDemoProposal = proposalId <= 4 && !proposal?.isBlockchainProposal;
    
    if (isDemoProposal) {
      toast({
        title: "Demo Proposal",
        description: "This is a demonstration proposal. Use 'Create Test Proposal' or 'Create Proposal' to make real blockchain proposals you can vote on.",
        variant: "destructive"
      });
      return;
    }

    // Set loading state for this proposal
    setVotingStates(prev => ({
      ...prev,
      [proposalId]: { ...prev[proposalId], isVoting: true }
    }));

    try {
      console.log(`Attempting to vote on proposal ${proposalId} with support ${support}`);
      
      let result;
      if (reason && reason.trim()) {
        console.log('Voting with reason:', reason.trim());
        // Vote with reason
        result = await castVoteWithReason({
          proposalId: BigInt(proposalId),
          support,
          reason: reason.trim()
        });
      } else {
        console.log('Simple vote');
        // Simple vote
        result = await castVote({
          proposalId: BigInt(proposalId),
          support
        });
      }

      console.log('Vote result:', result);

      if (result?.success) {
        const voteTypes = ['Against', 'For', 'Abstain'];
        toast({
          title: "Vote Cast Successfully!",
          description: `Your vote "${voteTypes[support]}" has been recorded on the blockchain. Transaction: ${result.txHash?.slice(0, 10)}...`,
        });

        // Update local state to reflect user has voted
        setVotingStates(prev => ({
          ...prev,
          [proposalId]: { isVoting: false, hasUserVoted: true }
        }));
      } else {
        throw new Error(result?.error || 'Transaction failed');
      }
    } catch (error) {
      console.error('Voting error:', error);
      let errorMessage = "Failed to cast vote. Please try again.";
      
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        if (error.message.includes('User rejected')) {
          errorMessage = "Transaction was cancelled by user.";
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = "Insufficient funds for transaction fees.";
        } else if (error.message.includes('governor: proposal not found')) {
          errorMessage = "This proposal does not exist on the blockchain. Create a real proposal first.";
        } else if (error.message.includes('governor: vote not currently active')) {
          errorMessage = "Voting period for this proposal has ended or not started.";
        } else if (error.message.includes('governor: vote already cast')) {
          errorMessage = "You have already voted on this proposal.";
        } else {
          errorMessage = error.message.length > 100 ? error.message.substring(0, 100) + '...' : error.message;
        }
      }
      
      toast({
        title: "Voting Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      // Clear loading state
      setVotingStates(prev => ({
        ...prev,
        [proposalId]: { ...prev[proposalId], isVoting: false }
      }));
    }
  };

  // Handle voting with reason dialog
  const handleVoteWithReasonDialog = (proposalId: number, support: number) => {
    setVoteDialog({
      isOpen: true,
      proposalId,
      support,
      reason: ''
    });
  };

  const submitVoteWithReason = async () => {
    if (voteDialog.proposalId !== null && voteDialog.support !== null) {
      await handleVote(voteDialog.proposalId, voteDialog.support, voteDialog.reason);
      setVoteDialog({
        isOpen: false,
        proposalId: null,
        support: null,
        reason: ''
      });
    }
  };

  // Enhanced voting power display
  const votingPowerDisplay = {
    totalTokens: userVotingPower?.toString() || '0',
    votingPower: userVotingPower?.toString() || '0',
  delegatedTo: null,
  delegatedFrom: 0
};

  const { switchChain } = useSwitchChain();

  const handleSwitchChain = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to switch network.",
        variant: "destructive"
      });
      return;
    }

    try {
      await switchChain({ chainId: baseSepolia.id });
      toast({
        title: "Network Switched",
        description: "You are now connected to Base Sepolia.",
      });
    } catch (error) {
      console.error('Network switching error:', error);
      toast({
        title: "Network Switching Failed",
        description: error instanceof Error ? error.message : "Failed to switch network.",
        variant: "destructive"
      });
    }
  };

  return (
    <main className="min-h-screen">

      {/* Network Warning */}
      {chainId !== baseSepolia.id && (
        <section className="py-4 bg-red-900/20 border-b border-red-500/20">
          <div className="container-wide">
            <Card className="border-red-500/30 bg-red-500/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-500">Wrong Network Detected</h3>
                      <p className="text-sm text-red-300 mt-1">
                        You're connected to the wrong network. Please switch to <strong>Base Sepolia</strong> to use the governance features.
                      </p>
                      <p className="text-xs text-red-400 mt-1">
                        Current network: {chainId === 8453 ? 'Base Mainnet' : `Chain ID ${chainId}`}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={handleSwitchChain}
                  >
                    Switch to Base Sepolia
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container-wide text-center">
          <Badge variant="outline" className="mb-4 border-gray-600 text-gray-300">
            🗳️ DAO Governance
          </Badge>
          <h1 className="text-fluid-5xl font-bold mb-6">
            Shape the Future of{' '}
            <span className="bg-gradient-to-r from-gray-300 via-white to-gray-200 bg-clip-text text-transparent">
              Transparent Funding
            </span>
          </h1>
          <p className="text-fluid-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Participate in democratic governance, vote on proposals, and help build a more 
            accountable and transparent funding ecosystem for everyone.
          </p>
          <Link href="#proposals">
            <Button size="lg" className="bg-gray-800 hover:bg-gray-700 text-white border-gray-600">
              View Proposals <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Governance Stats */}
      <section className="py-12 bg-gray-900/50">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {governanceStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center p-6 bg-gray-800/50 border-gray-700">
                  <Icon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Voting Power */}
      <section className="py-12">
        <div className="container-wide">
          <Card className="p-6 bg-gray-800/30 border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Your Voting Power</h2>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                Delegate Votes
              </Button>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-xl font-bold text-white">{votingPowerDisplay.totalTokens}</div>
                <div className="text-sm text-gray-400">Total Tokens</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{votingPowerDisplay.votingPower}</div>
                <div className="text-sm text-gray-400">Voting Power</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-400">
                  {votingPowerDisplay.delegatedTo || 'None'}
                </div>
                <div className="text-sm text-gray-400">Delegated To</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{votingPowerDisplay.delegatedFrom}</div>
                <div className="text-sm text-gray-400">Delegated From</div>
              </div>
            </div>
            
            {/* Governance Parameters */}
            <div className="mt-6 pt-6 border-t border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-4">Governance Parameters</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Voting Delay:</span>
                  <span className="text-white">{votingDelay?.toString() || '1'} blocks</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Voting Period:</span>
                  <span className="text-white">{votingPeriod?.toString() || '45818'} blocks</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Quorum Required:</span>
                  <span className="text-white">{quorum?.toString() || '4'}% of supply</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Proposals */}
      <section id="proposals" className="py-20">
        <div className="container-wide">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-fluid-3xl font-bold mb-4 text-white">Governance Proposals</h2>
              <p className="text-fluid-lg text-gray-400">
                Create and vote on proposals that shape the future of our platform
              </p>
            </div>
            <div className="flex gap-2">
            <Link href="/create/proposal">
              <Button className="bg-gray-800 hover:bg-gray-700 text-white">Create Proposal</Button>
            </Link>
              <Button 
                variant="outline" 
                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                onClick={async () => {
                  if (!isConnected) {
                    toast({
                      title: "Wallet Not Connected",
                      description: "Please connect your wallet to create a test proposal.",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  try {
                    // Create a meaningful test proposal with default data
                    const testProposalDescription = `# Test Proposal: Platform Fee Adjustment

## Summary
This is a test proposal to verify the governance system is working correctly. It proposes adjusting the platform fee structure.

## Motivation
- Test the voting mechanism
- Verify proposal creation works
- Demonstrate governance functionality

## Specification
- Platform fee: 2.5% → 2.0%
- Implementation: Immediate
- Duration: Permanent

## Rationale
Lower fees will attract more users while maintaining platform sustainability.

Created automatically by: ${address}
Timestamp: ${new Date().toISOString()}`;

                    const result = await propose({
                      targets: [contracts.FeeManager as Address],
                      values: [BigInt(0)],
                      calldatas: ['0x' as `0x${string}`],
                      description: testProposalDescription
                    });
                    
                    if (result?.success) {
                      toast({
                        title: "Test Proposal Created Successfully! 🎉",
                        description: `Your test proposal has been submitted to the blockchain. Transaction: ${result.txHash?.slice(0, 10)}...`,
                      });
                      
                      // Optionally refresh the page to show new proposals
                      setTimeout(() => {
                        window.location.reload();
                      }, 2000);
                    }
                  } catch (error) {
                    console.error('Test proposal error:', error);
                    let errorMessage = "Failed to create test proposal.";
                    
                    if (error instanceof Error) {
                      if (error.message.includes('User rejected')) {
                        errorMessage = "Transaction was cancelled by user.";
                      } else if (error.message.includes('insufficient funds')) {
                        errorMessage = "Insufficient funds for transaction fees.";
                      } else {
                        errorMessage = error.message.length > 100 ? error.message.substring(0, 100) + '...' : error.message;
                      }
                    }
                    
                    toast({
                      title: "Test Proposal Failed",
                      description: errorMessage,
                      variant: "destructive"
                    });
                  }
                }}
                disabled={isGovernanceLoading}
              >
                {isGovernanceLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Test Proposal'
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {isLoadingProposals && (
              <Card className="p-6 bg-gray-800/30 border-gray-700">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  <span className="text-gray-400">Loading proposals from blockchain...</span>
                </div>
              </Card>
            )}

            {realProposals.length === 0 && !isLoadingProposals && isConnected && (
              <Card className="p-6 bg-blue-500/5 border-blue-500/20">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">Ready for Real Proposals! 🎉</h3>
                  <p className="text-gray-400 mb-4">
                    Your governance system is now fully functional on Base Sepolia. 
                    Create real proposals using the buttons above and they will appear here.
                  </p>
                  <p className="text-sm text-gray-500">
                    Real proposals will be fetched from the blockchain and displayed with full voting functionality.
                  </p>
                </div>
              </Card>
            )}

            {allProposals.map((proposal) => {
              const totalVotes = proposal.votes.for + proposal.votes.against + proposal.votes.abstain;
              const forPercentage = (proposal.votes.for / totalVotes) * 100;
              const againstPercentage = (proposal.votes.against / totalVotes) * 100;
              const abstainPercentage = (proposal.votes.abstain / totalVotes) * 100;
              
              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'active': return 'bg-gray-600';
                  case 'passed': return 'bg-gray-500';
                  case 'rejected': return 'bg-gray-700';
                  default: return 'bg-gray-800';
                }
              };

              const getStatusIcon = (status: string) => {
                switch (status) {
                  case 'active': return <Clock className="h-4 w-4" />;
                  case 'passed': return <CheckCircle className="h-4 w-4" />;
                  case 'rejected': return <XCircle className="h-4 w-4" />;
                  default: return <AlertCircle className="h-4 w-4" />;
                }
              };

              // Check if this is a demo proposal (from the original demo list)
              const isDemoProposal = proposal.id <= 4 && !proposal.isBlockchainProposal;

              return (
                <div key={proposal.id}>
                  {/* Add section header for first demo proposal */}
                  {isDemoProposal && proposal.id === 1 && (
                    <div className="mb-6 mt-8">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-px bg-gray-600 flex-1"></div>
                        <Badge variant="outline" className="border-gray-500 text-gray-400">
                          Demo Proposals (For Reference)
                        </Badge>
                        <div className="h-px bg-gray-600 flex-1"></div>
                      </div>
                      <p className="text-sm text-gray-500 text-center">
                        The proposals below are examples showing the interface. Real proposals will appear above this section.
                      </p>
                    </div>
                  )}
                  
                  <Card className="p-6 bg-gray-800/30 border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="border-gray-600 text-gray-300">{proposal.category}</Badge>
                        <Badge variant="outline" className={`${getStatusColor(proposal.status)} text-white border-gray-600`}>
                          {getStatusIcon(proposal.status)}
                          <span className="ml-1 capitalize">{proposal.status}</span>
                        </Badge>
                          {isDemoProposal && (
                            <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                              Demo
                            </Badge>
                          )}
                        {proposal.status === 'active' && (
                          <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                            <Clock className="h-3 w-3 mr-1" />
                            {proposal.timeLeft} left
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-white">{proposal.title}</h3>
                      <p className="text-gray-400 mb-4">{proposal.description}</p>
                      <div className="text-sm text-gray-500">
                        Proposed by {proposal.author} • {proposal.created}
                      </div>
                    </div>
                  </div>

                  {/* Voting Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2 text-gray-300">
                      <span>Voting Progress</span>
                      <span>{totalVotes} / {proposal.minVotes} votes</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                      <div 
                        className="bg-gradient-to-r from-gray-500 to-gray-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((totalVotes / proposal.minVotes) * 100, 100)}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <ThumbsUp className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300">For</span>
                        </span>
                        <span className="font-medium text-white">{proposal.votes.for} ({forPercentage.toFixed(1)}%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <ThumbsDown className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300">Against</span>
                        </span>
                        <span className="font-medium text-white">{proposal.votes.against} ({againstPercentage.toFixed(1)}%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300">Abstain</span>
                        </span>
                        <span className="font-medium text-white">{proposal.votes.abstain} ({abstainPercentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Discuss
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                    
                    {proposal.status === 'active' && (
                      <div className="flex gap-2">
                          {!isConnected ? (
                            <Button size="sm" variant="outline" className="border-gray-600 text-gray-300" disabled>
                              Connect Wallet to Vote
                            </Button>
                          ) : votingStates[proposal.id]?.hasUserVoted ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Voted ✓
                            </Badge>
                          ) : (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                disabled={votingStates[proposal.id]?.isVoting}
                                onClick={() => handleVote(proposal.id, 0)} // 0 = Against
                              >
                                {votingStates[proposal.id]?.isVoting ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <ThumbsDown className="h-4 w-4 mr-2" />
                                )}
                          Vote Against
                        </Button>
                              <Button 
                                size="sm" 
                                className="bg-gray-600 hover:bg-gray-500 text-white"
                                disabled={votingStates[proposal.id]?.isVoting}
                                onClick={() => handleVote(proposal.id, 1)} // 1 = For
                              >
                                {votingStates[proposal.id]?.isVoting ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <ThumbsUp className="h-4 w-4 mr-2" />
                                )}
                          Vote For
                        </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-gray-500 text-gray-400 hover:bg-gray-600"
                                disabled={votingStates[proposal.id]?.isVoting}
                                onClick={() => handleVote(proposal.id, 2)} // 2 = Abstain
                              >
                                {votingStates[proposal.id]?.isVoting ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Eye className="h-4 w-4 mr-2" />
                                )}
                                Abstain
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                    disabled={votingStates[proposal.id]?.isVoting}
                                  >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Vote with Reason
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-gray-800 border-gray-700 text-white">
                                  <DialogHeader>
                                    <DialogTitle>Vote with Reason</DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                      Cast your vote and provide a reason that will be stored on the blockchain.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label className="text-gray-300">Your Vote</Label>
                                      <div className="flex gap-2 mt-2">
                                        <Button
                                          variant={voteDialog.support === 0 ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => setVoteDialog(prev => ({ ...prev, support: 0 }))}
                                          className="flex-1"
                                        >
                                          <ThumbsDown className="h-4 w-4 mr-2" />
                                          Against
                                        </Button>
                                        <Button
                                          variant={voteDialog.support === 1 ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => setVoteDialog(prev => ({ ...prev, support: 1 }))}
                                          className="flex-1"
                                        >
                                          <ThumbsUp className="h-4 w-4 mr-2" />
                                          For
                                        </Button>
                                        <Button
                                          variant={voteDialog.support === 2 ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => setVoteDialog(prev => ({ ...prev, support: 2 }))}
                                          className="flex-1"
                                        >
                                          <Eye className="h-4 w-4 mr-2" />
                                          Abstain
                                        </Button>
                                      </div>
                                    </div>
                                    <div>
                                      <Label htmlFor="vote-reason" className="text-gray-300">
                                        Reason (Optional)
                                      </Label>
                                      <Textarea
                                        id="vote-reason"
                                        placeholder="Explain your reasoning for this vote..."
                                        value={voteDialog.reason}
                                        onChange={(e) => setVoteDialog(prev => ({ ...prev, reason: e.target.value }))}
                                        className="bg-gray-700/50 border-gray-600 text-white mt-2"
                                        rows={3}
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setVoteDialog({ isOpen: false, proposalId: null, support: null, reason: '' })}
                                      className="border-gray-600 text-gray-300"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        if (voteDialog.support !== null) {
                                          handleVote(proposal.id, voteDialog.support, voteDialog.reason);
                                          setVoteDialog({ isOpen: false, proposalId: null, support: null, reason: '' });
                                        }
                                      }}
                                      disabled={voteDialog.support === null || votingStates[proposal.id]?.isVoting}
                                      className="bg-blue-600 hover:bg-blue-500 text-white"
                                    >
                                      {votingStates[proposal.id]?.isVoting ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          Casting Vote...
                                        </>
                                      ) : (
                                        'Cast Vote'
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}
                      </div>
                    )}
                  </div>
                </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How Governance Works */}
      <section className="py-20 bg-gray-900/50">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-fluid-3xl font-bold mb-4 text-white">How Governance Works</h2>
            <p className="text-fluid-lg text-gray-400 max-w-2xl mx-auto">
              Democratic, transparent, and efficient governance powered by blockchain technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 bg-gray-800/50 border-gray-700">
              <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center mx-auto mb-4">
                <Vote className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Propose</h3>
              <p className="text-gray-400 text-sm">
                Any token holder can create proposals for platform improvements, 
                policy changes, or funding decisions.
              </p>
            </Card>

            <Card className="text-center p-6 bg-gray-800/50 border-gray-700">
              <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Discuss</h3>
              <p className="text-gray-400 text-sm">
                Community members discuss proposals, share insights, 
                and build consensus before voting begins.
              </p>
            </Card>

            <Card className="text-center p-6 bg-gray-800/50 border-gray-700">
              <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Execute</h3>
              <p className="text-gray-400 text-sm">
                Approved proposals are automatically executed through 
                smart contracts, ensuring transparent implementation.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
} 