import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureSeedData } from '@/lib/seed';
import { publishToInstagram, publishToFacebook } from '@/lib/social/meta-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Processes queued scheduled posts ready to be published.
 * Can be called by cron, background worker, or client-side scheduler trigger.
 */
async function processPublishingQueue() {
  await ensureSeedData();

  const now = new Date();

  // Find all scheduled posts due for publishing
  const duePosts = await prisma.socialPost.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledAt: {
        lte: now,
      },
    },
    include: {
      client: {
        include: {
          socialAccounts: {
            where: { isConnected: true },
          },
        },
      },
    },
    take: 20,
  });

  const processedResults: any[] = [];

  for (const post of duePosts) {
    // Transition to PUBLISHING
    await prisma.socialPost.update({
      where: { id: post.id },
      data: { status: 'PUBLISHING' },
    });

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

    const primaryMedia = media.length > 0 ? media[0] : null;
    const mediaUrl = primaryMedia?.url || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80';
    const mediaType = primaryMedia?.type || 'image';

    const fullCaptionWithHashtags = hashtags.length > 0
      ? `${post.caption.trim()}\n\n${hashtags.join(' ')}`
      : post.caption.trim();

    let postSuccess = true;
    let failureReasons: string[] = [];

    for (const p of platforms) {
      const platformKey = p.toUpperCase();
      const account = post.client.socialAccounts.find((a) => a.platform === platformKey);

      if (!account || !account.encryptedToken) {
        const errorMsg = `No active connected ${platformKey} account found for ${post.client.name}`;
        failureReasons.push(errorMsg);
        postSuccess = false;

        await prisma.socialPublishAttempt.create({
          data: {
            postId: post.id,
            platform: platformKey,
            attemptNumber: 1,
            status: 'FAILED',
            errorMessage: errorMsg,
          },
        });
        continue;
      }

      if (platformKey === 'INSTAGRAM') {
        const res = await publishToInstagram(account.accountId, account.encryptedToken, {
          caption: fullCaptionWithHashtags,
          mediaUrl,
          mediaType,
        });

        if (res.success) {
          await prisma.socialPublishAttempt.create({
            data: {
              postId: post.id,
              platform: platformKey,
              attemptNumber: 1,
              status: 'SUCCESS',
              platformPostId: res.platformPostId,
              platformPostUrl: res.platformPostUrl,
            },
          });
        } else {
          postSuccess = false;
          failureReasons.push(`Instagram: ${res.error}`);
          await prisma.socialPublishAttempt.create({
            data: {
              postId: post.id,
              platform: platformKey,
              attemptNumber: 1,
              status: 'FAILED',
              errorMessage: res.error,
            },
          });
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
              postId: post.id,
              platform: platformKey,
              attemptNumber: 1,
              status: 'SUCCESS',
              platformPostId: res.platformPostId,
              platformPostUrl: res.platformPostUrl,
            },
          });
        } else {
          postSuccess = false;
          failureReasons.push(`Facebook: ${res.error}`);
          await prisma.socialPublishAttempt.create({
            data: {
              postId: post.id,
              platform: platformKey,
              attemptNumber: 1,
              status: 'FAILED',
              errorMessage: res.error,
            },
          });
        }
      }
    }

    const finalStatus = postSuccess ? 'PUBLISHED' : 'FAILED';
    const finalReason = failureReasons.length > 0 ? failureReasons.join(' | ') : null;

    const updated = await prisma.socialPost.update({
      where: { id: post.id },
      data: {
        status: finalStatus,
        publishedAt: postSuccess ? new Date() : null,
        failureReason: finalReason,
      },
    });

    await prisma.socialActivityLog.create({
      data: {
        clientId: post.clientId,
        postId: post.id,
        action: postSuccess
          ? `Auto-publisher successfully published scheduled post to ${platforms.join(', ')}`
          : `Auto-publisher failed to publish scheduled post: ${finalReason}`,
        userId: 'system_queue_worker',
        userName: 'KAIRO Auto-Publisher',
        details: `Scheduled time was ${post.scheduledAt?.toISOString()}`,
      },
    });

    processedResults.push({
      postId: updated.id,
      clientName: post.client.name,
      status: finalStatus,
      failureReason: finalReason,
    });
  }

  return {
    processedCount: duePosts.length,
    results: processedResults,
  };
}

export async function GET() {
  try {
    const result = await processPublishingQueue();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[API Social Queue Process GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Queue processing failed' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await processPublishingQueue();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[API Social Queue Process POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Queue processing failed' }, { status: 500 });
  }
}
