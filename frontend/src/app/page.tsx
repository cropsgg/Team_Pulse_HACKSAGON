'use client';

import React from 'react';
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
  Target,
  CheckCircle,
  Sparkles,
  Star,
  Rocket,
  Brain
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950">
      {/* Navigation */}
      <nav className="nav-modern">
        <div className="container-modern flex h-20 items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-800 border border-gray-700">
              <Sparkles className="h-6 w-6 text-gray-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-gray-100">ImpactChain</span>
              <span className="text-xs text-gray-400 font-medium">Powered by AI & Blockchain</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/explore" className="text-sm font-semibold text-gray-300 hover:text-gray-100 transition-colors">
              Explore Projects
            </Link>
            <Link href="/how-it-works" className="text-sm font-semibold text-gray-300 hover:text-gray-100 transition-colors">
              How it Works
            </Link>
            <Link href="/dashboard" className="text-sm font-semibold text-gray-300 hover:text-gray-100 transition-colors">
              Dashboard
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="btn-ghost">
                Sign In
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="sm" className="btn-primary">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-hero text-gray-100 relative">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container-modern relative z-10">
          <div className="mx-auto max-w-5xl text-center">
            <Badge className="mb-6 bg-gray-800/80 backdrop-blur-sm text-gray-300 border-gray-700 px-4 py-2 text-sm font-semibold">
              <Rocket className="mr-2 h-4 w-4" />
              Revolutionary Funding Platform
            </Badge>
            
            <h1 className="text-fluid-5xl font-black tracking-tight mb-8 text-gray-100">
              Revolutionizing Funding Through{' '}
              <span className="relative">
                <span className="text-gradient-primary">
                  Transparent Blockchain
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-gray-600 to-gray-400 rounded-full"></div>
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              ImpactChain & CharityChain bring AI-powered transparency to funding. 
              Support startups, charities, and individuals through our decentralized DAO platform 
              with complete accountability and real-time verification.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link href="/explore">
                <Button size="lg" className="btn-primary text-lg px-8 py-4 h-auto min-w-56">
                  <Heart className="mr-3 h-5 w-5" />
                  Explore Causes
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/create/startup">
                <Button variant="outline" size="lg" className="btn-outline text-lg px-8 py-4 h-auto min-w-56">
                  <TrendingUp className="mr-3 h-5 w-5" />
                  Launch Your Project
                </Button>
              </Link>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="text-3xl font-black text-gray-100 mb-2">₹12.4Cr+</div>
                <div className="text-sm text-gray-400 font-medium">Total Donated</div>
              </div>
              <div className="text-center bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="text-3xl font-black text-gray-100 mb-2">143+</div>
                <div className="text-sm text-gray-400 font-medium">Startups Funded</div>
              </div>
              <div className="text-center bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="text-3xl font-black text-gray-100 mb-2">2.8K+</div>
                <div className="text-sm text-gray-400 font-medium">Active Donors</div>
              </div>
              <div className="text-center bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="text-3xl font-black text-gray-100 mb-2">98%</div>
                <div className="text-sm text-gray-400 font-medium">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="w-16 h-16 bg-gray-700/30 rounded-full backdrop-blur-sm border border-gray-600"></div>
        </div>
        <div className="absolute bottom-20 right-10 animate-float" style={{animationDelay: '2s'}}>
          <div className="w-24 h-24 bg-gray-600/20 rounded-full backdrop-blur-sm border border-gray-600"></div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-features">
        <div className="container-modern">
          <div className="text-center mb-20">
            <h2 className="text-fluid-3xl font-black text-gray-100 mb-6">How It Works</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Three simple steps to transparent, accountable funding with AI-powered verification
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-modern group">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-8 w-8 text-gray-300" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-100">Submit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Founders and NGOs submit their projects with detailed proposals, 
                  documentation, and funding goals through our streamlined platform.
                </p>
              </CardContent>
            </Card>

            <Card className="card-modern group">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-8 w-8 text-gray-300" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-100">AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Advanced AI analyzes feasibility, market potential, and impact while 
                  the DAO community votes with complete transparency.
                </p>
              </CardContent>
            </Card>

            <Card className="card-modern group">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-8 w-8 text-gray-300" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-100">Fund & Track</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Smart contracts automatically release funds based on milestone 
                  completion with real-time tracking and verification.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-900">
        <div className="container-modern">
          <div className="text-center mb-20">
            <h2 className="text-fluid-3xl font-black text-gray-100 mb-6">Why Choose ImpactChain?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Advanced technology meets social impact for unprecedented transparency and accountability
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-modern">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-4">
                  <Shield className="h-7 w-7 text-gray-300" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-100">Complete Transparency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  Every transaction is recorded on the blockchain with real-time tracking 
                  and public verification of fund usage.
                </p>
              </CardContent>
            </Card>

            <Card className="card-modern">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-4">
                  <Zap className="h-7 w-7 text-gray-300" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-100">AI-Powered Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  Advanced AI evaluates project feasibility, market potential, 
                  and impact prediction before funding decisions.
                </p>
              </CardContent>
            </Card>

            <Card className="card-modern">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-4">
                  <Globe className="h-7 w-7 text-gray-300" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-100">Global Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  Support causes worldwide with multi-currency support and 
                  localized impact tracking across all regions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-cta text-gray-100">
        <div className="container-modern">
          <Card className="bg-gray-800/60 backdrop-blur-sm border-gray-700 text-center p-16 rounded-3xl">
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-fluid-3xl font-black text-gray-100">Ready to Make an Impact?</h3>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Join thousands of donors, investors, and changemakers building a more 
                  transparent and accountable funding ecosystem for the future.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/explore">
                  <Button size="lg" className="bg-gray-700 text-gray-100 hover:bg-gray-600 font-semibold py-4 px-8 h-auto text-lg border border-gray-600">
                    <Heart className="mr-3 h-5 w-5" />
                    Start Donating Today
                  </Button>
                </Link>
                <Link href="/create/startup">
                  <Button variant="outline" size="lg" className="btn-outline font-semibold py-4 px-8 h-auto text-lg">
                    <TrendingUp className="mr-3 h-5 w-5" />
                    Launch Your Project
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-300 py-16 border-t border-gray-800">
        <div className="container-modern">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-800 border border-gray-700">
                  <Sparkles className="h-6 w-6 text-gray-300" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xl text-gray-100">ImpactChain</span>
                  <span className="text-sm text-gray-400">Blockchain for Good</span>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Revolutionizing funding through AI-powered blockchain transparency 
                for a better tomorrow.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-lg text-gray-100">Platform</h4>
              <div className="space-y-3">
                <Link href="/explore" className="block text-gray-400 hover:text-gray-200 transition-colors">Explore Projects</Link>
                <Link href="/how-it-works" className="block text-gray-400 hover:text-gray-200 transition-colors">How it Works</Link>
                <Link href="/dashboard" className="block text-gray-400 hover:text-gray-200 transition-colors">Dashboard</Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-lg text-gray-100">Create</h4>
              <div className="space-y-3">
                <Link href="/create/ngo" className="block text-gray-400 hover:text-gray-200 transition-colors">NGO Project</Link>
                <Link href="/create/startup" className="block text-gray-400 hover:text-gray-200 transition-colors">Startup Funding</Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-lg text-gray-100">Support</h4>
              <div className="space-y-3">
                <Link href="/support" className="block text-gray-400 hover:text-gray-200 transition-colors">Help Center</Link>
                <Link href="/contact" className="block text-gray-400 hover:text-gray-200 transition-colors">Contact Us</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-500">
              &copy; 2024 ImpactChain. All rights reserved. Built with ❤️ for social impact.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
} 