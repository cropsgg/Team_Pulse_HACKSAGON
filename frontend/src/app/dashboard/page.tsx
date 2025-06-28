import React from 'react';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Heart,
  Wallet,
  Plus,
  Settings,
  Bell,
  Eye,
  Edit,
  ArrowUpRight,
  Calendar,
  Target,
  Award,
  Sparkles,
  Activity
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard - ImpactChain & CharityChain',
  description: 'Manage your projects, track contributions, and monitor your impact on the blockchain.',
};

const userStats = [
  { label: 'Total Donated', value: '₹2,45,000', icon: Heart, change: '+12%' },
  { label: 'Projects Supported', value: '23', icon: Target, change: '+3' },
  { label: 'Impact Score', value: '8.9/10', icon: Award, change: '+0.2' },
  { label: 'Wallet Balance', value: '₹12,500', icon: Wallet, change: '-₹500' }
];

const recentActivity = [
  {
    id: 1,
    type: 'donation',
    title: 'Donated to Clean Water Initiative',
    amount: '₹5,000',
    date: '2 hours ago',
    status: 'completed'
  },
  {
    id: 2,
    type: 'milestone',
    title: 'EcoTech Startup reached 50% funding',
    amount: '₹2,50,000',
    date: '1 day ago',
    status: 'progress'
  },
  {
    id: 3,
    type: 'vote',
    title: 'Voted on Funding Threshold Proposal',
    amount: 'Governance',
    date: '2 days ago',
    status: 'completed'
  },
  {
    id: 4,
    type: 'reward',
    title: 'Received Impact Badge',
    amount: 'Level 3',
    date: '3 days ago',
    status: 'reward'
  }
];

const supportedProjects = [
  {
    id: 1,
    title: 'Clean Water Initiative',
    type: 'charity',
    donated: 15000,
    raised: 450000,
    goal: 500000,
    status: 'active',
    image: '/placeholder-project.jpg',
    organization: 'WaterAid India'
  },
  {
    id: 2,
    title: 'EcoTech Sustainable Energy',
    type: 'startup',
    donated: 25000,
    raised: 1250000,
    goal: 2500000,
    status: 'active',
    image: '/placeholder-project.jpg',
    organization: 'EcoTech Solutions'
  },
  {
    id: 3,
    title: 'Rural Education Program',
    type: 'charity',
    donated: 8000,
    raised: 280000,
    goal: 300000,
    status: 'completed',
    image: '/placeholder-project.jpg',
    organization: 'Teach for India'
  }
];

export default function DashboardPage() {
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
            <Link href="/governance" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Governance
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-primary">
              Dashboard
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8" />
          </div>
        </div>
      </nav>

      <div className="container-wide py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-fluid-4xl font-bold mb-2">Welcome back, Alex!</h1>
              <p className="text-fluid-lg text-muted-foreground">
                Track your impact and manage your contributions
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" asChild>
                <Link href="/explore">
                  <Eye className="mr-2 h-4 w-4" />
                  Explore Projects
                </Link>
              </Button>
              <Button size="lg" asChild>
                <Link href="/create/startup">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {userStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <Badge variant="secondary" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/activity">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const getIcon = (type: string) => {
                      switch (type) {
                        case 'donation': return <Heart className="h-4 w-4 text-red-500" />;
                        case 'milestone': return <Target className="h-4 w-4 text-blue-500" />;
                        case 'vote': return <Users className="h-4 w-4 text-green-500" />;
                        case 'reward': return <Award className="h-4 w-4 text-yellow-500" />;
                        default: return <Activity className="h-4 w-4" />;
                      }
                    };

                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case 'completed': return 'bg-green-100 text-green-800';
                        case 'progress': return 'bg-blue-100 text-blue-800';
                        case 'reward': return 'bg-yellow-100 text-yellow-800';
                        default: return 'bg-gray-100 text-gray-800';
                      }
                    };

                    return (
                      <div key={activity.id} className="flex items-center gap-4 p-4 rounded-lg border">
                        <div className="flex-shrink-0">
                          {getIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground">{activity.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={getStatusColor(activity.status)}>
                            {activity.amount}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" asChild>
                    <Link href="/explore">
                      <Eye className="mr-2 h-4 w-4" />
                      Explore New Projects
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/create/startup">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Project
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/governance">
                      <Users className="mr-2 h-4 w-4" />
                      View Proposals
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/wallet">
                      <Wallet className="mr-2 h-4 w-4" />
                      Manage Wallet
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Impact Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Impact Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">8.9</div>
                    <div className="text-sm text-muted-foreground">Impact Score</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Transparency</span>
                      <span className="font-medium">9.2/10</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Consistency</span>
                      <span className="font-medium">8.8/10</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Engagement</span>
                      <span className="font-medium">8.7/10</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="w-full justify-center">
                    Top 5% Contributors
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Supported Projects */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Supported Projects</h2>
            <Button variant="outline" asChild>
              <Link href="/my-projects">View All</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportedProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-purple-500/10 relative">
                  <div className="absolute top-3 left-3">
                    <Badge variant={project.type === 'startup' ? 'default' : 'secondary'}>
                      {project.type === 'startup' ? 'Startup' : 'Charity'}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant={project.status === 'completed' ? 'default' : 'outline'}>
                      {project.status === 'completed' ? 'Completed' : 'Active'}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">by {project.organization}</p>
                </CardHeader>

                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Your contribution: ₹{project.donated.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>₹{project.raised.toLocaleString()}</span>
                      <span className="text-muted-foreground">₹{project.goal.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((project.raised / project.goal) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {Math.round((project.raised / project.goal) * 100)}% funded
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <Link href={`/project/${project.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link href={`/project/${project.id}/donate`}>
                        <Heart className="h-4 w-4 mr-2" />
                        Donate More
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
} 