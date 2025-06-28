'use client';

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  Users, 
  Target,
  TrendingUp,
  Star,
  CheckCircle,
  Clock,
  Globe,
  Mail,
  Phone,
  ArrowLeft,
  Sparkles,
  Award,
  Shield,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';


// Mock project data - in a real app, this would come from the API based on the slug
const project = {
  id: 1,
  title: 'EcoTech Sustainable Energy Solutions',
  slug: 'ecotech-sustainable-energy',
  description: 'Revolutionary solar panel technology that increases efficiency by 40% while reducing manufacturing costs. Our innovative approach combines AI-driven optimization with sustainable materials to create the next generation of renewable energy solutions.',
  fullDescription: `EcoTech is pioneering the future of sustainable energy with our breakthrough solar panel technology. Our proprietary AI-driven optimization system, combined with innovative sustainable materials, delivers unprecedented efficiency improvements while maintaining cost-effectiveness.

Our solution addresses the critical need for more efficient renewable energy sources in the face of climate change. Through extensive research and development, we've created solar panels that are 40% more efficient than traditional models, while using 30% fewer rare earth materials.

The technology has been validated through rigorous testing and has received endorsements from leading environmental organizations. We're now ready to scale production and bring this technology to market globally.`,
  type: 'startup',
  category: 'Energy',
  organization: 'EcoTech Solutions',
  founder: 'Dr. Sarah Chen',
  location: 'Mumbai, India',
  website: 'https://ecotech-solutions.com',
  email: 'contact@ecotech-solutions.com',
  phone: '+91 98765 43210',
  raised: 1250000,
  goal: 2500000,
  backers: 89,
  daysLeft: 42,
  rating: 4.8,
  status: 'active',
  featured: true,
  verified: true,
  created: '2024-01-10',
  lastUpdated: '2024-01-20',
  milestones: [
    {
      id: 1,
      title: 'Prototype Development',
      description: 'Complete initial prototype and testing phase',
      targetAmount: 500000,
      status: 'completed',
      completedDate: '2024-01-15'
    },
    {
      id: 2,
      title: 'Regulatory Approval',
      description: 'Obtain necessary certifications and regulatory approvals',
      targetAmount: 300000,
      status: 'in-progress',
      progress: 65
    },
    {
      id: 3,
      title: 'Manufacturing Setup',
      description: 'Establish manufacturing facilities and supply chain',
      targetAmount: 800000,
      status: 'upcoming'
    },
    {
      id: 4,
      title: 'Market Launch',
      description: 'Launch product and begin commercial operations',
      targetAmount: 900000,
      status: 'upcoming'
    }
  ],
  team: [
    {
      name: 'Dr. Sarah Chen',
      role: 'CEO & Co-founder',
      bio: 'Former Tesla energy engineer with 15 years of renewable energy experience',
      avatar: '/avatar-1.jpg'
    },
    {
      name: 'Mark Johnson',
      role: 'CTO & Co-founder',
      bio: 'AI specialist with PhD from MIT, previously at Google DeepMind',
      avatar: '/avatar-2.jpg'
    },
    {
      name: 'Priya Sharma',
      role: 'VP of Operations',
      bio: 'Manufacturing expert with experience scaling renewable energy products',
      avatar: '/avatar-3.jpg'
    }
  ],
  updates: [
    {
      id: 1,
      title: 'Prototype Testing Complete',
      content: 'We\'ve successfully completed our prototype testing phase with results exceeding expectations.',
      date: '2024-01-18',
      type: 'milestone'
    },
    {
      id: 2,
      title: 'Partnership Announcement',
      content: 'Excited to announce our partnership with SolarMax Industries for manufacturing.',
      date: '2024-01-15',
      type: 'announcement'
    }
  ],
  impact: {
    carbonReduction: '2,500 tons CO2/year',
    energyGenerated: '5,000 MWh/year',
    jobsCreated: '150 direct jobs',
    communitiesServed: '25 communities'
  }
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fundingPercentage = (project.raised / project.goal) * 100;
  
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
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/explore">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Explore
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container-wide py-8">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant={project.type === 'startup' ? 'default' : 'secondary'}>
                  {project.type === 'startup' ? 'Startup' : 'Charity'}
                </Badge>
                <Badge variant="outline">{project.category}</Badge>
                {project.featured && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {project.verified && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <h1 className="text-fluid-4xl font-bold mb-4">{project.title}</h1>
              <p className="text-fluid-lg text-muted-foreground mb-4">{project.description}</p>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {project.location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {project.daysLeft} days left
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {project.backers} backers
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {project.rating} rating
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Image */}
            <div className="aspect-video bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-semibold">{project.title}</h3>
                <p className="text-sm opacity-90">by {project.organization}</p>
              </div>
            </div>

            {/* Funding Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Funding Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-3xl font-bold text-primary">₹{project.raised.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">raised of ₹{project.goal.toLocaleString()} goal</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{Math.round(fundingPercentage)}%</div>
                      <div className="text-sm text-muted-foreground">funded</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-primary h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold">{project.backers}</div>
                      <div className="text-muted-foreground">Backers</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{project.daysLeft}</div>
                      <div className="text-muted-foreground">Days Left</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">₹{Math.round(project.raised / project.backers).toLocaleString()}</div>
                      <div className="text-muted-foreground">Avg. Donation</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Project Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {project.milestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        milestone.status === 'completed' 
                          ? 'bg-green-500 text-white' 
                          : milestone.status === 'in-progress'
                          ? 'bg-blue-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {milestone.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : milestone.status === 'in-progress' ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{milestone.title}</h4>
                          <Badge variant={
                            milestone.status === 'completed' ? 'default' :
                            milestone.status === 'in-progress' ? 'secondary' :
                            'outline'
                          }>
                            {milestone.status === 'completed' && milestone.completedDate}
                            {milestone.status === 'in-progress' && `${milestone.progress}% complete`}
                            {milestone.status === 'upcoming' && 'Upcoming'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                        <div className="text-sm font-medium">Target: ₹{milestone.targetAmount.toLocaleString()}</div>
                        
                        {milestone.status === 'in-progress' && (
                          <div className="mt-2">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${milestone.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Project</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {project.fullDescription.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Meet the Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {project.team.map((member, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <Avatar className="w-12 h-12" />
                      <div className="flex-1">
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-primary mb-2">{member.role}</p>
                        <p className="text-sm text-muted-foreground">{member.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Updates */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.updates.map((update) => (
                    <div key={update.id} className="border-l-2 border-primary/20 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{update.title}</h4>
                        <Badge variant="outline">{update.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{update.content}</p>
                      <div className="text-xs text-muted-foreground">{update.date}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Support Action */}
            <Card>
              <CardHeader>
                <CardTitle>Support This Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button size="lg" className="w-full">
                  <Heart className="mr-2 h-4 w-4" />
                  Donate Now
                </Button>
                <Button variant="outline" size="lg" className="w-full">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Invest
                </Button>
                <div className="text-xs text-muted-foreground text-center">
                  All transactions are secured by blockchain technology
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={project.website} className="text-sm text-primary hover:underline">
                    {project.website}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${project.email}`} className="text-sm text-primary hover:underline">
                    {project.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{project.phone}</span>
                </div>
              </CardContent>
            </Card>

            {/* Impact Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Expected Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Carbon Reduction</span>
                  <span className="text-sm font-medium">{project.impact.carbonReduction}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Energy Generated</span>
                  <span className="text-sm font-medium">{project.impact.energyGenerated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Jobs Created</span>
                  <span className="text-sm font-medium">{project.impact.jobsCreated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Communities Served</span>
                  <span className="text-sm font-medium">{project.impact.communitiesServed}</span>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Trust & Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Identity Verified</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Documents Reviewed</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Community Endorsed</span>
                </div>
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">AI Validated</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
} 