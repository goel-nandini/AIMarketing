import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyServerAuth } from '@/lib/auth/server-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const authResult = await verifyServerAuth(req);
    const body = await req.json().catch(() => ({}));
    
    const userId = body.userId || (authResult.authenticated && authResult.user?.uid) || 'usr_aman';
    const userName = body.userName || (authResult.authenticated && authResult.user?.name) || 'Aman Sir';
    const userEmail = body.userEmail || (authResult.authenticated && authResult.user?.email) || 'aman@codekap.com';
    const deltaSeconds = Number(body.deltaSeconds) || 0;
    const currentPage = body.currentPage || '/dashboard';
    const deviceInfo = body.deviceInfo || 'Desktop Browser';
    const status = body.status || 'ACTIVE'; // ACTIVE or IDLE

    const todayDate = new Date().toISOString().split('T')[0];

    // Find existing log for today
    const existing = await prisma.screenTimeLog.findUnique({
      where: {
        userId_date: {
          userId,
          date: todayDate,
        },
      },
    });

    let pageBreakdownMap: Record<string, number> = {};
    if (existing?.pageBreakdown) {
      try {
        pageBreakdownMap = JSON.parse(existing.pageBreakdown);
      } catch {}
    }

    if (deltaSeconds > 0) {
      pageBreakdownMap[currentPage] = (pageBreakdownMap[currentPage] || 0) + deltaSeconds;
    }

    const updated = await prisma.screenTimeLog.upsert({
      where: {
        userId_date: {
          userId,
          date: todayDate,
        },
      },
      update: {
        userName,
        userEmail,
        activeSeconds: { increment: deltaSeconds },
        lastActiveAt: new Date(),
        pageBreakdown: JSON.stringify(pageBreakdownMap),
        deviceInfo,
        status,
      },
      create: {
        userId,
        userName,
        userEmail,
        date: todayDate,
        activeSeconds: deltaSeconds,
        sessionCount: 1,
        firstLoginAt: new Date(),
        lastActiveAt: new Date(),
        pageBreakdown: JSON.stringify(pageBreakdownMap),
        deviceInfo,
        status,
      },
    });

    return NextResponse.json({ success: true, log: updated });
  } catch (error: any) {
    console.error('[ScreenTime Heartbeat Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
