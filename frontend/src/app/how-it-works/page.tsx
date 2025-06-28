'use client';

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Users, 
  Vote, 
  CheckCircle, 
  CreditCard,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  Clock,
  Target,
  Sparkles,
  Brain,
  Globe
} from 'lucide-react';
import Link from 'next/link';


const steps = [
  {
    id: 1,
    title: 'Submit Project',
    description: 'Founders and NGOs submit detailed project proposals with documentation, goals, and milestones.',
    icon: FileText,
    color: 'bg-blue-500',
    details: [
      'Complete project documentation',
      'Financial planning and budgets',
      'Team credentials and experience',
      'Milestone-based delivery plan',
      'Impact measurement metrics'
    ]
  },
  {
    id: 2,
    title: 'AI Analysis',
    description: 'Advanced AI evaluates project feasibility, market potential, and impact prediction.',
    icon: Brain,
    color: 'bg-purple-500',
    details: [
      'Market analysis and competition review',
      'Technical feasibility assessment',
      'Financial viability scoring',
      'Impact prediction modeling',
      'Risk assessment and mitigation'
    ]
  },
  {
    id: 3,
    title: 'Community Vote',
    description: 'DAO members vote on funding decisions with full transparency and accountability.',
    icon: Vote,
    color: 'bg-green-500',
    details: [
      'Transparent voting process',
      'Stake-weighted governance',
      'Public proposal discussions',
      'Consensus building mechanisms',
      'Democratic decision making'
    ]
  },
  {
    id: 4,
    title: 'Smart Contract',
    description: 'Approved projects receive funding through milestone-based smart contracts.',
    icon: CheckCircle,
    color: 'bg-orange-500',
    details: [
      'Automated fund release',
      'Milestone verification',
      'Transparent tracking',
      'Immutable records',
      'Dispute resolution'
    ]
  },
  {
    id: 5,
    title: 'Track Progress',
    description: 'Real-time monitoring of project progress with transparent reporting and updates.',
    icon: BarChart3,
    color: 'bg-pink-500',
    details: [
      'Real-time progress tracking',
      'Milestone completion verification',
      'Impact measurement reports',
      'Financial transparency',
      'Community updates'
    ]
  },
  {
    id: 6,
    title: 'Verify Impact',
    description: 'Independent verification of project outcomes and impact measurement.',
    icon: Shield,
    color: 'bg-indigo-500',
    details: [
      'Third-party verification',
      'Impact measurement validation',
      'Audit trail maintenance',
      'Success metrics reporting',
      'Accountability enforcement'
    ]
  }
];

const benefits = [
  {
    title: 'Complete Transparency',
    description: 'Every transaction and decision is recorded on the blockchain for public verification.',
    icon: Globe,
    stats: '100% Transparent'
  },
  {
    title: 'AI-Powered Decisions',
    description: 'Advanced AI analysis ensures only viable projects receive funding support.',
    icon: Brain,
    stats: '95% Success Rate'
  },
  {
    title: 'Milestone-Based Funding',
    description: 'Funds are released incrementally based on verified milestone completion.',
    icon: Target,
    stats: '98% Accountability'
  },
  {
    title: 'Fast Processing',
    description: 'Automated smart contracts enable rapid funding decisions and disbursements.',
    icon: Zap,
    stats: '< 48 Hours'
  }
];

export default function HowItWorksPage() {
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
            <Link href="/how-it-works" className="text-sm font-medium text-primary">
              How it Works
            </Link>
            <Link href="/governance" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Governance
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/create/startup">Create Project</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container-wide text-center">
          <Badge variant="outline" className="mb-4">
            🔄 Transparent Process
          </Badge>
          <h1 className="text-fluid-5xl font-bold mb-6">
            How ImpactChain{' '}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Works
            </span>
          </h1>
          <p className="text-fluid-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Our AI-powered blockchain platform revolutionizes funding through transparent, 
            accountable, and efficient processes that benefit both funders and recipients.
          </p>
          <Button size="lg" asChild>
            <Link href="/explore">
              Start Exploring <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-fluid-3xl font-bold mb-4">Our 6-Step Process</h2>
            <p className="text-fluid-lg text-muted-foreground max-w-2xl mx-auto">
              From project submission to impact verification, every step is transparent and accountable
            </p>
          </div>

          <div className="space-y-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div key={step.id} className={`flex items-center gap-8 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="flex-1">
                    <Card className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center text-white`}>
                          <Icon className="h-8 w-8" />
                        </div>
                        <div>
                          <Badge variant="outline" className="mb-2">Step {step.id}</Badge>
                          <h3 className="text-2xl font-bold">{step.title}</h3>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-6 text-lg">
                        {step.description}
                      </p>
                      
                      <div className="space-y-2">
                        {step.details.map((detail, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-muted-foreground">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                      <div className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center text-white shadow-lg`}>
                        <Icon className="h-8 w-8" />
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-1 h-16 bg-gradient-to-b from-primary/50 to-purple-500/50 mx-auto mt-4" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-fluid-3xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-fluid-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced technology meets social impact for unprecedented transparency and accountability
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{benefit.description}</p>
                  <Badge variant="secondary" className="text-xs">
                    {benefit.stats}
                  </Badge>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-wide">
          <Card className="text-center p-12 bg-gradient-to-r from-primary/5 to-purple-500/5">
            <CardContent className="space-y-6">
              <h3 className="text-fluid-2xl font-bold">Ready to Get Started?</h3>
              <p className="text-fluid-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of donors, investors, and changemakers building a more 
                transparent and accountable funding ecosystem.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/explore">
                    Explore Projects
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/create/startup">
                    Create Project
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
} 