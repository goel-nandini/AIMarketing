import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyServerAuth } from '@/lib/auth/server-auth';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/chat/conversations/[id]/messages
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
    const userId = user.uid;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
    }

    const isMember = conversation.members.some(
      (m) => m.userId === userId || m.userEmail === user.email
    );
    const isAdmin = user.role === 'ADMIN' || user.role === 'MANAGER';

    if (!isMember && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: id,
      },
      include: {
        reads: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const totalMembers = conversation.members.length;

    const parsedMessages = messages.map((m) => {
      const isDeleted = !!m.deletedAt;
      const isReadByMe = m.reads.some((r) => r.userId === userId);
      const isReadByAll = m.reads.length >= Math.max(1, totalMembers - 1);

      return {
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        senderName: m.senderName,
        senderEmail: m.senderEmail,
        senderAvatar: m.senderAvatar,
        content: isDeleted ? 'This message was deleted.' : m.content,
        messageType: m.messageType,
        attachmentUrl: isDeleted ? null : m.attachmentUrl,
        attachmentName: isDeleted ? null : m.attachmentName,
        attachmentSize: isDeleted ? null : m.attachmentSize,
        isEdited: m.isEdited,
        deletedAt: m.deletedAt ? m.deletedAt.toISOString() : null,
        isDeleted,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
        reads: m.reads.map((r) => ({
          id: r.id,
          messageId: r.messageId,
          userId: r.userId,
          readAt: r.readAt.toISOString(),
        })),
        isReadByMe,
        isReadByAll,
      };
    });

    return NextResponse.json({ success: true, messages: parsedMessages });
  } catch (error: any) {
    console.error('[API Chat Messages GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch messages' }, { status: 500 });
  }
}

/**
 * POST /api/chat/conversations/[id]/messages
 * Sends a real message in the conversation.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }
    const user = auth.user;

    await ensureSeedData();
    const { id } = await params;
    const body = await req.json();

    const { content, messageType = 'TEXT', attachmentUrl, attachmentName, attachmentSize } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content cannot be empty.' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
    }

    const isMember = conversation.members.some(
      (m) => m.userId === user.uid || m.userEmail === user.email
    );
    const isAdmin = user.role === 'ADMIN' || user.role === 'MANAGER';

    if (!isMember && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cleanContent = content.trim();

    // Create message in database
    const newMessage = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: user.uid,
        senderName: user.name,
        senderEmail: user.email,
        senderAvatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        content: cleanContent,
        messageType,
        attachmentUrl: attachmentUrl || null,
        attachmentName: attachmentName || null,
        attachmentSize: attachmentSize || null,
      },
    });

    // Mark as read by sender automatically
    await prisma.messageRead.create({
      data: {
        messageId: newMessage.id,
        userId: user.uid,
      },
    });

    // Update conversation lastMessage & lastMessageAt
    await prisma.conversation.update({
      where: { id },
      data: {
        lastMessage: `${user.name.split(' ')[0]}: ${cleanContent.slice(0, 60)}`,
        lastMessageAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        conversationId: newMessage.conversationId,
        senderId: newMessage.senderId,
        senderName: newMessage.senderName,
        senderEmail: newMessage.senderEmail,
        senderAvatar: newMessage.senderAvatar,
        content: newMessage.content,
        messageType: newMessage.messageType,
        attachmentUrl: newMessage.attachmentUrl,
        attachmentName: newMessage.attachmentName,
        attachmentSize: newMessage.attachmentSize,
        isEdited: false,
        deletedAt: null,
        createdAt: newMessage.createdAt.toISOString(),
        updatedAt: newMessage.updatedAt.toISOString(),
        isReadByMe: true,
        isReadByAll: false,
      },
    });
  } catch (error: any) {
    console.error('[API Chat Messages POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to send message' }, { status: 500 });
  }
}
