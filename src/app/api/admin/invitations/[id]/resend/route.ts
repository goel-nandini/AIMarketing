import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureSeedData } from '@/lib/seed';
import { verifyAdminAuth } from '@/lib/auth/server-auth';
import { sendInvitationEmail } from '@/lib/email/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureSeedData();
    const authResult = await verifyAdminAuth(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.statusCode || 403 });
    }

    const { id } = await params;
    const invitation = await prisma.invitation.findUnique({
      where: { id },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const invitationUrl = `${protocol}://${host}/signup?passcode=${encodeURIComponent(invitation.passcode)}&email=${encodeURIComponent(invitation.email)}`;

    const emailRes = await sendInvitationEmail({
      toEmail: invitation.email,
      role: invitation.role,
      invitedByName: authResult.user.name || 'Super Admin',
      passcode: invitation.passcode,
      invitationUrl,
      message: invitation.message || undefined,
    });

    return NextResponse.json({
      success: true,
      delivered: emailRes.delivered,
      message: emailRes.delivered
        ? `Invitation email resent to ${invitation.email}!`
        : `Email delivery attempt completed for ${invitation.email}.`,
    });
  } catch (error: any) {
    console.error('[Invitation Resend Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
