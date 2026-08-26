import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyServerAuth } from '@/lib/auth/server-auth';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/social/posts?clientId=xxx&status=DRAFT|SCHEDULED|PUBLISHED|FAILED
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
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const whereClause: any = {};
    if (clientId) {
      whereClause.clientId = clientId;
    }
    if (status && status !== 'ALL') {
      whereClause.status = status.toUpperCase();
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
        attempts: {
          orderBy: { attemptedAt: 'desc' },
          take: 5,
        },
      },
      orderBy: [
        { scheduledAt: 'asc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    const parsedPosts = posts.map((post) => {
      let platforms: string[] = ['INSTAGRAM', 'FACEBOOK'];
      try {
        platforms = JSON.parse(post.platformsJson);
      } catch {}

      let hashtags: string[] = [];
      try {
        hashtags = JSON.parse(post.hashtagsJson);
      } catch {}

      let media: any[] = [];
      try {
        media = JSON.parse(post.mediaJson);
      } catch {}

      let music: any = null;
      if (post.musicJson) {
        try {
          music = JSON.parse(post.musicJson);
        } catch {}
      }

      let locationDetails: any = null;
      if (post.locationJson) {
        try {
          locationDetails = JSON.parse(post.locationJson);
        } catch {}
      }

      return {
        id: post.id,
        clientId: post.clientId,
        clientName: post.client?.businessName || post.client?.name || 'Client',
        clientLogo: post.client?.logoUrl,
        createdById: post.createdById,
        createdByName: post.createdByName,
        createdByEmail: post.createdByEmail,
        platforms,
        caption: post.caption,
        hashtags,
        location: post.location,
        locationDetails,
        media,
        music,
        status: post.status,
        scheduledAt: post.scheduledAt ? post.scheduledAt.toISOString() : null,
        publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
        failureReason: post.failureReason,
        lastEditedById: post.lastEditedById,
        lastEditedByName: post.lastEditedByName,
        lastEditedAt: post.lastEditedAt ? post.lastEditedAt.toISOString() : null,
        isLocked: post.isLocked,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        attempts: post.attempts.map((att) => ({
          id: att.id,
          postId: att.postId,
          platform: att.platform,
          attemptNumber: att.attemptNumber,
          status: att.status,
          errorMessage: att.errorMessage,
          platformPostId: att.platformPostId,
          platformPostUrl: att.platformPostUrl,
          attemptedAt: att.attemptedAt.toISOString(),
        })),
      };
    });

    return NextResponse.json({ success: true, posts: parsedPosts });
  } catch (error: any) {
    console.error('[API Social Posts GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch social posts' }, { status: 500 });
  }
}

/**
 * POST /api/social/posts
 * Creates a new social post (DRAFT, READY, SCHEDULED, PUBLISHING).
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

    await ensureSeedData();
    const body = await req.json();

    const {
      clientId,
      platforms,
      caption,
      hashtags,
      location,
      locationDetails,
      media,
      music,
      status,
      scheduledAt,
    } = body;

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required.' }, { status: 400 });
    }

    if (!caption || !caption.trim()) {
      return NextResponse.json({ error: 'Post caption cannot be empty.' }, { status: 400 });
    }

    // Verify client exists
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json({ error: `Client with ID "${clientId}" not found.` }, { status: 404 });
    }

    const postStatus = status || (scheduledAt ? 'SCHEDULED' : 'DRAFT');
    const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;

    const newPost = await prisma.socialPost.create({
      data: {
        clientId,
        createdById: auth.user.uid,
        createdByName: auth.user.name,
        createdByEmail: auth.user.email,
        platformsJson: JSON.stringify(platforms && platforms.length > 0 ? platforms : ['INSTAGRAM', 'FACEBOOK']),
        caption: caption.trim(),
        hashtagsJson: JSON.stringify(hashtags || []),
        location: location || null,
        locationJson: locationDetails ? JSON.stringify(locationDetails) : null,
        mediaJson: JSON.stringify(media || []),
        musicJson: music ? JSON.stringify(music) : null,
        status: postStatus,
        scheduledAt: scheduledDate,
        lastEditedById: auth.user.uid,
        lastEditedByName: auth.user.name,
        lastEditedAt: new Date(),
      },
    });

    // Log Activity
    const actionText =
      postStatus === 'SCHEDULED'
        ? `${auth.user.name} scheduled a post for ${scheduledDate?.toLocaleDateString()}`
        : `${auth.user.name} created a new ${postStatus.toLowerCase()} post`;

    await prisma.socialActivityLog.create({
      data: {
        clientId,
        postId: newPost.id,
        action: actionText,
        userId: auth.user.uid,
        userName: auth.user.name,
        details: `Platforms: ${(platforms || ['INSTAGRAM']).join(', ')}`,
      },
    });

    return NextResponse.json({
      success: true,
      post: {
        id: newPost.id,
        clientId: newPost.clientId,
        status: newPost.status,
        caption: newPost.caption,
        scheduledAt: newPost.scheduledAt?.toISOString() || null,
        createdAt: newPost.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[API Social Posts POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to create social post' }, { status: 500 });
  }
}
