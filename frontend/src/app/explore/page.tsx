import React from 'react';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  SlidersHorizontal,
  MapPin,
  Calendar,
  TrendingUp,
  Heart,
  Users,
  Target,
  Star,
  Globe,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { projects } from '@/data/mock';

export const metadata: Metadata = {
  title: 'Explore Projects - ImpactChain & CharityChain',
  description: 'Discover and support innovative startups, charitable causes, and individuals in need through our transparent blockchain platform.',
};

const categories = [
  { id: 'all', name: 'All Projects', icon: Globe, count: 234 },
  { id: 'startup', name: 'Startups', icon: TrendingUp, count: 143 },
  { id: 'charity', name: 'Charities', icon: Heart, count: 67 },
  { id: 'personal', name: 'Personal Needs', icon: Users, count: 24 },
];

const sortOptions = [
  { value: 'trending', label: 'Trending' },
  { value: 'newest', label: 'Newest' },
  { value: 'funding', label: 'Most Funded' },
  { value: 'ending', label: 'Ending Soon' },
];

const filters = {
  fundingRange: [
    { value: '0-10000', label: 'Under ₹10K' },
    { value: '10000-100000', label: '₹10K - ₹1L' },
    { value: '100000-1000000', label: '₹1L - ₹10L' },
    { value: '1000000+', label: 'Above ₹10L' },
  ],
  location: [
    { value: 'india', label: 'India' },
    { value: 'global', label: 'Global' },
    { value: 'asia', label: 'Asia Pacific' },
    { value: 'europe', label: 'Europe' },
  ],
  stage: [
    { value: 'idea', label: 'Idea Stage' },
    { value: 'prototype', label: 'Prototype' },
    { value: 'growth', label: 'Growth' },
    { value: 'scale', label: 'Scale' },
  ],
};

export default function ExplorePage() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-wide flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl">ImpactChain</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/explore" className="text-sm font-medium text-primary">
              Explore
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
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

      <div className="container-wide py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-fluid-4xl font-bold mb-4">Explore Projects</h1>
          <p className="text-fluid-lg text-muted-foreground">
            Discover innovative startups, impactful charities, and individuals in need. 
            Support causes that matter to you through transparent blockchain funding.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search projects, organizations, or causes..." 
                className="pl-10 h-12"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="lg">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button variant="outline" size="lg">
                <Filter className="mr-2 h-4 w-4" />
                Sort: Trending
              </Button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={category.id === 'all' ? 'default' : 'outline'}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                  <Badge variant="secondary" className="ml-1">
                    {category.count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.slice(0, 9).map((project) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-purple-500/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 left-3">
                  <Badge variant={project.type === 'startup' ? 'default' : project.type === 'charity' ? 'secondary' : 'outline'}>
                    {project.type === 'startup' ? 'Startup' : project.type === 'charity' ? 'Charity' : 'Personal'}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className="bg-background/80 backdrop-blur">
                    <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
                    {project.rating}
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 hover:text-primary transition-colors">
                      <Link href={`/project/${project.slug}`}>
                        {project.title}
                      </Link>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      by {project.organization}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {project.description}
                </p>

                {/* Funding Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">₹{project.raised.toLocaleString()}</span>
                    <span className="text-muted-foreground">₹{project.goal.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((project.raised / project.goal) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{Math.round((project.raised / project.goal) * 100)}% funded</span>
                    <span>{project.daysLeft} days left</span>
                  </div>
                </div>

                {/* Project Meta */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {project.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {project.backers} backers
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" asChild>
                    <Link href={`/project/${project.slug}`}>
                      Support Now
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/project/${project.slug}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button size="lg" variant="outline">
            Load More Projects
          </Button>
        </div>
      </div>
    </main>
  );
} 