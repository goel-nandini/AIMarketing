import { NextResponse } from 'next/server';
import { metaAdsIntegrationService } from '@/lib/services/ads/meta-ads.service';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/connections?error=missing_code', req.url));
    }

    await metaAdsIntegrationService.exchangeCodeForTokens(code);

    await prisma.auditLog.create({
      data: {
        action: 'Connected Meta Ads Account via OAuth 2.0',
        status: 'SUCCESS',
        details: 'Exchanged authorization code and stored Meta long-lived access token reference.',
      },
    });

    return NextResponse.redirect(new URL('/connections?connected=meta', req.url));
  } catch (error: any) {
    return NextResponse.redirect(new URL(`/connections?error=${encodeURIComponent(error.message)}`, req.url));
  }
}
