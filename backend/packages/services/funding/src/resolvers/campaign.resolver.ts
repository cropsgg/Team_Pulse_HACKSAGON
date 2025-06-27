import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { FundingService } from '../services/funding.service';

// Simple GraphQL types
interface Campaign {
  id: string;
  title: string;
  description: string;
  target: number;
  raised: number;
  status: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateCampaignInput {
  title: string;
  description: string;
  target: number;
  category?: string;
  endDate?: Date;
}

@Resolver('Campaign')
export class CampaignResolver {
  constructor(private readonly fundingService: FundingService) {}

  @Query('campaigns')
  async getCampaigns(): Promise<Campaign[]> {
    return this.fundingService.findAll();
  }

  @Query('campaign')
  async getCampaign(@Args('id', { type: () => ID }) id: string): Promise<Campaign | null> {
    const campaign = await this.fundingService.findOne(id);
    return campaign || null;
  }

  @Query('campaignStats')
  async getCampaignStats() {
    return this.fundingService.getCampaignStats();
  }

  @Mutation('createCampaign')
  async createCampaign(@Args('input') input: CreateCampaignInput): Promise<Campaign> {
    return this.fundingService.create(input);
  }

  @Mutation('updateCampaign')
  async updateCampaign(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: Partial<CreateCampaignInput>
  ): Promise<Campaign | null> {
    return this.fundingService.update(id, input);
  }

  @Mutation('deleteCampaign')
  async deleteCampaign(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    const deleted = await this.fundingService.delete(id);
    return deleted !== null;
  }
} 