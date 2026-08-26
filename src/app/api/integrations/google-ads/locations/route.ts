import { NextResponse } from 'next/server';
import { googleAdsIntegrationService } from '@/lib/services/ads/google-ads.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || 'Toronto';

    const criterion = await googleAdsIntegrationService.resolveGeoTargetConstant(query);
    return NextResponse.json(criterion);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
