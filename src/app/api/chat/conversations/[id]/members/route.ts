import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyServerAuth } from '@/lib/auth/server-auth';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/chat/conversations/[id]/members
 * Adds a real team member to the conversation.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    await ensureSeedData();
    const { id } = await params;
    const body = await req.json();
    const { userId, role = 'MEMBER' } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required.' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
    }

    // Check if user already a member
    if (conversation.members.some((m) => m.userId === userId)) {
      return NextResponse.json({ error: 'User is already a member of this conversation.' }, { status: 400 });
    }

    // Find real user or employee details
    const realUser = await prisma.user.findUnique({ where: { id: userId } });
    const realEmp = !realUser ? await prisma.employee.findUnique({ where: { id: userId } }) : null;

    if (!realUser && !realEmp) {
      return NextResponse.json({ error: `User with ID "${userId}" does not exist in workspace.` }, { status: 404 });
    }

    const userName = realUser?.name || realEmp?.name || 'Team Member';
    const userEmail = realUser?.email || realEmp?.email || `${userId}@codekap.com`;
    const userAvatar = realUser?.avatar || realEmp?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;

    const member = await prisma.conversationMember.create({
      data: {
        conversationId: id,
        userId,
        userName,
        userEmail,
        userAvatar,
        role,
      },
    });

    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    console.error('[API Chat Add Member Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to add member' }, { status: 500 });
  }
}

/**
 * DELETE /api/chat/conversations/[id]/members?userId=xxx
 * Removes a member from the conversation.
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    await ensureSeedData();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId');

    if (!targetUserId) {
      return NextResponse.json({ error: 'userId query parameter is required.' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
    }

    const isSelf = targetUserId === auth.user.uid;
    const isCreator = conversation.createdById === auth.user.uid;
    const isAdmin = auth.user.role === 'ADMIN' || auth.user.role === 'MANAGER';

    if (!isSelf && !isCreator && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You cannot remove other members from this conversation.' }, { status: 403 });
    }

    await prisma.conversationMember.deleteMany({
      where: {
        conversationId: id,
        userId: targetUserId,
      },
    });

    return NextResponse.json({ success: true, message: 'Member removed from conversation.' });
  } catch (error: any) {
    console.error('[API Chat Remove Member Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to remove member' }, { status: 500 });
  }
}
