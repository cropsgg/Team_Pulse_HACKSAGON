import type {
  User,
  Project,
  ProjectType,
  ProjectCategory,
  ProjectStatus,
  UserRole,
  KYCStatus,
  Milestone,
  MilestoneStatus,
  Transaction,
  TransactionType,
  TransactionStatus,
  Proposal,
  ProposalType,
  ProposalStatus,
  Investment,
  InvestmentStatus,
  Donation,
  DonationStatus,
  PlatformMetrics,
  Notification,
  NotificationType,
} from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    address: '0x1234567890123456789012345678901234567890',
    email: 'alice@example.com',
    name: 'Alice Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b512c2f0?w=150',
    bio: 'Passionate about education and technology. Building bridges between innovation and social impact.',
    role: UserRole.DONOR,
    verified: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    preferences: {
      theme: 'light',
      language: 'en',
      currency: 'USD',
      notifications: {
        email: true,
        push: true,
        milestones: true,
        votes: true,
        marketing: false,
      },
      privacy: {
        showProfile: true,
        showDonations: true,
        showInvestments: false,
      },
    },
    social: {
      twitter: '@alicejohnson',
      linkedin: 'linkedin.com/in/alicejohnson',
      website: 'https://alicejohnson.dev',
    },
    kycStatus: KYCStatus.APPROVED,
  },
  {
    id: '2',
    address: '0x2345678901234567890123456789012345678901',
    email: 'bob@techstartup.com',
    name: 'Bob Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Serial entrepreneur focused on sustainable technology solutions.',
    role: UserRole.FOUNDER,
    verified: true,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z',
    preferences: {
      theme: 'dark',
      language: 'en',
      currency: 'USD',
      notifications: {
        email: true,
        push: true,
        milestones: true,
        votes: true,
        marketing: true,
      },
      privacy: {
        showProfile: true,
        showDonations: false,
        showInvestments: true,
      },
    },
    social: {
      twitter: '@bobchen_tech',
      linkedin: 'linkedin.com/in/bobchen',
      github: 'github.com/bobchen',
      website: 'https://techstartup.com',
    },
    kycStatus: KYCStatus.APPROVED,
  },
  {
    id: '3',
    address: '0x3456789012345678901234567890123456789012',
    email: 'carol@vcfirm.com',
    name: 'Carol Martinez',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    bio: 'VC partner at TechForward Ventures. Investing in the future of Web3 and social impact.',
    role: UserRole.VC,
    verified: true,
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-28T14:00:00Z',
    preferences: {
      theme: 'system',
      language: 'en',
      currency: 'USD',
      notifications: {
        email: true,
        push: false,
        milestones: true,
        votes: true,
        marketing: false,
      },
      privacy: {
        showProfile: true,
        showDonations: false,
        showInvestments: true,
      },
    },
    social: {
      linkedin: 'linkedin.com/in/carolmartinez',
      website: 'https://techforward.vc',
    },
    kycStatus: KYCStatus.APPROVED,
  },
];

// Mock Milestones
const mockMilestones: Milestone[] = [
  {
    id: 'milestone-1',
    projectId: 'project-1',
    title: 'Complete Mobile App Development',
    description: 'Develop and test the core mobile application with basic learning features.',
    targetAmount: 50000,
    targetDate: '2024-03-15T00:00:00Z',
    completedAt: '2024-03-10T10:00:00Z',
    status: MilestoneStatus.VERIFIED,
    evidenceRequired: true,
    evidence: [
      {
        id: 'evidence-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
        description: 'Screenshots of the completed mobile app',
        uploadedAt: '2024-03-10T10:00:00Z',
      },
    ],
    verifications: [
      {
        id: 'verification-1',
        verifierId: '3',
        verifier: mockUsers[2],
        status: 'approved',
        comment: 'App meets all specified requirements. Great work!',
        verifiedAt: '2024-03-12T09:00:00Z',
      },
    ],
    order: 1,
  },
  {
    id: 'milestone-2',
    projectId: 'project-1',
    title: 'Deploy to 10 Schools',
    description: 'Pilot the application in 10 partner schools and gather initial feedback.',
    targetAmount: 75000,
    targetDate: '2024-06-01T00:00:00Z',
    status: MilestoneStatus.IN_PROGRESS,
    evidenceRequired: true,
    evidence: [],
    verifications: [],
    order: 2,
  },
];

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: 'project-1',
    slug: 'teachher-education-app',
    title: 'TeachHer: Education App for Girls',
    description: 'Empowering girls in rural areas through accessible digital education platform with AI-powered personalized learning.',
    longDescription: `TeachHer is a groundbreaking educational platform designed specifically to address the education gap for girls in rural and underserved communities. Our AI-powered application provides personalized learning experiences, making quality education accessible regardless of geographic or economic barriers.

## The Problem
- Over 130 million girls worldwide are out of school
- Rural communities lack access to quality educational resources
- Traditional one-size-fits-all education doesn't work for diverse learning needs

## Our Solution
TeachHer leverages artificial intelligence to create personalized learning paths for each student, adapting to their pace, learning style, and interests. The platform works offline, ensuring accessibility even in areas with limited internet connectivity.

## Key Features
- **AI-Powered Personalization**: Adaptive learning algorithms that adjust to each student's needs
- **Offline Capability**: Download lessons and continue learning without internet
- **Multi-Language Support**: Content available in local languages
- **Progress Tracking**: Real-time analytics for students, parents, and teachers
- **Community Features**: Connect with mentors and peer learners

## Impact Goals
- Reach 10,000 girls in the first year
- Improve learning outcomes by 40%
- Increase school retention rates by 25%
- Create a sustainable model for educational access`,
    type: ProjectType.CHARITY,
    category: ProjectCategory.EDUCATION,
    status: ProjectStatus.ACTIVE,
    creator: mockUsers[1],
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-25T15:30:00Z',
    coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    images: [
      'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    ],
    video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    documents: [
      {
        id: 'doc-1',
        name: 'TeachHer_Business_Plan.pdf',
        type: 'application/pdf',
        url: '/documents/teachher-business-plan.pdf',
        ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        size: 2457600,
        uploadedAt: '2024-01-20T10:00:00Z',
        verified: true,
      },
    ],
    fundingGoal: 250000,
    currentFunding: 186500,
    currency: 'USD',
    minContribution: 25,
    startDate: '2024-01-20T00:00:00Z',
    endDate: '2024-08-20T23:59:59Z',
    location: {
      country: 'India',
      state: 'Rajasthan',
      city: 'Jaipur',
      coordinates: {
        lat: 26.9124,
        lng: 75.7873,
      },
    },
    tags: ['education', 'girls', 'AI', 'rural', 'technology', 'social-impact'],
    milestones: mockMilestones,
    updates: [],
    faqs: [
      {
        id: 'faq-1',
        question: 'How does the AI personalization work?',
        answer: 'Our AI analyzes learning patterns, speed, and preferences to create customized lesson plans and exercises for each student.',
        order: 1,
      },
      {
        id: 'faq-2',
        question: 'What happens if there\'s no internet connection?',
        answer: 'The app works completely offline. Students can download lessons and sync progress when connectivity returns.',
        order: 2,
      },
    ],
    viewCount: 15420,
    shareCount: 342,
    favoriteCount: 89,
    aiScore: 87,
    aiAnalysis: {
      feasibilityScore: 85,
      marketPotential: 92,
      riskAssessment: 25,
      impactPrediction: 95,
      recommendations: [
        'Strong team with relevant experience',
        'Clear market need and target audience',
        'Innovative use of AI technology',
        'Scalable business model',
      ],
      concerns: [
        'Dependency on mobile device access',
        'Need for local partnerships',
        'Competition from established EdTech players',
      ],
      summary: 'TeachHer presents a compelling solution to a critical global problem with strong technical innovation and clear social impact potential.',
      analyzedAt: '2024-01-21T09:00:00Z',
    },
    verified: true,
    verificationStatus: 'VERIFIED' as any,
  },
  {
    id: 'project-2',
    slug: 'greentech-carbon-capture',
    title: 'GreenTech: AI-Powered Carbon Capture',
    description: 'Revolutionary carbon capture technology using machine learning to optimize atmospheric CO2 removal for climate action.',
    longDescription: `GreenTech is developing next-generation carbon capture technology that combines advanced materials science with artificial intelligence to create the most efficient atmospheric CO2 removal system ever designed.

## The Climate Challenge
Climate change demands immediate action. Current carbon capture technologies are expensive, energy-intensive, and difficult to scale. We need breakthrough innovations to make carbon removal economically viable.

## Our Innovation
Our AI-powered carbon capture system uses:
- **Smart Materials**: Novel sorbent materials that adapt to atmospheric conditions
- **Predictive Optimization**: Machine learning algorithms that optimize capture efficiency
- **Energy Integration**: Renewable energy integration for sustainable operations
- **Modular Design**: Scalable units for deployment anywhere

## Market Opportunity
The voluntary carbon market is projected to reach $100B by 2030. Our technology offers:
- 60% lower operational costs than existing solutions
- 3x higher capture efficiency
- Fully automated operation
- Verified carbon credits through blockchain

## Funding Use
- R&D and prototype development: 40%
- Team expansion: 25%
- Pilot plant construction: 25%
- Regulatory approvals: 10%`,
    type: ProjectType.STARTUP,
    category: ProjectCategory.CLEANTECH,
    status: ProjectStatus.ACTIVE,
    creator: mockUsers[1],
    createdAt: '2024-01-15T14:00:00Z',
    updatedAt: '2024-01-28T11:00:00Z',
    coverImage: 'https://images.unsplash.com/photo-1569163366271-44884c8b1ea6?w=800',
    images: [
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800',
      'https://images.unsplash.com/photo-1581092918484-8313d3a1f3ba?w=800',
    ],
    documents: [],
    fundingGoal: 2000000,
    currentFunding: 1250000,
    currency: 'USD',
    minContribution: 1000,
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-07-15T23:59:59Z',
    contractAddress: '0x4567890123456789012345678901234567890123',
    tokenSymbol: 'GTC',
    tokenAddress: '0x5678901234567890123456789012345678901234',
    location: {
      country: 'United States',
      state: 'California',
      city: 'San Francisco',
    },
    tags: ['climate', 'AI', 'carbon-capture', 'cleantech', 'sustainability'],
    milestones: [],
    updates: [],
    faqs: [],
    viewCount: 8930,
    shareCount: 156,
    favoriteCount: 234,
    aiScore: 91,
    verified: true,
    verificationStatus: 'VERIFIED' as any,
  },
];

// Mock Platform Metrics
export const mockPlatformMetrics: PlatformMetrics = {
  totalProjects: 1247,
  totalFunding: 45600000,
  totalDonations: 28900000,
  totalInvestments: 16700000,
  totalUsers: 12890,
  activeProjects: 342,
  completedProjects: 89,
  monthlyActiveUsers: 8456,
  monthlyTransactionVolume: 3400000,
  averageProjectSize: 36587,
  successRate: 73.2,
  usersByCountry: {
    'United States': 3245,
    'India': 2876,
    'United Kingdom': 1543,
    'Germany': 1234,
    'Canada': 987,
    'Australia': 856,
    'France': 743,
    'Japan': 654,
    'Brazil': 567,
    'Netherlands': 432,
  },
  fundingByCountry: {
    'United States': 18500000,
    'United Kingdom': 8900000,
    'Germany': 6700000,
    'Canada': 4300000,
    'India': 3200000,
    'Australia': 2800000,
    'France': 1900000,
    'Japan': 1500000,
    'Netherlands': 1200000,
    'Brazil': 900000,
  },
  projectsByCategory: {
    'EDUCATION': 234,
    'HEALTHCARE': 198,
    'ENVIRONMENT': 176,
    'TECHNOLOGY': 165,
    'POVERTY': 143,
    'FINTECH': 89,
    'CLEANTECH': 76,
    'HUMAN_RIGHTS': 54,
    'DISASTER_RELIEF': 43,
    'SAAS': 39,
    'DEFI': 30,
  },
  fundingByCategory: {
    'TECHNOLOGY': 12400000,
    'HEALTHCARE': 8900000,
    'EDUCATION': 7600000,
    'ENVIRONMENT': 6800000,
    'FINTECH': 4300000,
    'CLEANTECH': 3200000,
    'POVERTY': 1800000,
    'SAAS': 1400000,
    'HUMAN_RIGHTS': 900000,
    'DEFI': 700000,
    'DISASTER_RELIEF': 500000,
  },
};

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    type: TransactionType.DONATION,
    fromAddress: '0x1234567890123456789012345678901234567890',
    toAddress: '0x2345678901234567890123456789012345678901',
    amount: 500,
    currency: 'USD',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    blockNumber: 18945672,
    gasUsed: 21000,
    gasPrice: 20000000000,
    status: TransactionStatus.CONFIRMED,
    timestamp: '2024-01-25T14:30:00Z',
    projectId: 'project-1',
    metadata: {
      projectTitle: 'TeachHer: Education App for Girls',
      donorMessage: 'Keep up the amazing work!',
    },
  },
  {
    id: 'tx-2',
    type: TransactionType.INVESTMENT,
    fromAddress: '0x3456789012345678901234567890123456789012',
    toAddress: '0x4567890123456789012345678901234567890123',
    amount: 25000,
    currency: 'USD',
    txHash: '0xbcdef1234567890bcdef1234567890bcdef1234567890bcdef1234567890a',
    blockNumber: 18945673,
    gasUsed: 45000,
    gasPrice: 20000000000,
    status: TransactionStatus.CONFIRMED,
    timestamp: '2024-01-25T15:00:00Z',
    projectId: 'project-2',
    metadata: {
      projectTitle: 'GreenTech: AI-Powered Carbon Capture',
      equityPercentage: 0.25,
      valuation: 10000000,
    },
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: '1',
    type: NotificationType.MILESTONE_COMPLETED,
    title: 'Milestone Completed!',
    message: 'TeachHer has completed their mobile app development milestone.',
    data: {
      projectId: 'project-1',
      milestoneId: 'milestone-1',
    },
    read: false,
    createdAt: '2024-01-25T10:00:00Z',
    projectId: 'project-1',
    actionUrl: '/project/teachher-education-app',
  },
  {
    id: 'notif-2',
    userId: '1',
    type: NotificationType.PROJECT_FUNDED,
    title: 'Project Reached Funding Goal!',
    message: 'GreenTech has reached 62% of their funding goal.',
    data: {
      projectId: 'project-2',
      fundingPercentage: 62.5,
    },
    read: true,
    createdAt: '2024-01-24T16:30:00Z',
    projectId: 'project-2',
    actionUrl: '/project/greentech-carbon-capture',
  },
];

// Export all mock data
export const mockData = {
  users: mockUsers,
  projects: mockProjects,
  platformMetrics: mockPlatformMetrics,
  transactions: mockTransactions,
  notifications: mockNotifications,
  milestones: mockMilestones,
}; 