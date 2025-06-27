import { Injectable } from '@nestjs/common';

// Simple interfaces
interface Proposal {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  votingEnds: Date;
  createdAt: Date;
  updatedAt: Date;
  treasuryRecipient?: string;
  treasuryAmount?: number;
  creator: {
    id: string;
    name?: string;
    email: string;
  };
  votes: Vote[];
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
}

interface Vote {
  id: string;
  choice: string;
  weight: number;
  createdAt: Date;
  voter: {
    id: string;
    name?: string;
    email: string;
  };
}

interface CreateProposalData {
  title: string;
  description: string;
  type?: string;
  votingEnds: Date;
  treasuryRecipient?: string;
  treasuryAmount?: number;
  creatorId: string;
}

interface CreateVoteData {
  proposalId: string;
  voterId: string;
  choice: string;
  weight?: number;
}

@Injectable()
export class ProposalService {
  // Mock data for development
  private proposals: Proposal[] = [
    {
      id: '1',
      title: 'Platform Fee Reduction',
      description: 'Proposal to reduce platform fees from 2.5% to 1.5% to encourage more donations.',
      type: 'GOVERNANCE',
      status: 'ACTIVE',
      votingEnds: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: {
        id: '1',
        name: 'Admin User',
        email: 'admin@impactchain.org',
      },
      votes: [],
      votesFor: 0,
      votesAgainst: 0,
      votesAbstain: 0,
    },
    {
      id: '2',
      title: 'Treasury Allocation for Development',
      description: 'Allocate 10,000 MATIC from treasury for platform improvements.',
      type: 'TREASURY_SPEND',
      status: 'ACTIVE',
      votingEnds: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      treasuryAmount: 10000,
      treasuryRecipient: '0xDevTeamAddress',
      creator: {
        id: '2',
        name: 'Sarah Johnson',
        email: 'donor@example.com',
      },
      votes: [],
      votesFor: 0,
      votesAgainst: 0,
      votesAbstain: 0,
    },
  ];

  private votes: Vote[] = [];

  async findAll(): Promise<Proposal[]> {
    return this.proposals.map(proposal => ({
      ...proposal,
      votes: this.votes.filter(vote => vote.id.startsWith(proposal.id)),
    }));
  }

  async findOne(id: string): Promise<Proposal | null> {
    const proposal = this.proposals.find(p => p.id === id);
    if (!proposal) return null;

    return {
      ...proposal,
      votes: this.votes.filter(vote => vote.id.startsWith(proposal.id)),
    };
  }

  async create(data: CreateProposalData): Promise<Proposal> {
    const newProposal: Proposal = {
      id: Date.now().toString(),
      ...data,
      type: data.type || 'GOVERNANCE',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: {
        id: data.creatorId,
        name: 'User',
        email: 'user@example.com',
      },
      votes: [],
      votesFor: 0,
      votesAgainst: 0,
      votesAbstain: 0,
    };

    this.proposals.push(newProposal);
    return newProposal;
  }

  async vote(data: CreateVoteData): Promise<Vote> {
    const proposal = this.proposals.find(p => p.id === data.proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    if (new Date() > proposal.votingEnds) {
      throw new Error('Voting period has ended');
    }

    // Check if user already voted
    const existingVote = this.votes.find(
      v => v.id.includes(data.proposalId) && v.voter.id === data.voterId
    );
    if (existingVote) {
      throw new Error('User has already voted on this proposal');
    }

    const newVote: Vote = {
      id: `${data.proposalId}-${data.voterId}-${Date.now()}`,
      choice: data.choice,
      weight: data.weight || 1,
      createdAt: new Date(),
      voter: {
        id: data.voterId,
        name: 'Voter',
        email: 'voter@example.com',
      },
    };

    this.votes.push(newVote);

    // Update proposal vote counts
    switch (data.choice.toLowerCase()) {
      case 'for':
        proposal.votesFor += newVote.weight;
        break;
      case 'against':
        proposal.votesAgainst += newVote.weight;
        break;
      case 'abstain':
        proposal.votesAbstain += newVote.weight;
        break;
    }

    return newVote;
  }

  async getProposalStats() {
    return {
      total: this.proposals.length,
      active: this.proposals.filter(p => p.status === 'ACTIVE').length,
      passed: this.proposals.filter(p => p.status === 'PASSED').length,
      failed: this.proposals.filter(p => p.status === 'FAILED').length,
      totalVotes: this.votes.length,
    };
  }

  async executeProposal(id: string): Promise<Proposal | null> {
    const proposal = this.proposals.find(p => p.id === id);
    if (!proposal) return null;

    if (proposal.status !== 'ACTIVE') {
      throw new Error('Proposal is not active');
    }

    if (new Date() < proposal.votingEnds) {
      throw new Error('Voting period has not ended');
    }

    // Simple majority rule
    if (proposal.votesFor > proposal.votesAgainst) {
      proposal.status = 'PASSED';
    } else {
      proposal.status = 'FAILED';
    }

    proposal.updatedAt = new Date();
    return proposal;
  }
} 