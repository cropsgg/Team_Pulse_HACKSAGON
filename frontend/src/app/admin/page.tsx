'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockCampaigns, mockStats, mockDonations, mockUsers } from '@/data/mock';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  BarChart3,
  PieChart,
  Globe,
  Zap,
  Target,
  Calendar,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Plus,
  ExternalLink,
  RefreshCw,
  Bell,
  Flag,
  Award,
  Database,
  Satellite,
  Brain
} from 'lucide-react';

interface TabProps {
  id: string;
  label: string;
  icon: React.ElementType;
}

const tabs: TabProps[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'campaigns', label: 'Campaigns', icon: Target },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'fraud', label: 'Fraud Detection', icon: Shield },
  { id: 'treasury', label: 'Treasury', icon: DollarSign },
  { id: 'analytics', label: 'Analytics', icon: PieChart },
  { id: 'settings', label: 'Settings', icon: Settings }
];

const AlertCard = ({ type, title, description, severity, timestamp }: any) => (
  <Card className={`p-4 border-l-4 ${
    severity === 'high' ? 'border-l-red-500 bg-red-50 dark:bg-red-950/20' :
    severity === 'medium' ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' :
    'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20'
  }`}>
    <CardContent className="p-0">
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full ${
          severity === 'high' ? 'bg-red-100 dark:bg-red-900' :
          severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900' :
          'bg-blue-100 dark:bg-blue-900'
        }`}>
          {type === 'fraud' && <Shield className="h-4 w-4 text-red-600" />}
          {type === 'system' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
          {type === 'info' && <Bell className="h-4 w-4 text-blue-600" />}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
          <p className="text-xs text-muted-foreground mt-2">{formatDate(timestamp)}</p>
        </div>
        <Button size="sm" variant="outline" className="text-xs">
          Review
        </Button>
      </div>
    </CardContent>
  </Card>
);

const CampaignRowAdmin = ({ campaign }: { campaign: any }) => (
  <Card className="p-4">
    <CardContent className="p-0">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gradient-to-br from-charity-100 to-impact-100 rounded-lg" />
        <div className="flex-1">
          <h3 className="font-semibold">{campaign.title}</h3>
          <p className="text-sm text-muted-foreground">{campaign.creatorName}</p>
          <div className="flex items-center space-x-4 mt-2">
            <Badge variant={campaign.status === 'active' ? 'success' : 'outline'}>
              {campaign.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatCurrency(campaign.raised)} / {formatCurrency(campaign.goal)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">{campaign.backers} donors</p>
          <p className="text-xs text-muted-foreground">
            {Math.round((campaign.raised / campaign.goal) * 100)}% funded
          </p>
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button size="sm" variant="outline">
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock admin data
  const adminStats = {
    totalUsers: mockStats[1]?.value || 12847,
    activeCampaigns: 24,
    totalVolume: mockStats[0]?.value || 2847593,
    pendingReviews: 8,
    fraudAlerts: 3,
    treasuryBalance: 2500000
  };

  const recentAlerts = [
    {
      type: 'fraud',
      title: 'Suspicious Donation Pattern',
      description: 'Multiple large donations from similar wallet addresses detected',
      severity: 'high',
      timestamp: new Date('2024-01-26')
    },
    {
      type: 'system',
      title: 'Milestone Verification Pending',
      description: 'Clean Water Kenya campaign milestone requires manual review',
      severity: 'medium',
      timestamp: new Date('2024-01-25')
    },
    {
      type: 'info',
      title: 'New Campaign Submitted',
      description: 'Solar School Initiative campaign awaiting approval',
      severity: 'low',
      timestamp: new Date('2024-01-24')
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">{formatNumber(adminStats.totalUsers)}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Campaigns</p>
                      <p className="text-2xl font-bold">{adminStats.activeCampaigns}</p>
                    </div>
                    <Target className="h-8 w-8 text-charity-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Volume</p>
                      <p className="text-2xl font-bold">{formatCurrency(adminStats.totalVolume)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Reviews</p>
                      <p className="text-2xl font-bold">{adminStats.pendingReviews}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Alerts */}
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-red-500" />
                    <span>Recent Alerts</span>
                  </div>
                  <Badge variant="destructive">{adminStats.fraudAlerts} High Priority</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-4">
                  {recentAlerts.map((alert, index) => (
                    <AlertCard key={index} {...alert} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Campaign
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Import Users
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Analytics
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Satellite className="mr-2 h-4 w-4" />
                    Update Satellite Data
                  </Button>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-impact-500" />
                    <span>System Health</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Blockchain Sync</span>
                      <Badge variant="success">Online</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>AI Services</span>
                      <Badge variant="success">Operational</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Satellite Oracle</span>
                      <Badge variant="warning">Delayed</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>ZK Verifier</span>
                      <Badge variant="success">Active</Badge>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Refresh Status
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'campaigns':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Campaign Management</h2>
              <Button variant="charity">
                <Plus className="mr-2 h-4 w-4" />
                New Campaign
              </Button>
            </div>

            <div className="flex gap-4">
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="flex-1"
              />
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>

            <div className="space-y-4">
              {mockCampaigns.map((campaign) => (
                <CampaignRowAdmin key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>
        );

      case 'fraud':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Fraud Detection</h2>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure Rules
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Alerts</p>
                      <p className="text-2xl font-bold text-red-600">{adminStats.fraudAlerts}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Risk Score</p>
                      <p className="text-2xl font-bold text-yellow-600">0.12</p>
                    </div>
                    <Shield className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">AI Confidence</p>
                      <p className="text-2xl font-bold text-green-600">94.2%</p>
                    </div>
                    <Brain className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Fraud Detection Rules</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-4">
                  {[
                    { rule: 'Large donation velocity', threshold: '>$10k in 1 hour', status: 'active' },
                    { rule: 'Wallet clustering', threshold: '>5 similar addresses', status: 'active' },
                    { rule: 'Geographic anomaly', threshold: 'VPN/Tor detection', status: 'active' },
                    { rule: 'Behavioral pattern', threshold: 'ML confidence <80%', status: 'disabled' }
                  ].map((rule, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-semibold text-sm">{rule.rule}</p>
                        <p className="text-xs text-muted-foreground">{rule.threshold}</p>
                      </div>
                      <Badge variant={rule.status === 'active' ? 'success' : 'outline'}>
                        {rule.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'treasury':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Treasury Management</h2>
              <Button variant="outline">
                <ExternalLink className="mr-2 h-4 w-4" />
                View on Blockchain
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Treasury Balance</p>
                      <p className="text-2xl font-bold">{formatCurrency(adminStats.treasuryBalance)}</p>
                    </div>
                    <Zap className="h-8 w-8 text-impact-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Inflow</p>
                      <p className="text-2xl font-bold">{formatCurrency(450000)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Allocated Funds</p>
                      <p className="text-2xl font-bold">{formatCurrency(1850000)}</p>
                    </div>
                    <Target className="h-8 w-8 text-charity-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Fund Allocation</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-4">
                  {[
                    { category: 'Active Campaigns', amount: 1200000, percentage: 48 },
                    { category: 'Emergency Reserve', amount: 650000, percentage: 26 },
                    { category: 'Platform Operations', amount: 350000, percentage: 14 },
                    { category: 'Development Fund', amount: 300000, percentage: 12 }
                  ].map((allocation, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{allocation.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(allocation.amount)} ({allocation.percentage}%)
                        </span>
                      </div>
                      <Progress
                        value={allocation.percentage}
                        max={100}
                        variant="charity"
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Tab content for {activeTab} coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">
              Admin <span className="text-charity-500">Dashboard</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Platform management and oversight tools for administrators
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-charity-500 text-charity-600'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {renderTabContent()}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
} 