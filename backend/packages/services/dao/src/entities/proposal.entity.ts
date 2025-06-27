import { ObjectType, Field, ID, InputType, registerEnumType } from '@nestjs/graphql';

export enum ProposalStatus {
  ACTIVE = 'ACTIVE',
  EXECUTED = 'EXECUTED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

registerEnumType(ProposalStatus, {
  name: 'ProposalStatus',
});

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  walletAddress?: string;
}

@ObjectType()
export class Vote {
  @Field(() => ID)
  id: string;

  @Field()
  choice: string;

  @Field()
  weight: number;

  @Field({ nullable: true })
  reason?: string;

  @Field(() => User)
  user: User;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class Proposal {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  category: string;

  @Field(() => ProposalStatus)
  status: ProposalStatus;

  @Field(() => Date)
  votingEndsAt: Date;

  @Field(() => Date, { nullable: true })
  executedAt?: Date;

  @Field(() => User)
  creator: User;

  @Field(() => [Vote])
  votes: Vote[];

  @Field()
  voteCount: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class ProposalConnection {
  @Field(() => [Proposal])
  proposals: Proposal[];

  @Field()
  total: number;

  @Field()
  hasMore: boolean;
}

@InputType()
export class CreateProposalInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  category: string;

  @Field({ nullable: true })
  metadata?: any;
}

@InputType()
export class UpdateProposalInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  metadata?: any;
} 