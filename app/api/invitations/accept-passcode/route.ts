import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { passcode, name, email, uid } = body;

    if (!passcode || !passcode.trim()) {
      return NextResponse.json({ error: 'Passcode is required to join the team.' }, { status: 400 });
    }

    const cleanPasscode = passcode.trim().toUpperCase();

    // Look up invite in database
    const invite = await prisma.invitation.findUnique({
      where: { passcode: cleanPasscode },
    });

    if (!invite || invite.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Invalid or already used invitation passcode.' },
        { status: 400 }
      );
    }

    if (new Date() > new Date(invite.expiresAt)) {
      return NextResponse.json(
        { error: 'This invitation passcode has expired.' },
        { status: 410 }
      );
    }

    const targetEmail = (email || invite.email).toLowerCase().trim();
    const memberName = (name || invite.name || targetEmail.split('@')[0]).trim();
    const assignedRole = invite.role || 'TEAM_MEMBER';
    const userId = uid || `usr_${Date.now()}`;

    // Mark invitation as ACCEPTED in SQLite
    await prisma.invitation.update({
      where: { id: invite.id },
      data: {
        status: 'ACCEPTED',
      },
    });

    // Create or update User record in SQLite
    const user = await prisma.user.upsert({
      where: { email: targetEmail },
      update: {
        name: memberName,
        role: assignedRole,
        title: assignedRole === 'MANAGER' ? 'Marketing Manager' : 'Team Member',
      },
      create: {
        id: userId,
        email: targetEmail,
        name: memberName,
        role: assignedRole,
        title: assignedRole === 'MANAGER' ? 'Marketing Manager' : 'Team Member',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetEmail}`,
      },
    });

    // Record audit trail
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        action: `Team Member Joined via Passcode: [${cleanPasscode}]`,
        apiOperation: 'POST /api/invitations/accept-passcode (Prisma Engine)',
        status: 'SUCCESS',
        details: `Assigned Role: ${assignedRole}, Invited By: ${invite.invitedByName || 'Super Admin'}`,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        uid: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        avatar: user.avatar,
      },
      message: `Welcome to the team! Joined successfully with role: ${assignedRole}`,
    });
  } catch (error: any) {
    console.error('[Accept Passcode Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
