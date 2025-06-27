import React from 'react';
import { notFound } from 'next/navigation';
import { mockCampaigns } from '@/data/mock';
import CampaignDetailClient from './campaign-detail-client';

interface CampaignDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate static params for all campaigns
export async function generateStaticParams() {
  return mockCampaigns.map((campaign) => ({
    id: campaign.id,
  }));
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = await params;
  const campaign = mockCampaigns.find(c => c.id === id);

  if (!campaign) {
    notFound();
  }

  return <CampaignDetailClient campaign={campaign} />;
} 