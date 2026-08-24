import { NextResponse } from 'next/server';
import { videoGenerationService } from '@/lib/services/media/video-generation.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, prompt, aspectRatio, durationSeconds, provider } = body;

    if (!campaignId || !prompt) {
      return NextResponse.json({ error: 'campaignId and prompt are required' }, { status: 400 });
    }

    const result = await videoGenerationService.createVideoGeneration({
      campaignId,
      prompt,
      aspectRatio: aspectRatio || '9:16',
      durationSeconds: durationSeconds || 15,
      provider: provider || 'openai',
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
