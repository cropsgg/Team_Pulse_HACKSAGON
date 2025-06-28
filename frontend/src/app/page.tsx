import React from 'react';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Heart, 
  TrendingUp, 
  Shield, 
  Users, 
  Zap,
  Globe,
  Award,
  BarChart3,
  Target,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ImpactChain & CharityChain - Revolutionizing Funding Through Blockchain',
  description: 'AI-Powered Decentralized Blockchain DAO platform for transparent and accountable funding of startups and charitable causes.',
};

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-wide flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl">ImpactChain</span>
          </div>
          
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
            <Link href="/impact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Impact
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/explore">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
        <div className="container-wide relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="outline" className="mb-4">
              🚀 Powered by AI & Blockchain
            </Badge>
            
            <h1 className="text-fluid-5xl font-bold tracking-tight text-balance mb-6">
              Revolutionizing Funding Through{' '}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Transparent Blockchain
              </span>
            </h1>
            
            <p className="text-fluid-lg text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
              ImpactChain & CharityChain bring AI-powered transparency to funding. 
              Support startups, charities, and individuals through our decentralized DAO platform 
              with complete accountability and blockchain verification.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" className="min-w-48" asChild>
                <Link href="/explore">
                  Explore Causes <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="min-w-48" asChild>
                <Link href="/create/startup">Launch Your Project</Link>
              </Button>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">₹12.4Cr</div>
                <div className="text-sm text-muted-foreground">Total Donated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">143</div>
                <div className="text-sm text-muted-foreground">Startups Funded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">2.8K</div>
                <div className="text-sm text-muted-foreground">Active Donors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background gradient animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-fluid-3xl font-bold mb-4">How It Works</h2>
            <p className="text-fluid-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to transparent, accountable funding
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Submit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Founders and NGOs submit their projects with detailed proposals, 
                  documentation, and funding goals.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Vote</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  AI analyzes feasibility while the DAO community votes on funding decisions 
                  with full transparency.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Fund</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Smart contracts automatically release funds based on milestone 
                  completion and verification.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-fluid-3xl font-bold mb-4">Why Choose ImpactChain?</h2>
            <p className="text-fluid-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced technology meets social impact for unprecedented transparency
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Complete Transparency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every transaction is recorded on the blockchain with real-time tracking 
                  and public verification of fund usage.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle>AI-Powered Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced AI evaluates project feasibility, market potential, 
                  and impact prediction before funding decisions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Milestone-Based Funding</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Funds are released incrementally based on verified milestone 
                  completion, ensuring accountability.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Global Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Support causes worldwide with multi-currency support and 
                  localized impact tracking.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Verified Organizations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All NGOs and startups undergo rigorous verification processes 
                  with ongoing compliance monitoring.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Investment Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  VCs can track portfolio performance with real-time analytics 
                  and automated equity token management.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-wide">
          <Card className="text-center p-12 bg-gradient-to-r from-primary/5 to-purple-500/5">
            <CardContent className="space-y-6">
              <h3 className="text-fluid-2xl font-bold">Ready to Make an Impact?</h3>
              <p className="text-fluid-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of donors, investors, and changemakers building a more 
                transparent and accountable funding ecosystem.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/explore">
                    <Heart className="mr-2 h-4 w-4" />
                    Start Donating
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/create/startup">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Launch Project
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container-wide">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="font-bold text-xl">ImpactChain</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Revolutionizing funding through AI-powered blockchain transparency.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <div className="space-y-2 text-sm">
                <Link href="/explore" className="text-muted-foreground hover:text-foreground block">Explore</Link>
                <Link href="/how-it-works" className="text-muted-foreground hover:text-foreground block">How it Works</Link>
                <Link href="/governance" className="text-muted-foreground hover:text-foreground block">Governance</Link>
                <Link href="/impact" className="text-muted-foreground hover:text-foreground block">Impact</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Create</h4>
              <div className="space-y-2 text-sm">
                <Link href="/create/ngo" className="text-muted-foreground hover:text-foreground block">NGO Project</Link>
                <Link href="/create/startup" className="text-muted-foreground hover:text-foreground block">Startup</Link>
                <Link href="/create/personal" className="text-muted-foreground hover:text-foreground block">Personal Need</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm">
                <Link href="/help" className="text-muted-foreground hover:text-foreground block">Help Center</Link>
                <Link href="/docs" className="text-muted-foreground hover:text-foreground block">Documentation</Link>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground block">Contact</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 ImpactChain. All rights reserved. Built with ❤️ for social impact.</p>
          </div>
        </div>
      </footer>
    </main>
  );
} 