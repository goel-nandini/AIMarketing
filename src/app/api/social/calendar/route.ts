import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyServerAuth } from '@/lib/auth/server-auth';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/social/calendar?clientId=xxx&month=8&year=2026
 */
export async function GET(req: Request) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    await ensureSeedData();

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    const whereClause: any = {};
    if (clientId) {
      whereClause.clientId = clientId;
    }

    const posts = await prisma.socialPost.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            businessName: true,
            logoUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const events = posts.map((post) => {
      let platforms = [];
      try {
        platforms = JSON.parse(post.platformsJson);
      } catch {}

      let media = [];
      try {
        media = JSON.parse(post.mediaJson);
      } catch {}

      const eventDate = post.scheduledAt || post.publishedAt || post.createdAt;

      return {
        id: post.id,
        clientId: post.clientId,
        clientName: post.client?.name || 'Client',
        clientLogo: post.client?.logoUrl,
        title: post.caption.slice(0, 45) + (post.caption.length > 45 ? '...' : ''),
        caption: post.caption,
        platforms,
        status: post.status,
        date: eventDate.toISOString(),
        scheduledAt: post.scheduledAt ? post.scheduledAt.toISOString() : null,
        publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
        mediaUrl: media[0]?.url || null,
        mediaType: media[0]?.type || 'image',
        createdByName: post.createdByName,
        failureReason: post.failureReason,
      };
    });

    return NextResponse.json({ success: true, events });
  } catch (error: any) {
    console.error('[API Social Calendar GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch calendar' }, { status: 500 });
  }
}
