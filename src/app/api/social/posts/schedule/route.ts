import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyServerAuth } from '@/lib/auth/server-auth';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/social/posts/schedule
 * Body: { postId?: string, postData?: any, scheduledAt: string, timezone?: string }
 */
export async function POST(req: Request) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    if (auth.user.role === 'VIEWER') {
      return NextResponse.json({ error: 'Forbidden: Viewers cannot schedule posts.' }, { status: 403 });
    }

    await ensureSeedData();
    const body = await req.json();
    const { postId, postData, scheduledAt, timezone } = body;

    if (!scheduledAt) {
      return NextResponse.json({ error: 'scheduledAt date/time is required.' }, { status: 400 });
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ error: 'Invalid scheduledAt format.' }, { status: 400 });
    }

    let targetPost: any = null;

    if (postId) {
      targetPost = await prisma.socialPost.update({
        where: { id: postId },
        data: {
          status: 'SCHEDULED',
          scheduledAt: scheduledDate,
          failureReason: null,
          lastEditedById: auth.user.uid,
          lastEditedByName: auth.user.name,
          lastEditedAt: new Date(),
        },
        include: { client: true },
      });
    } else if (postData) {
      if (!postData.clientId || !postData.caption) {
        return NextResponse.json({ error: 'clientId and caption are required.' }, { status: 400 });
      }

      targetPost = await prisma.socialPost.create({
        data: {
          clientId: postData.clientId,
          createdById: auth.user.uid,
          createdByName: auth.user.name,
          createdByEmail: auth.user.email,
          platformsJson: JSON.stringify(postData.platforms || ['INSTAGRAM', 'FACEBOOK']),
          caption: postData.caption.trim(),
          hashtagsJson: JSON.stringify(postData.hashtags || []),
          location: postData.location || null,
          mediaJson: JSON.stringify(postData.media || []),
          musicJson: postData.music ? JSON.stringify(postData.music) : null,
          status: 'SCHEDULED',
          scheduledAt: scheduledDate,
          lastEditedById: auth.user.uid,
          lastEditedByName: auth.user.name,
          lastEditedAt: new Date(),
        },
        include: { client: true },
      });
    } else {
      return NextResponse.json({ error: 'Either postId or postData must be provided.' }, { status: 400 });
    }

    // Log Activity
    await prisma.socialActivityLog.create({
      data: {
        clientId: targetPost.clientId,
        postId: targetPost.id,
        action: `${auth.user.name} scheduled post for ${scheduledDate.toLocaleString()}`,
        userId: auth.user.uid,
        userName: auth.user.name,
        details: `Scheduled Time: ${scheduledDate.toISOString()}, Timezone: ${timezone || 'Asia/Kolkata'}`,
      },
    });

    return NextResponse.json({
      success: true,
      status: 'SCHEDULED',
      post: {
        id: targetPost.id,
        clientId: targetPost.clientId,
        clientName: targetPost.client?.name,
        status: targetPost.status,
        scheduledAt: targetPost.scheduledAt?.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[API Social Schedule Error]:', error);
    return NextResponse.json({ error: error.message || 'Scheduling failed' }, { status: 500 });
  }
}
