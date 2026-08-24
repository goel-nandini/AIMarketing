import { NextResponse } from 'next/server';
import { metaAdsIntegrationService } from '@/lib/services/ads/meta-ads.service';

export async function GET() {
  try {
    const accounts = await metaAdsIntegrationService.getAccessibleAccounts();
    return NextResponse.json(accounts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
