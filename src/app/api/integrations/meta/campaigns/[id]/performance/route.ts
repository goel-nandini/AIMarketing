import { NextResponse } from 'next/server';
import { metaAdsIntegrationService } from '@/lib/services/ads/meta-ads.service';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: campaignId } = await params;
    const metrics = await metaAdsIntegrationService.getCampaignPerformance(campaignId);
    return NextResponse.json(metrics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
