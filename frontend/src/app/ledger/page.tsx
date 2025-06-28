'use client';

import { Helmet } from 'react-helmet-async';
import { Download, Filter, ExternalLink, Shield, Clock, TrendingUp, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const transactions = [
  {
    id: 'tx_001',
    type: 'donation',
    amount: 50000,
    from: '0x1234...abcd',
    to: 'teachher-education',
    project: 'TeachHer: Rural Girls Education',
    timestamp: '2024-01-15T10:30:00Z',
    txHash: '0xabcd1234567890...',
    status: 'confirmed',
    blockNumber: 12847563
  },
  {
    id: 'tx_002', 
    type: 'milestone',
    amount: 150000,
    from: 'platform-escrow',
    to: 'cleanwater-initiative',
    project: 'Clean Water for Villages',
    timestamp: '2024-01-15T09:15:00Z',
    txHash: '0xefgh5678901234...',
    status: 'confirmed',
    blockNumber: 12847521,
    milestone: 'Phase 1: Well Construction Completed'
  },
  {
    id: 'tx_003',
    type: 'investment',
    amount: 2500000,
    from: '0x5678...efgh',
    to: 'greentech-startup',
    project: 'EcoSolar Solutions Pvt Ltd',
    timestamp: '2024-01-15T08:45:00Z',
    txHash: '0xijkl9012345678...',
    status: 'confirmed',
    blockNumber: 12847489,
    equity: '2.5%'
  },
  {
    id: 'tx_004',
    type: 'donation',
    amount: 25000,
    from: '0x9012...ijkl',
    to: 'medical-emergency',
    project: 'Arjun\'s Cancer Treatment',
    timestamp: '2024-01-15T07:22:00Z',
    txHash: '0xmnop3456789012...',
    status: 'confirmed',
    blockNumber: 12847445
  },
  {
    id: 'tx_005',
    type: 'milestone',
    amount: 300000,
    from: 'platform-escrow',
    to: 'skill-development',
    project: 'Digital Skills for Women',
    timestamp: '2024-01-14T16:30:00Z',
    txHash: '0xqrst6789012345...',
    status: 'confirmed',
    blockNumber: 12846892,
    milestone: 'Phase 2: Training Modules Deployed'
  }
];

const stats = [
  {
    label: 'Total Transactions',
    value: '127,456',
    change: '+2.3%',
    icon: TrendingUp
  },
  {
    label: 'Volume (24h)',
    value: '₹12.4L',
    change: '+8.7%',
    icon: TrendingUp
  },
  {
    label: 'Active Projects',
    value: '2,847',
    change: '+1.2%',
    icon: Shield
  },
  {
    label: 'Avg Block Time',
    value: '2.1s',
    change: '0%',
    icon: Clock
  }
];

function getTransactionIcon(type: string) {
  switch (type) {
    case 'donation':
      return '💝';
    case 'investment':
      return '💰';
    case 'milestone':
      return '🎯';
    default:
      return '📄';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function LedgerPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container-wide">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 mb-6">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Complete Transparency</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Public Ledger
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Every transaction, milestone, and fund transfer recorded permanently 
              on the blockchain for complete transparency and accountability.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 border-b">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                      </div>
                      <div className="flex flex-col items-end">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {stat.change}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="py-6 bg-muted/30">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by transaction hash, address, or project..."
                  className="pl-10"
                />
              </div>
              
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="donation">Donations</SelectItem>
                  <SelectItem value="investment">Investments</SelectItem>
                  <SelectItem value="milestone">Milestones</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="recent">
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Value</SelectItem>
                  <SelectItem value="lowest">Lowest Value</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </section>

      {/* Transaction List */}
      <section className="py-8">
        <div className="container-wide">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-md">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="donations">Donations</TabsTrigger>
              <TabsTrigger value="investments">Investments</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <Card key={tx.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Transaction Icon & Type */}
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getTransactionIcon(tx.type)}</div>
                          <div>
                            <div className="font-semibold capitalize">{tx.type}</div>
                            <div className="text-sm text-muted-foreground">
                              Block #{tx.blockNumber.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Transaction Details */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Project</div>
                            <div className="font-medium">{tx.project}</div>
                            {tx.milestone && (
                              <div className="text-sm text-blue-600 mt-1">{tx.milestone}</div>
                            )}
                          </div>
                          
                          <div>
                            <div className="text-sm text-muted-foreground">Amount</div>
                            <div className="font-semibold text-lg">
                              ₹{tx.amount.toLocaleString()}
                              {tx.equity && (
                                <span className="text-sm text-muted-foreground ml-2">
                                  ({tx.equity} equity)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(tx.status)}>
                            {tx.status}
                          </Badge>
                          
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Transaction Details */}
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">From: </span>
                            <code className="bg-muted px-2 py-1 rounded text-xs">
                              {tx.from}
                            </code>
                          </div>
                          <div>
                            <span className="text-muted-foreground">To: </span>
                            <code className="bg-muted px-2 py-1 rounded text-xs">
                              {tx.to}
                            </code>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Hash: </span>
                            <code className="bg-muted px-2 py-1 rounded text-xs">
                              {tx.txHash}
                            </code>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-sm text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'medium'
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-8">
                <Button variant="outline">
                  Load More Transactions
                </Button>
              </div>
            </TabsContent>

            {/* Other tab contents would filter the same data */}
            <TabsContent value="donations">
              <div className="text-center py-8 text-muted-foreground">
                Donation transactions only...
              </div>
            </TabsContent>

            <TabsContent value="investments">
              <div className="text-center py-8 text-muted-foreground">
                Investment transactions only...
              </div>
            </TabsContent>

            <TabsContent value="milestones">
              <div className="text-center py-8 text-muted-foreground">
                Milestone transactions only...
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Verification Notice */}
      <section className="py-8 bg-blue-50 border-t">
        <div className="container-wide">
          <div className="flex items-center justify-center space-x-3 text-blue-800">
            <Shield className="h-5 w-5" />
            <span className="text-sm">
              All transactions are cryptographically verified and permanently recorded on Base blockchain
            </span>
            <Button variant="link" className="text-blue-600 p-0 h-auto">
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
} 