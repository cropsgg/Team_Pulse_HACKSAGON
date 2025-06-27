import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        email
        username
        role
        profile {
          displayName
          bio
          avatar
        }
      }
      accessToken
      refreshToken
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        id
        email
        username
        role
        profile {
          displayName
          bio
          avatar
        }
      }
      accessToken
      refreshToken
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      refreshToken
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

export const ME = gql`
  query Me {
    me {
      id
      email
      username
      role
      profile {
        displayName
        bio
        avatar
        walletAddress
      }
    }
  }
`;

export const DONATE_HELP = gql`
  mutation DonateHelp($id: ID!, $amount: Float!) {
    donateHelp(id: $id, amount: $amount) {
      id
      amount
      helpRequest {
        id
        title
        raised
        goal
        status
      }
      donor {
        id
        name
      }
      createdAt
    }
  }
`;

export const DONATE_FUNDING = gql`
  mutation DonateFunding($id: ID!, $amount: Float!) {
    donateFunding(id: $id, amount: $amount) {
      id
      amount
      fundingRound {
        id
        title
        raised
        goal
        status
      }
      investor {
        id
        name
      }
      createdAt
    }
  }
`;

export const PLACE_BID = gql`
  mutation PlaceBid($id: ID!, $amount: Float!) {
    placeBid(id: $id, amount: $amount) {
      id
      amount
      auction {
        id
        assetName
        currentBid
        status
      }
      bidder {
        id
        name
      }
      createdAt
    }
  }
`;

export const CAST_VOTE = gql`
  mutation CastVote($proposalId: ID!, $choice: String!, $weight: Int!) {
    castVote(proposalId: $proposalId, choice: $choice, weight: $weight) {
      id
      choice
      weight
      proposal {
        id
        title
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

export const CREATE_IDEA = gql`
  mutation CreateIdea($input: IdeaInput!) {
    createIdea(input: $input) {
      id
      title
      description
      fundingGoal
      status
      founder {
        id
        name
      }
      createdAt
    }
  }
`; 