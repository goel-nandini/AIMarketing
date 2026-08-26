import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyServerAuth } from '@/lib/auth/server-auth';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/chat/conversations/[id]/read
 * Marks all unread messages in conversation as read for the current user.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    await ensureSeedData();
    const { id } = await params;
    const userId = auth.user.uid;

    // Find all unread messages in this conversation for current user
    const unreadMessages = await prisma.message.findMany({
      where: {
        conversationId: id,
        deletedAt: null,
        reads: {
          none: {
            userId,
          },
        },
      },
      select: { id: true },
    });

    for (const msg of unreadMessages) {
      try {
        await prisma.messageRead.create({
          data: {
            messageId: msg.id,
            userId,
          },
        });
      } catch {}
    }

    return NextResponse.json({ success: true, markedCount: unreadMessages.length });
  } catch (error: any) {
    console.error('[API Chat Mark Read Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to mark messages as read' }, { status: 500 });
  }
}
