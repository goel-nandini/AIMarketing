import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '../../../../lib/auth/server-auth';
import { prisma } from '../../../../lib/prisma';
import { UserRole, UserProfile } from '../../../../lib/types';

export async function GET(req: Request) {
  try {
    const authResult = await verifyAdminAuth(req);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.statusCode || 403 });
    }

    const prismaUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const formattedUsers: UserProfile[] = prismaUsers.map((u) => ({
      uid: u.id,
      name: u.name,
      email: u.email,
      username: u.email.split('@')[0],
      role: (u.role === 'ADMIN' ? 'ADMIN' : u.role === 'MANAGER' ? 'MANAGER' : 'TEAM_MEMBER') as UserRole,
      status: 'ACTIVE',
      emailVerified: true,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
      avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
      title: u.title,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
