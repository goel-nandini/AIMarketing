import { NextResponse } from 'next/server';
import { googleAdsIntegrationService } from '@/lib/services/ads/google-ads.service';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: campaignId } = await params;
    const metrics = await googleAdsIntegrationService.getCampaignPerformance(campaignId);
    return NextResponse.json(metrics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
