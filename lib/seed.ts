import { prisma } from './prisma';

const SQLITE_INIT_TABLES = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'TEAM',
    "avatar" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`,
  `CREATE TABLE IF NOT EXISTS "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT DEFAULT '',
    "clientCode" TEXT DEFAULT '',
    "githubRepo" TEXT DEFAULT '',
    "deploymentUrl" TEXT DEFAULT '',
    "status" TEXT DEFAULT 'ACTIVE',
    "description" TEXT NOT NULL,
    "brandTone" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'Google Ads',
    "location" TEXT NOT NULL,
    "dailyBudget" REAL NOT NULL,
    "totalBudget" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "googleAdsCampaignId" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TEXT,
    "metricsSpend" REAL NOT NULL DEFAULT 0,
    "metricsImpressions" INTEGER NOT NULL DEFAULT 0,
    "metricsClicks" INTEGER NOT NULL DEFAULT 0,
    "metricsCtr" REAL NOT NULL DEFAULT 0,
    "metricsCpc" REAL NOT NULL DEFAULT 0,
    "metricsConversions" INTEGER NOT NULL DEFAULT 0,
    "metricsCpa" REAL NOT NULL DEFAULT 0,
    "metricsConvRate" REAL NOT NULL DEFAULT 0,
    "aiInsight" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS "Creative" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'IMAGE',
    "provider" TEXT NOT NULL DEFAULT 'Gemini',
    "model" TEXT NOT NULL DEFAULT 'gemini-3.6-flash',
    "prompt" TEXT NOT NULL,
    "aspectRatio" TEXT NOT NULL DEFAULT '1:1',
    "imageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'FINAL',
    "metadataJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS "CampaignBrief" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "productService" TEXT NOT NULL,
    "serviceDescription" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "landingPageUrl" TEXT NOT NULL,
    "offer" TEXT NOT NULL,
    "cta" TEXT NOT NULL,
    "targetCountry" TEXT NOT NULL,
    "targetProvince" TEXT NOT NULL,
    "targetCity" TEXT NOT NULL,
    "targetLanguage" TEXT NOT NULL,
    "aiRequirements" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "CampaignBrief_campaignId_key" ON "CampaignBrief"("campaignId");`,
  `CREATE TABLE IF NOT EXISTS "CampaignProposal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "recommendedBudgetCAD" REAL NOT NULL,
    "platform" TEXT NOT NULL,
    "audienceJson" TEXT NOT NULL,
    "strategyJson" TEXT NOT NULL,
    "copyJson" TEXT NOT NULL,
    "creativesJson" TEXT NOT NULL,
    "qualityCheckJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "CampaignProposal_campaignId_key" ON "CampaignProposal"("campaignId");`,
  `CREATE TABLE IF NOT EXISTS "AgentRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "outputJson" TEXT,
    "error" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
  );`,
  `CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "userName" TEXT,
    "agentName" TEXT,
    "action" TEXT NOT NULL,
    "campaignId" TEXT,
    "campaignName" TEXT,
    "apiOperation" TEXT,
    "status" TEXT NOT NULL,
    "details" TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS "AISetting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "strategyProvider" TEXT NOT NULL DEFAULT 'OpenAI',
    "researchProvider" TEXT NOT NULL DEFAULT 'Gemini',
    "copyProvider" TEXT NOT NULL DEFAULT 'OpenAI',
    "imageProvider" TEXT NOT NULL DEFAULT 'OpenAI',
    "videoProvider" TEXT NOT NULL DEFAULT 'Gemini',
    "validationProvider" TEXT NOT NULL DEFAULT 'Gemini',
    "demoMode" BOOLEAN NOT NULL DEFAULT true
  );`,
  `CREATE TABLE IF NOT EXISTS "ConnectionStatus" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "openAiConnected" BOOLEAN NOT NULL DEFAULT true,
    "geminiConnected" BOOLEAN NOT NULL DEFAULT true,
    "googleAdsConnected" BOOLEAN NOT NULL DEFAULT true,
    "googleAdsCustomerId" TEXT DEFAULT '849-204-9102',
    "googleAdsAccountName" TEXT DEFAULT 'G1 Sphere Canada Ads'
  );`,
  `CREATE TABLE IF NOT EXISTS "Invitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'TEAM_MEMBER',
    "passcode" TEXT NOT NULL,
    "tokenHash" TEXT,
    "invitedBy" TEXT,
    "invitedByName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Invitation_passcode_key" ON "Invitation"("passcode");`,
  `CREATE TABLE IF NOT EXISTS "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "assignedToId" TEXT NOT NULL,
    "assignedToName" TEXT NOT NULL,
    "assignedToEmail" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "assignedByName" TEXT NOT NULL,
    "clientId" TEXT,
    "clientName" TEXT,
    "campaignId" TEXT,
    "campaignName" TEXT,
    "dueDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`
];

let tablesEnsured = false;

export async function ensureSeedData() {
  try {
    if (!tablesEnsured) {
      for (const query of SQLITE_INIT_TABLES) {
        try {
          await prisma.$executeRawUnsafe(query);
        } catch {}
      }
      tablesEnsured = true;
    }

    // 1. Ensure Super Admin (Aman Sir - Sole Super Admin)
    await prisma.user.upsert({
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

    // 2. Ensure Active Super Admin Passcode (AGENT-7788)
    const existingInvite = await prisma.invitation.findFirst({
      where: { passcode: 'AGENT-7788' },
    });
    if (!existingInvite) {
      const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
      await prisma.invitation.create({
        data: {
          email: 'admin@codekap.com',
          name: 'Workspace Joining Invite',
          role: 'ADMIN',
          passcode: 'AGENT-7788',
          status: 'PENDING',
          invitedBy: 'usr_aman',
          invitedByName: 'Aman Sir',
          message: 'Official joining passcode for Codekap marketing workspace.',
          expiresAt,
        },
      });
    }
  } catch (err) {
    console.warn('[Seed Data Warning]:', err);
  }
}

