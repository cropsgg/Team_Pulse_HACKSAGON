'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ContributionModal } from '@/components/modals/ContributionModal';
import { Campaign } from '@/types';
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
  Award,
  ExternalLink,
  Copy
} from 'lucide-react';

interface CampaignDetailClientProps {
  campaign: Campaign;
}

export default function CampaignDetailClient({ campaign }: CampaignDetailClientProps) {
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'updates' | 'nfts'>('overview');

  const progressPercentage = (campaign.raised / campaign.goal) * 100;
  const daysLeft = Math.ceil((campaign.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign.title,
          text: campaign.shortDescription,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="capitalize">
                  {campaign.category}
                </Badge>
                <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                  {campaign.status}
                </Badge>
                {campaign.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {campaign.location.country}
                  </div>
                )}
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{campaign.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{campaign.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{campaign.backers.toLocaleString()} backers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Campaign ended'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>Verified</span>
                </div>
              </div>
            </div>

            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-3xl font-bold text-charity-600">
                      ${campaign.raised.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      raised of ${campaign.goal.toLocaleString()} goal
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{progressPercentage.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">funded</div>
                  </div>
                </div>
                
                <Progress value={progressPercentage} className="h-3" />
                
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setShowContributionModal(true)}
                    className="flex-1 bg-charity-500 hover:bg-charity-600"
                    disabled={campaign.status !== 'active'}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    {campaign.status === 'active' ? 'Support Campaign' : 'Campaign Ended'}
                  </Button>
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Creator Info */}
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Campaign Creator</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-charity-500 to-impact-500 flex items-center justify-center text-white font-bold">
                  {campaign.creatorName.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold">{campaign.creatorName}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <span>{campaign.creator.slice(0, 8)}...{campaign.creator.slice(-6)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyAddress(campaign.creator)}
                      className="h-4 w-4 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Campaign Image */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-charity-600">{campaign.kpis.length}</div>
                <div className="text-sm text-muted-foreground">KPIs Tracked</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-impact-600">{campaign.milestones.length}</div>
                <div className="text-sm text-muted-foreground">Milestones</div>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex p-1 space-x-1 bg-muted rounded-lg w-fit">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'milestones', label: 'Milestones', icon: Target },
              { id: 'updates', label: 'Updates', icon: Clock },
              { id: 'nfts', label: 'NFT Rewards', icon: Award }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'milestones' | 'updates' | 'nfts')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-background text-charity-600 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* KPIs */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Impact Metrics
                </h3>
                <div className="space-y-4">
                  {campaign.kpis.map((kpi) => (
                    <div key={kpi.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{kpi.name}</div>
                          <div className="text-sm text-muted-foreground">{kpi.description}</div>
                        </div>
                        {kpi.verified && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{kpi.current.toLocaleString()} / {kpi.target.toLocaleString()} {kpi.unit}</span>
                      </div>
                      <Progress value={(kpi.current / kpi.target) * 100} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        Last updated: {kpi.lastUpdated.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Contract Info */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Blockchain Details
                </h3>
                <div className="space-y-4">
                  {campaign.contractAddress && (
                    <div>
                      <label className="text-sm font-medium">Campaign Contract</label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                          {campaign.contractAddress}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyAddress(campaign.contractAddress!)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {campaign.escrowAddress && (
                    <div>
                      <label className="text-sm font-medium">Escrow Contract</label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                          {campaign.escrowAddress}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyAddress(campaign.escrowAddress!)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Smart Contract Verified</span>
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Funds are secured in escrow until milestones are met
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'milestones' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Campaign Milestones</h3>
              <div className="space-y-6">
                {campaign.milestones.map((milestone, index) => (
                  <div key={milestone.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        milestone.status === 'completed' 
                          ? 'bg-green-500 text-white' 
                          : milestone.status === 'in-progress'
                          ? 'bg-blue-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {milestone.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      {index < campaign.milestones.length - 1 && (
                        <div className="w-px h-16 bg-border mt-2" />
                      )}
                    </div>
                    
                    <div className="flex-1 pb-8">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{milestone.title}</h4>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        </div>
                        <Badge variant={
                          milestone.status === 'completed' ? 'default' :
                          milestone.status === 'in-progress' ? 'secondary' : 'outline'
                        }>
                          {milestone.status}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span>Target: ${milestone.targetAmount.toLocaleString()}</span>
                        <span>Due: {milestone.deadline.toLocaleDateString()}</span>
                      </div>
                      
                      {milestone.completedAt && (
                        <div className="text-sm text-green-600 mt-1">
                          Completed: {milestone.completedAt.toLocaleDateString()}
                        </div>
                      )}
                      
                      {milestone.evidence && milestone.evidence.length > 0 && (
                        <div className="mt-3">
                          <div className="text-sm font-medium mb-2">Evidence:</div>
                          <div className="space-y-1">
                            {milestone.evidence.map((evidence, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <Badge variant="outline" className="text-xs">
                                  {evidence.type}
                                </Badge>
                                <span className="text-muted-foreground">
                                  {evidence.verificationSource}
                                </span>
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'updates' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Campaign Updates</h3>
              <div className="space-y-6">
                <div className="border-l-4 border-l-charity-500 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">Milestone 1 Completed Successfully</h4>
                    <span className="text-sm text-muted-foreground">2 days ago</span>
                  </div>
                  <p className="text-muted-foreground mb-2">
                    We&apos;ve successfully completed our site survey and community engagement phase. 
                    The response from local communities has been overwhelmingly positive.
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="outline">Site Survey</Badge>
                    <Badge variant="outline">Community Engagement</Badge>
                  </div>
                </div>
                
                <div className="border-l-4 border-l-blue-500 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">Equipment Procurement in Progress</h4>
                    <span className="text-sm text-muted-foreground">1 week ago</span>
                  </div>
                  <p className="text-muted-foreground mb-2">
                    We&apos;ve begun the procurement process for solar water purification systems. 
                    Expected delivery within the next 2 months.
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="outline">Procurement</Badge>
                    <Badge variant="outline">Solar Systems</Badge>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'nfts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaign.nftRewards?.map((nft) => (
                <Card key={nft.id} className="p-6">
                  <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <Award className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <h4 className="font-semibold mb-2">{nft.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{nft.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Min. Donation:</span>
                      <span className="font-semibold">${nft.minDonation}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Claimed:</span>
                      <span>{nft.claimed} / {nft.supply}</span>
                    </div>
                    <Progress value={(nft.claimed / nft.supply) * 100} className="h-2" />
                  </div>
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled={nft.claimed >= nft.supply}
                  >
                    {nft.claimed >= nft.supply ? 'Sold Out' : 'Claim NFT'}
                  </Button>
                </Card>
              )) || (
                <div className="col-span-full text-center py-12">
                  <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No NFT Rewards Available</h3>
                  <p className="text-muted-foreground">
                    This campaign doesn&apos;t currently offer NFT rewards for contributors.
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Contribution Modal */}
      {showContributionModal && (
        <ContributionModal
          isOpen={showContributionModal}
          onClose={() => setShowContributionModal(false)}
          type="funding"
          item={{
            id: campaign.id,
            title: campaign.title,
            description: campaign.description,
            goal: campaign.goal,
            raised: campaign.raised,
            creator: {
              name: campaign.creatorName
            }
          }}
        />
      )}
    </div>
  );
} 