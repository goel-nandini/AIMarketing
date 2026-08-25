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
  
  `CREATE TABLE IF NOT EXISTS "Department" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "headId" TEXT,
    "headName" TEXT,
    "description" TEXT,
    "icon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Department_name_key" ON "Department"("name");`,

  `CREATE TABLE IF NOT EXISTS "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "department" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "managerId" TEXT,
    "managerName" TEXT,
    "joiningDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "avatar" TEXT,
    "workloadScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Employee_employeeId_key" ON "Employee"("employeeId");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Employee_email_key" ON "Employee"("email");`,

  `CREATE TABLE IF NOT EXISTS "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadCode" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'Website',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "assignedToId" TEXT,
    "assignedToName" TEXT,
    "lastContactDate" TEXT,
    "nextFollowUpDate" TEXT,
    "estimatedValue" REAL NOT NULL DEFAULT 0,
    "requirementNotes" TEXT,
    "convertedClientId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Lead_leadCode_key" ON "Lead"("leadCode");`,

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

  `CREATE TABLE IF NOT EXISTS "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "department" TEXT NOT NULL DEFAULT 'Development',
    "managerId" TEXT,
    "managerName" TEXT,
    "teamMembersJson" TEXT DEFAULT '[]',
    "startDate" TEXT NOT NULL,
    "deadline" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "health" TEXT NOT NULL DEFAULT 'ON_TRACK',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "billingTotal" REAL NOT NULL DEFAULT 0,
    "billingPaid" REAL NOT NULL DEFAULT 0,
    "gitRepoUrl" TEXT,
    "liveUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Project_projectCode_key" ON "Project"("projectCode");`,

  `CREATE TABLE IF NOT EXISTS "Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 1,
    "dueDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,

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
    "projectId" TEXT,
    "projectName" TEXT,
    "sopRef" TEXT,
    "proofUrl" TEXT,
    "githubLink" TEXT,
    "estimatedHours" REAL,
    "dueDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "WorkLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "employeeEmail" TEXT NOT NULL,
    "projectId" TEXT,
    "projectName" TEXT,
    "taskId" TEXT,
    "taskTitle" TEXT,
    "date" TEXT NOT NULL,
    "workCompleted" TEXT NOT NULL,
    "timeSpentHours" REAL NOT NULL DEFAULT 0,
    "proofUrl" TEXT,
    "blocker" TEXT,
    "tomorrowPlan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "SOP" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "checklistJson" TEXT NOT NULL DEFAULT '[]',
    "requiredProof" TEXT,
    "expectedDurationHours" REAL NOT NULL DEFAULT 0,
    "responsibleRole" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "version" TEXT NOT NULL DEFAULT '1.0',
    "active" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "SOP_code_key" ON "SOP"("code");`,

  `CREATE TABLE IF NOT EXISTS "Quotation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quotationNumber" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "validUntil" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientGstin" TEXT,
    "billingAddress" TEXT,
    "itemsJson" TEXT NOT NULL DEFAULT '[]',
    "subtotal" REAL NOT NULL DEFAULT 0,
    "taxAmount" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "bankDetails" TEXT,
    "terms" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Quotation_quotationNumber_key" ON "Quotation"("quotationNumber");`,

  `CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "quotationId" TEXT,
    "date" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientGstin" TEXT,
    "billingAddress" TEXT,
    "itemsJson" TEXT NOT NULL DEFAULT '[]',
    "subtotal" REAL NOT NULL DEFAULT 0,
    "cgst" REAL NOT NULL DEFAULT 0,
    "sgst" REAL NOT NULL DEFAULT 0,
    "igst" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "amountPaid" REAL NOT NULL DEFAULT 0,
    "balanceDue" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "paymentMethod" TEXT,
    "razorpayPaymentLinkId" TEXT,
    "razorpayPaymentId" TEXT,
    "notes" TEXT,
    "terms" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");`,

  `CREATE TABLE IF NOT EXISTS "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    "gstAmount" REAL NOT NULL DEFAULT 0,
    "paymentMethod" TEXT NOT NULL DEFAULT 'Bank Transfer',
    "description" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "department" TEXT NOT NULL DEFAULT 'Management',
    "projectId" TEXT,
    "projectName" TEXT,
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS "MarketingContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "campaignId" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'Instagram',
    "contentType" TEXT NOT NULL DEFAULT 'Post',
    "title" TEXT NOT NULL,
    "caption" TEXT,
    "creativeUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "publishDate" TEXT NOT NULL,
    "resultsJson" TEXT,
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
  `CREATE UNIQUE INDEX IF NOT EXISTS "Invitation_passcode_key" ON "Invitation"("passcode");`
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

    // 3. Ensure Core Departments
    const deptCount = await prisma.department.count();
    if (deptCount === 0) {
      await prisma.department.createMany({
        data: [
          { name: 'Sales & Business Development', headName: 'Aman Sir', description: 'Lead generation, sales pipeline, quotation negotiation & client onboarding' },
          { name: 'Development', headName: 'Lead Architect', description: 'Web app development, Next.js architecture, frontend/backend engineering & QA' },
          { name: 'Digital Marketing', headName: 'Marketing Lead', description: 'SEO, Google Ads, Meta Reels/Banners, performance marketing & creative campaigns' },
          { name: 'Administration & Management', headName: 'Aman Sir', description: 'Finance, GST invoicing, employee management, SOPs and business reporting' },
        ],
      });
    }

    // 4. Ensure Core SOP Templates
    const sopCount = await prisma.sOP.count();
    if (sopCount === 0) {
      await prisma.sOP.createMany({
        data: [
          {
            code: 'SOP-DEV-01',
            title: 'Fullstack Web Application Development SOP',
            department: 'Development',
            service: 'Custom Web Application',
            purpose: 'Standardize end-to-end web engineering from requirement SRS to deployment.',
            instructions: 'Follow standard Next.js + Tailwind + PostgreSQL architecture. Validate responsive layouts, write API tests, and secure role authorizations.',
            checklistJson: JSON.stringify([
              '1. Requirement Gathering & SRS Review',
              '2. UI/UX Wireframing & Design Signoff',
              '3. Database Schema & Prisma Migration',
              '4. API Endpoints & Server-Side Security Guard',
              '5. Frontend Component Assembly & Responsive Layout QA',
              '6. Client Demo & Feedback Iteration',
              '7. Production Deployment & Monitoring Setup'
            ]),
            requiredProof: 'Live deployment URL + GitHub PR Link + QA Checklist Signoff',
            expectedDurationHours: 40,
            responsibleRole: 'EMPLOYEE',
          },
          {
            code: 'SOP-MKT-01',
            title: 'Performance Digital Marketing & Google/Meta Ads SOP',
            department: 'Digital Marketing',
            service: 'Performance Marketing',
            purpose: 'Drive predictable lead generation and brand awareness with measurable ROAS.',
            instructions: 'Create conversion-focused visual creatives, setup UTM campaign tracking, configure conversion pixels, and monitor daily spend vs CPA.',
            checklistJson: JSON.stringify([
              '1. Audience Research & Competitor Benchmark',
              '2. Creative Visual Direction & Copywriting',
              '3. Conversion Pixel & Conversion Tracking Setup',
              '4. Campaign Setup in Ads Manager with Daily Budget',
              '5. A/B Testing Headings and Creatives',
              '6. Weekly Performance Optimization & CPA Audit',
              '7. Monthly Client Performance Report'
            ]),
            requiredProof: 'Ads Manager Screenshot + Lead Export Sheet + Monthly ROI Dashboard',
            expectedDurationHours: 20,
            responsibleRole: 'EMPLOYEE',
          }
        ],
      });
    }
  } catch (err) {
    console.warn('[Seed Data Warning]:', err);
  }
}
