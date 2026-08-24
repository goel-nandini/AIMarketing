const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanData() {
  console.log('--- Cleaning all dummy data from SQLite database ---');

  // 1. Delete audit logs, agent runs, creatives, briefs, proposals, campaigns
  await prisma.auditLog.deleteMany({});
  console.log('✓ Cleared Audit Logs');

  await prisma.agentRun.deleteMany({});
  console.log('✓ Cleared Agent Runs');

  await prisma.creative.deleteMany({});
  console.log('✓ Cleared Creatives');

  await prisma.campaignBrief.deleteMany({});
  console.log('✓ Cleared Campaign Briefs');

  await prisma.campaignProposal.deleteMany({});
  console.log('✓ Cleared Campaign Proposals');

  await prisma.campaign.deleteMany({});
  console.log('✓ Cleared Campaigns');

  // 2. Delete dummy clients
  await prisma.client.deleteMany({});
  console.log('✓ Cleared Clients/Businesses');

  // 3. Delete invitations
  await prisma.invitation.deleteMany({});
  console.log('✓ Cleared Invitations');

  // 4. Clean users - retain only Super Admin (Aman Sir)
  const usersToDelete = await prisma.user.findMany({
    where: {
      email: {
        not: 'aman@codekap.com',
      },
    },
  });

  if (usersToDelete.length > 0) {
    await prisma.user.deleteMany({
      where: {
        email: {
          not: 'aman@codekap.com',
        },
      },
    });
    console.log(`✓ Removed ${usersToDelete.length} dummy seeded user accounts:`, usersToDelete.map(u => u.name));
  }

  // Ensure Super Admin exists in DB
  const superAdmin = await prisma.user.upsert({
    where: { email: 'aman@codekap.com' },
    update: {
      name: 'Aman Sir',
      role: 'ADMIN',
      title: 'Super Admin / Founder & CEO',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    create: {
      id: 'usr_aman',
      name: 'Aman Sir',
      email: 'aman@codekap.com',
      role: 'ADMIN',
      title: 'Super Admin / Founder & CEO',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });
  console.log('✓ Super Admin profile active:', superAdmin.email, `(${superAdmin.role})`);

  // Log initial system clean event
  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      userName: superAdmin.name,
      action: 'System Database Purge & Fresh Initialization',
      status: 'SUCCESS',
      details: 'All dummy clients, campaigns, and mock team members deleted. Super Admin hub ready.',
    },
  });

  const state = {
    activeUsers: await prisma.user.count(),
    clients: await prisma.client.count(),
    campaigns: await prisma.campaign.count(),
    invitations: await prisma.invitation.count(),
    auditLogs: await prisma.auditLog.count(),
  };

  console.log('\n--- Clean Database Status Summary ---');
  console.log(JSON.stringify(state, null, 2));
}

cleanData()
  .catch((err) => {
    console.error('Error cleaning database:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
