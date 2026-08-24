const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  const clients = await prisma.client.findMany();
  const campaigns = await prisma.campaign.findMany();
  const invitations = await prisma.invitation.findMany();
  const auditLogs = await prisma.auditLog.findMany();
  console.log(JSON.stringify({
    usersCount: users.length,
    users,
    clientsCount: clients.length,
    clients,
    campaignsCount: campaigns.length,
    invitationsCount: invitations.length,
    auditLogsCount: auditLogs.length,
  }, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
