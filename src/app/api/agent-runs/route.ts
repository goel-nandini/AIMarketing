import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');

    const agentRuns = await prisma.agentRun.findMany({
      where: campaignId ? { campaignId } : undefined,
      orderBy: { startedAt: 'asc' },
    });

    return NextResponse.json(agentRuns);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
