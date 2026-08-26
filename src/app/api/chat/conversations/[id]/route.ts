import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyServerAuth } from '@/lib/auth/server-auth';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/chat/conversations/[id]
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }
    const user = auth.user;

    await ensureSeedData();
    const { id } = await params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        client: true,
        members: true,
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
    }

    // Permission check
    const isMember = conversation.members.some(
      (m) => m.userId === user.uid || m.userEmail === user.email
    );
    const isAdmin = user.role === 'ADMIN' || user.role === 'MANAGER';

    if (!isMember && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You are not a member of this conversation.' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        clientId: conversation.clientId,
        clientName: conversation.client?.businessName || conversation.client?.name || conversation.clientName,
        clientLogo: conversation.client?.logoUrl,
        name: conversation.name,
        type: conversation.type,
        avatarUrl: conversation.avatarUrl,
        createdById: conversation.createdById,
        createdByName: conversation.createdByName,
        members: conversation.members.map((m) => ({
          id: m.id,
          userId: m.userId,
          userName: m.userName,
          userEmail: m.userEmail,
          userAvatar: m.userAvatar,
          role: m.role,
          joinedAt: m.joinedAt.toISOString(),
        })),
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[API Chat Conversation Detail GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch conversation' }, { status: 500 });
  }
}

/**
 * PATCH /api/chat/conversations/[id]
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }
    const user = auth.user;

    await ensureSeedData();
    const { id } = await params;
    const body = await req.json();

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
    }

    const isMember = conversation.members.some((m) => m.userId === user.uid);
    const isAdmin = user.role === 'ADMIN' || user.role === 'MANAGER';

    if (!isMember && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.conversation.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name.trim() }),
        ...(body.avatarUrl !== undefined && { avatarUrl: body.avatarUrl }),
      },
    });

    return NextResponse.json({ success: true, conversation: updated });
  } catch (error: any) {
    console.error('[API Chat Conversation PATCH Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to update conversation' }, { status: 500 });
  }
}

/**
 * DELETE /api/chat/conversations/[id]
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }
    const user = auth.user;

    await ensureSeedData();
    const { id } = await params;

    const conversation = await prisma.conversation.findUnique({ where: { id } });
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
    }

    const isCreator = conversation.createdById === user.uid;
    const isAdmin = user.role === 'ADMIN' || user.role === 'MANAGER';

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Only conversation creator or admins can delete.' }, { status: 403 });
    }

    await prisma.conversation.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Conversation deleted successfully.' });
  } catch (error: any) {
    console.error('[API Chat Conversation DELETE Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete conversation' }, { status: 500 });
  }
}
