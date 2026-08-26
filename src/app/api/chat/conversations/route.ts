import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyServerAuth } from '@/lib/auth/server-auth';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/chat/conversations
 * Returns real conversations the authenticated user is part of.
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
    const search = searchParams.get('search')?.toLowerCase().trim();

    const userId = auth.user.uid;
    const userEmail = auth.user.email;
    const isAdmin = auth.user.role === 'ADMIN' || auth.user.role === 'MANAGER';

    // Find conversations where user is a member, or if admin/manager find client conversations
    const whereClause: any = {
      ...(clientId ? { clientId } : {}),
      ...(isAdmin
        ? {}
        : {
            members: {
              some: {
                OR: [{ userId }, { userEmail }],
              },
            },
          }),
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { clientName: { contains: search } },
        { lastMessage: { contains: search } },
      ];
    }

    const conversations = await prisma.conversation.findMany({
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
        members: {
          orderBy: { joinedAt: 'asc' },
        },
        messages: {
          where: { deletedAt: null },
          select: {
            id: true,
            senderId: true,
            reads: {
              where: { userId },
              select: { id: true },
            },
          },
        },
      },
      orderBy: [
        { lastMessageAt: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    const parsedConversations = conversations.map((c) => {
      // Calculate unread count for current user
      const unreadCount = c.messages.filter(
        (m) => m.senderId !== userId && m.reads.length === 0
      ).length;

      return {
        id: c.id,
        clientId: c.clientId,
        clientName: c.client?.businessName || c.client?.name || c.clientName || 'General Workspace',
        clientLogo: c.client?.logoUrl,
        name: c.name,
        type: c.type,
        avatarUrl: c.avatarUrl,
        createdById: c.createdById,
        createdByName: c.createdByName,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt ? c.lastMessageAt.toISOString() : null,
        unreadCount,
        members: c.members.map((m) => ({
          id: m.id,
          conversationId: m.conversationId,
          userId: m.userId,
          userName: m.userName,
          userEmail: m.userEmail,
          userAvatar: m.userAvatar,
          role: m.role,
          joinedAt: m.joinedAt.toISOString(),
        })),
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({ success: true, conversations: parsedConversations });
  } catch (error: any) {
    console.error('[API Chat Conversations GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch conversations' }, { status: 500 });
  }
}

/**
 * POST /api/chat/conversations
 * Creates a new conversation / group linked to a real client and real members.
 */
export async function POST(req: Request) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    await ensureSeedData();
    const body = await req.json();

    const { name, clientId, type = 'GROUP', memberUserIds = [] } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Conversation name is required.' }, { status: 400 });
    }

    let clientName: string | null = null;
    let clientLogo: string | null = null;

    if (clientId) {
      const client = await prisma.client.findUnique({ where: { id: clientId } });
      if (!client) {
        return NextResponse.json({ error: `Client "${clientId}" not found.` }, { status: 404 });
      }
      clientName = client.businessName || client.name;
      clientLogo = client.logoUrl;
    }

    // Always include current creator as ADMIN member
    const uniqueUserIds = Array.from(new Set([auth.user.uid, ...memberUserIds]));

    // Fetch real member details from DB
    const realUsers = await prisma.user.findMany({
      where: {
        id: { in: uniqueUserIds },
      },
    });

    const realEmployees = await prisma.employee.findMany({
      where: {
        id: { in: uniqueUserIds },
      },
    });

    const membersData: any[] = [];

    // Ensure creator is present
    membersData.push({
      userId: auth.user.uid,
      userName: auth.user.name,
      userEmail: auth.user.email,
      userAvatar: auth.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.user.uid}`,
      role: 'ADMIN',
    });

    for (const uid of uniqueUserIds) {
      if (uid === auth.user.uid) continue;

      const u = realUsers.find((x) => x.id === uid);
      if (u) {
        membersData.push({
          userId: u.id,
          userName: u.name,
          userEmail: u.email,
          userAvatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
          role: 'MEMBER',
        });
        continue;
      }

      const emp = realEmployees.find((x) => x.id === uid);
      if (emp) {
        membersData.push({
          userId: emp.id,
          userName: emp.name,
          userEmail: emp.email,
          userAvatar: emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.id}`,
          role: 'MEMBER',
        });
      }
    }

    const newConversation = await prisma.conversation.create({
      data: {
        name: name.trim(),
        clientId: clientId || null,
        clientName: clientName || null,
        type,
        createdById: auth.user.uid,
        createdByName: auth.user.name,
        members: {
          create: membersData,
        },
      },
      include: {
        client: true,
        members: true,
      },
    });

    return NextResponse.json({
      success: true,
      conversation: {
        id: newConversation.id,
        clientId: newConversation.clientId,
        clientName: newConversation.clientName,
        name: newConversation.name,
        type: newConversation.type,
        createdByName: newConversation.createdByName,
        members: newConversation.members,
        createdAt: newConversation.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[API Chat Conversations POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to create conversation' }, { status: 500 });
  }
}
