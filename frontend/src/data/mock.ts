import { 
  Campaign, 
  Donation, 
  User, 
  VolunteerTask, 
  GovernanceProposal, 
  DeFiVault,
  Badge,
  AIStory,
  CBDCVoucher,
  SatelliteData,
  ZKProof
} from '@/types';

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'Clean Water for Rural Kenya',
    description: 'Providing sustainable clean water access to 10,000 people in rural Kenya through solar-powered water purification systems. Our project combines cutting-edge technology with community-driven implementation to ensure long-term success and maintenance.',
    shortDescription: 'Solar-powered water purification for 10,000 people in rural Kenya',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    category: 'environment',
    goal: 250000,
    raised: 187500,
    backers: 1247,
    deadline: new Date('2024-08-15'),
    creator: '0x742d35Cc6634C0532925a3b8D2b542b2e24b5e6c',
    creatorName: 'WaterAid Kenya',
    tags: ['water', 'sustainability', 'kenya', 'solar', 'community'],
    status: 'active',
    location: {
      country: 'Kenya',
      region: 'Turkana County',
      coordinates: { lat: 2.5177, lng: 34.4753 }
    },
    contractAddress: '0x1234567890123456789012345678901234567890',
    escrowAddress: '0x2345678901234567890123456789012345678901',
    milestones: [
      {
        id: 'm1',
        title: 'Site Survey and Community Engagement',
        description: 'Complete site assessment and community consultation',
        targetAmount: 50000,
        deadline: new Date('2024-03-01'),
        status: 'completed',
        completedAt: new Date('2024-02-28'),
        verificationHash: '0xabc123...',
        evidence: [{
          type: 'document',
          url: '/documents/site-survey.pdf',
          hash: '0xdef456...',
          timestamp: new Date('2024-02-28'),
          verificationSource: 'IPFS'
        }]
      },
      {
        id: 'm2',
        title: 'Equipment Procurement',
        description: 'Purchase and deliver solar water purification systems',
        targetAmount: 125000,
        deadline: new Date('2024-05-01'),
        status: 'in-progress'
      },
      {
        id: 'm3',
        title: 'Installation and Training',
        description: 'Install systems and train local technicians',
        targetAmount: 75000,
        deadline: new Date('2024-07-01'),
        status: 'pending'
      }
    ],
    kpis: [
      {
        id: 'k1',
        name: 'People with Water Access',
        description: 'Number of people with access to clean water',
        target: 10000,
        current: 3250,
        unit: 'people',
        lastUpdated: new Date('2024-01-15'),
        verified: true
      },
      {
        id: 'k2',
        name: 'Water Quality Score',
        description: 'Average water quality score (WHO standards)',
        target: 95,
        current: 92,
        unit: '%',
        lastUpdated: new Date('2024-01-15'),
        verified: true
      }
    ],
    nftRewards: [
      {
        id: 'nft1',
        name: 'Water Guardian',
        description: 'Commemorative NFT for $100+ donations',
        image: '/nfts/water-guardian.png',
        minDonation: 100,
        supply: 1000,
        claimed: 234,
        contractAddress: '0x3456789012345678901234567890123456789012'
      }
    ]
  },
  {
    id: '2',
    title: 'Emergency Education Fund - Ukraine',
    description: 'Supporting displaced Ukrainian children with emergency education services, digital learning platforms, and psychological support. This initiative ensures continuity of education during challenging times.',
    shortDescription: 'Emergency education support for displaced Ukrainian children',
    image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=600&fit=crop',
    category: 'education',
    goal: 500000,
    raised: 342750,
    backers: 2156,
    deadline: new Date('2024-09-01'),
    creator: '0x8ba1f109551bD432803012645Hac136c21ef0ee',
    creatorName: 'UNICEF Ukraine',
    tags: ['education', 'ukraine', 'children', 'emergency', 'digital-learning'],
    status: 'active',
    location: {
      country: 'Ukraine',
      region: 'Multiple Regions'
    },
    contractAddress: '0x4567890123456789012345678901234567890123',
    milestones: [
      {
        id: 'm4',
        title: 'Platform Development',
        description: 'Develop multilingual digital learning platform',
        targetAmount: 150000,
        deadline: new Date('2024-04-01'),
        status: 'completed',
        completedAt: new Date('2024-03-25')
      },
      {
        id: 'm5',
        title: 'Teacher Training',
        description: 'Train 500 teachers on digital education tools',
        targetAmount: 200000,
        deadline: new Date('2024-06-01'),
        status: 'in-progress'
      }
    ],
    kpis: [
      {
        id: 'k3',
        name: 'Children Reached',
        description: 'Number of children receiving education support',
        target: 15000,
        current: 8750,
        unit: 'children',
        lastUpdated: new Date('2024-01-20'),
        verified: true
      }
    ]
  },
  {
    id: '3',
    title: 'Reforestation of Amazon Basin',
    description: 'Large-scale reforestation project to plant 1 million trees in the Amazon Basin, working with indigenous communities to restore degraded forest areas and combat climate change.',
    shortDescription: 'Plant 1 million trees in the Amazon Basin with indigenous communities',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    category: 'environment',
    goal: 1000000,
    raised: 256000,
    backers: 3421,
    deadline: new Date('2024-12-31'),
    creator: '0x9cd047484b30a2b4dcd5bc7ddfa5b5b8cd5b5e21',
    creatorName: 'Amazon Conservation Assoc.',
    tags: ['environment', 'amazon', 'reforestation', 'climate', 'indigenous'],
    status: 'active',
    location: {
      country: 'Brazil',
      region: 'Amazon Basin',
      coordinates: { lat: -3.4653, lng: -62.2159 }
    },
    milestones: [
      {
        id: 'm6',
        title: 'Community Partnerships',
        description: 'Establish partnerships with 20 indigenous communities',
        targetAmount: 100000,
        deadline: new Date('2024-03-31'),
        status: 'completed',
        completedAt: new Date('2024-03-15')
      }
    ],
    kpis: [
      {
        id: 'k4',
        name: 'Trees Planted',
        description: 'Number of trees planted and surviving after 6 months',
        target: 1000000,
        current: 125000,
        unit: 'trees',
        lastUpdated: new Date('2024-01-25'),
        verified: true
      },
      {
        id: 'k5',
        name: 'Carbon Sequestered',
        description: 'Estimated carbon dioxide sequestered',
        target: 500000,
        current: 62500,
        unit: 'tons CO2',
        lastUpdated: new Date('2024-01-25'),
        verified: false
      }
    ]
  }
];

export const mockUsers: User[] = [
  {
    id: 'u1',
    address: '0x742d35Cc6634C0532925a3b8D2b542b2e24b5e6c',
    name: 'Alex Thompson',
    email: 'alex@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    bio: 'Passionate about clean water initiatives and sustainable development.',
    totalDonated: 25000,
    totalCampaigns: 3,
    reputation: 850,
    badges: [
      {
        id: 'b1',
        name: 'Water Guardian',
        description: 'Donated $10,000+ to water projects',
        image: '/badges/water-guardian.png',
        tokenId: '1',
        contractAddress: '0x1234567890123456789012345678901234567890',
        earnedAt: new Date('2023-12-01'),
        rarity: 'rare'
      }
    ],
    preferences: {
      categories: ['environment', 'healthcare'],
      regions: ['Africa', 'Asia'],
      emailNotifications: true,
      pushNotifications: true,
      theme: 'system'
    },
    aiProfile: {
      donorCluster: 'impact-focused',
      recommendedCampaigns: ['1', '3'],
      riskScore: 0.15,
      churnProbability: 0.08,
      lifetimeValue: 50000,
      lastUpdated: new Date('2024-01-01')
    }
  }
];

export const mockDonations: Donation[] = [
  {
    id: 'd1',
    campaignId: '1',
    donorAddress: '0x742d35Cc6634C0532925a3b8D2b542b2e24b5e6c',
    donorName: 'Alex Thompson',
    amount: 500,
    currency: 'ETH',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    transactionHash: '0xabcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234',
    message: 'Hope this helps bring clean water to those who need it most!',
    isAnonymous: false
  },
  {
    id: 'd2',
    campaignId: '2',
    donorAddress: '0x8ba1f109551bD432803012645Hac136c21ef0ee',
    amount: 1000,
    currency: 'USDC',
    timestamp: new Date('2024-01-20T14:45:00Z'),
    transactionHash: '0xef123456789012ef123456789012ef123456789012ef123456789012ef1234',
    isAnonymous: true
  }
];

export const mockVolunteerTasks: VolunteerTask[] = [
  {
    id: 't1',
    title: 'Translation: Water Safety Guide to Swahili',
    description: 'Translate our comprehensive water safety and maintenance guide from English to Swahili for local communities in Kenya.',
    category: 'translation',
    difficulty: 'intermediate',
    timeEstimate: 8,
    skills: ['Swahili', 'English', 'Technical Writing'],
    reward: 250,
    deadline: new Date('2024-02-29'),
    status: 'open',
    campaignId: '1'
  },
  {
    id: 't2',
    title: 'Design: Educational Infographics',
    description: 'Create visual infographics explaining water purification processes for community education materials.',
    category: 'design',
    difficulty: 'beginner',
    timeEstimate: 12,
    skills: ['Graphic Design', 'Illustration', 'Adobe Creative Suite'],
    reward: 400,
    deadline: new Date('2024-03-15'),
    status: 'assigned',
    assignedTo: '0x9cd047484b30a2b4dcd5bc7ddfa5b5b8cd5b5e21',
    campaignId: '1'
  }
];

export const mockGovernanceProposals: GovernanceProposal[] = [
  {
    id: 'p1',
    title: 'Increase Treasury Allocation for Emergency Relief',
    description: 'Proposal to allocate an additional 500,000 USDC from the treasury for emergency disaster relief campaigns in response to recent natural disasters.',
    type: 'treasury',
    proposer: '0x742d35Cc6634C0532925a3b8D2b542b2e24b5e6c',
    totalVotes: 15000,
    votesFor: 12500,
    votesAgainst: 2500,
    quorum: 10000,
    deadline: new Date('2024-02-15'),
    status: 'active',
    votes: [
      {
        voter: '0x8ba1f109551bD432803012645Hac136c21ef0ee',
        choice: 'for',
        weight: 1000,
        timestamp: new Date('2024-01-25T09:15:00Z'),
        reason: 'Emergency relief is crucial for our mission'
      }
    ]
  }
];

export const mockDeFiVaults: DeFiVault[] = [
  {
    id: 'v1',
    name: 'Impact Stability Vault',
    description: 'Low-risk vault using Aave and Compound protocols to generate steady yield for platform operations.',
    apy: 5.2,
    tvl: 2500000,
    minimumDeposit: 100,
    lockPeriod: 30,
    riskLevel: 'low',
    protocol: 'Aave',
    contractAddress: '0x7890123456789012345678901234567890123456',
    deposits: [
      {
        id: 'dep1',
        depositor: '0x742d35Cc6634C0532925a3b8D2b542b2e24b5e6c',
        amount: 5000,
        depositedAt: new Date('2024-01-01'),
        currentValue: 5108,
        yield: 108,
        nftId: 'impact-bond-001'
      }
    ]
  }
];

export const mockBadges: Badge[] = [
  {
    id: 'b1',
    name: 'First Donation',
    description: 'Made your first donation to any campaign',
    image: '/badges/first-donation.png',
    tokenId: '1',
    contractAddress: '0x1234567890123456789012345678901234567890',
    earnedAt: new Date('2023-06-15'),
    rarity: 'common'
  },
  {
    id: 'b2',
    name: 'Impact Amplifier',
    description: 'Donated to 10+ different campaigns',
    image: '/badges/impact-amplifier.png',
    tokenId: '42',
    contractAddress: '0x1234567890123456789012345678901234567890',
    earnedAt: new Date('2023-11-20'),
    rarity: 'rare'
  }
];

export const mockAIStories: AIStory[] = [
  {
    id: 'story1',
    campaignId: '1',
    donorAddress: '0x742d35Cc6634C0532925a3b8D2b542b2e24b5e6c',
    title: 'Your Impact: Clean Water Flows in Turkana',
    script: 'Thanks to your generous donation of $500, Alex, three families in Turkana County now have access to clean, safe drinking water. Your contribution helped fund the solar purification system that serves over 150 people daily...',
    thumbnailUrl: '/stories/water-impact-thumb.jpg',
    duration: 45,
    generatedAt: new Date('2024-01-16'),
    personalizations: ['donor_name', 'donation_amount', 'specific_impact']
  }
];

export const mockCBDCVouchers: CBDCVoucher[] = [
  {
    id: 'voucher1',
    amount: 50,
    currency: 'USD',
    recipientPhone: '+254712345678',
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    expiresAt: new Date('2024-03-01'),
    campaignId: '1',
    status: 'active'
  }
];

export const mockSatelliteData: SatelliteData[] = [
  {
    date: new Date('2024-01-15'),
    coordinates: { lat: 2.5177, lng: 34.4753 },
    changeDetected: true,
    confidenceScore: 0.94,
    imageHash: '0x123456789abcdef...',
    oracleVerified: true
  }
];

export const mockZKProofs: ZKProof[] = [
  {
    id: 'zk1',
    campaignId: '1',
    kpiId: 'k1',
    proofHash: '0xabcdef123456789...',
    publicInputs: [3250, 1641734400], // current value, timestamp
    verificationKey: '0x987654321fedcba...',
    createdAt: new Date('2024-01-15'),
    verified: true
  }
];

// Mock statistics for the platform
export const mockStats = [
  {
    label: 'Total Raised',
    value: 2847593,
    suffix: '+',
  },
  {
    label: 'Active Donors',
    value: 12847,
    suffix: '+',
  },
  {
    label: 'Lives Impacted',
    value: 48392,
    suffix: '+',
  },
  {
    label: 'Countries Reached',
    value: 67,
    suffix: '',
  },
];

// Mock contract addresses
export const mockContracts = {
  mainDonation: '0x1234567890123456789012345678901234567890',
  governance: '0x2345678901234567890123456789012345678901',
  badgeNFT: '0x3456789012345678901234567890123456789012',
  deFiVault: '0x4567890123456789012345678901234567890123',
  zkVerifier: '0x5678901234567890123456789012345678901234'
};

// Volunteers Mock Data
export const mockVolunteers = [
  {
    id: 'vol-001',
    name: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    avatar: '/avatars/sarah.jpg',
    joinedDate: new Date('2023-06-15'),
    hoursContributed: 150,
    tasksCompleted: 23,
    impactScore: 1250,
    communityRank: 5,
    rating: 4.9,
    skills: [
      { name: 'UI/UX Design', level: 'Expert', proficiency: 95 },
      { name: 'Graphic Design', level: 'Advanced', proficiency: 88 },
      { name: 'Project Management', level: 'Intermediate', proficiency: 75 }
    ],
    badges: [
      {
        id: 'badge-001',
        name: 'Design Master',
        description: 'Completed 10+ design tasks',
        rarity: 'rare',
        earnedDate: new Date('2023-11-20')
      },
      {
        id: 'badge-002',
        name: 'Community Hero',
        description: 'Top 10 volunteer contributor',
        rarity: 'epic',
        earnedDate: new Date('2023-12-01')
      }
    ],
    location: { country: 'United States', region: 'California' },
    bio: 'Passionate designer helping nonprofits create better user experiences',
    preferences: {
      categories: ['design', 'content'],
      maxHoursPerWeek: 10,
      preferredLocation: 'remote'
    }
  },
  {
    id: 'vol-002',
    name: 'Marcus Rodriguez',
    email: 'marcus.r@email.com',
    avatar: '/avatars/marcus.jpg',
    joinedDate: new Date('2023-08-20'),
    hoursContributed: 125,
    tasksCompleted: 18,
    impactScore: 980,
    communityRank: 8,
    rating: 4.7,
    skills: [
      { name: 'Full-stack Development', level: 'Expert', proficiency: 92 },
      { name: 'Blockchain Development', level: 'Advanced', proficiency: 85 },
      { name: 'Technical Writing', level: 'Intermediate', proficiency: 70 }
    ],
    badges: [
      {
        id: 'badge-003',
        name: 'Code Warrior',
        description: 'Completed 5+ development tasks',
        rarity: 'rare',
        earnedDate: new Date('2023-10-15')
      }
    ],
    location: { country: 'Canada', region: 'Ontario' },
    bio: 'Full-stack developer building technical solutions for social good',
    preferences: {
      categories: ['development', 'technical'],
      maxHoursPerWeek: 15,
      preferredLocation: 'remote'
    }
  }
];

// Portfolio data for DeFi dashboard
export const portfolioData = {
  totalValue: 45750,
  yield24h: 2.3,
  activePositions: 32450,
  averageApy: 18.7
};

// Export aliases for volunteer page compatibility
export const volunteerTasks = mockVolunteerTasks;
export const volunteerProfiles = mockVolunteers; 