import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyServerAuth } from '@/lib/auth/server-auth';
import { ensureSeedData } from '@/lib/seed';
import { publishToInstagram, publishToFacebook } from '@/lib/social/meta-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/social/posts/publish
 * Body: { postId?: string, postData?: { clientId, platforms, caption, hashtags, location, media, music } }
 */
export async function POST(req: Request) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    if (auth.user.role === 'VIEWER') {
      return NextResponse.json({ error: 'Forbidden: Viewers cannot publish posts.' }, { status: 403 });
    }

    await ensureSeedData();
    const body = await req.json();
    const { postId, postData } = body;

    let targetPost: any = null;

    if (postId) {
      targetPost = await prisma.socialPost.findUnique({
        where: { id: postId },
        include: { client: true },
      });
      if (!targetPost) {
        return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
      }
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
          caption: postData.caption,
          hashtagsJson: JSON.stringify(postData.hashtags || []),
          location: postData.location || null,
          mediaJson: JSON.stringify(postData.media || []),
          musicJson: postData.music ? JSON.stringify(postData.music) : null,
          status: 'PUBLISHING',
          lastEditedById: auth.user.uid,
          lastEditedByName: auth.user.name,
          lastEditedAt: new Date(),
        },
      });
    } else {
      return NextResponse.json({ error: 'Either postId or postData must be provided.' }, { status: 400 });
    }

    // Mark status as PUBLISHING
    await prisma.socialPost.update({
      where: { id: targetPost.id },
      data: {
        status: 'PUBLISHING',
        lastEditedById: auth.user.uid,
        lastEditedByName: auth.user.name,
        lastEditedAt: new Date(),
      },
    });

    let platforms: string[] = ['INSTAGRAM', 'FACEBOOK'];
    try {
      platforms = JSON.parse(targetPost.platformsJson);
    } catch {}

    let hashtags: string[] = [];
    try {
      hashtags = JSON.parse(targetPost.hashtagsJson);
    } catch {}

    let media: any[] = [];
    try {
      media = JSON.parse(targetPost.mediaJson);
    } catch {}

    const primaryMedia = media.length > 0 ? media[0] : null;
    const mediaUrl = primaryMedia?.url || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80';
    const mediaType = primaryMedia?.type || 'image';

    const fullCaptionWithHashtags = hashtags.length > 0
      ? `${targetPost.caption.trim()}\n\n${hashtags.join(' ')}`
      : targetPost.caption.trim();

    // Fetch client connected accounts
    const clientAccounts = await prisma.socialAccount.findMany({
      where: {
        clientId: targetPost.clientId,
        isConnected: true,
      },
    });

    const publishResults: any[] = [];
    let overallSuccess = true;
    let failureReasons: string[] = [];

    for (const p of platforms) {
      const platformKey = p.toUpperCase();
      const account = clientAccounts.find((a) => a.platform === platformKey);

      if (!account) {
        const errorMsg = `No connected ${platformKey} account found for this client. Please connect account first in KAIRO Social Accounts.`;
        failureReasons.push(errorMsg);
        overallSuccess = false;

        await prisma.socialPublishAttempt.create({
          data: {
            postId: targetPost.id,
            platform: platformKey,
            attemptNumber: 1,
            status: 'FAILED',
            errorMessage: errorMsg,
          },
        });

        publishResults.push({
          platform: platformKey,
          success: false,
          error: errorMsg,
        });
        continue;
      }

      if (!account.encryptedToken) {
        const errorMsg = `Access token missing for ${account.username} (${platformKey}). Reconnect required.`;
        failureReasons.push(errorMsg);
        overallSuccess = false;

        await prisma.socialPublishAttempt.create({
          data: {
            postId: targetPost.id,
            platform: platformKey,
            attemptNumber: 1,
            status: 'FAILED',
            errorMessage: errorMsg,
          },
        });

        publishResults.push({
          platform: platformKey,
          success: false,
          error: errorMsg,
        });
        continue;
      }

      // Execute platform publishing via Meta Graph API
      if (platformKey === 'INSTAGRAM') {
        const res = await publishToInstagram(account.accountId, account.encryptedToken, {
          caption: fullCaptionWithHashtags,
          mediaUrl,
          mediaType,
        });

        if (res.success) {
          await prisma.socialPublishAttempt.create({
            data: {
              postId: targetPost.id,
              platform: platformKey,
              attemptNumber: 1,
              status: 'SUCCESS',
              platformPostId: res.platformPostId,
              platformPostUrl: res.platformPostUrl,
            },
          });
          publishResults.push(res);
        } else {
          overallSuccess = false;
          failureReasons.push(`Instagram: ${res.error}`);
          await prisma.socialPublishAttempt.create({
            data: {
              postId: targetPost.id,
              platform: platformKey,
              attemptNumber: 1,
              status: 'FAILED',
              errorMessage: res.error,
            },
          });
          publishResults.push(res);
        }
      } else if (platformKey === 'FACEBOOK') {
        const res = await publishToFacebook(account.accountId, account.encryptedToken, {
          caption: fullCaptionWithHashtags,
          mediaUrl,
          mediaType,
        });

        if (res.success) {
          await prisma.socialPublishAttempt.create({
            data: {
              postId: targetPost.id,
              platform: platformKey,
              attemptNumber: 1,
              status: 'SUCCESS',
              platformPostId: res.platformPostId,
              platformPostUrl: res.platformPostUrl,
            },
          });
          publishResults.push(res);
        } else {
          overallSuccess = false;
          failureReasons.push(`Facebook: ${res.error}`);
          await prisma.socialPublishAttempt.create({
            data: {
              postId: targetPost.id,
              platform: platformKey,
              attemptNumber: 1,
              status: 'FAILED',
              errorMessage: res.error,
            },
          });
          publishResults.push(res);
        }
      }
    }

    const finalStatus = overallSuccess ? 'PUBLISHED' : 'FAILED';
    const finalFailureReason = failureReasons.length > 0 ? failureReasons.join(' | ') : null;

    const updatedPost = await prisma.socialPost.update({
      where: { id: targetPost.id },
      data: {
        status: finalStatus,
        publishedAt: overallSuccess ? new Date() : null,
        failureReason: finalFailureReason,
        lastEditedById: auth.user.uid,
        lastEditedByName: auth.user.name,
        lastEditedAt: new Date(),
      },
    });

    // Log Activity
    const actionText = overallSuccess
      ? `${auth.user.name} published post to ${platforms.join(', ')}`
      : `${auth.user.name} attempted to publish post (Failed)`;

    await prisma.socialActivityLog.create({
      data: {
        clientId: targetPost.clientId,
        postId: targetPost.id,
        action: actionText,
        userId: auth.user.uid,
        userName: auth.user.name,
        details: overallSuccess
          ? `Published successfully to ${platforms.join(', ')}`
          : `Failure: ${finalFailureReason}`,
      },
    });

    return NextResponse.json({
      success: overallSuccess,
      status: finalStatus,
      postId: updatedPost.id,
      failureReason: finalFailureReason,
      results: publishResults,
    });
  } catch (error: any) {
    console.error('[API Social Publish Error]:', error);
    return NextResponse.json({ error: error.message || 'Publishing failed' }, { status: 500 });
  }
}
