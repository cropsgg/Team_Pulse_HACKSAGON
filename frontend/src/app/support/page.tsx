'use client';

import { Helmet } from 'react-helmet-async';
import { Search, MessageCircle, FileText, Video, ExternalLink, HelpCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const faqCategories = [
  {
    title: 'Getting Started',
    icon: '🚀',
    faqs: [
      {
        question: 'How do I create an account?',
        answer: 'You can create an account by connecting your crypto wallet (MetaMask, WalletConnect) or signing up with your email address. We\'ll create a smart wallet for email users automatically.'
      },
      {
        question: 'What is ImpactChain & CharityChain?',
        answer: 'We\'re an AI-powered decentralized blockchain platform that connects donors with verified charitable projects and investors with promising startups, ensuring transparency through blockchain technology.'
      },
      {
        question: 'How does blockchain technology help?',
        answer: 'Blockchain provides complete transparency - every donation and investment is recorded permanently, milestone completions are verified, and funds are released automatically through smart contracts.'
      }
    ]
  },
  {
    title: 'Donations & Funding',
    icon: '💝',
    faqs: [
      {
        question: 'How do I donate to a project?',
        answer: 'Browse projects in the Explore section, click on a project you\'d like to support, and click the "Donate" button. You can pay with cryptocurrency or fiat currency through our payment partners.'
      },
      {
        question: 'Are donations tax-deductible?',
        answer: 'Yes, donations to registered NGOs qualify for 80G tax deductions in India. We provide detailed receipts and annual tax reports from your dashboard.'
      },
      {
        question: 'How are funds released to projects?',
        answer: 'Funds are released based on milestone completion. Projects must submit evidence of progress, which is verified by AI analysis and community review before funds are released.'
      }
    ]
  },
  {
    title: 'Project Creation',
    icon: '📝',
    faqs: [
      {
        question: 'How do I create a charity project?',
        answer: 'Click "Create Project" → "NGO Project", fill out the detailed form with your project information, upload required documents, and submit for verification. The process typically takes 2-3 business days.'
      },
      {
        question: 'What documents do I need?',
        answer: 'For NGOs: Registration certificate, 12A/80G certificates, project proposal, budget breakdown, and team information. For startups: Business plan, financial projections, and incorporation documents.'
      },
      {
        question: 'How long does verification take?',
        answer: 'Project verification typically takes 2-3 business days. Our AI system performs initial checks, followed by human review. You\'ll be notified via email once verification is complete.'
      }
    ]
  },
  {
    title: 'DAO Governance',
    icon: '🗳️',
    faqs: [
      {
        question: 'What is DAO governance?',
        answer: 'DAO (Decentralized Autonomous Organization) governance allows community members to vote on platform decisions like fee changes, feature updates, and dispute resolutions. All proposals are transparent and recorded on-chain.'
      },
      {
        question: 'How do I participate in voting?',
        answer: 'Connect your wallet and visit the Governance section. Your voting power is based on your platform participation, stake, and reputation. All active community members can participate.'
      },
      {
        question: 'What happens if a proposal passes?',
        answer: 'Approved proposals are automatically executed through smart contracts. The community can track implementation progress and verify that changes are made as voted.'
      }
    ]
  }
];

const supportChannels = [
  {
    title: 'AI Chat Assistant',
    description: 'Get instant answers to common questions',
    icon: MessageCircle,
    action: 'Chat Now',
    availability: '24/7 Available',
    responseTime: 'Instant'
  },
  {
    title: 'Email Support',
    description: 'Detailed help for complex issues',
    icon: FileText,
    action: 'Send Email',
    availability: 'Business Hours',
    responseTime: '2-4 hours'
  },
  {
    title: 'Video Tutorials',
    description: 'Step-by-step visual guides',
    icon: Video,
    action: 'Watch Videos',
    availability: 'Always Available',
    responseTime: 'Self-paced'
  },
  {
    title: 'Community Forum',
    description: 'Connect with other users and experts',
    icon: HelpCircle,
    action: 'Join Forum',
    availability: '24/7 Community',
    responseTime: '30 min avg'
  }
];

const popularGuides = [
  {
    title: 'Creating Your First NGO Project',
    description: 'Complete walkthrough of the project creation process',
    readTime: '8 min read',
    category: 'Getting Started',
    status: 'featured'
  },
  {
    title: 'Understanding Milestone Verification',
    description: 'How our AI-powered verification system works',
    readTime: '5 min read',
    category: 'Process',
    status: 'new'
  },
  {
    title: 'Tax Benefits and Documentation',
    description: 'Maximizing tax benefits from charitable donations',
    readTime: '6 min read',
    category: 'Taxes',
    status: 'updated'
  },
  {
    title: 'DAO Voting Best Practices',
    description: 'How to participate effectively in governance',
    readTime: '4 min read',
    category: 'Governance',
    status: 'popular'
  }
];

const ticketStatus = [
  {
    id: '#SP-1001',
    subject: 'Wallet connection issues with MetaMask',
    status: 'resolved',
    priority: 'medium',
    created: '2024-01-15',
    updated: '2024-01-16'
  },
  {
    id: '#SP-1002',
    subject: 'Tax receipt not generated',
    status: 'in-progress',
    priority: 'high',
    created: '2024-01-14',
    updated: '2024-01-15'
  }
];

function getStatusBadge(status: string) {
  switch (status) {
    case 'resolved':
      return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
    case 'in-progress':
      return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
    case 'open':
      return <Badge className="bg-blue-100 text-blue-800">Open</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getGuideStatus(status: string) {
  switch (status) {
    case 'featured':
      return <Badge className="bg-purple-100 text-purple-800">Featured</Badge>;
    case 'new':
      return <Badge className="bg-green-100 text-green-800">New</Badge>;
    case 'updated':
      return <Badge className="bg-blue-100 text-blue-800">Updated</Badge>;
    case 'popular':
      return <Badge className="bg-orange-100 text-orange-800">Popular</Badge>;
    default:
      return null;
  }
}

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <section className="py-16 lg:py-24">
        <div className="container-wide">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full px-4 py-2 mb-6">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Support Center</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              How can we <span className="text-gradient">help you?</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Find answers to your questions, get step-by-step guides, or contact our support team.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search for help articles, guides, or ask a question..."
                className="pl-12 h-14 text-lg"
              />
            </div>
          </div>

          {/* Support Channels */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {supportChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <Card key={channel.title} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold text-lg mb-2">{channel.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{channel.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="text-xs text-muted-foreground">{channel.availability}</div>
                      <div className="text-xs font-medium text-green-600">{channel.responseTime}</div>
                    </div>
                    <Button className="w-full">{channel.action}</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16">
        <div className="container-wide">
          <Tabs defaultValue="faq" className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="guides">Guides</TabsTrigger>
              <TabsTrigger value="tickets">My Tickets</TabsTrigger>
              <TabsTrigger value="chat">Live Chat</TabsTrigger>
            </TabsList>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="mt-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {faqCategories.map((category) => (
                  <Card key={category.title}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <span className="text-2xl">{category.icon}</span>
                        <span>{category.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {category.faqs.map((faq, index) => (
                          <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                            <h4 className="font-medium mb-2">{faq.question}</h4>
                            <p className="text-sm text-muted-foreground">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Guides Tab */}
            <TabsContent value="guides" className="mt-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularGuides.map((guide, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline">{guide.category}</Badge>
                        {getGuideStatus(guide.status)}
                      </div>
                      <h3 className="font-semibold mb-2">{guide.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{guide.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{guide.readTime}</span>
                        <Button variant="ghost" size="sm">
                          Read More
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tickets Tab */}
            <TabsContent value="tickets" className="mt-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Support Tickets</h2>
                  <Button>Create New Ticket</Button>
                </div>

                <div className="space-y-4">
                  {ticketStatus.map((ticket) => (
                    <Card key={ticket.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold">{ticket.subject}</h3>
                              {getStatusBadge(ticket.status)}
                              <Badge variant="outline" className="text-xs">
                                {ticket.priority} priority
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Ticket {ticket.id} • Created {ticket.created} • Updated {ticket.updated}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Live Chat Tab */}
            <TabsContent value="chat" className="mt-8">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-2xl font-semibold mb-4">Contact Our Support Team</h3>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                      Our support team is available to help you with any questions or issues. 
                      Reach out through email or create a support ticket for personalized assistance.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button size="lg">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Create Support Ticket
                      </Button>
                      <Button variant="outline" size="lg">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Email Support
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-muted/30">
        <div className="container-wide text-center">
          <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
            <Button variant="outline" size="lg">
              <ExternalLink className="h-4 w-4 mr-2" />
              Community Forum
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
} 