import { ObjectType, Field, ID, InputType, registerEnumType } from '@nestjs/graphql';

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(CampaignStatus, {
  name: 'CampaignStatus',
});

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field()
  email: string;
}

@ObjectType()
export class Donation {
  @Field(() => ID)
  id: string;

  @Field()
  amount: number;

  @Field()
  currency: string;

  @Field(() => User)
  user: User;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class Campaign {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  target: number;

  @Field()
  raised: number;

  @Field()
  currency: string;

  @Field()
  category: string;

  @Field(() => CampaignStatus)
  status: CampaignStatus;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => Date, { nullable: true })
  endsAt?: Date;

  @Field(() => User)
  creator: User;

  @Field(() => [Donation])
  donations: Donation[];

  @Field()
  donationCount: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class CampaignConnection {
  @Field(() => [Campaign])
  campaigns: Campaign[];

  @Field()
  total: number;

  @Field()
  hasMore: boolean;
}

@InputType()
export class CreateCampaignInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  target: number;

  @Field()
  currency: string;

  @Field()
  category: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => Date, { nullable: true })
  endsAt?: Date;

  @Field({ nullable: true })
  metadata?: any;
}

@InputType()
export class UpdateCampaignInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  target?: number;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => Date, { nullable: true })
  endsAt?: Date;

  @Field({ nullable: true })
  metadata?: any;
} 