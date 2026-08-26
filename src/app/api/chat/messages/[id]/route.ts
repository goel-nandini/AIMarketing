import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyServerAuth } from '@/lib/auth/server-auth';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * PATCH /api/chat/messages/[id]
 * Edits own message.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    await ensureSeedData();
    const { id } = await params;
    const body = await req.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content cannot be empty.' }, { status: 400 });
    }

    const message = await prisma.message.findUnique({ where: { id } });
    if (!message) {
      return NextResponse.json({ error: 'Message not found.' }, { status: 404 });
    }

    if (message.deletedAt) {
      return NextResponse.json({ error: 'Cannot edit a deleted message.' }, { status: 400 });
    }

    const isSender = message.senderId === auth.user.uid;
    if (!isSender) {
      return NextResponse.json({ error: 'Forbidden: You can only edit your own messages.' }, { status: 403 });
    }

    const updated = await prisma.message.update({
      where: { id },
      data: {
        content: content.trim(),
        isEdited: true,
      },
    });

    return NextResponse.json({ success: true, message: updated });
  } catch (error: any) {
    console.error('[API Chat Edit Message Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to edit message' }, { status: 500 });
  }
}

/**
 * DELETE /api/chat/messages/[id]
 * Soft deletes own message ("This message was deleted").
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    await ensureSeedData();
    const { id } = await params;

    const message = await prisma.message.findUnique({ where: { id } });
    if (!message) {
      return NextResponse.json({ error: 'Message not found.' }, { status: 404 });
    }

    const isSender = message.senderId === auth.user.uid;
    const isAdmin = auth.user.role === 'ADMIN' || auth.user.role === 'MANAGER';

    if (!isSender && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own messages.' }, { status: 403 });
    }

    // Soft delete
    const updated = await prisma.message.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: 'Message deleted successfully.' });
  } catch (error: any) {
    console.error('[API Chat Delete Message Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete message' }, { status: 500 });
  }
}
