'use client';

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Heart, Target, FileText, Sparkles, Info } from 'lucide-react';
import Link from 'next/link';


export default function CreateNGOPage() {
  return (
    <main className="min-h-screen">
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <Heart className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-fluid-4xl font-bold">Create Charity Project</h1>
              <p className="text-fluid-lg text-muted-foreground">
                Submit your charitable cause for transparent community funding
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <Info className="h-5 w-5 text-red-600" />
            <div className="text-sm text-red-800">
              <strong>Important:</strong> All NGO submissions undergo thorough verification.
            </div>
          </div>
        </div>

        <div className="max-w-4xl">
          <form className="space-y-8">
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
                    <Label htmlFor="project-title">Project Title *</Label>
                    <Input id="project-title" placeholder="Enter your project title" />
                  </div>
                  <div>
                    <Label htmlFor="organization-name">Organization Name *</Label>
                    <Input id="organization-name" placeholder="Your NGO name" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Project Description *</Label>
                  <textarea 
                    id="description"
                    className="w-full min-h-32 p-3 border border-input rounded-md text-sm"
                    placeholder="Describe your charitable project..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Target className="h-5 w-5" />
                  Funding Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="funding-goal">Funding Goal (₹) *</Label>
                    <Input id="funding-goal" type="number" placeholder="Amount needed" />
                  </div>
                  <div>
                    <Label htmlFor="beneficiaries">Beneficiaries *</Label>
                    <Input id="beneficiaries" type="number" placeholder="People helped" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline">Save as Draft</Button>
              <Button className="bg-red-600 hover:bg-red-700">Submit Project</Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
