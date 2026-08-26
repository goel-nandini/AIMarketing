import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyServerAuth } from '@/lib/auth/server-auth';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/chat/users
 * Returns list of real workspace users and employees for conversation member picker.
 */
export async function GET(req: Request) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    await ensureSeedData();

    const [users, employees] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          title: true,
        },
      }),
      prisma.employee.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          designation: true,
          department: true,
        },
      }),
    ]);

    const seenEmails = new Set<string>();
    const realMembers: any[] = [];

    // Add Users
    for (const u of users) {
      if (seenEmails.has(u.email.toLowerCase())) continue;
      seenEmails.add(u.email.toLowerCase());
      realMembers.push({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
        title: u.title || 'Team Member',
      });
    }

    // Add Employees
    for (const emp of employees) {
      if (seenEmails.has(emp.email.toLowerCase())) continue;
      seenEmails.add(emp.email.toLowerCase());
      realMembers.push({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        role: emp.role,
        avatar: emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.id}`,
        title: emp.designation || emp.department || 'Employee',
      });
    }

    return NextResponse.json({ success: true, users: realMembers });
  } catch (error: any) {
    console.error('[API Chat Users GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: 500 });
  }
}
