import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/auth/server-auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
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

    await prisma.invitation.update({
      where: { id },
      data: { status: 'REVOKED' },
    });

    await prisma.auditLog.create({
      data: {
        userId: authResult.user.uid,
        userName: authResult.user.name || 'Super Admin',
        action: `Super Admin Revoked Team Passcode for ${invitation.email}`,
        apiOperation: `POST /api/admin/invitations/${id}/revoke (Prisma Engine)`,
        status: 'SUCCESS',
        details: `Revoked invite passcode [${invitation.passcode}] for ${invitation.email}.`,
      },
    });

    return NextResponse.json({ success: true, message: 'Invitation passcode revoked successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
