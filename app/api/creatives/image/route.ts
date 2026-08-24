import { NextResponse } from 'next/server';
import { imageGenerationService } from '@/lib/services/media/image-generation.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, prompt, aspectRatio, provider, quality } = body;

    if (!campaignId || !prompt) {
      return NextResponse.json({ error: 'campaignId and prompt are required' }, { status: 400 });
    }

    const result = await imageGenerationService.generateAndSaveImage({
      campaignId,
      prompt,
      aspectRatio: aspectRatio || '4:5',
      provider: provider || 'openai',
      quality: quality || 'standard',
    });

    if (result.status === 'CREATIVE_BLOCKED') {
      return NextResponse.json(result, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
