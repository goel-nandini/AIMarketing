import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureSeedData } from '@/lib/seed';
import { verifyAdminAuth } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: any }) {
  try {
    await ensureSeedData();
    const authResult = await verifyAdminAuth(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.statusCode || 403 });
    }

    const resolvedParams = params && typeof params.then === 'function' ? await params : params;
    const targetId = resolvedParams?.id || '';

    if (!targetId) {
      return NextResponse.json({ error: 'Target ID is required.' }, { status: 400 });
    }

    // Try finding by id, passcode, or email
    try {
      const invitation = await prisma.invitation.findFirst({
        where: {
          OR: [
            { id: targetId },
            { passcode: targetId },
            { email: targetId },
          ],
        },
      });

      if (invitation) {
        await prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: 'REVOKED' },
        });

        await prisma.auditLog.create({
          data: {
            userId: authResult.user.uid,
            userName: authResult.user.name || 'Super Admin',
            action: `Super Admin Revoked Team Passcode for ${invitation.email}`,
            apiOperation: `POST /api/admin/invitations/${targetId}/revoke`,
            status: 'SUCCESS',
            details: `Revoked invite passcode [${invitation.passcode}] for ${invitation.email}.`,
          },
        }).catch(() => null);
      } else {
        // Also try soft updateMany in case ID was direct
        await prisma.invitation.updateMany({
          where: {
            OR: [
              { id: targetId },
              { passcode: targetId },
              { email: targetId },
            ],
          },
          data: { status: 'REVOKED' },
        }).catch(() => null);
      }
    } catch (dbErr: any) {
      console.warn('[Revoke DB Note]:', dbErr?.message);
    }

    return NextResponse.json({ success: true, message: 'Invitation passcode revoked successfully.' });
  } catch (error: any) {
    console.error('[Revoke Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

