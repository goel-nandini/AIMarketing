import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { imageGenerationService } from '@/lib/services/media/image-generation.service';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: creativeId } = await params;
    const body = await req.json();

    const { campaignId, prompt, aspectRatio, provider } = body;

    const newCreative = await imageGenerationService.generateAndSaveImage({
      campaignId: campaignId || 'cmp_01',
      prompt: prompt || 'Regenerated diagnostic consultation visual in Toronto',
      aspectRatio: aspectRatio || '4:5',
      provider: provider || (process.env.GEMINI_API_KEY ? 'gemini' : 'openai'),
    });

    try {
      const campaignExists = campaignId ? await prisma.campaign.findUnique({ where: { id: campaignId } }).catch(() => null) : null;
      await prisma.auditLog.create({
        data: {
          action: `Regenerated Creative Asset (Parent: ${creativeId})`,
          campaignId: campaignExists ? campaignId : null,
          campaignName: campaignExists ? campaignExists.name : 'System Creative Studio',
          agentName: 'Creative Agent',
          apiOperation: `POST /api/creatives/${creativeId}/regenerate`,
          status: 'SUCCESS',
          details: `Created new version ${newCreative.id} with parent link to ${creativeId}.`,
        },
      }).catch(() => null);
    } catch {}

    return NextResponse.json({
      ...newCreative,
      parentCreativeId: creativeId,
      generationVersion: 2,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
