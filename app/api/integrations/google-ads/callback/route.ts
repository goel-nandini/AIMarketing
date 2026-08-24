import { NextResponse } from 'next/server';
import { googleAdsIntegrationService } from '@/lib/services/ads/google-ads.service';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/connections?error=missing_code', req.url));
    }

    await googleAdsIntegrationService.exchangeCodeForTokens(code);

    await prisma.connectionStatus.upsert({
      where: { id: 'default' },
      update: { googleAdsConnected: true },
      create: {
        id: 'default',
        googleAdsConnected: true,
        googleAdsCustomerId: '849-204-9102',
        googleAdsAccountName: 'G1 Sphere Canada Ads',
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'Connected Google Ads Account via OAuth 2.0',
        status: 'SUCCESS',
        details: 'Exchanged authorization code and stored token reference securely.',
      },
    });

    return NextResponse.redirect(new URL('/connections?connected=google', req.url));
  } catch (error: any) {
    return NextResponse.redirect(new URL(`/connections?error=${encodeURIComponent(error.message)}`, req.url));
  }
}
