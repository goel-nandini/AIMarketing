import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: campaignId } = await params;
    const proposal = await prisma.campaignProposal.findUnique({
      where: { campaignId },
    });

    if (!proposal) {
      const defaultProposal = await prisma.campaignProposal.findFirst();
      if (defaultProposal) {
        return NextResponse.json({
          ...defaultProposal,
          audience: JSON.parse(defaultProposal.audienceJson),
          strategy: JSON.parse(defaultProposal.strategyJson),
          copy: JSON.parse(defaultProposal.copyJson),
          creatives: JSON.parse(defaultProposal.creativesJson),
          qualityCheck: JSON.parse(defaultProposal.qualityCheckJson),
        });
      }
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...proposal,
      audience: JSON.parse(proposal.audienceJson),
      strategy: JSON.parse(proposal.strategyJson),
      copy: JSON.parse(proposal.copyJson),
      creatives: JSON.parse(proposal.creativesJson),
      qualityCheck: JSON.parse(proposal.qualityCheckJson),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
