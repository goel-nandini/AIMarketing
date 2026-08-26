import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { googleAdsExecutionService } from '@/lib/google-ads/client';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: campaignId } = await params;
    const body = await req.json();

    const { authorized, userName, userId } = body;

    if (!authorized) {
      return NextResponse.json(
        { error: 'Explicit human budget launch confirmation is required.' },
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
      dailyBudget: campaign.dailyBudget,
      totalBudget: campaign.totalBudget,
      currency: campaign.currency,
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
      return NextResponse.json({ error: 'Proposal data missing' }, { status: 400 });
    }

    const executionResult = await googleAdsExecutionService.deployApprovedCampaign(
      formattedCampaign,
      proposal,
      userName || 'Aman Sir'
    );

    if (executionResult.success) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'ACTIVE',
          googleAdsCampaignId: executionResult.googleAdsCampaignId,
          approvedBy: userName || 'Aman Sir',
          approvedAt: new Date().toISOString(),
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: userId || null,
          userName: userName || 'Aman Sir',
          action: 'Human Approved & Launched Campaign to Google Ads API',
          campaignId: campaign.id,
          campaignName: campaign.name,
          apiOperation: `GoogleAdsService.createCampaign (${executionResult.googleAdsCampaignId})`,
          status: 'SUCCESS',
          details: `Approved daily budget: ${campaign.currency} $${campaign.dailyBudget}/day. Execution logs: ${executionResult.logs.join(' | ')}`,
        },
      });
    }

    return NextResponse.json(executionResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
