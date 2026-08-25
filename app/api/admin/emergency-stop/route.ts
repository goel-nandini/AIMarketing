import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    await ensureSeedData();
    const body = await req.json();
    const { userId, userName, confirmationReason } = body;

    // Verify Admin Role
    const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    const role = user?.role || 'ADMIN';

    if (role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only ADMIN users can trigger global emergency stop.' },
        { status: 403 }
      );
    }

    // Pause all ACTIVE campaigns
    const updatedCount = await prisma.campaign.updateMany({
      where: { status: 'ACTIVE' },
      data: { status: 'PAUSED' },
    });

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user?.id || null,
        userName: user?.name || userName || 'Aman Sir (ADMIN)',
        action: 'TRIGGERED GLOBAL EMERGENCY STOP',
        status: 'WARNING',
        details: `ADMIN Emergency Stop triggered! Paused ${updatedCount.count} active campaigns. Reason: ${confirmationReason || 'Administrative emergency halt.'}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `GLOBAL EMERGENCY STOP EXECUTED. Paused ${updatedCount.count} active campaigns.`,
      pausedCampaignsCount: updatedCount.count,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
