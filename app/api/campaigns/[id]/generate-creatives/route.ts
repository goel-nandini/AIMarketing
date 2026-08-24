import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { imageGenerationService } from '@/lib/services/media/image-generation.service';
import { videoGenerationService } from '@/lib/services/media/video-generation.service';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: campaignId } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { proposal: true, client: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Generate 3 image assets and 1 video job
    const img1 = await imageGenerationService.generateAndSaveImage({
      campaignId,
      prompt: `Professional specialist explaining eye care consultation results in modern clean clinic in ${campaign.location}`,
      aspectRatio: '4:5',
    });

    const img2 = await imageGenerationService.generateAndSaveImage({
      campaignId,
      prompt: `Happy energetic client enjoying outdoor activity under crisp sunlight in ${campaign.location}`,
      aspectRatio: '9:16',
    });

    const videoJob = await videoGenerationService.createVideoGeneration({
      campaignId,
      prompt: `Cinematic 10s video showing precision diagnostic technology and consultation desk in ${campaign.location}`,
      aspectRatio: '9:16',
      durationSeconds: 15,
    });

    await prisma.auditLog.create({
      data: {
        action: 'Generated Batch Campaign Creative Assets',
        campaignId,
        agentName: 'Creative Agent',
        status: 'SUCCESS',
        details: 'Generated 2 images (4:5, 9:16) and queued 1 video generation job.',
      },
    });

    return NextResponse.json({
      success: true,
      campaignId,
      images: [img1, img2],
      videoJob,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
