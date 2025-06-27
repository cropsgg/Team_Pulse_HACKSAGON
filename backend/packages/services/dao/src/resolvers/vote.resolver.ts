import { Resolver, Mutation, Query, Args, Context, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { VoteService } from '../services/vote.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { 
  Vote, 
  CastVoteInput, 
  VoteConnection,
  VoteChoice 
} from '../entities/vote.entity';

@Resolver(() => Vote)
export class VoteResolver {
  constructor(private voteService: VoteService) {}

  @Query(() => VoteConnection)
  async votes(
    @Args('proposalId', { nullable: true }) proposalId?: string,
    @Args('userId', { nullable: true }) userId?: string,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number = 0,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number = 20,
  ): Promise<VoteConnection> {
    return this.voteService.findMany(proposalId, userId, offset, limit);
  }

  @Query(() => Vote, { nullable: true })
  async vote(
    @Args('proposalId') proposalId: string,
    @Args('userId') userId: string,
  ): Promise<Vote | null> {
    return this.voteService.findByProposalAndUser(proposalId, userId);
  }

  @Mutation(() => Vote)
  @UseGuards(JwtAuthGuard)
  async castVote(
    @Args('input') input: CastVoteInput,
    @Context() context,
  ): Promise<Vote> {
    const userId = context.req.user.id;
    return this.voteService.castVote(input, userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async changeVote(
    @Args('proposalId') proposalId: string,
    @Args('choice', { type: () => VoteChoice }) choice: VoteChoice,
    @Args('weight', { type: () => Int, nullable: true }) weight?: number,
    @Context() context,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    return this.voteService.changeVote(proposalId, userId, choice, weight);
  }

  @Query(() => Int)
  async getVotingPower(
    @Args('userId') userId: string,
    @Args('proposalId') proposalId: string,
  ): Promise<number> {
    return this.voteService.getVotingPower(userId, proposalId);
  }
} 