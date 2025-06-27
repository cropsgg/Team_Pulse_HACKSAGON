import { Resolver, Query, Mutation, Args, Context, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProposalService } from '../services/proposal.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { 
  Proposal, 
  CreateProposalInput, 
  UpdateProposalInput,
  ProposalConnection,
  ProposalStatus 
} from '../entities/proposal.entity';

@Resolver(() => Proposal)
export class ProposalResolver {
  constructor(private proposalService: ProposalService) {}

  @Query(() => ProposalConnection)
  async proposals(
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
    @Args('status', { type: () => ProposalStatus, nullable: true }) status?: ProposalStatus,
    @Args('category', { nullable: true }) category?: string,
  ): Promise<ProposalConnection> {
    return this.proposalService.findMany(offset, limit, status, category);
  }

  @Query(() => Proposal, { nullable: true })
  async proposal(@Args('id') id: string): Promise<Proposal | null> {
    return this.proposalService.findById(id);
  }

  @Mutation(() => Proposal)
  @UseGuards(JwtAuthGuard)
  async createProposal(
    @Args('input') input: CreateProposalInput,
    @Context() context,
  ): Promise<Proposal> {
    const userId = context.req.user.id;
    return this.proposalService.create(input, userId);
  }

  @Mutation(() => Proposal)
  @UseGuards(JwtAuthGuard)
  async updateProposal(
    @Args('id') id: string,
    @Args('input') input: UpdateProposalInput,
    @Context() context,
  ): Promise<Proposal> {
    const userId = context.req.user.id;
    return this.proposalService.update(id, input, userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async executeProposal(
    @Args('id') id: string,
    @Context() context,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    return this.proposalService.execute(id, userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async cancelProposal(
    @Args('id') id: string,
    @Context() context,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    return this.proposalService.cancel(id, userId);
  }
} 