import { Injectable } from '@nestjs/common';

// Simple interface to avoid import issues
interface CreateCampaignData {
  title: string;
  description: string;
  target: number;
  raised?: number;
  status?: string;
  category?: string;
  endDate?: Date;
  creatorId?: string;
}

@Injectable()
export class FundingService {
  // Mock data for development
  private campaigns = [
    {
      id: '1',
      title: 'Clean Water for Rural Kenya',
      description: 'Providing solar-powered water pumps for 500 families in rural Kenya.',
      target: 50000,
      raised: 15000,
      status: 'ACTIVE',
      category: 'ENVIRONMENT',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Digital Education Platform',
      description: 'Bringing tablets and internet connectivity to remote schools.',
      target: 25000,
      raised: 8500,
      status: 'ACTIVE',
      category: 'EDUCATION',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async findAll() {
    return this.campaigns;
  }

  async findOne(id: string) {
    return this.campaigns.find(campaign => campaign.id === id);
  }

  async create(data: CreateCampaignData) {
    const newCampaign = {
      id: Date.now().toString(),
      ...data,
      raised: data.raised || 0,
      status: data.status || 'ACTIVE',
      category: data.category || 'GENERAL',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.campaigns.push(newCampaign);
    return newCampaign;
  }

  async update(id: string, data: Partial<CreateCampaignData>) {
    const index = this.campaigns.findIndex(campaign => campaign.id === id);
    if (index === -1) return null;
    
    this.campaigns[index] = {
      ...this.campaigns[index],
      ...data,
      updatedAt: new Date(),
    };
    
    return this.campaigns[index];
  }

  async delete(id: string) {
    const index = this.campaigns.findIndex(campaign => campaign.id === id);
    if (index === -1) return null;
    
    const deleted = this.campaigns[index];
    this.campaigns.splice(index, 1);
    return deleted;
  }

  // Additional utility methods
  async getCampaignStats() {
    return {
      total: this.campaigns.length,
      active: this.campaigns.filter(c => c.status === 'ACTIVE').length,
      totalRaised: this.campaigns.reduce((sum, c) => sum + c.raised, 0),
      totalTarget: this.campaigns.reduce((sum, c) => sum + c.target, 0),
    };
  }
} 