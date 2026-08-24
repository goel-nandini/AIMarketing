import { NextResponse } from 'next/server';
import { metaAdsIntegrationService } from '@/lib/services/ads/meta-ads.service';
import { verifyRolePermission } from '@/lib/auth/server-auth';

export async function GET(req: Request) {
  const authResult = await verifyRolePermission(req, ['ADMIN', 'MANAGER']);
  if (!authResult.authenticated) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.statusCode || 403 });
  }

  const url = metaAdsIntegrationService.getOAuthAuthUrl();
  return NextResponse.redirect(url);
}
