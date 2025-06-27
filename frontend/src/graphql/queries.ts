import { gql } from '@apollo/client';

export const GET_HELP_REQUESTS = gql`
  query HelpRequests($offset: Int, $limit: Int, $status: String) {
    helpRequests(offset: $offset, limit: $limit, status: $status) {
      id
      title
      description
      goal
      raised
      status
      creator {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_HELP_REQUEST = gql`
  query HelpRequest($id: ID!) {
    helpRequest(id: $id) {
      id
      title
      description
      goal
      raised
      status
      creator {
        id
        name
        email
      }
      donors {
        id
        name
        amount
        donatedAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_FUNDING_ROUNDS = gql`
  query FundingRounds($offset: Int, $limit: Int, $status: String) {
    fundingRounds(offset: $offset, limit: $limit, status: $status) {
      id
      title
      description
      goal
      raised
      status
      founder {
        id
        name
      }
      milestones {
        id
        title
        description
        targetDate
        completed
      }
      kpis {
        id
        name
        current
        target
        unit
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_FUNDING_ROUND = gql`
  query FundingRound($id: ID!) {
    fundingRound(id: $id) {
      id
      title
      description
      goal
      raised
      status
      founder {
        id
        name
        email
      }
      investors {
        id
        name
        amount
        investedAt
      }
      milestones {
        id
        title
        description
        targetDate
        completed
        completedAt
      }
      kpis {
        id
        name
        description
        current
        target
        unit
        verified
        lastUpdated
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_AUCTIONS = gql`
  query Auctions($offset: Int, $limit: Int, $status: String) {
    auctions(offset: $offset, limit: $limit, status: $status) {
      id
      assetName
      assetType
      description
      currentBid
      startingBid
      endsAt
      status
      seller {
        id
        name
      }
      bids {
        id
        amount
        bidder {
          id
          name
        }
        createdAt
      }
      createdAt
    }
  }
`;

export const GET_AUCTION = gql`
  query Auction($id: ID!) {
    auction(id: $id) {
      id
      assetName
      assetType
      description
      currentBid
      startingBid
      endsAt
      status
      seller {
        id
        name
        email
      }
      bids {
        id
        amount
        bidder {
          id
          name
        }
        createdAt
      }
      winner {
        id
        name
      }
      createdAt
    }
  }
`;

export const GET_PROPOSALS = gql`
  query Proposals($offset: Int, $limit: Int, $status: String) {
    proposals(offset: $offset, limit: $limit, status: $status) {
      id
      title
      description
      type
      status
      proposer {
        id
        name
      }
      votes {
        id
        weight
        choice
        voter {
          id
          name
        }
        createdAt
      }
      totalVotes
      totalWeight
      endsAt
      createdAt
    }
  }
`;

export const GET_PROPOSAL = gql`
  query Proposal($id: ID!) {
    proposal(id: $id) {
      id
      title
      description
      type
      status
      proposer {
        id
        name
        email
      }
      votes {
        id
        weight
        choice
        voter {
          id
          name
        }
        createdAt
      }
      totalVotes
      totalWeight
      endsAt
      createdAt
    }
  }
`;

export const GET_MY_BADGES = gql`
  query MyBadges {
    me {
      id
      badges {
        id
        name
        description
        imageUrl
        metadata
        earnedAt
      }
    }
  }
`;

export const GET_MY_PROFILE = gql`
  query MyProfile {
    me {
      id
      email
      name
      role
      helpDonations {
        id
        amount
        helpRequest {
          id
          title
        }
        createdAt
      }
      fundingContributions {
        id
        amount
        fundingRound {
          id
          title
        }
        createdAt
      }
      auctionsWon {
        id
        assetName
        finalBid
        auction {
          id
          assetName
        }
        createdAt
      }
      badges {
        id
        name
        description
        imageUrl
        earnedAt
      }
    }
  }
`; 