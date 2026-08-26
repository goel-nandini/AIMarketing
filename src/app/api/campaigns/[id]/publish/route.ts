import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { googleAdsAdapter } from '@/lib/services/ads/google-ads.adapter';
import { metaAdsAdapter } from '@/lib/services/ads/meta-ads.adapter';
import { PlatformCampaignPlan } from '@/lib/services/ads/base-platform.adapter';
import { verifyRolePermission } from '@/lib/auth/server-auth';
import { recordAuditLog } from '@/lib/firebase/firestore-service';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyRolePermission(req, ['ADMIN', 'MANAGER']);
    const { id: campaignId } = await params;
    const body = await req.json();

    if (!authResult.authenticated || !authResult.user) {
      await recordAuditLog({
        userId: authResult.user?.uid || 'unauthenticated',
        userName: authResult.user?.name || 'Unauthorized User',
        action: 'BLOCKED: Campaign Publish Attempt',
        campaignId,
        status: 'ERROR',
        details: authResult.error || 'Role is not authorized to publish advertising campaigns.',
      });
      return NextResponse.json(
        { error: authResult.error || 'Forbidden: Role is not authorized to publish campaigns.' },
        { status: authResult.statusCode || 403 }
      );
    }

    const user = authResult.user;
    const { executionId, platform } = body;

    // 2. Fetch Campaign & Proposal from DB
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { proposal: true, client: true },
    });

    if (!campaign || !campaign.proposal) {
      return NextResponse.json({ error: 'Campaign or Proposal record not found.' }, { status: 404 });
    }

    // 3. Idempotency Check
    if (campaign.status === 'ACTIVE' && campaign.googleAdsCampaignId) {
      return NextResponse.json({
        success: true,
        message: 'Campaign has already been published cleanly. Returning existing resource IDs.',
        externalCampaignId: campaign.googleAdsCampaignId,
        idempotent: true,
      });
    }

    const copy = JSON.parse(campaign.proposal.copyJson);

    // 4. Construct Master PlatformCampaignPlan
    const plan: PlatformCampaignPlan = {
      id: campaign.id,
      campaignName: campaign.name,
      objective: campaign.objective,
      platform: (platform || campaign.platform) as any,
      country: campaign.client.country || 'Canada',
      cities: [campaign.location],
      ageRange: '25-55',
      gender: 'All',
      language: 'English',
      budget: {
        dailyBudget: campaign.dailyBudget,
        totalBudget: campaign.totalBudget,
        currency: campaign.currency,
      },
      schedule: {
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        noEndDate: !campaign.endDate,
      },
      bidding: {
        strategy: 'Maximize Conversions',
        targetCpa: 35,
      },
      destination: {
        type: 'WEBSITE',
        url: campaign.client.website || 'https://icare-eyeconsultation.ca',
      },
      creative: {
        headlines: copy.headlines || [`${campaign.name} Consultation`],
        descriptions: copy.descriptions || ['Book your consultation appointment today.'],
        primaryTexts: copy.primaryTexts || ['Discover professional healthcare care.'],
        cta: 'Book Consultation',
      },
    };

    // 5. Dispatch to Platform Adapter
    const selectedPlatform = platform || campaign.platform;
    const adapter = selectedPlatform === 'Meta Ads' ? metaAdsAdapter : googleAdsAdapter;

    const result = await adapter.deployCampaign(plan, user?.name || 'Aman Sir');

    if (result.success && result.externalCampaignId) {
      // Update Database Status
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'ACTIVE',
          googleAdsCampaignId: result.externalCampaignId,
          approvedBy: user?.name || 'Aman Sir',
          approvedAt: new Date().toISOString(),
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user?.uid || null,
          userName: user?.name || 'Aman Sir',
          action: `Published Approved Campaign to ${adapter.platformName}`,
          campaignId: campaign.id,
          campaignName: campaign.name,
          apiOperation: `${adapter.platformName}.deployCampaign (${result.externalCampaignId})`,
          status: 'SUCCESS',
          details: `Approved Budget: ${campaign.currency} $${campaign.dailyBudget}/day. Execution Logs: ${result.logs.join(' | ')}`,
        },
      });
    }

    return NextResponse.json({
      ...result,
      executionId: executionId || `exec_${Date.now()}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
