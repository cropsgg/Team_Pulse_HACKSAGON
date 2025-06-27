'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockCampaigns, mockDonations, mockUsers, mockStats, mockDeFiVaults } from '@/data/mock';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import {
  TrendingUp,
  Heart,
  Users,
  Target,
  Award,
  Star,
  Zap,
  Eye,
  ArrowUpRight,
  Calendar,
  Activity,
  Brain,
  Shield,
  Wallet,
  PieChart,
  BarChart3,
  Globe,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  ExternalLink,
  Download,
  Share2
} from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, color = 'text-blue-500' }: any) => (
  <Card className="p-6">
    <CardContent className="p-0">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && (
            <p className={`text-sm flex items-center ${change.positive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {change.value}
            </p>
          )}
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </CardContent>
  </Card>
);

const AIRecommendationCard = ({ campaign, reason }: any) => (
  <Card className="p-4 hover:shadow-md transition-shadow">
    <CardContent className="p-0">
      <div className="flex space-x-4">
        <div className="w-16 h-16 bg-gradient-to-br from-charity-100 to-impact-100 rounded-lg flex items-center justify-center">
          <Brain className="h-8 w-8 text-charity-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">{campaign.title}</h3>
          <p className="text-xs text-muted-foreground mb-2">{campaign.shortDescription}</p>
          <Badge variant="outline" className="text-xs mb-2">
            <Sparkles className="w-3 h-3 mr-1" />
            {reason}
          </Badge>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {Math.round((campaign.raised / campaign.goal) * 100)}% funded
            </span>
            <Button size="sm" variant="outline" className="text-xs h-7">
              View
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const BadgeCard = ({ badge }: any) => (
  <Card className="p-4 text-center hover:shadow-md transition-shadow">
    <CardContent className="p-0">
      <div className="w-12 h-12 bg-gradient-to-br from-charity-100 to-impact-100 rounded-full mx-auto mb-3 flex items-center justify-center">
        <Award className={`h-6 w-6 ${
          badge.rarity === 'legendary' ? 'text-yellow-500' :
          badge.rarity === 'epic' ? 'text-purple-500' :
          badge.rarity === 'rare' ? 'text-blue-500' :
          'text-gray-500'
        }`} />
      </div>
      <h3 className="font-semibold text-sm mb-1">{badge.name}</h3>
      <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
      <Badge variant="outline" className="text-xs">
        {badge.rarity}
      </Badge>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const currentUser = mockUsers[0]; // Mock current user
  const userDonations = mockDonations.filter(d => d.donorAddress === currentUser.address);
  
  // Mock AI insights
  const aiInsights = {
    donorCluster: currentUser.aiProfile?.donorCluster || 'impact-focused',
    churnRisk: currentUser.aiProfile?.churnProbability || 0.08,
    lifetimeValue: currentUser.aiProfile?.lifetimeValue || 50000,
    recommendedCampaigns: mockCampaigns.slice(0, 3)
  };

  const stats = [
    {
      title: 'Total Donated',
      value: formatCurrency(currentUser.totalDonated),
      change: { positive: true, value: '+12% this month' },
      icon: Heart,
      color: 'text-charity-500'
    },
    {
      title: 'Campaigns Supported',
      value: currentUser.totalCampaigns.toString(),
      change: { positive: true, value: '+2 this month' },
      icon: Target,
      color: 'text-impact-500'
    },
    {
      title: 'Impact Score',
      value: currentUser.reputation.toString(),
      change: { positive: true, value: '+45 this week' },
      icon: Star,
      color: 'text-yellow-500'
    },
    {
      title: 'Badges Earned',
      value: currentUser.badges.length.toString(),
      icon: Award,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold">
            Welcome back, <span className="text-charity-500">{currentUser.name || 'Donor'}</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your personalized impact dashboard powered by AI insights
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </motion.div>

        {/* AI Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid lg:grid-cols-3 gap-6"
        >
          {/* AI Profile */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-charity-500" />
                <span>AI Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Donor Type</span>
                  <Badge variant="charity">{aiInsights.donorCluster}</Badge>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Churn Risk</span>
                  <Badge variant={aiInsights.churnRisk < 0.1 ? 'success' : 'warning'}>
                    {(aiInsights.churnRisk * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Predicted LTV</span>
                  <span className="font-semibold">{formatCurrency(aiInsights.lifetimeValue)}</span>
                </div>
              </div>
              
              {aiInsights.churnRisk > 0.1 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Engagement Alert</span>
                  </div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    We miss you! Check out these new campaigns that match your interests.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Heart className="mr-2 h-4 w-4" />
                Find New Campaigns
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Award className="mr-2 h-4 w-4" />
                View Badge Collection
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Impact Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share Your Impact
              </Button>
            </CardContent>
          </Card>

          {/* DeFi Portfolio */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-impact-500" />
                <span>DeFi Portfolio</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              {mockDeFiVaults[0].deposits.map((deposit) => (
                <div key={deposit.id} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Principal</span>
                    <span className="font-semibold">{formatCurrency(deposit.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Current Value</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(deposit.currentValue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Yield Earned</span>
                    <span className="text-green-600">+{formatCurrency(deposit.yield)}</span>
                  </div>
                  <Progress
                    value={deposit.currentValue}
                    max={deposit.amount + 1000}
                    variant="impact"
                    size="sm"
                  />
                </div>
              ))}
              <Button className="w-full" variant="outline" size="sm">
                <ExternalLink className="mr-2 h-3 w-3" />
                View Full Portfolio
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-charity-500" />
                  <span>AI Recommendations</span>
                </div>
                <Badge variant="charity">Personalized</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="grid md:grid-cols-3 gap-4">
                {aiInsights.recommendedCampaigns.map((campaign, index) => (
                  <AIRecommendationCard
                    key={campaign.id}
                    campaign={campaign}
                    reason={[
                      'Matches your interests',
                      'High impact potential',
                      'Trending in your network'
                    ][index]}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity & Badge Collection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          {/* Recent Donations */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-impact-500" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-4">
                {userDonations.slice(0, 5).map((donation) => {
                  const campaign = mockCampaigns.find(c => c.id === donation.campaignId);
                  return (
                    <div key={donation.id} className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 bg-charity-100 rounded-full flex items-center justify-center">
                        <Heart className="h-5 w-5 text-charity-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{campaign?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(donation.timestamp)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(donation.amount)}</p>
                        <p className="text-xs text-muted-foreground">{donation.currency}</p>
                      </div>
                    </div>
                  );
                })}
                <Button className="w-full" variant="outline" size="sm">
                  View All Activity
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Badge Collection */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span>Badge Collection</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="grid grid-cols-2 gap-4">
                {currentUser.badges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
                <Card className="p-4 text-center border-2 border-dashed border-muted-foreground/20">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Star className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Unlock more badges</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Impact Stories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Play className="h-5 w-5 text-charity-500" />
                  <span>Your Impact Stories</span>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-3 w-3" />
                  Generate Report
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="bg-gradient-to-r from-charity-50 to-impact-50 dark:from-charity-950 dark:to-impact-950 rounded-lg p-6 text-center">
                <Play className="h-16 w-16 text-charity-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Your Impact Video is Ready!</h3>
                <p className="text-muted-foreground mb-4">
                  AI has generated a personalized video showing the impact of your donations
                </p>
                <Button variant="charity">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
} 