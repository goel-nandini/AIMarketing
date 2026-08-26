import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { googleAdsExecutionService } from '@/lib/google-ads/client';
import { verifyRolePermission } from '@/lib/auth/server-auth';
import { recordAuditLog } from '@/lib/firebase/firestore-service';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyRolePermission(req, ['ADMIN', 'MANAGER']);
    if (!authResult.authenticated || !authResult.user) {
      // Record blocked log
      await recordAuditLog({
        userId: authResult.user?.uid || 'unauthenticated',
        userName: authResult.user?.name || 'Unauthorized User',
        action: 'BLOCKED: Unauthorized Campaign Approval Attempt',
        status: 'ERROR',
        details: authResult.error || 'User not authorized to approve advertising spend.',
      });

      return NextResponse.json(
        { error: authResult.error || 'Forbidden: Only ADMIN and MANAGER roles can approve campaigns.' },
        { status: authResult.statusCode || 403 }
      );
    }

    const user = authResult.user;
    const role = user.role;
    const { id: campaignId } = await params;
    const body = await req.json();
    const { authorized, dailyBudget, currency } = body;

    if (!authorized) {
      return NextResponse.json(
        { error: 'Explicit human budget authorization checkbox is required.' },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { proposal: true, client: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const formattedCampaign = {
      id: campaign.id,
      name: campaign.name,
      clientId: campaign.clientId,
      clientName: campaign.client.name,
      objective: campaign.objective,
      platform: campaign.platform,
      location: campaign.location,
      dailyBudget: dailyBudget || campaign.dailyBudget,
      totalBudget: campaign.totalBudget,
      currency: currency || campaign.currency,
      status: campaign.status as any,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      googleAdsCampaignId: campaign.googleAdsCampaignId || undefined,
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString(),
    };

    const proposal = campaign.proposal ? {
      id: campaign.proposal.id,
      campaignId: campaign.id,
      clientId: campaign.clientId,
      clientName: campaign.client.name,
      objective: campaign.objective,
      location: campaign.location,
      recommendedBudgetCAD: campaign.proposal.recommendedBudgetCAD,
      platform: campaign.platform,
      audience: JSON.parse(campaign.proposal.audienceJson),
      strategy: JSON.parse(campaign.proposal.strategyJson),
      copy: JSON.parse(campaign.proposal.copyJson),
      creatives: JSON.parse(campaign.proposal.creativesJson),
      qualityCheck: JSON.parse(campaign.proposal.qualityCheckJson),
      createdAt: campaign.proposal.createdAt.toISOString(),
    } : null;

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 400 });
    }

    // Execute through Google Ads execution service (DEMO_MODE=true)
    const executionResult = await googleAdsExecutionService.deployApprovedCampaign(
      formattedCampaign,
      proposal,
      user?.name || 'Aman Sir'
    );

    if (executionResult.success) {
      // Update database status
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'ACTIVE',
          googleAdsCampaignId: executionResult.googleAdsCampaignId,
          approvedBy: user?.name || 'Aman Sir',
          approvedAt: new Date().toISOString(),
        },
      });

      // Record immutable approval log
      await prisma.auditLog.create({
        data: {
          userId: user?.uid || null,
          userName: user?.name || 'Aman Sir',
          action: 'Authorized Human Approved & Launched Campaign Spend',
          campaignId: campaign.id,
          campaignName: campaign.name,
          apiOperation: `GoogleAdsService.createCampaign (${executionResult.googleAdsCampaignId})`,
          status: 'SUCCESS',
          details: `Approved daily budget: ${currency || campaign.currency} $${dailyBudget || campaign.dailyBudget}/day by role: ${role}`,
        },
      });
    }

    return NextResponse.json(executionResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
