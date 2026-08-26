import { NextResponse } from 'next/server';
import { googleAdsOAuthService } from '@/lib/google-ads/oauth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/connections?error=missing_code', req.url));
    }

    const tokens = await googleAdsOAuthService.exchangeCodeForTokens(code);

    // Save connection status in SQLite
    await prisma.connectionStatus.upsert({
      where: { id: 'default' },
      update: {
        googleAdsConnected: true,
      },
      create: {
        id: 'default',
        googleAdsConnected: true,
        googleAdsCustomerId: '849-204-9102',
        googleAdsAccountName: 'G1 Sphere Canada Ads',
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'Connected Google Ads OAuth Account',
        status: 'SUCCESS',
        details: 'Successfully exchanged authorization code for refresh tokens.',
      },
    });

    return NextResponse.redirect(new URL('/connections?connected=true', req.url));
  } catch (error: any) {
    return NextResponse.redirect(new URL('/connections?error=' + encodeURIComponent(error.message), req.url));
  }
}
