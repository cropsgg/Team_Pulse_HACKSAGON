'use client';

import { Helmet } from 'react-helmet-async';
import { Settings, TrendingUp, Users, FileText, Calendar, DollarSign, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressChart, LineChart } from '@/components/charts';


const projectStats = [
  {
    label: 'Total Raised',
    value: '₹4.2L',
    change: '+12.5%',
    icon: DollarSign,
    color: 'text-green-600'
  },
  {
    label: 'Active Donors',
    value: '156',
    change: '+8.7%',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    label: 'Project Views',
    value: '2.4K',
    change: '+15.3%',
    icon: TrendingUp,
    color: 'text-purple-600'
  },
  {
    label: 'Milestones',
    value: '3/5',
    change: 'On track',
    icon: Target,
    color: 'text-orange-600'
  }
];

const milestones = [
  {
    id: 1,
    title: 'Project Planning & Setup',
    description: 'Complete initial project documentation and setup',
    status: 'completed',
    amount: 50000,
    dueDate: '2024-01-15',
    completedDate: '2024-01-12',
    evidence: 'Project plan and documentation uploaded'
  },
  {
    id: 2,
    title: 'Phase 1: Infrastructure Development',
    description: 'Build basic infrastructure and core systems',
    status: 'completed',
    amount: 100000,
    dueDate: '2024-02-15',
    completedDate: '2024-02-10',
    evidence: 'Photos and progress reports submitted'
  },
  {
    id: 3,
    title: 'Phase 2: Implementation',
    description: 'Deploy systems and begin operations',
    status: 'in-progress',
    amount: 150000,
    dueDate: '2024-03-15',
    progress: 65
  },
  {
    id: 4,
    title: 'Phase 3: Scaling',
    description: 'Expand reach and optimize operations',
    status: 'pending',
    amount: 100000,
    dueDate: '2024-04-15'
  },
  {
    id: 5,
    title: 'Final Evaluation',
    description: 'Complete project evaluation and reporting',
    status: 'pending',
    amount: 20000,
    dueDate: '2024-05-15'
  }
];

const recentActivity = [
  {
    type: 'donation',
    message: 'Received ₹5,000 donation from @donor123',
    timestamp: '2 hours ago',
    icon: '💝'
  },
  {
    type: 'milestone',
    message: 'Milestone 2 evidence reviewed and approved',
    timestamp: '6 hours ago',
    icon: '✅'
  },
  {
    type: 'comment',
    message: 'New question from community member',
    timestamp: '1 day ago',
    icon: '💬'
  },
  {
    type: 'update',
    message: 'Project progress updated to 65%',
    timestamp: '2 days ago',
    icon: '📈'
  }
];

const fundingData = [
  { label: 'Week 1', value: 25000 },
  { label: 'Week 2', value: 45000 },
  { label: 'Week 3', value: 35000 },
  { label: 'Week 4', value: 55000 },
  { label: 'Week 5', value: 48000 },
  { label: 'Week 6', value: 62000 },
  { label: 'Week 7', value: 58000 },
  { label: 'Week 8', value: 72000 }
];

function getMilestoneIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'in-progress':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    default:
      return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
  }
}

function getMilestoneColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in-progress':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function ConsolePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <section className="py-8 border-b">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Project Console</h1>
              <p className="text-muted-foreground">
                Manage your project: <span className="font-medium">Clean Water Initiative</span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View Public Page
              </Button>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Project Settings
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-8">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {projectStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Icon className={`h-8 w-8 ${stat.color}`} />
                      <Badge variant="secondary" className="text-green-600">
                        {stat.change}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <div className="text-sm font-medium">{stat.label}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16">
        <div className="container-wide">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Funding Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">₹4.2L raised of ₹5L goal</span>
                          <span className="text-sm text-muted-foreground">84%</span>
                        </div>
                        <Progress value={84} className="h-3" />
                      </div>
                      <LineChart 
                        data={fundingData}
                        height={250}
                        color="#ef4444"
                        className="w-full"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Progress Circle */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Overall Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <ProgressChart 
                        current={420000} 
                        target={500000}
                        color="#ef4444"
                      />
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="text-lg">{activity.icon}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">{activity.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {activity.timestamp}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Milestones Tab */}
            <TabsContent value="milestones" className="mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Milestone Management</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Track and manage your project milestones for transparent fund releases
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {milestones.map((milestone, index) => (
                        <div key={milestone.id} className="relative">
                          {/* Connector Line */}
                          {index < milestones.length - 1 && (
                            <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                          )}
                          
                          <div className="flex items-start space-x-4">
                            {/* Icon */}
                            <div className="flex-shrink-0 mt-1">
                              {getMilestoneIcon(milestone.status)}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold">{milestone.title}</h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {milestone.description}
                                  </p>
                                  
                                  {milestone.status === 'in-progress' && milestone.progress && (
                                    <div className="mt-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm">Progress</span>
                                        <span className="text-sm text-muted-foreground">
                                          {milestone.progress}%
                                        </span>
                                      </div>
                                      <Progress value={milestone.progress} className="h-2" />
                                    </div>
                                  )}
                                  
                                  {milestone.evidence && (
                                    <p className="text-xs text-green-600 mt-2">
                                      ✓ {milestone.evidence}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="flex flex-col items-end space-y-2">
                                  <Badge className={getMilestoneColor(milestone.status)}>
                                    {milestone.status.replace('-', ' ')}
                                  </Badge>
                                  <span className="text-sm font-medium">
                                    ₹{milestone.amount.toLocaleString()}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              
                              {milestone.status === 'in-progress' && (
                                <div className="mt-4 flex space-x-2">
                                  <Button size="sm">
                                    Submit Evidence
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    Update Progress
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Community Tab */}
            <TabsContent value="community" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Community Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">How will the funds be used?</h4>
                          <Badge variant="secondary">New</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Can you provide more details about how the ₹1.5L will be allocated?
                        </p>
                        <Button size="sm">Respond</Button>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Progress on water filtration systems?</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          What's the timeline for installing the water filters?
                        </p>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">View Thread</Button>
                          <span className="text-xs text-muted-foreground">3 replies</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Donor Engagement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Response Rate</span>
                        <span className="font-semibold">94%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Avg Response Time</span>
                        <span className="font-semibold">2.4 hours</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">Community Rating</span>
                        <span className="font-semibold">4.8/5</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Document Management</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Upload and manage project documents, evidence, and reports
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Upload Documents</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Drag and drop files here or click to browse
                      </p>
                      <Button>
                        Choose Files
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Uploaded Documents</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="font-medium">Project Proposal.pdf</div>
                              <div className="text-xs text-muted-foreground">Uploaded 3 days ago</div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="font-medium">Budget Breakdown.xlsx</div>
                              <div className="text-xs text-muted-foreground">Uploaded 1 week ago</div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </main>
  );
} 