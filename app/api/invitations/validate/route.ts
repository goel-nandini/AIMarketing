import { NextResponse } from 'next/server';
import { getInvitationByTokenHash, hashInvitationToken } from '../../../../lib/firebase/firestore-service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Invitation token is missing.' }, { status: 400 });
    }

    const tokenHash = hashInvitationToken(token);
    const invitation = await getInvitationByTokenHash(tokenHash);

    if (!invitation) {
      return NextResponse.json({ valid: false, error: 'Invitation is invalid or does not exist.' }, { status: 404 });
    }

    if (invitation.status === 'ACCEPTED') {
      return NextResponse.json({ valid: false, error: 'This invitation has already been used.' }, { status: 400 });
    }

    if (invitation.status === 'REVOKED') {
      return NextResponse.json({ valid: false, error: 'This invitation has been revoked by an administrator.' }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(invitation.expiresAt);
    if (expiresAt < now || invitation.status === 'EXPIRED') {
      return NextResponse.json({ valid: false, error: 'This invitation link has expired.' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        invitedByName: invitation.invitedByName || 'Administrator',
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
  }
}
