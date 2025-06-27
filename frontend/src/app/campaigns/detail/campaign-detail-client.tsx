'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockCampaigns } from '@/data/mock';
import { formatCurrency, formatDate, calculatePercentage } from '@/lib/utils';
import {
  Heart,
  Share2,
  MapPin,
  Calendar,
  Users,
  Target,
  CheckCircle,
  Clock,
  TrendingUp,
  Shield,
  Activity,
  Eye,
  Globe,
  Award,
  Zap,
  ArrowRight,
  ExternalLink,
  Play,
  Download,
  Copy,
  ChevronRight,
  AlertCircle,
  Star
} from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: any;
}

const DonationModal = ({ isOpen, onClose, campaign }: DonationModalProps) => {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Support This Campaign</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              ×
            </Button>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Image
                  src={campaign.image}
                  alt={campaign.title}
                  width={200}
                  height={120}
                  className="rounded-lg mx-auto mb-4"
                />
                <h3 className="font-semibold">{campaign.title}</h3>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Donation Amount (USD)</label>
                <div className="flex space-x-2 mb-4">
                  {[25, 50, 100, 250].map((preset) => (
                    <Button
                      key={preset}
                      variant={amount === preset.toString() ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAmount(preset.toString())}
                    >
                      ${preset}
                    </Button>
                  ))}
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Custom amount"
                  className="w-full p-3 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message (Optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Leave an encouraging message..."
                  className="w-full p-3 border rounded-md h-20 resize-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <label htmlFor="anonymous" className="text-sm">Donate anonymously</label>
              </div>

              <Button
                className="w-full"
                variant="charity"
                disabled={!amount}
                onClick={() => setStep(2)}
              >
                Continue to Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                <p className="text-muted-foreground">
                  Connect your wallet to complete the donation
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Donation Amount:</span>
                  <span className="font-semibold">${amount}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Platform Fee:</span>
                  <span>$0 (0%)</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${amount}</span>
                </div>
              </div>

              <Button className="w-full" variant="charity">
                <Heart className="mr-2 h-4 w-4" />
                Donate ${amount}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function CampaignDetailClient({ campaignId }: { campaignId: string }) {
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  
  // Find campaign by ID
  const campaign = mockCampaigns.find(c => c.id === campaignId);
  
  if (!campaign) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
          <p className="text-muted-foreground">The campaign you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const progressPercentage = calculatePercentage(campaign.raised, campaign.goal);
  const daysLeft = Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-2 gap-8"
        >
          {/* Image */}
          <div className="relative h-64 lg:h-80 rounded-xl overflow-hidden">
            <Image
              src={campaign.image}
              alt={campaign.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex justify-between items-end">
                <Badge variant="secondary" className="bg-white/90 text-black">
                  {campaign.category}
                </Badge>
                <Badge variant="success" className="bg-charity-500 text-white">
                  <Activity className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </div>
          </div>

          {/* Campaign Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{campaign.title}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {campaign.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{campaign.location.country}, {campaign.location.region}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Ends {formatDate(campaign.deadline)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>by {campaign.creatorName}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {campaign.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Funding Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{formatCurrency(campaign.raised)}</h2>
                <Badge variant={daysLeft > 0 ? 'default' : 'destructive'}>
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Campaign ended'}
                </Badge>
              </div>
              
              <Progress
                value={campaign.raised}
                max={campaign.goal}
                variant="gradient"
                size="lg"
                showPercentage
              />

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{progressPercentage}%</div>
                  <div className="text-sm text-muted-foreground">Funded</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{campaign.backers.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Donors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(campaign.goal)}</div>
                  <div className="text-sm text-muted-foreground">Goal</div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  className="flex-1"
                  variant="charity"
                  size="lg"
                  onClick={() => setIsDonationModalOpen(true)}
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Donate Now
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* KPIs Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-charity-500" />
                <span>Impact Metrics</span>
                <Badge variant="success" className="ml-auto">
                  <Shield className="w-3 h-3 mr-1" />
                  Blockchain Verified
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="grid md:grid-cols-2 gap-6">
                {campaign.kpis.map((kpi) => (
                  <div key={kpi.id} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{kpi.name}</h3>
                      {kpi.verified && (
                        <Badge variant="success" size="sm">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{kpi.description}</p>
                    <Progress
                      value={kpi.current}
                      max={kpi.target}
                      variant="impact"
                      showPercentage
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Last updated: {formatDate(kpi.lastUpdated)}
                      </span>
                      <span className="font-medium">
                        {kpi.current.toLocaleString()} / {kpi.target.toLocaleString()} {kpi.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Milestones Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-impact-500" />
                <span>Project Milestones</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-6">
                {campaign.milestones.map((milestone, index) => (
                  <div key={milestone.id} className="flex space-x-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        milestone.status === 'completed' ? 'bg-green-500 text-white' :
                        milestone.status === 'in-progress' ? 'bg-blue-500 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {milestone.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : milestone.status === 'in-progress' ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </div>
                      {index < campaign.milestones.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-200 mt-2" />
                      )}
                    </div>
                    
                    <div className="flex-1 pb-8">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{milestone.title}</h3>
                        <Badge variant={
                          milestone.status === 'completed' ? 'success' :
                          milestone.status === 'in-progress' ? 'info' :
                          'outline'
                        }>
                          {milestone.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {milestone.description}
                      </p>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Target: {formatCurrency(milestone.targetAmount)}
                        </span>
                        <span className="text-muted-foreground">
                          Due: {formatDate(milestone.deadline)}
                        </span>
                      </div>
                      {milestone.completedAt && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ Completed on {formatDate(milestone.completedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* NFT Rewards */}
        {campaign.nftRewards && campaign.nftRewards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-charity-500" />
                  <span>NFT Rewards</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="grid md:grid-cols-2 gap-6">
                  {campaign.nftRewards.map((nft) => (
                    <div key={nft.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold">{nft.name}</h3>
                        <Badge variant="outline">
                          {nft.claimed}/{nft.supply} claimed
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {nft.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Min. donation: {formatCurrency(nft.minDonation)}
                        </span>
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        campaign={campaign}
      />
    </div>
  );
} 