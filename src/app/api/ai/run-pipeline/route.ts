import { NextResponse } from 'next/server';
import { orchestrator } from '../../../../lib/ai/orchestrator';

export async function POST(req: Request) {
  try {
    const { campaignId } = await req.json();

    if (!campaignId) {
      return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
    }

    const proposal = await orchestrator.executeFullPipelineAndSave(campaignId);
    return NextResponse.json(proposal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
