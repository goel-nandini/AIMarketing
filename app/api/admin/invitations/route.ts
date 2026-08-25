import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { ensureSeedData } from '@/lib/seed';
import { verifyAdminAuth } from '../../../../lib/auth/server-auth';
import { UserRole } from '../../../../lib/types';

// Helper to generate readable 6-character team passcodes (e.g. AGENT-7291 or CODE-4819)
function generatePasscode(): string {
  const prefix = 'AGENT';
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${digits}`;
}

export async function GET(req: Request) {
  try {
    await ensureSeedData();
    const authResult = await verifyAdminAuth(req);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.statusCode || 403 });
    }

    const invitations = await prisma.invitation.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      invitations.map((inv) => ({
        id: inv.id,
        email: inv.email,
        name: inv.name,
        role: inv.role,
        passcode: inv.passcode,
        status: inv.status,
        invitedBy: inv.invitedBy,
        invitedByName: inv.invitedByName,
        expiresAt: inv.expiresAt.toISOString(),
        createdAt: inv.createdAt.toISOString(),
      }))
    );
  } catch (error: any) {
    console.error('[Invitations GET Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await verifyAdminAuth(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.statusCode || 403 });
    }

    const body = await req.json();
    const { email, name, role = 'TEAM_MEMBER', customPasscode, message } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const targetEmail = email.toLowerCase().trim();

    // Check if user is already an active registered user
    const existingUser = await prisma.user.findUnique({
      where: { email: targetEmail },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: `User with email ${targetEmail} is already a registered team member.` },
        { status: 400 }
      );
    }

    // Determine passcode
    let passcode = (customPasscode || '').trim().toUpperCase();
    if (!passcode) {
      passcode = generatePasscode();
    }

    // Check if passcode is already in use by a pending invitation
    const existingInviteWithCode = await prisma.invitation.findUnique({
      where: { passcode },
    });
    if (existingInviteWithCode && existingInviteWithCode.status === 'PENDING') {
      passcode = `${passcode}-${Math.floor(10 + Math.random() * 90)}`;
    }

    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days expiration

    // Revoke any previous pending invitations for this email
    await prisma.invitation.updateMany({
      where: { email: targetEmail, status: 'PENDING' },
      data: { status: 'REVOKED' },
    });

    const newInvite = await prisma.invitation.create({
      data: {
        email: targetEmail,
        name: name ? name.trim() : null,
        role: role as UserRole,
        passcode,
        invitedBy: authResult.user.uid,
        invitedByName: authResult.user.name || 'Super Admin',
        status: 'PENDING',
        message: message ? message.trim() : null,
        expiresAt,
      },
    });

    // Send invitation email
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const invitationUrl = `${protocol}://${host}/signup?passcode=${encodeURIComponent(passcode)}&email=${encodeURIComponent(targetEmail)}`;

    let emailStatus: { success: boolean; delivered: boolean; info?: string } = { success: true, delivered: false };
    try {
      const { sendInvitationEmail } = await import('@/lib/email/service');
      emailStatus = await sendInvitationEmail({
        toEmail: targetEmail,
        role: role,
        invitedByName: authResult.user.name || 'Super Admin',
        passcode,
        invitationUrl,
        message: message ? message.trim() : undefined,
      });
    } catch (err: any) {
      console.warn('[Email Dispatch Warning]:', err.message);
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: newInvite.id,
        email: newInvite.email,
        name: newInvite.name,
        role: newInvite.role,
        passcode: newInvite.passcode,
        status: newInvite.status,
        expiresAt: newInvite.expiresAt.toISOString(),
      },
      emailDelivered: emailStatus.delivered,
      emailInfo: emailStatus.info,
      message: emailStatus.delivered
        ? `Invitation and passcode email sent to ${targetEmail}!`
        : `Invitation created with Passcode [${passcode}]. Configure SMTP in .env to send direct inbox emails.`,
    });
  } catch (error: any) {
    console.error('[Invitations POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
