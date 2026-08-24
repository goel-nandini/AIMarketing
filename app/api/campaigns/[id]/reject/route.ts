import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: campaignId } = await params;
    const body = await req.json();
    const { userId, userName, reason } = body;

    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'REJECTED' },
    });

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userName: userName || 'Aman Sir',
        action: 'Rejected Campaign Proposal',
        campaignId: campaign.id,
        campaignName: campaign.name,
        status: 'WARNING',
        details: `Reason: ${reason || 'Revision requested.'}`,
      },
    });

    return NextResponse.json(campaign);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
