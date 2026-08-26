import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyServerAuth } from '@/lib/auth/server-auth';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/social/posts/[id]
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    await ensureSeedData();
    const { id } = await params;

    const post = await prisma.socialPost.findUnique({
      where: { id },
      include: {
        client: true,
        attempts: {
          orderBy: { attemptedAt: 'desc' },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    }

    let platforms = [];
    try {
      platforms = JSON.parse(post.platformsJson);
    } catch {}

    let hashtags = [];
    try {
      hashtags = JSON.parse(post.hashtagsJson);
    } catch {}

    let media = [];
    try {
      media = JSON.parse(post.mediaJson);
    } catch {}

    let music = null;
    if (post.musicJson) {
      try {
        music = JSON.parse(post.musicJson);
      } catch {}
    }

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        clientId: post.clientId,
        clientName: post.client?.businessName || post.client?.name,
        clientLogo: post.client?.logoUrl,
        createdById: post.createdById,
        createdByName: post.createdByName,
        createdByEmail: post.createdByEmail,
        platforms,
        caption: post.caption,
        hashtags,
        location: post.location,
        media,
        music,
        status: post.status,
        scheduledAt: post.scheduledAt?.toISOString() || null,
        publishedAt: post.publishedAt?.toISOString() || null,
        failureReason: post.failureReason,
        lastEditedById: post.lastEditedById,
        lastEditedByName: post.lastEditedByName,
        lastEditedAt: post.lastEditedAt?.toISOString() || null,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        attempts: post.attempts,
      },
    });
  } catch (error: any) {
    console.error('[API Social Post Detail GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch post' }, { status: 500 });
  }
}

/**
 * PATCH /api/social/posts/[id]
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    if (auth.user.role === 'VIEWER') {
      return NextResponse.json({ error: 'Forbidden: Viewers cannot edit posts.' }, { status: 403 });
    }

    await ensureSeedData();
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.socialPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    }

    const updateData: any = {
      lastEditedById: auth.user.uid,
      lastEditedByName: auth.user.name,
      lastEditedAt: new Date(),
    };

    if (body.caption !== undefined) updateData.caption = body.caption;
    if (body.platforms !== undefined) updateData.platformsJson = JSON.stringify(body.platforms);
    if (body.hashtags !== undefined) updateData.hashtagsJson = JSON.stringify(body.hashtags);
    if (body.location !== undefined) updateData.location = body.location;
    if (body.media !== undefined) updateData.mediaJson = JSON.stringify(body.media);
    if (body.music !== undefined) updateData.musicJson = body.music ? JSON.stringify(body.music) : null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.scheduledAt !== undefined) {
      updateData.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
    }
    if (body.failureReason !== undefined) updateData.failureReason = body.failureReason;

    const updated = await prisma.socialPost.update({
      where: { id },
      data: updateData,
    });

    // Log Activity
    await prisma.socialActivityLog.create({
      data: {
        clientId: updated.clientId,
        postId: updated.id,
        action: `${auth.user.name} edited post`,
        userId: auth.user.uid,
        userName: auth.user.name,
        details: body.status ? `Status changed to ${body.status}` : 'Updated caption/media',
      },
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (error: any) {
    console.error('[API Social Post PATCH Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to update post' }, { status: 500 });
  }
}

/**
 * DELETE /api/social/posts/[id]
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    if (auth.user.role === 'VIEWER') {
      return NextResponse.json({ error: 'Forbidden: Viewers cannot delete posts.' }, { status: 403 });
    }

    await ensureSeedData();
    const { id } = await params;

    const existing = await prisma.socialPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    }

    await prisma.socialPost.delete({ where: { id } });

    await prisma.socialActivityLog.create({
      data: {
        clientId: existing.clientId,
        postId: id,
        action: `${auth.user.name} deleted post`,
        userId: auth.user.uid,
        userName: auth.user.name,
        details: `Post was in ${existing.status} status`,
      },
    });

    return NextResponse.json({ success: true, message: 'Post deleted successfully.' });
  } catch (error: any) {
    console.error('[API Social Post DELETE Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete post' }, { status: 500 });
  }
}
