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
    <main className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
      {/* Navigation */}
      <nav className="nav-modern">
        <div className="container-modern flex h-20 items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-gray-900">ImpactChain</span>
              <span className="text-xs text-gray-600 font-medium">Powered by AI & Blockchain</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/explore" className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
              Explore Projects
            </Link>
            <Link href="/how-it-works" className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
              How it Works
            </Link>
            <Link href="/dashboard" className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
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
      <section className="section-hero text-white relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container-modern relative z-10">
          <div className="mx-auto max-w-5xl text-center">
            <Badge className="mb-6 bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 text-sm font-semibold">
              <Rocket className="mr-2 h-4 w-4" />
              Revolutionary Funding Platform
            </Badge>
            
            <h1 className="text-fluid-5xl font-black tracking-tight mb-8 text-white">
              Revolutionizing Funding Through{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Transparent Blockchain
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full"></div>
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
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
                <Button variant="outline" size="lg" className="btn-secondary text-lg px-8 py-4 h-auto min-w-56 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-gray-900">
                  <TrendingUp className="mr-3 h-5 w-5" />
                  Launch Your Project
                </Button>
              </Link>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-black text-white mb-2">₹12.4Cr+</div>
                <div className="text-sm text-white/80 font-medium">Total Donated</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-black text-white mb-2">143+</div>
                <div className="text-sm text-white/80 font-medium">Startups Funded</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-black text-white mb-2">2.8K+</div>
                <div className="text-sm text-white/80 font-medium">Active Donors</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-black text-white mb-2">98%</div>
                <div className="text-sm text-white/80 font-medium">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm"></div>
        </div>
        <div className="absolute bottom-20 right-10 animate-float" style={{animationDelay: '2s'}}>
          <div className="w-24 h-24 bg-white/5 rounded-full backdrop-blur-sm"></div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-features">
        <div className="container-modern">
          <div className="text-center mb-20">
            <h2 className="text-fluid-3xl font-black text-gray-900 mb-6">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three simple steps to transparent, accountable funding with AI-powered verification
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-modern group">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Submit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Founders and NGOs submit their projects with detailed proposals, 
                  documentation, and funding goals through our streamlined platform.
                </p>
              </CardContent>
            </Card>

            <Card className="card-modern group">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Advanced AI analyzes feasibility, market potential, and impact while 
                  the DAO community votes with complete transparency.
                </p>
              </CardContent>
            </Card>

            <Card className="card-modern group">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Fund & Track</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Smart contracts automatically release funds based on milestone 
                  completion with real-time tracking and verification.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container-modern">
          <div className="text-center mb-20">
            <h2 className="text-fluid-3xl font-black text-gray-900 mb-6">Why Choose ImpactChain?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced technology meets social impact for unprecedented transparency and accountability
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-modern">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Complete Transparency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Every transaction is recorded on the blockchain with real-time tracking 
                  and public verification of fund usage.
                </p>
              </CardContent>
            </Card>

            <Card className="card-modern">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">AI-Powered Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Advanced AI evaluates project feasibility, market potential, 
                  and impact prediction before funding decisions.
                </p>
              </CardContent>
            </Card>

            <Card className="card-modern">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4">
                  <Globe className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Global Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Support causes worldwide with multi-currency support and 
                  localized impact tracking across all regions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-cta text-white">
        <div className="container-modern">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center p-16 rounded-3xl">
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-fluid-3xl font-black text-white">Ready to Make an Impact?</h3>
                <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  Join thousands of donors, investors, and changemakers building a more 
                  transparent and accountable funding ecosystem for the future.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/explore">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold py-4 px-8 h-auto text-lg">
                    <Heart className="mr-3 h-5 w-5" />
                    Start Donating Today
                  </Button>
                </Link>
                <Link href="/create/startup">
                  <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold py-4 px-8 h-auto text-lg">
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
      <footer className="bg-gray-900 text-white py-16">
        <div className="container-modern">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xl">ImpactChain</span>
                  <span className="text-sm text-gray-400">Blockchain for Good</span>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Revolutionizing funding through AI-powered blockchain transparency 
                for a better tomorrow.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-lg text-white">Platform</h4>
              <div className="space-y-3">
                <Link href="/explore" className="block text-gray-300 hover:text-white transition-colors">Explore Projects</Link>
                <Link href="/how-it-works" className="block text-gray-300 hover:text-white transition-colors">How it Works</Link>
                <Link href="/dashboard" className="block text-gray-300 hover:text-white transition-colors">Dashboard</Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-lg text-white">Create</h4>
              <div className="space-y-3">
                <Link href="/create/ngo" className="block text-gray-300 hover:text-white transition-colors">NGO Project</Link>
                <Link href="/create/startup" className="block text-gray-300 hover:text-white transition-colors">Startup Funding</Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-lg text-white">Support</h4>
              <div className="space-y-3">
                <Link href="/support" className="block text-gray-300 hover:text-white transition-colors">Help Center</Link>
                <Link href="/contact" className="block text-gray-300 hover:text-white transition-colors">Contact Us</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2024 ImpactChain. All rights reserved. Built with ❤️ for social impact.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
} 