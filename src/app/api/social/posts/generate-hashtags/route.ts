import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyServerAuth } from '@/lib/auth/server-auth';
import { generateSocialHashtags } from '@/lib/social/social-ai-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/social/posts/generate-hashtags
 */
export async function POST(req: Request) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    if (auth.user.role === 'VIEWER') {
      return NextResponse.json({ error: 'Forbidden: Viewers have read-only access.' }, { status: 403 });
    }

    const body = await req.json();
    const { clientId, captionContext, mediaContext } = body;

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required.' }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
    }

    const hashtags = await generateSocialHashtags(
      {
        name: client.name,
        businessName: client.businessName,
        industry: client.industry,
        city: client.city,
        province: client.province,
      },
      captionContext,
      mediaContext
    );

    return NextResponse.json({
      success: true,
      hashtags,
    });
  } catch (error: any) {
    console.error('[API Social Generate Hashtags Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate hashtags' }, { status: 500 });
  }
}
