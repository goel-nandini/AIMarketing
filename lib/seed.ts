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

    // 6. Ensure Sample Campaign & Creatives for Jeevansphere
    const campCount = await prisma.campaign.count();
    if (campCount === 0 && clientId) {
      const sampleCampaign = await prisma.campaign.create({
        data: {
          name: 'Jeevansphere — Delhi Eye Care Consultation Ads',
          clientId: clientId,
          objective: 'LEAD_GENERATION',
          platform: 'Google Ads',
          location: 'Delhi, India',
          dailyBudget: 75,
          totalBudget: 2250,
          currency: 'CAD',
          status: 'ACTIVE',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          metricsSpend: 420.5,
          metricsImpressions: 14200,
          metricsClicks: 890,
          metricsCtr: 6.27,
          metricsCpc: 0.47,
          metricsConversions: 48,
          metricsCpa: 8.76,
          metricsConvRate: 5.39,
          aiInsight: 'Strong campaign engagement in Delhi region. Video storyboards driving 3.2x higher consultation bookings.',
          proposal: {
            create: {
              clientId: clientId,
              clientName: 'Jeevansphere',
              objective: 'LEAD_GENERATION',
              location: 'Delhi, India',
              recommendedBudgetCAD: 75,
              platform: 'Google Ads',
              audienceJson: JSON.stringify({
                primaryAudience: 'Adults 25-55 seeking laser vision correction & comprehensive eye health checkups',
                secondaryAudience: 'Working professionals with digital eye strain in Delhi NCR',
                demographics: { ageRange: '25-55', gender: 'All', incomeBracket: 'Middle to High' },
              }),
              strategyJson: JSON.stringify({
                coreMessage: 'World-Class Precision Eye Care & Vision Consultation in Delhi',
                valueProposition: 'Regain Clear Vision with Certified Specialists & Advanced Technology',
                angle: 'Trust, Medical Excellence & Immediate Relief',
                recommendedChannel: 'Google Search & Meta Reels',
              }),
              copyJson: JSON.stringify({
                headlines: [
                  'Top-Rated Eye Care Clinic in Delhi | Jeevansphere',
                  'Advanced Laser Vision Correction | Book Today',
                  'Experience Clear, Strain-Free Sight'
                ],
                descriptions: [
                  'Consult with premier ophthalmology specialists in CP, New Delhi. Advanced diagnostic equipment and compassionate care.',
                  'Comprehensive vision checkups and specialized eye care treatment. Schedule your private appointment today.'
                ],
              }),
              creativesJson: JSON.stringify([
                {
                  id: 'crt_jeev_01',
                  title: 'Precision Optical Care Specialist Consultation',
                  visualDirection: 'Modern clean clinic setting with advanced diagnostic eye examination equipment',
                  imagePrompt: 'Professional optometrist examining patient eyes with modern diagnostic slit lamp equipment in clean aesthetic clinic, 8k commercial photography',
                  videoPrompt: 'Optometrist examining a patients eyes in a modern optical clinic',
                  storyboard: [
                    'Scene 1: Hook — Blurry vision or screen strain affecting daily work',
                    'Scene 2: Precision examination at Jeevansphere Clinic',
                    'Scene 3: Expert ophthalmologist explaining treatment options',
                    'Scene 4: CTA: Book Comprehensive Consultation Today'
                  ],
                  generatedImageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop&q=85',
                  generatedVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-optometrist-examining-a-patients-eyes-41581-large.mp4',
                  hookText: 'Clear Sight, Confident Living in Delhi'
                },
                {
                  id: 'crt_jeev_02',
                  title: 'Vision Freedom & Lifestyle Campaign',
                  visualDirection: 'Happy person enjoying crisp outdoor sights in Delhi landmark',
                  imagePrompt: 'Smiling confident person looking with clear sharp vision, warm cinematic natural lighting, commercial advertisement quality',
                  videoPrompt: 'Doctor talking to a patient in a clinic setting with confidence',
                  storyboard: [
                    'Scene 1: Tired of switching between glasses and struggling with strain',
                    'Scene 2: Seamless painless consultation at Jeevansphere',
                    'Scene 3: Clear vision results and patient satisfaction',
                    'Scene 4: CTA: Schedule Your Visit at Jeevansphere'
                  ],
                  generatedImageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&auto=format&fit=crop&q=85',
                  generatedVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-doctor-talking-to-a-patient-in-a-clinic-41584-large.mp4',
                  hookText: 'Experience Exceptional Eye Care Today'
                }
              ]),
              qualityCheckJson: JSON.stringify({
                status: 'PASS',
                warnings: [],
                errors: [],
                overallScore: 98,
              }),
            },
          },
        },
      });

      await prisma.creative.create({
        data: {
          campaignId: sampleCampaign.id,
          title: 'Precision Optical Care Specialist Consultation',
          type: 'IMAGE',
          provider: 'Gemini',
          model: 'gemini-3.6-flash',
          prompt: 'Professional optometrist examining patient eyes with modern diagnostic slit lamp equipment in clean aesthetic clinic',
          aspectRatio: '4:5',
          imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop&q=85',
          status: 'FINAL',
        },
      });

      await prisma.creative.create({
        data: {
          campaignId: sampleCampaign.id,
          title: 'Vision Freedom & Lifestyle Campaign',
          type: 'IMAGE',
          provider: 'Gemini',
          model: 'gemini-3.6-flash',
          prompt: 'Smiling confident person looking with clear sharp vision in natural warm lighting',
          aspectRatio: '9:16',
          imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&auto=format&fit=crop&q=85',
          status: 'FINAL',
        },
      });
    }
  } catch (err) {
    console.warn('[Seed Data Warning]:', err);
  }
}
