import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyAdminAuth } from '@/lib/auth/server-auth';
import { sendInvitationEmail } from '@/lib/email/service';
import {
  getInvitationById,
  createInvitation,
  hashInvitationToken,
  recordAuditLog,
} from '@/lib/firebase/firestore-service';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyAdminAuth(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.statusCode || 403 });
    }

    const { id } = await params;
    const invitation = await getInvitationById(id);

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
    }

    // Generate new raw token and new tokenHash
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashInvitationToken(rawToken);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const invitationUrl = `${protocol}://${host}/invite/${rawToken}`;

    // Send real email delivery
    try {
      await sendInvitationEmail({
        toEmail: invitation.email,
        role: invitation.role,
        invitedByName: authResult.user.name,
        invitationUrl: invitationUrl,
        message: invitation.message,
      });
    } catch (emailErr: any) {
      return NextResponse.json(
        { error: `Resend Failed: ${emailErr.message || 'Email service error.'}` },
        { status: 500 }
      );
    }

    // Update invitation doc with new token hash, status, expiration
    const updatedInvitation = {
      ...invitation,
      tokenHash,
      status: 'PENDING' as const,
      expiresAt,
    };

    await createInvitation(updatedInvitation);

    await recordAuditLog({
      userId: authResult.user.uid,
      userName: authResult.user.name,
      action: 'INVITATION_RESENT',
      status: 'SUCCESS',
      details: `Resent invitation to ${invitation.email}. Extended expiration by 7 days.`,
    });

    return NextResponse.json({ success: true, message: 'Invitation resent successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
