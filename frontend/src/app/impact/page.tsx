'use client';

import { Helmet } from 'react-helmet-async';
import { Globe, TrendingUp, Users, Heart, Droplets, Leaf, GraduationCap, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressChart, LineChart, AnimatedCounter } from '@/components/charts';


const impactMetrics = [
  {
    label: 'Lives Impacted',
    value: 1247853,
    change: '+12.3%',
    icon: Users,
    description: 'People helped through our platform'
  },
  {
    label: 'Funds Distributed',
    value: 8945000000, // 89.45 Cr
    change: '+23.7%',
    icon: TrendingUp,
    description: 'Total funds distributed in INR'
  },
  {
    label: 'Projects Funded',
    value: 12847,
    change: '+8.9%',
    icon: Heart,
    description: 'Successfully funded projects'
  },
  {
    label: 'Active Donors',
    value: 156734,
    change: '+15.2%',
    icon: Building,
    description: 'Regular contributors to causes'
  }
];

const categoryImpacts = [
  {
    category: 'Education',
    icon: GraduationCap,
    beneficiaries: 324156,
    projects: 2847,
    color: '#3b82f6'
  },
  {
    category: 'Healthcare', 
    icon: Heart,
    beneficiaries: 189432,
    projects: 1923,
    color: '#ef4444'
  },
  {
    category: 'Clean Water',
    icon: Droplets,
    beneficiaries: 156789,
    projects: 1245,
    color: '#06b6d4'
  },
  {
    category: 'Environment',
    icon: Leaf,
    beneficiaries: 98234,
    projects: 876,
    color: '#10b981'
  }
];

const impactLocations = [
  { name: 'Maharashtra', projects: 2847, beneficiaries: 234567, coords: [19.7515, 75.7139] },
  { name: 'Karnataka', projects: 2156, beneficiaries: 189432, coords: [15.3173, 75.7139] },
  { name: 'Tamil Nadu', projects: 1923, beneficiaries: 167890, coords: [11.1271, 78.6569] },
  { name: 'Delhi', projects: 1678, beneficiaries: 145623, coords: [28.7041, 77.1025] },
  { name: 'Gujarat', projects: 1456, beneficiaries: 123456, coords: [23.0225, 72.5714] },
  { name: 'West Bengal', projects: 1234, beneficiaries: 109876, coords: [22.9868, 87.8550] }
];

const successStories = [
  {
    title: "Clean Water for 10,000 Villagers",
    location: "Rajasthan, India",
    impact: "10,247 people now have access to clean drinking water",
    imageUrl: "/api/placeholder/300/200",
    category: "Clean Water",
    fundingAmount: 2500000
  },
  {
    title: "Solar Education Initiative",
    location: "Bihar, India", 
    impact: "1,500 students learning with solar-powered devices",
    imageUrl: "/api/placeholder/300/200",
    category: "Education",
    fundingAmount: 1800000
  },
  {
    title: "Women's Healthcare Program",
    location: "Odisha, India",
    impact: "5,000 women received maternal healthcare",
    imageUrl: "/api/placeholder/300/200", 
    category: "Healthcare",
    fundingAmount: 3200000
  }
];

const monthlyData = [
  { label: 'Jan', value: 45000000 },
  { label: 'Feb', value: 52000000 },
  { label: 'Mar', value: 48000000 },
  { label: 'Apr', value: 61000000 },
  { label: 'May', value: 58000000 },
  { label: 'Jun', value: 67000000 },
  { label: 'Jul', value: 73000000 },
  { label: 'Aug', value: 69000000 },
  { label: 'Sep', value: 78000000 },
  { label: 'Oct', value: 82000000 },
  { label: 'Nov', value: 89000000 },
  { label: 'Dec', value: 94000000 }
];

export default function ImpactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="container-wide">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500/10 to-blue-500/10 rounded-full px-4 py-2 mb-6">
              <Globe className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Global Impact Dashboard</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Our <span className="text-gradient">Collective Impact</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Track the real-world change we're creating together through transparent,
              blockchain-verified charitable giving and impact investing.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {impactMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.label} className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Icon className="h-8 w-8 text-red-600" />
                      <Badge variant="secondary" className="text-green-600">
                        {metric.change}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold">
                        {metric.label === 'Funds Distributed' ? (
                          <>
                            ₹<AnimatedCounter end={Math.floor(metric.value / 10000000)} />Cr
                          </>
                        ) : (
                          <AnimatedCounter end={metric.value} />
                        )}
                      </div>
                      <div className="text-sm font-medium">{metric.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {metric.description}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact by Category */}
      <section className="py-16 bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Impact by Category</h2>
            <p className="text-muted-foreground">
              See how we're making a difference across various cause areas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryImpacts.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.category} className="text-center">
                  <CardContent className="p-6">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <Icon className="h-8 w-8" style={{ color: category.color }} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{category.category}</h3>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold" style={{ color: category.color }}>
                        <AnimatedCounter end={category.beneficiaries} />
                      </div>
                      <div className="text-sm text-muted-foreground">People Helped</div>
                      <div className="text-sm">
                        <AnimatedCounter end={category.projects} /> Projects
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Funding Trends */}
      <section className="py-16">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Funding Trends</h2>
              <p className="text-muted-foreground mb-8">
                Our monthly funding distribution shows consistent growth in community
                support and successful project completion rates.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <span className="font-medium">Average Monthly Growth</span>
                  <span className="text-green-600 font-bold">+18.4%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <span className="font-medium">Project Success Rate</span>
                  <span className="text-blue-600 font-bold">94.7%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <span className="font-medium">Average Donation Size</span>
                  <span className="text-purple-600 font-bold">₹2,847</span>
                </div>
              </div>
            </div>
            
            <div>
              <LineChart 
                data={monthlyData}
                height={300}
                color="#ef4444"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
            <p className="text-muted-foreground">
              Real impact stories from our funded projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-red-100 to-blue-100" />
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-3">
                    {story.category}
                  </Badge>
                  <h3 className="font-semibold text-lg mb-2">{story.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{story.location}</p>
                  <p className="text-sm mb-4">{story.impact}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      ₹{(story.fundingAmount / 100000).toFixed(1)}L funded
                    </span>
                    <span className="text-muted-foreground">2023</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Geographic Impact */}
      <section className="py-16">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Geographic Reach</h2>
            <p className="text-muted-foreground">
              Our impact spans across India, creating change in every state
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {impactLocations.map((location) => (
              <Card key={location.name}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{location.name}</h3>
                    <Badge variant="outline">{location.projects} projects</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {location.beneficiaries.toLocaleString()} people impacted
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Impact Movement</h2>
          <p className="text-xl mb-8 opacity-90">
            Every donation creates a ripple effect of positive change
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Donating
            </button>
            <button className="px-8 py-3 border border-white rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Create Project
            </button>
          </div>
        </div>
      </section>
    </main>
  );
} 