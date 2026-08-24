import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: campaignId } = await params;
    const body = await req.json();
    const { userId, userName } = body;

    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'PENDING_APPROVAL' },
    });

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userName: userName || 'Team Member',
        action: 'Submitted Campaign Proposal for Human Approval',
        campaignId: campaign.id,
        campaignName: campaign.name,
        status: 'SUCCESS',
        details: 'Proposal status updated to PENDING_APPROVAL.',
      },
    });

    return NextResponse.json(campaign);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
