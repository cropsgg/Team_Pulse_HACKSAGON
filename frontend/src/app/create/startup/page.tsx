'use client';

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  Upload,
  Plus,
  Minus,
  Info,
  Target,
  Calendar,
  Users,
  TrendingUp,
  FileText,
  Sparkles,
  Building,
  Globe,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';


const formSections = [
  { id: 'basic', title: 'Basic Information', icon: FileText },
  { id: 'team', title: 'Team & Expertise', icon: Users },
  { id: 'business', title: 'Business Model', icon: Building },
  { id: 'funding', title: 'Funding Requirements', icon: DollarSign },
  { id: 'milestones', title: 'Milestones & Timeline', icon: Target },
  { id: 'documents', title: 'Documents & Media', icon: Upload }
];

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Environment',
  'Energy', 'Transportation', 'Food & Agriculture', 'Manufacturing', 'Other'
];

const fundingStages = [
  'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth', 'Bridge'
];

export default function CreateStartupPage() {
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
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container-wide py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-fluid-4xl font-bold">Create Startup Project</h1>
              <p className="text-fluid-lg text-muted-foreground">
                Submit your startup for transparent blockchain funding
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-5 w-5 text-blue-600" />
            <div className="text-sm text-blue-800">
              <strong>Important:</strong> All submissions undergo AI analysis and community voting. 
              Ensure your information is accurate and complete for the best chance of approval.
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Application Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formSections.map((section, index) => {
                    const Icon = section.icon;
                    const isActive = index === 0; // First section active by default
                    const isCompleted = false; // None completed initially
                    
                    return (
                      <div 
                        key={section.id} 
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          isActive 
                            ? 'bg-primary/10 border border-primary/20' 
                            : isCompleted 
                            ? 'bg-green-50 border border-green-200' 
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isActive 
                            ? 'bg-primary text-white' 
                            : isCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-muted'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${
                            isActive ? 'text-primary' : isCompleted ? 'text-green-700' : ''
                          }`}>
                            {section.title}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <div className="text-sm text-muted-foreground mb-2">Overall Progress</div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-1/6 transition-all duration-500" />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">1 of 6 sections completed</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <form className="space-y-8">
              {/* Basic Information Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <FileText className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="company-name">Company Name *</Label>
                      <Input id="company-name" placeholder="Enter your company name" />
                    </div>
                    <div>
                      <Label htmlFor="website">Website URL</Label>
                      <Input id="website" placeholder="https://yourcompany.com" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tagline">Tagline *</Label>
                    <Input id="tagline" placeholder="Brief description of what your company does" />
                  </div>

                  <div>
                    <Label htmlFor="description">Detailed Description *</Label>
                    <textarea 
                      id="description"
                      className="w-full min-h-32 p-3 border border-input rounded-md text-sm"
                      placeholder="Provide a comprehensive description of your startup, the problem you're solving, and your solution..."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="industry">Industry *</Label>
                      <select id="industry" className="w-full p-3 border border-input rounded-md text-sm">
                        <option value="">Select an industry</option>
                        {industries.map((industry) => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input id="location" placeholder="City, Country" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="founded">Founded Year *</Label>
                      <Input id="founded" type="number" placeholder="2024" />
                    </div>
                    <div>
                      <Label htmlFor="employees">Number of Employees *</Label>
                      <select id="employees" className="w-full p-3 border border-input rounded-md text-sm">
                        <option value="">Select range</option>
                        <option value="1-10">1-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-200">51-200</option>
                        <option value="201-500">201-500</option>
                        <option value="500+">500+</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Users className="h-5 w-5" />
                    Team & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label>Team Members *</Label>
                      <Button type="button" variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Member
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <Card className="p-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="member-name">Full Name *</Label>
                            <Input id="member-name" placeholder="John Doe" />
                          </div>
                          <div>
                            <Label htmlFor="member-role">Role *</Label>
                            <Input id="member-role" placeholder="CEO & Co-founder" />
                          </div>
                        </div>
                        <div className="mt-4">
                          <Label htmlFor="member-bio">Bio & Experience *</Label>
                          <textarea 
                            id="member-bio"
                            className="w-full min-h-24 p-3 border border-input rounded-md text-sm mt-1"
                            placeholder="Brief bio highlighting relevant experience and expertise..."
                          />
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button type="button" variant="ghost" size="sm">
                            <Minus className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="advisors">Key Advisors (Optional)</Label>
                    <textarea 
                      id="advisors"
                      className="w-full min-h-24 p-3 border border-input rounded-md text-sm"
                      placeholder="List key advisors and their credentials..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Funding Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5" />
                    Funding Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="funding-amount">Funding Amount (₹) *</Label>
                      <Input id="funding-amount" type="number" placeholder="5000000" />
                    </div>
                    <div>
                      <Label htmlFor="funding-stage">Funding Stage *</Label>
                      <select id="funding-stage" className="w-full p-3 border border-input rounded-md text-sm">
                        <option value="">Select stage</option>
                        {fundingStages.map((stage) => (
                          <option key={stage} value={stage}>{stage}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="use-of-funds">Use of Funds *</Label>
                    <textarea 
                      id="use-of-funds"
                      className="w-full min-h-32 p-3 border border-input rounded-md text-sm"
                      placeholder="Detailed breakdown of how the funds will be used (e.g., product development, marketing, hiring, etc.)..."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="revenue-model">Revenue Model *</Label>
                      <textarea 
                        id="revenue-model"
                        className="w-full min-h-24 p-3 border border-input rounded-md text-sm"
                        placeholder="How does your startup generate revenue?"
                      />
                    </div>
                    <div>
                      <Label htmlFor="current-revenue">Current Monthly Revenue (₹)</Label>
                      <Input id="current-revenue" type="number" placeholder="0" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button variant="outline" asChild>
                  <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Save as Draft
                  </Link>
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline">
                    Preview Application
                  </Button>
                  <Button>
                    Continue to Next Section
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
} 