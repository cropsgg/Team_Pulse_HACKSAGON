'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, 
  Eye, 
  Heart, 
  Users, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Bell,
  Settings,
  Award,
  Target,
  Activity,
  BarChart3,
  PieChart,
  ExternalLink
} from 'lucide-react';
import { DonationChart } from '../charts/DonationChart';
import { MetricsCard, DonationMetrics, ProjectMetrics } from '../charts/MetricsCard';
import { useCurrentUser, useUserStats } from '@/hooks/api/useUserApi';
import { useUserProjects } from '@/hooks/api/useProjectApi';
import { useContractEvents } from '@/hooks/useContractEvents';
import { UserRole } from '@/lib/api/services/userService';
import { formatEther } from 'viem';

interface UserDashboardProps {
  className?: string;
}

export function UserDashboard({ className }: UserDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: userStats, isLoading: statsLoading } = useUserStats();
  const { data: userProjects, isLoading: projectsLoading } = useUserProjects();

  // Real donation data from API
  const { data: userStatsData, isLoading: donationDataLoading } = useUserStats(
    user?.id, 
    !!user
  );

  // Real-time blockchain events
  const { events: recentEvents } = useContractEvents();

  // Filter events relevant to current user
  const userRelevantEvents = useMemo(() => {
    if (!user?.walletAddress || !recentEvents.length) return [];
    
    const userAddress = user.walletAddress.toLowerCase();
    
    return recentEvents
      .filter(event => {
        // Show events where user is involved
        const eventArgs = event.args as any;
        return (
          eventArgs?.donor?.toLowerCase() === userAddress ||
          eventArgs?.ngo?.toLowerCase() === userAddress ||
          eventArgs?.founder?.toLowerCase() === userAddress ||
          eventArgs?.investor?.toLowerCase() === userAddress ||
          eventArgs?.user?.toLowerCase() === userAddress
        );
      })
      .slice(0, 5) // Show last 5 relevant events
      .map((event, index) => ({
        id: `${event.transactionHash}-${index}`,
        type: event.eventName?.toLowerCase() || 'unknown',
        description: formatEventDescription(event),
        time: 'Just now', // Real events are recent
        icon: getEventIcon(event.eventName || ''),
        txHash: event.transactionHash,
      }));
  }, [user?.walletAddress, recentEvents]);

  // Format event descriptions for user-friendly display
  const formatEventDescription = (event: any) => {
    const eventName = event.eventName;
    const args = event.args as any;

    switch (eventName) {
      case 'DonationMade':
        return `Donated ${formatEther(args.amount)} ETH to ${args.projectTitle || 'a project'}`;
      case 'NGORegistered':
        return `Registered as NGO: ${args.name}`;
      case 'StartupRegistered':
        return `Registered startup: ${args.name}`;
      case 'VCVoteCast':
        return `Voted on startup funding proposal`;
      case 'MilestoneSubmitted':
        return `Submitted milestone for verification`;
      case 'ProposalCreated':
        return `Created governance proposal`;
      case 'VoteCast':
        return `Voted on governance proposal`;
      default:
        return `${eventName} event occurred`;
    }
  };

  // Get icon for event type
  const getEventIcon = (eventName: string) => {
    switch (eventName) {
      case 'DonationMade':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'NGORegistered':
      case 'StartupRegistered':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'VCVoteCast':
      case 'VoteCast':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'MilestoneSubmitted':
        return <Award className="h-4 w-4 text-orange-500" />;
      case 'ProposalCreated':
        return <Activity className="h-4 w-4 text-indigo-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Transform API data to chart format (temporary until API structure matches)
  const transformedDonationData = useMemo(() => {
    if (!userStatsData?.monthlyDonations) {
      // Fallback to demo data if no API data
      return [
        { date: '2024-01-01', amount: 1200, count: 8, average: 150 },
        { date: '2024-01-02', amount: 800, count: 5, average: 160 },
        { date: '2024-01-03', amount: 1500, count: 12, average: 125 },
        { date: '2024-01-04', amount: 900, count: 6, average: 150 },
        { date: '2024-01-05', amount: 2000, count: 15, average: 133 },
        { date: '2024-01-06', amount: 1100, count: 7, average: 157 },
        { date: '2024-01-07', amount: 1300, count: 9, average: 144 },
      ];
    }
    
    // Transform API data to chart format
    return userStatsData.monthlyDonations.map((item, index) => ({
      date: item.month,
      amount: item.amount,
      count: Math.floor(item.amount / 100), // Estimate count
      average: Math.floor(item.amount / Math.max(1, Math.floor(item.amount / 100))),
    }));
  }, [userStatsData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleBasedActions = () => {
    if (!user) return null;

    switch (user.role) {
      case UserRole.DONOR:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Discover Projects
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View Impact
            </Button>
          </div>
        );
      
      case UserRole.NGO_ADMIN:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </Button>
          </div>
        );
      
      case UserRole.VC:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Browse Startups
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Portfolio Overview
            </Button>
          </div>
        );
      
      case UserRole.FOUNDER:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Startup
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Raise Funding
            </Button>
          </div>
        );
      
      default:
        return (
          <Button className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Explore Platform
          </Button>
        );
    }
  };

  const getRecentActivity = () => {
    // Use real blockchain events if available, otherwise show mock data
    if (userRelevantEvents.length > 0) {
      return userRelevantEvents;
    }
    
    // Fallback to mock data when no real events
    return [
      {
        id: '1',
        type: 'donation',
        description: 'Donated $50 to Clean Water Initiative',
        time: '2 hours ago',
        icon: <DollarSign className="h-4 w-4 text-green-500" />,
        txHash: undefined,
      },
      {
        id: '2',
        type: 'follow',
        description: 'Started following Education for All',
        time: '1 day ago',
        icon: <Heart className="h-4 w-4 text-red-500" />,
        txHash: undefined,
      },
      {
        id: '3',
        type: 'milestone',
        description: 'Project milestone completed',
        time: '3 days ago',
        icon: <Award className="h-4 w-4 text-blue-500" />,
        txHash: undefined,
      },
    ];
  };

  if (userLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {getGreeting()}, {user?.name}!
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant="outline">{user?.role}</Badge>
                  {user?.isVerified && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {getRoleBasedActions()}
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Total Donated"
          value={userStats?.totalDonated || 0}
          icon="dollar"
          variant="success"
          loading={statsLoading}
          change={{
            value: 12.5,
            type: 'increase',
            period: 'this month'
          }}
        />
        <MetricsCard
          title="Projects Supported"
          value={userStats?.projectsSupported || 0}
          icon="heart"
          variant="info"
          loading={statsLoading}
        />
        <MetricsCard
          title="Projects Created"
          value={userStats?.projectsCreated || 0}
          icon="target"
          loading={statsLoading}
        />
        <MetricsCard
          title="Reputation"
          value={userStats?.reputation || 0}
          icon="award"
          variant="warning"
          loading={statsLoading}
        />
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donation Trends */}
            <DonationChart
                              data={transformedDonationData}
              period={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              currency="USD"
            />

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getRecentActivity().map((event) => (
                    <div key={event.id} className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {event.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-500">{event.time}</p>
                          {event.txHash && (
                            <a
                              href={`https://basescan.org/tx/${event.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                            >
                              View tx <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                Your complete activity history and interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Activity timeline will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Projects</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>

          {projectsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : userProjects?.projects?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userProjects.projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{project.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.shortDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProjectMetrics
                      views={project.stats.viewCount}
                      followers={project.stats.followerCount}
                      funding={project.currentFunding}
                      goal={project.fundingGoal}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500 mb-4">No projects yet</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Detailed insights and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Advanced analytics dashboard will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 