import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { ensureSeedData } from '../../../lib/seed';

export async function GET() {
  try {
    await ensureSeedData();
    const campaigns = await prisma.campaign.findMany({
      include: {
        client: true,
        proposal: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = campaigns.map(c => ({
      id: c.id,
      name: c.name,
      clientId: c.clientId,
      clientName: c.client.name,
      objective: c.objective,
      platform: c.platform,
      location: c.location,
      dailyBudget: c.dailyBudget,
      totalBudget: c.totalBudget,
      currency: c.currency,
      status: c.status,
      startDate: c.startDate,
      endDate: c.endDate,
      googleAdsCampaignId: c.googleAdsCampaignId,
      approvedBy: c.approvedBy,
      approvedAt: c.approvedAt,
      metrics: {
        spend: c.metricsSpend,
        impressions: c.metricsImpressions,
        clicks: c.metricsClicks,
        ctr: c.metricsCtr,
        cpc: c.metricsCpc,
        conversions: c.metricsConversions,
        cpa: c.metricsCpa,
        conversionRate: c.metricsConvRate,
      },
      aiInsight: c.aiInsight,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureSeedData();
    const brief = await req.json();
    const client = await prisma.client.findUnique({ where: { id: brief.clientId } });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 400 });
    }

    const campaignName = `${client.name} — ${brief.targetCity} ${brief.objective}`;

    const newCampaign = await prisma.campaign.create({
      data: {
        name: campaignName,
        clientId: client.id,
        objective: brief.objective,
        platform: brief.platform || 'Google Ads',
        location: `${brief.targetCity}, ${brief.targetProvince}, ${brief.targetCountry}`,
        dailyBudget: Number(brief.dailyBudget) || 50,
        totalBudget: Number(brief.totalBudget) || 1500,
        currency: brief.currency || 'CAD',
        status: 'AI_PROCESSING',
        startDate: brief.startDate || new Date().toISOString().split('T')[0],
        endDate: brief.endDate || new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
        brief: {
          create: {
            productService: brief.productService,
            serviceDescription: brief.serviceDescription || '',
            websiteUrl: brief.websiteUrl || client.website,
            landingPageUrl: brief.landingPageUrl || client.website,
            offer: brief.offer || '',
            cta: brief.cta || 'Book Consultation',
            targetCountry: brief.targetCountry || 'Canada',
            targetProvince: brief.targetProvince || 'Ontario',
            targetCity: brief.targetCity || 'Toronto',
            targetLanguage: brief.targetLanguage || 'English',
            aiRequirements: JSON.stringify(brief.aiRequirements || []),
          },
        },
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        action: `Created Campaign Brief: ${campaignName}`,
        campaignId: newCampaign.id,
        campaignName: campaignName,
        apiOperation: 'POST /api/campaigns (Brief Ingestion)',
        status: 'SUCCESS',
        details: `Initiated AI Agent Pipeline for target location: ${newCampaign.location}`,
      },
    });

    return NextResponse.json(newCampaign);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
