import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@impactchain.org',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        avatar: 'https://avatar.vercel.sh/admin',
      },
    }),
    prisma.user.create({
      data: {
        email: 'donor@example.com',
        name: 'Sarah Johnson',
        password: hashedPassword,
        role: 'MEMBER',
        avatar: 'https://avatar.vercel.sh/sarah',
      },
    }),
    prisma.user.create({
      data: {
        email: 'ngo@example.com',
        name: 'David Chen',
        password: hashedPassword,
        role: 'FOUNDER',
        avatar: 'https://avatar.vercel.sh/david',
      },
    }),
    prisma.user.create({
      data: {
        email: 'volunteer@example.com',
        name: 'Emma Wilson',
        password: hashedPassword,
        role: 'MEMBER',
        avatar: 'https://avatar.vercel.sh/emma',
      },
    }),
    prisma.user.create({
      data: {
        email: 'builder@example.com',
        name: 'Alex Martinez',
        password: hashedPassword,
        role: 'MEMBER',
        avatar: 'https://avatar.vercel.sh/alex',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create test campaigns
  const campaigns = await Promise.all([
    prisma.campaign.create({
      data: {
        title: 'Clean Water for Rural Kenya',
        description: 'Providing solar-powered water pumps for 500 families in rural Kenya. This project will ensure access to clean, safe drinking water year-round.',
        target: 50000,
        raised: 15000,
        status: 'ACTIVE',
        category: 'ENVIRONMENT',
        creatorId: users[2].id, // NGO user
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
        tags: 'water,kenya,solar,rural',
        location: 'Nairobi, Kenya',
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        milestones: {
          create: [
            {
              title: 'Site Assessment',
              description: 'Complete geological and social impact assessment',
              targetAmount: 15000,
              status: 'PENDING',
              deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
            },
            {
              title: 'Equipment Purchase',
              description: 'Purchase and ship solar pump equipment',
              targetAmount: 25000,
              status: 'PENDING',
              deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
            },
            {
              title: 'Installation & Training',
              description: 'Install pumps and train local technicians',
              targetAmount: 10000,
              status: 'PENDING',
              deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            },
          ],
        },
      },
    }),
    prisma.campaign.create({
      data: {
        title: 'Digital Education for Underserved Communities',
        description: 'Bringing tablets and internet connectivity to remote schools, enabling 1000+ students to access quality digital education.',
        target: 25000,
        raised: 8500,
        status: 'ACTIVE',
        category: 'EDUCATION',
        creatorId: users[3].id, // Volunteer user
        imageUrl: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80',
        tags: 'education,technology,children',
        location: 'Global',
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.campaign.create({
      data: {
        title: 'Emergency Medical Supplies',
        description: 'Urgent medical supplies needed for disaster relief efforts. Every donation helps save lives.',
        target: 15000,
        raised: 12000,
        status: 'ACTIVE',
        category: 'HEALTHCARE',
        creatorId: users[0].id, // Admin user
        imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309',
        tags: 'medical,emergency,relief',
        location: 'Various Locations',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log(`✅ Created ${campaigns.length} campaigns`);

  // Create test donations
  const donations = await Promise.all([
    prisma.donation.create({
      data: {
        amount: 1000,
        currency: 'USD',
        status: 'CONFIRMED',
        donorId: users[1].id,
        campaignId: campaigns[0].id,
        transactionHash: '0xabc123...',
      },
    }),
    prisma.donation.create({
      data: {
        amount: 500,
        currency: 'USD',
        status: 'CONFIRMED',
        donorId: users[4].id,
        campaignId: campaigns[1].id,
        transactionHash: '0xdef456...',
      },
    }),
    prisma.donation.create({
      data: {
        amount: 2000,
        currency: 'USD',
        status: 'CONFIRMED',
        donorId: users[1].id,
        campaignId: campaigns[2].id,
        transactionHash: '0xghi789...',
      },
    }),
  ]);

  console.log(`✅ Created ${donations.length} donations`);

  // Create test help requests
  const helpRequests = await Promise.all([
    prisma.helpRequest.create({
      data: {
        title: 'Emergency Medical Equipment',
        description: 'Urgent need for ventilators and oxygen concentrators for local hospital.',
        amount: 5000,
        urgency: 'CRITICAL',
        status: 'APPROVED',
        location: 'Mumbai, India',
        creatorId: users[2].id,
      },
    }),
    prisma.helpRequest.create({
      data: {
        title: 'Disaster Relief Supplies',
        description: 'Food, water, and temporary shelter materials needed for flood victims.',
        amount: 3000,
        urgency: 'HIGH',
        status: 'PENDING',
        location: 'Bangladesh',
        creatorId: users[3].id,
      },
    }),
  ]);

  console.log(`✅ Created ${helpRequests.length} help requests`);

  // Create test governance proposals
  const proposals = await Promise.all([
    prisma.proposal.create({
      data: {
        title: 'Allocate Treasury Funds for Platform Development',
        description: 'Proposal to allocate 10,000 MATIC from treasury for platform improvements and new features.',
        type: 'TREASURY_SPEND',
        status: 'ACTIVE',
        votingEnds: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        creatorId: users[0].id,
        treasuryAmount: 10000,
        treasuryRecipient: '0xDevTeamAddress',
      },
    }),
    prisma.proposal.create({
      data: {
        title: 'Reduce Platform Fees to 1.5%',
        description: 'Proposal to reduce platform fees from 2.5% to 1.5% to encourage more donations.',
        type: 'GOVERNANCE',
        status: 'ACTIVE',
        votingEnds: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        creatorId: users[1].id,
      },
    }),
  ]);

  console.log(`✅ Created ${proposals.length} proposals`);

  // Create test votes
  const votes = await Promise.all([
    prisma.vote.create({
      data: {
        choice: 'FOR',
        weight: 100,
        voterId: users[1].id,
        proposalId: proposals[0].id,
      },
    }),
    prisma.vote.create({
      data: {
        choice: 'FOR',
        weight: 250,
        voterId: users[2].id,
        proposalId: proposals[0].id,
      },
    }),
    prisma.vote.create({
      data: {
        choice: 'AGAINST',
        weight: 50,
        voterId: users[3].id,
        proposalId: proposals[1].id,
      },
    }),
  ]);

  console.log(`✅ Created ${votes.length} votes`);

  // Create test auctions
  const auctions = await Promise.all([
    prisma.auction.create({
      data: {
        title: 'Digital Art for Charity',
        description: 'Beautiful digital artwork donated by renowned artist. All proceeds go to environmental causes.',
        category: 'Art',
        startPrice: 100,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        imageUrl: 'https://images.unsplash.com/photo-1549490349-8643362247b5',
      },
    }),
    prisma.auction.create({
      data: {
        title: 'Vintage Photography Collection',
        description: 'Rare vintage photographs donated for charity auction. Historical significance meets social impact.',
        category: 'Photography',
        startPrice: 250,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd',
      },
    }),
  ]);

  console.log(`✅ Created ${auctions.length} auctions`);

  // Create test auction bids
  const bids = await Promise.all([
    prisma.auctionBid.create({
      data: {
        amount: 150,
        auctionId: auctions[0].id,
        bidderId: users[1].id,
      },
    }),
    prisma.auctionBid.create({
      data: {
        amount: 300,
        auctionId: auctions[1].id,
        bidderId: users[4].id,
      },
    }),
  ]);

  console.log(`✅ Created ${bids.length} auction bids`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`   • ${users.length} users created`);
  console.log(`   • ${campaigns.length} campaigns created`);
  console.log(`   • ${donations.length} donations created`);
  console.log(`   • ${helpRequests.length} help requests created`);
  console.log(`   • ${proposals.length} governance proposals created`);
  console.log(`   • ${votes.length} votes created`);
  console.log(`   • ${auctions.length} auctions created`);
  console.log(`   • ${bids.length} auction bids created`);
  
  console.log('\n🔑 Test Login Credentials:');
  console.log('   • admin@impactchain.org / password123 (Admin)');
  console.log('   • donor@example.com / password123 (Donor)');
  console.log('   • ngo@example.com / password123 (NGO)');
  console.log('   • volunteer@example.com / password123 (Volunteer)');
  console.log('   • builder@example.com / password123 (Builder)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 