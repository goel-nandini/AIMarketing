import { NextResponse } from 'next/server';
import { googleAdsIntegrationService } from '@/lib/services/ads/google-ads.service';

export async function GET() {
  try {
    const accounts = await googleAdsIntegrationService.getAccessibleAccounts();
    return NextResponse.json(accounts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
