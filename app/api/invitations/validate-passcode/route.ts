import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { passcode, email } = body;

    if (!passcode || !passcode.trim()) {
      return NextResponse.json({ error: 'Passcode is required.' }, { status: 400 });
    }

    const cleanPasscode = passcode.trim().toUpperCase();

    // Look up passcode in SQLite database
    const invite = await prisma.invitation.findUnique({
      where: { passcode: cleanPasscode },
    });

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid invite passcode. Please verify the code with your Super Admin.' },
        { status: 404 }
      );
    }

    if (invite.status === 'REVOKED') {
      return NextResponse.json(
        { error: 'This invitation passcode has been revoked by the Super Admin.' },
        { status: 403 }
      );
    }

    if (invite.status === 'ACCEPTED') {
      return NextResponse.json(
        { error: 'This invitation passcode has already been used to join the team.' },
        { status: 400 }
      );
    }

    if (new Date() > new Date(invite.expiresAt)) {
      return NextResponse.json(
        { error: 'This invitation passcode has expired. Please ask your Super Admin to generate a new one.' },
        { status: 410 }
      );
    }

    // Optional email check if email is provided
    if (email && email.trim() && invite.email.toLowerCase() !== email.trim().toLowerCase()) {
      return NextResponse.json(
        { error: `This passcode was issued specifically for ${invite.email}. Please use that email or request a new code.` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: invite.email,
      name: invite.name,
      role: invite.role,
      invitedByName: invite.invitedByName || 'Super Admin',
      passcode: invite.passcode,
      invitationId: invite.id,
    });
  } catch (error: any) {
    console.error('[Validate Passcode Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
