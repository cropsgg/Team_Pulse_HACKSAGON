'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GridSkeleton } from '@/components/ui/LoadingSkeletons';
import { mockGovernanceProposals } from '@/data/mock';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import {
  Vote,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Shield,
  Coins,
  Calendar,
  Target,
  Activity,
  BarChart3,
  PieChart,
  ArrowRight,
  Plus,
  Eye,
  MessageCircle,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Zap,
  Award,
  Lock,
  Unlock,
  ExternalLink,
  AlertCircle,
  Info,
  Star,
  Globe,
  Database,
  Search,
  Filter
} from 'lucide-react';

interface VotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: any;
}

const VotingModal = ({ isOpen, onClose, proposal }: VotingModalProps) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [voteAmount, setVoteAmount] = useState('');
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Cast Your Vote</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              ×
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">{proposal.title}</h3>
              <p className="text-sm text-muted-foreground">{proposal.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Your Vote</label>
                          <div className="space-y-2">
              {(proposal.options || []).map((option: any) => (
                  <label
                    key={option.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedOption === option.id ? 'border-charity-500 bg-charity-50 dark:bg-charity-950/20' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="vote"
                      value={option.id}
                      checked={selectedOption === option.id}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {option.type === 'for' && <ThumbsUp className="h-4 w-4 text-green-600" />}
                        {option.type === 'against' && <ThumbsDown className="h-4 w-4 text-red-600" />}
                        {option.type === 'abstain' && <Minus className="h-4 w-4 text-gray-600" />}
                        <span className="font-medium">{option.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Voting Power</label>
                          <div className="relative">
              <Input
                type="number"
                value={voteAmount}
                onChange={(e) => setVoteAmount(e.target.value)}
                placeholder="Enter VOTE tokens"
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                VOTE
              </span>
            </div>
              <p className="text-xs text-muted-foreground mt-1">Available: 1,250 VOTE tokens</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Comment (Optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your reasoning..."
                className="w-full p-3 border rounded-md h-20 resize-none"
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span>Voting Power:</span>
                <span className="font-medium">{voteAmount || '0'} VOTE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Transaction Fee:</span>
                <span>~$2.50</span>
              </div>
            </div>

            <Button
              className="w-full"
              variant="charity"
              disabled={!selectedOption || !voteAmount}
            >
              <Vote className="mr-2 h-4 w-4" />
              Cast Vote
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ProposalCard = ({ proposal }: { proposal: any }) => {
  const [isVotingModalOpen, setIsVotingModalOpen] = useState(false);
  const totalVotes = (proposal.options || []).reduce((sum: number, option: any) => sum + option.votes, 0);
  const timeLeft = Math.ceil((new Date(proposal.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <>
      <Card className="p-6 hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Badge variant={proposal.status === 'active' ? 'success' : proposal.status === 'passed' ? 'info' : 'outline'}>
                {proposal.status}
              </Badge>
              <Badge variant="outline">{proposal.category}</Badge>
            </div>
            {timeLeft > 0 && (
              <div className="text-sm text-muted-foreground">
                {timeLeft} days left
              </div>
            )}
          </div>

          <h3 className="text-lg font-semibold mb-2">{proposal.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{proposal.description}</p>

                  <div className="space-y-3 mb-4">
          {(proposal.options || []).map((option: any) => {
              const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
              return (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      {option.type === 'for' && <ThumbsUp className="h-3 w-3 text-green-600" />}
                      {option.type === 'against' && <ThumbsDown className="h-3 w-3 text-red-600" />}
                      {option.type === 'abstain' && <Minus className="h-3 w-3 text-gray-600" />}
                      <span>{option.label}</span>
                    </div>
                    <span className="font-medium">{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={option.votes}
                    max={totalVotes || 1}
                    variant={option.type === 'for' ? 'charity' : option.type === 'against' ? 'impact' : 'default'}
                    size="sm"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{formatNumber(totalVotes)} votes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Ends {formatDate(proposal.endDate)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="h-3 w-3" />
              <span>Quorum: {proposal.quorum}%</span>
            </div>
          </div>

          <div className="flex space-x-2">
            {proposal.status === 'active' && (
              <Button
                variant="charity"
                onClick={() => setIsVotingModalOpen(true)}
                className="flex-1"
              >
                <Vote className="h-4 w-4 mr-2" />
                Vote Now
              </Button>
            )}
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Details
            </Button>
            <Button variant="outline" size="icon">
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <VotingModal
        isOpen={isVotingModalOpen}
        onClose={() => setIsVotingModalOpen(false)}
        proposal={proposal}
      />
    </>
  );
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function GovernancePage() {
  const [activeTab, setActiveTab] = useState<'proposals' | 'analytics' | 'delegate'>('proposals');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [voteChoice, setVoteChoice] = useState<'for' | 'against' | 'abstain' | null>(null);

  const [visibleCount, setVisibleCount] = useState(6);
  
  const filteredProposals = mockGovernanceProposals.filter((proposal: any) => {
    const matchesStatus = filterStatus === 'all' || proposal.status === filterStatus;
    const matchesType = filterType === 'all' || proposal.type === filterType;
    const matchesSearch = proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         proposal.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });
  
  const proposals = filteredProposals.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProposals.length;
  const loadMore = () => setVisibleCount(prev => prev + 6);

  const governanceStats = {
    totalProposals: mockGovernanceProposals.length,
    activeProposals: mockGovernanceProposals.filter(p => p.status === 'active').length,
    passedProposals: mockGovernanceProposals.filter(p => p.status === 'passed').length,
    totalVotes: mockGovernanceProposals.reduce((sum, p) => sum + p.totalVotes, 0),
    participationRate: 67.3,
    treasuryBalance: 2_450_000,
    stakingPower: 856_000,
    nextProposalId: mockGovernanceProposals.length + 1
  };

  const statusColors = {
    active: 'bg-blue-500',
    passed: 'bg-green-500',
    failed: 'bg-red-500',
    executed: 'bg-purple-500',
    cancelled: 'bg-gray-500'
  };

  const typeColors = {
    'treasury': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    'governance': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    'protocol': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    'campaign-approval': 'bg-charity-100 text-charity-800 dark:bg-charity-900/20 dark:text-charity-300',
    'emergency': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
  };

  const renderProposalCard = (proposal: any) => (
    <motion.div
      key={proposal.id}
      variants={itemVariants}
      className="group"
    >
      <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={typeColors[proposal.type as keyof typeof typeColors]}>
                {proposal.type.replace('-', ' ')}
              </Badge>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${statusColors[proposal.status as keyof typeof statusColors]}`} />
                <span className="text-sm text-muted-foreground capitalize">{proposal.status}</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
              {proposal.title}
            </h3>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {proposal.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">#{proposal.id}</div>
          </div>
        </div>

        <div className="space-y-4 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span>Votes Cast</span>
            <span className="font-semibold">{proposal.totalVotes.toLocaleString()}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>For</span>
              <span className="text-green-600">{proposal.votesFor.toLocaleString()} ({((proposal.votesFor / proposal.totalVotes) * 100).toFixed(1)}%)</span>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-green-500 transition-all"
                style={{ width: `${(proposal.votesFor / proposal.totalVotes) * 100}%` }}
              />
              <div 
                className="absolute top-0 h-full bg-red-500 transition-all"
                style={{ 
                  left: `${(proposal.votesFor / proposal.totalVotes) * 100}%`,
                  width: `${(proposal.votesAgainst / proposal.totalVotes) * 100}%` 
                }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span>Against</span>
              <span className="text-red-600">{proposal.votesAgainst.toLocaleString()} ({((proposal.votesAgainst / proposal.totalVotes) * 100).toFixed(1)}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span>Quorum</span>
            <span className={`font-semibold ${
              proposal.totalVotes >= proposal.quorum ? 'text-green-600' : 'text-red-600'
            }`}>
              {((proposal.totalVotes / proposal.quorum) * 100).toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {proposal.status === 'active' 
                  ? `${Math.ceil((new Date(proposal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left`
                  : `Ended ${new Date(proposal.deadline).toLocaleDateString()}`
                }
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>By {proposal.proposer.slice(0, 8)}...</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {proposal.status === 'active' && (
            <>
              <Button 
                size="sm" 
                className="flex-1 bg-green-500 hover:bg-green-600"
                onClick={() => {
                  setSelectedProposal(proposal.id);
                  setVoteChoice('for');
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Vote For
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  setSelectedProposal(proposal.id);
                  setVoteChoice('against');
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Vote Against
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setSelectedProposal(proposal.id);
                  setVoteChoice('abstain');
                }}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Abstain
              </Button>
            </>
          )}
          {proposal.status === 'passed' && !proposal.executionData && (
            <Button size="sm" className="w-full">
              <Target className="h-4 w-4 mr-2" />
              Execute Proposal
            </Button>
          )}
          <Button size="sm" variant="ghost" className="px-3">
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );

  const renderAnalyticsTab = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Proposals</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">
              {governanceStats.totalProposals}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              {governanceStats.activeProposals} currently active
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Pass Rate</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-800 dark:text-green-200">
              {((governanceStats.passedProposals / governanceStats.totalProposals) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-green-600 dark:text-green-400 mt-1">
              {governanceStats.passedProposals} proposals passed
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Participation</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-800 dark:text-purple-200">
              {governanceStats.participationRate}%
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400 mt-1">
              Average voter turnout
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-gradient-to-br from-charity-50 to-charity-100 dark:from-charity-900/20 dark:to-charity-800/20 border-charity-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-charity-600" />
                <span className="text-sm font-medium text-charity-700 dark:text-charity-300">Treasury</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-charity-800 dark:text-charity-200">
              ${(governanceStats.treasuryBalance / 1_000_000).toFixed(1)}M
            </div>
            <div className="text-sm text-charity-600 dark:text-charity-400 mt-1">
              Available for allocation
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Proposal Types Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(
              mockGovernanceProposals.reduce((acc, proposal) => {
                acc[proposal.type] = (acc[proposal.type] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([type, count]) => (
              <div key={type} className="space-y-2">
                <div className="flex justify-between">
                  <span className="capitalize">{type.replace('-', ' ')}</span>
                  <span className="font-semibold">{count}</span>
                </div>
                <Progress 
                  value={(count / governanceStats.totalProposals) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Voting Activity Trend
          </h3>
          <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Interactive charts coming soon</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Top Delegates
        </h3>
        <div className="space-y-4">
          {[
            { address: '0x742d35Cc...', votes: 245000, proposals: 12, reputation: 95 },
            { address: '0x8ba1f109...', votes: 189000, proposals: 8, reputation: 92 },
            { address: '0x9cd04748...', votes: 156000, proposals: 15, reputation: 89 },
            { address: '0x6f34a5b2...', votes: 134000, proposals: 6, reputation: 87 },
            { address: '0x5e29c8f1...', votes: 112000, proposals: 9, reputation: 85 }
          ].map((delegate, index) => (
            <div key={delegate.address} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold">
                  #{index + 1}
                </div>
                <div>
                  <div className="font-semibold">{delegate.address}</div>
                  <div className="text-sm text-muted-foreground">
                    {delegate.proposals} proposals • {delegate.reputation}% reputation
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">{(delegate.votes / 1000).toFixed(0)}K</div>
                <div className="text-sm text-muted-foreground">Voting Power</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );

  const renderDelegateTab = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Delegate Your Voting Power</h2>
        <p className="text-muted-foreground">
          Delegate your tokens to trusted community members or vote directly on proposals
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Delegation Status
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Current Delegation</span>
                <Badge variant="outline">Self-Delegated</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                You are currently voting with your own tokens
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-blue-700 dark:text-blue-300">Voting Power</span>
                <span className="font-bold text-blue-800 dark:text-blue-200">15,000 IMPACT</span>
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Tokens available for voting
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Delegation History</span>
                <span className="text-muted-foreground">Last 30 days</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Self-delegated</span>
                  <span>30 days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delegated to 0x742d35Cc...</span>
                  <span>Before that</span>
                </div>
              </div>
            </div>

            <Button className="w-full">
              <Target className="h-4 w-4 mr-2" />
              Change Delegation
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Suggested Delegates</h3>
          
          <div className="space-y-3">
            {[
              { 
                address: '0x742d35Cc6634C0532925a3b8D2b542b2e24b5e6c',
                name: 'WaterAid Delegate',
                votes: 245000,
                alignment: 95,
                focus: 'Environmental & Water'
              },
              { 
                address: '0x8ba1f109551bD432803012645Hac136c21ef0ee',
                name: 'Education First',
                votes: 189000,
                alignment: 92,
                focus: 'Education & Children'
              },
              { 
                address: '0x9cd047484b30a2b4dcd5bc7ddfa5b5b8cd5b5e21',
                name: 'Climate Action',
                votes: 156000,
                alignment: 89,
                focus: 'Climate & Environment'
              }
            ].map((delegate) => (
              <div key={delegate.address} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold">{delegate.name}</div>
                    <div className="text-xs text-muted-foreground">{delegate.address.slice(0, 12)}...</div>
                  </div>
                  <Button size="sm" variant="outline">
                    Delegate
                  </Button>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Voting Power: {(delegate.votes / 1000).toFixed(0)}K</span>
                  <span>Alignment: {delegate.alignment}%</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Focus: {delegate.focus}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">
            DAO <span className="text-primary">Governance</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Participate in decentralized governance. Vote on proposals, delegate tokens, and shape the future of ImpactChain.
          </p>
        </motion.div>

        <div className="flex justify-center mb-8">
          <div className="flex p-1 space-x-1 bg-muted rounded-lg">
            {[
              { id: 'proposals', label: 'Proposals', icon: Vote },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'delegate', label: 'Delegate', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-background text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'proposals' && (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mb-8"
            >
              <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search proposals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Proposal
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {['all', 'active', 'passed', 'failed'].map((status) => (
                    <Button
                      key={status}
                      variant={filterStatus === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus(status)}
                      className="capitalize"
                    >
                      {status}
                    </Button>
                  ))}
                  <div className="border-l mx-2" />
                  {['all', 'treasury', 'governance', 'protocol', 'campaign-approval'].map((type) => (
                    <Button
                      key={type}
                      variant={filterType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType(type)}
                      className="capitalize"
                    >
                      {type.replace('-', ' ')}
                    </Button>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            >
                             {proposals.map(renderProposalCard)}
            </motion.div>

            {hasMore && (
              <div className="text-center">
                                 <Button onClick={loadMore} variant="outline">
                   Load More Proposals
                </Button>
              </div>
            )}
          </>
        )}

        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'delegate' && renderDelegateTab()}
      </div>
    </div>
  );
} 