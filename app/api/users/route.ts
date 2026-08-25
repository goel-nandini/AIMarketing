import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { ensureSeedData } from '../../../lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    await ensureSeedData();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const formatted = users.map((u) => ({
      uid: u.id,
      name: u.name,
      email: u.email,
      username: u.email.split('@')[0],
      role: u.role,
      status: 'ACTIVE',
      title: u.title,
      avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
