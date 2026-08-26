import { NextResponse } from 'next/server';
import { verifyServerAuth } from '@/lib/auth/server-auth';
import { getMetaOAuthUrl } from '@/lib/social/meta-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/social/accounts/connect
 * Initiates Meta OAuth flow or returns configuration guidance.
 */
export async function POST(req: Request) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    if (auth.user.role === 'VIEWER') {
      return NextResponse.json({ error: 'Forbidden: Viewers cannot connect social accounts.' }, { status: 403 });
    }

    const body = await req.json();
    const { clientId, platform, redirectUri } = body;

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required.' }, { status: 400 });
    }

    const appId = (process.env.META_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID || '').trim();

    if (!appId) {
      // Return clear configuration guidance
      return NextResponse.json({
        configured: false,
        message: 'Meta App ID not configured in server environment. Use direct token connection or set META_APP_ID in .env.',
        supportedPlatforms: ['INSTAGRAM', 'FACEBOOK'],
        requiredScopes: [
          'pages_show_list',
          'pages_read_engagement',
          'pages_manage_posts',
          'instagram_basic',
          'instagram_content_publish',
        ],
      });
    }

    const effectiveRedirect = redirectUri || `${req.headers.get('origin') || 'http://localhost:3000'}/social/accounts/callback`;
    const oauthUrl = getMetaOAuthUrl(clientId, effectiveRedirect);

    return NextResponse.json({
      configured: true,
      oauthUrl,
      platform: platform || 'META',
      redirectUri: effectiveRedirect,
    });
  } catch (error: any) {
    console.error('[API Social Connect Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to initialize OAuth connection' }, { status: 500 });
  }
}
