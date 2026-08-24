import { NextResponse } from 'next/server';
import { googleAdsOAuthService } from '@/lib/google-ads/oauth';

export async function GET() {
  const authUrl = googleAdsOAuthService.getAuthUrl();
  return NextResponse.redirect(authUrl);
}
