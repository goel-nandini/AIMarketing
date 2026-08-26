import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyServerAuth } from '@/lib/auth/server-auth';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/social/activity?clientId=xxx
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
    const limit = parseInt(searchParams.get('limit') || '30', 10);

    const whereClause: any = {};
    if (clientId) {
      whereClause.clientId = clientId;
    }

    const logs = await prisma.socialActivityLog.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            businessName: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      activities: logs.map((l) => ({
        id: l.id,
        clientId: l.clientId,
        clientName: l.client?.name || 'Client',
        postId: l.postId,
        action: l.action,
        userId: l.userId,
        userName: l.userName,
        details: l.details,
        platform: l.platform,
        timestamp: l.timestamp.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('[API Social Activity GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch activities' }, { status: 500 });
  }
}
