const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

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
        description: 'Providing solar-powered water pumps for 500 families in rural Kenya.',
        target: 50000,
        raised: 15000,
        status: 'ACTIVE',
        category: 'ENVIRONMENT',
        creatorId: users[2].id,
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
        tags: 'water,kenya,solar,rural',
        location: 'Nairobi, Kenya',
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.campaign.create({
      data: {
        title: 'Digital Education Platform',
        description: 'Bringing tablets and internet connectivity to remote schools.',
        target: 25000,
        raised: 8500,
        status: 'ACTIVE',
        category: 'EDUCATION',
        creatorId: users[3].id,
        imageUrl: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80',
        tags: 'education,technology,children',
        location: 'Global',
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.campaign.create({
      data: {
        title: 'Emergency Medical Supplies',
        description: 'Urgent medical supplies needed for disaster relief efforts.',
        target: 15000,
        raised: 12000,
        status: 'ACTIVE',
        category: 'HEALTHCARE',
        creatorId: users[0].id,
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
  ]);

  console.log(`✅ Created ${donations.length} donations`);

  // Create test proposals
  const proposals = await Promise.all([
    prisma.proposal.create({
      data: {
        title: 'Platform Fee Reduction',
        description: 'Proposal to reduce platform fees from 2.5% to 1.5%.',
        type: 'GOVERNANCE',
        status: 'ACTIVE',
        votingEnds: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        creatorId: users[0].id,
      },
    }),
  ]);

  console.log(`✅ Created ${proposals.length} proposals`);

  console.log('\n🎉 Database seeded successfully!');
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