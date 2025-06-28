'use client';

import { Helmet } from 'react-helmet-async';
import { Building, TrendingUp, Users, Award, Calculator, FileText, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const csrBenefits = [
  {
    title: 'Tax Optimization',
    description: 'Maximize your CSR tax benefits with 80G certified donations',
    icon: Calculator,
    value: '30% Tax Savings'
  },
  {
    title: 'Transparency',
    description: 'Blockchain-verified impact tracking and milestone reporting',
    icon: FileText,
    value: '100% Transparent'
  },
  {
    title: 'Brand Impact',
    description: 'Measurable social impact that enhances your brand reputation',
    icon: Award,
    value: 'Real Impact'
  },
  {
    title: 'Compliance',
    description: 'Automated compliance reporting and documentation',
    icon: CheckCircle,
    value: 'Fully Compliant'
  }
];

const partnershipTiers = [
  {
    name: 'Essential',
    price: '₹5L - ₹25L',
    period: 'annually',
    description: 'Perfect for growing companies starting their CSR journey',
    features: [
      'Choose from 50+ verified NGO projects',
      'Quarterly impact reports',
      'Basic tax documentation',
      'Email support',
      'Employee volunteer matching'
    ],
    highlight: false
  },
  {
    name: 'Professional',
    price: '₹25L - ₹1Cr',
    period: 'annually',
    description: 'Comprehensive CSR solution for established enterprises',
    features: [
      'Custom project partnerships',
      'Monthly detailed analytics',
      'Dedicated account manager',
      'Priority support',
      'Employee engagement platform',
      'Custom impact dashboard',
      'Media coverage opportunities'
    ],
    highlight: true
  },
  {
    name: 'Enterprise',
    price: '₹1Cr+',
    period: 'annually',
    description: 'Full-scale CSR ecosystem for large corporations',
    features: [
      'Exclusive project creation',
      'Real-time impact tracking',
      'C-suite executive reports',
      '24/7 premium support',
      'Custom blockchain solutions',
      'Global impact programs',
      'Annual CSR summit access',
      'Regulatory compliance automation'
    ],
    highlight: false
  }
];

const corporatePartners = [
  { name: 'TechCorp India', logo: '🏢', sector: 'Technology', contribution: '₹2.4Cr' },
  { name: 'GreenEnergy Ltd', logo: '🌱', sector: 'Renewable Energy', contribution: '₹1.8Cr' },
  { name: 'FinanceFirst', logo: '💼', sector: 'Financial Services', contribution: '₹3.2Cr' },
  { name: 'Healthcare Plus', logo: '🏥', sector: 'Healthcare', contribution: '₹1.5Cr' },
  { name: 'EduTech Solutions', logo: '📚', sector: 'Education Technology', contribution: '₹0.9Cr' },
  { name: 'Manufacturing Co', logo: '🏭', sector: 'Manufacturing', contribution: '₹2.1Cr' }
];

const impactMetrics = [
  { label: 'Corporate Partners', value: '89', change: '+23%' },
  { label: 'Total CSR Deployed', value: '₹47Cr', change: '+34%' },
  { label: 'Lives Impacted', value: '2.8L', change: '+28%' },
  { label: 'Projects Funded', value: '342', change: '+19%' }
];

const csrCategories = [
  { name: 'Education & Skill Development', allocation: 35, projects: 89 },
  { name: 'Healthcare & Sanitation', allocation: 25, projects: 67 },
  { name: 'Environmental Sustainability', allocation: 20, projects: 45 },
  { name: 'Rural Development', allocation: 12, projects: 34 },
  { name: 'Women Empowerment', allocation: 8, projects: 28 }
];

export default function CSRPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-full px-4 py-2 mb-6">
                <Building className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Corporate CSR Hub</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                Transform Your <span className="text-gradient">CSR Impact</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Partner with ImpactChain for transparent, measurable, and compliant 
                corporate social responsibility initiatives that create real change.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600">
                  Schedule Consultation
                </Button>
                <Button variant="outline" size="lg">
                  Download CSR Guide
                </Button>
              </div>
            </div>
            
            {/* Tax Calculator */}
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>CSR Tax Benefit Calculator</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="revenue">Annual Revenue (₹)</Label>
                  <Input id="revenue" placeholder="10,00,00,000" />
                </div>
                <div>
                  <Label htmlFor="sector">Business Sector</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="financial">Financial Services</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">Calculate CSR Benefits</Button>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">₹2,00,000</div>
                  <div className="text-sm text-green-700">Minimum CSR Obligation</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Based on 2% of average net profit
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CSR Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our CSR Platform?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Leverage blockchain technology for transparent, compliant, and impactful CSR initiatives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {csrBenefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card key={benefit.title} className="text-center">
                  <CardContent className="p-6">
                    <Icon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{benefit.description}</p>
                    <Badge variant="secondary" className="text-blue-600">
                      {benefit.value}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="py-16">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Corporate Impact</h2>
            <p className="text-muted-foreground">
              Measurable results from our corporate partnerships
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {impactMetrics.map((metric) => (
              <Card key={metric.label}>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold mb-2">{metric.value}</div>
                  <div className="text-sm font-medium mb-1">{metric.label}</div>
                  <Badge variant="secondary" className="text-green-600">
                    {metric.change} this year
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CSR Allocation */}
          <Card>
            <CardHeader>
              <CardTitle>CSR Fund Allocation by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {csrCategories.map((category) => (
                  <div key={category.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{category.name}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">
                          {category.projects} projects
                        </span>
                        <span className="font-semibold">{category.allocation}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${category.allocation}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Partnership Tiers */}
      <section className="py-16 bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Partnership Plans</h2>
            <p className="text-muted-foreground">
              Choose the CSR partnership that best fits your organization's needs
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {partnershipTiers.map((tier) => (
              <Card key={tier.name} className={tier.highlight ? 'ring-2 ring-blue-500' : ''}>
                {tier.highlight && (
                  <div className="bg-blue-500 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold">{tier.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground">/{tier.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full mt-6" 
                    variant={tier.highlight ? 'default' : 'outline'}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Partners */}
      <section className="py-16">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Leading Corporations</h2>
            <p className="text-muted-foreground">
              Join industry leaders making a real difference through our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {corporatePartners.map((partner) => (
              <Card key={partner.name}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{partner.logo}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{partner.name}</h3>
                      <p className="text-sm text-muted-foreground">{partner.sector}</p>
                      <p className="text-sm font-medium text-green-600">
                        {partner.contribution} contributed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your CSR?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join leading corporations using blockchain technology for transparent, 
            measurable, and compliant CSR initiatives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Schedule Demo
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Download Brochure
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
} 