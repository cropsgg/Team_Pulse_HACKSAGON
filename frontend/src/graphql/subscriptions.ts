import { gql } from '@apollo/client';

export const PROPOSAL_PASSED_SUBSCRIPTION = gql`
  subscription OnProposalPassed {
    proposalPassed {
      id
      title
      status
      type
      result
      finalizedAt
    }
  }
`;

export const AUCTION_FINALIZED_SUBSCRIPTION = gql`
  subscription OnAuctionFinalized {
    auctionFinalized {
      id
      assetName
      currentBid
      status
      winner {
        id
        name
      }
      finalizedAt
    }
  }
`;

export const NEW_BID_SUBSCRIPTION = gql`
  subscription OnNewBid($auctionId: ID!) {
    newBid(auctionId: $auctionId) {
      id
      amount
      auction {
        id
        currentBid
      }
      bidder {
        id
        name
      }
      createdAt
    }
  }
`;

export const HELP_DONATION_SUBSCRIPTION = gql`
  subscription OnHelpDonation($helpRequestId: ID!) {
    helpDonation(helpRequestId: $helpRequestId) {
      id
      amount
      helpRequest {
        id
        raised
        goal
      }
      donor {
        id
        name
      }
      createdAt
    }
  }
`;

export const FUNDING_CONTRIBUTION_SUBSCRIPTION = gql`
  subscription OnFundingContribution($fundingRoundId: ID!) {
    fundingContribution(fundingRoundId: $fundingRoundId) {
      id
      amount
      fundingRound {
        id
        raised
        goal
      }
      investor {
        id
        name
      }
      createdAt
    }
  }
`;

export const VOTE_CAST_SUBSCRIPTION = gql`
  subscription OnVoteCast($proposalId: ID!) {
    voteCast(proposalId: $proposalId) {
      id
      choice
      weight
      proposal {
        id
        totalVotes
        totalWeight
      }
      voter {
        id
        name
      }
      createdAt
    }
  }
`; 