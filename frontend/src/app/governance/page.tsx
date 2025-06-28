'use client';

import React from 'react';
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
  Sparkles
} from 'lucide-react';
import Link from 'next/link';


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

const votingPower = {
  totalTokens: 1000,
  votingPower: 1000,
  delegatedTo: null,
  delegatedFrom: 0
};

export default function GovernancePage() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-wide flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl">ImpactChain</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/explore" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Explore
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </Link>
            <Link href="/governance" className="text-sm font-medium text-primary">
              Governance
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/create/proposal">
              <Button size="sm">Create Proposal</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container-wide text-center">
          <Badge variant="outline" className="mb-4">
            🗳️ DAO Governance
          </Badge>
          <h1 className="text-fluid-5xl font-bold mb-6">
            Shape the Future of{' '}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Transparent Funding
            </span>
          </h1>
          <p className="text-fluid-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Participate in democratic governance, vote on proposals, and help build a more 
            accountable and transparent funding ecosystem for everyone.
          </p>
          <Link href="#proposals">
            <Button size="lg">
              View Proposals <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Governance Stats */}
      <section className="py-12 bg-muted/30">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {governanceStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center p-6">
                  <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Voting Power */}
      <section className="py-12">
        <div className="container-wide">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Your Voting Power</h2>
              <Button variant="outline" size="sm">
                Delegate Votes
              </Button>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-xl font-bold text-primary">{votingPower.totalTokens}</div>
                <div className="text-sm text-muted-foreground">Total Tokens</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-primary">{votingPower.votingPower}</div>
                <div className="text-sm text-muted-foreground">Voting Power</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-muted-foreground">
                  {votingPower.delegatedTo || 'None'}
                </div>
                <div className="text-sm text-muted-foreground">Delegated To</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-primary">{votingPower.delegatedFrom}</div>
                <div className="text-sm text-muted-foreground">Delegated From</div>
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
              <h2 className="text-fluid-3xl font-bold mb-4">Active Proposals</h2>
              <p className="text-fluid-lg text-muted-foreground">
                Vote on proposals that shape the future of our platform
              </p>
            </div>
            <Link href="/create/proposal">
              <Button>Create Proposal</Button>
            </Link>
          </div>

          <div className="space-y-6">
            {proposals.map((proposal) => {
              const totalVotes = proposal.votes.for + proposal.votes.against + proposal.votes.abstain;
              const forPercentage = (proposal.votes.for / totalVotes) * 100;
              const againstPercentage = (proposal.votes.against / totalVotes) * 100;
              const abstainPercentage = (proposal.votes.abstain / totalVotes) * 100;
              
              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'active': return 'bg-blue-500';
                  case 'passed': return 'bg-green-500';
                  case 'rejected': return 'bg-red-500';
                  default: return 'bg-gray-500';
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

              return (
                <Card key={proposal.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline">{proposal.category}</Badge>
                        <Badge variant="outline" className={`${getStatusColor(proposal.status)} text-white`}>
                          {getStatusIcon(proposal.status)}
                          <span className="ml-1 capitalize">{proposal.status}</span>
                        </Badge>
                        {proposal.status === 'active' && (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            {proposal.timeLeft} left
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{proposal.title}</h3>
                      <p className="text-muted-foreground mb-4">{proposal.description}</p>
                      <div className="text-sm text-muted-foreground">
                        Proposed by {proposal.author} • {proposal.created}
                      </div>
                    </div>
                  </div>

                  {/* Voting Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Voting Progress</span>
                      <span>{totalVotes} / {proposal.minVotes} votes</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mb-4">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((totalVotes / proposal.minVotes) * 100, 100)}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <ThumbsUp className="h-4 w-4 text-green-500" />
                          For
                        </span>
                        <span className="font-medium">{proposal.votes.for} ({forPercentage.toFixed(1)}%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <ThumbsDown className="h-4 w-4 text-red-500" />
                          Against
                        </span>
                        <span className="font-medium">{proposal.votes.against} ({againstPercentage.toFixed(1)}%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-gray-500" />
                          Abstain
                        </span>
                        <span className="font-medium">{proposal.votes.abstain} ({abstainPercentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Discuss
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                    
                    {proposal.status === 'active' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          Vote Against
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Vote For
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How Governance Works */}
      <section className="py-20 bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-fluid-3xl font-bold mb-4">How Governance Works</h2>
            <p className="text-fluid-lg text-muted-foreground max-w-2xl mx-auto">
              Democratic, transparent, and efficient governance powered by blockchain technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Vote className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Propose</h3>
              <p className="text-muted-foreground text-sm">
                Any token holder can create proposals for platform improvements, 
                policy changes, or funding decisions.
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Discuss</h3>
              <p className="text-muted-foreground text-sm">
                Community members discuss proposals, share insights, 
                and build consensus before voting begins.
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Execute</h3>
              <p className="text-muted-foreground text-sm">
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