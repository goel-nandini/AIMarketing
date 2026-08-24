import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth/server-auth';
import { prisma } from '@/lib/prisma';
import {
  getUserProfile,
  updateUserRole,
  updateUserStatus,
  releaseUsername,
  recordAuditLog,
} from '@/lib/firebase/firestore-service';
import { UserRole, UserStatus } from '@/lib/types';
import { adminAuth, adminFirestore } from '@/lib/firebase/admin';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyAdminAuth(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.statusCode || 403 });
    }

    const { id: targetUid } = await params;
    const body = await req.json();
    const { role, status } = body;

    // Check Prisma first, then Firestore / memory
    let targetUser: any = await prisma.user.findFirst({
      where: {
        OR: [{ id: targetUid }, { email: targetUid }],
      },
    });

    if (!targetUser) {
      targetUser = await getUserProfile(targetUid);
    }

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user profile not found.' }, { status: 404 });
    }

    const targetUserId = targetUser.id || targetUser.uid;
    const targetUserEmail = targetUser.email;
    const currentRole = targetUser.role;

    // Prevent self-demotion or self-suspension
    if (targetUserId === authResult.user.uid || targetUserEmail === authResult.user.email) {
      if (role && role !== 'ADMIN') {
        return NextResponse.json({ error: 'Security Protection: You cannot demote your own ADMIN role.' }, { status: 400 });
      }
      if (status && status !== 'ACTIVE') {
        return NextResponse.json({ error: 'Security Protection: You cannot suspend or disable your own active account.' }, { status: 400 });
      }
    }

    let updated = false;

    // Handle Role Change
    if (role && role !== currentRole) {
      const validRoles: UserRole[] = ['ADMIN', 'MANAGER', 'TEAM_MEMBER', 'VIEWER'];
      if (!validRoles.includes(role as UserRole)) {
        return NextResponse.json({ error: `Invalid role "${role}".` }, { status: 400 });
      }

      // Update in Prisma
      try {
        await prisma.user.update({
          where: { id: targetUserId },
          data: { role: role as string },
        });
      } catch {}

      // Update in Firestore/memory
      try {
        await updateUserRole(targetUserId, role as UserRole);
      } catch {}

      await recordAuditLog({
        userId: authResult.user.uid,
        userName: authResult.user.name,
        action: 'ROLE_CHANGED',
        status: 'SUCCESS',
        details: `Changed user ${targetUserEmail} role from ${currentRole} to ${role}.`,
      });

      // Also record in Prisma audit log
      try {
        await prisma.auditLog.create({
          data: {
            userId: authResult.user.uid,
            userName: authResult.user.name,
            action: `Role Changed for ${targetUserEmail}`,
            status: 'SUCCESS',
            details: `Updated role from ${currentRole} to ${role}`,
          },
        });
      } catch {}

      updated = true;
    }

    // Handle Status Change
    if (status && status !== targetUser.status) {
      const validStatuses: UserStatus[] = ['PENDING', 'ACTIVE', 'SUSPENDED', 'DISABLED', 'INVITED'];
      if (!validStatuses.includes(status as UserStatus)) {
        return NextResponse.json({ error: `Invalid status "${status}".` }, { status: 400 });
      }

      try {
        await updateUserStatus(targetUserId, status as UserStatus);
      } catch {}

      const actionType = status === 'SUSPENDED' ? 'USER_SUSPENDED' : status === 'ACTIVE' ? 'USER_REACTIVATED' : 'USER_STATUS_UPDATED';

      await recordAuditLog({
        userId: authResult.user.uid,
        userName: authResult.user.name,
        action: actionType,
        status: 'SUCCESS',
        details: `Updated user ${targetUserEmail} status to ${status}.`,
      });

      updated = true;
    }

    return NextResponse.json({ success: updated, message: 'User updated successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyAdminAuth(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.statusCode || 403 });
    }

    const { id: targetUid } = await params;

    let targetUser: any = await prisma.user.findFirst({
      where: {
        OR: [{ id: targetUid }, { email: targetUid }],
      },
    });

    if (!targetUser) {
      targetUser = await getUserProfile(targetUid);
    }

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found.' }, { status: 404 });
    }

    const targetUserId = targetUser.id || targetUser.uid;
    const targetUserEmail = targetUser.email;

    if (targetUserId === authResult.user.uid || targetUserEmail === authResult.user.email) {
      return NextResponse.json({ error: 'Security Protection: You cannot delete your own account.' }, { status: 400 });
    }

    // Delete from Prisma
    try {
      await prisma.user.delete({
        where: { id: targetUserId },
      });
    } catch {}

    // Release username
    if (targetUser.username) {
      await releaseUsername(targetUser.username);
    }

    // Remove from Firestore /users
    if (adminFirestore) {
      try {
        await adminFirestore.collection('users').doc(targetUserId).delete();
      } catch {}
    }

    // Remove from Firebase Auth if Admin SDK present
    if (adminAuth) {
      try {
        await adminAuth.deleteUser(targetUserId);
      } catch (authErr) {
        console.warn('Firebase Auth delete error:', authErr);
      }
    }

    await recordAuditLog({
      userId: authResult.user.uid,
      userName: authResult.user.name,
      action: 'USER_REMOVED',
      status: 'SUCCESS',
      details: `Removed user ${targetUser.name} (${targetUserEmail}) from Agent AI.`,
    });

    return NextResponse.json({ success: true, message: 'User removed successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
