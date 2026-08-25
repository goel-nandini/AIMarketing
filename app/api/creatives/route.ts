import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureSeedData } from '@/lib/seed';
import { generateCreativeBanner } from '@/lib/services/media/creative-banner-generator';

export async function GET(req: Request) {
  try {
    await ensureSeedData();
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');

    // 1. Fetch creatives stored in SQLite Creative table
    const storedCreatives = await prisma.creative.findMany({
      where: campaignId ? { campaignId } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    const results: any[] = storedCreatives.map((c) => ({
      id: c.id,
      campaignId: c.campaignId || 'cmp_global',
      type: c.type,
      provider: c.provider,
      model: c.model,
      prompt: c.prompt,
      aspectRatio: c.aspectRatio,
      downloadUrl: c.imageUrl,
      status: c.status,
      createdBy: 'AI',
      createdAt: c.createdAt.toISOString(),
    }));

    // 2. Also inspect proposals for any additional campaign creatives
    const proposals = await prisma.campaignProposal.findMany({
      where: campaignId ? { campaignId } : undefined,
      include: { campaign: true },
      orderBy: { createdAt: 'desc' },
    });

    for (const p of proposals) {
      if (p.creativesJson) {
        try {
          const parsed = JSON.parse(p.creativesJson);
          if (Array.isArray(parsed)) {
            for (let idx = 0; idx < parsed.length; idx++) {
              const c = parsed[idx];
              const creativeId = c.id || `crt_${p.campaignId}_${idx}`;
              if (!results.some((r) => r.id === creativeId)) {
                results.push({
                  id: creativeId,
                  campaignId: p.campaignId,
                  type: 'IMAGE',
                  provider: 'Gemini',
                  model: 'gemini-3.6-flash',
                  prompt: c.imagePrompt || c.title || 'Campaign Banner',
                  aspectRatio: idx === 0 ? '4:5' : '9:16',
                  downloadUrl: c.generatedImageUrl || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
                  status: 'FINAL',
                  createdBy: 'AI',
                  createdAt: p.createdAt.toISOString(),
                });
              }
            }
          }
        } catch {}
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error fetching creatives:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, aspectRatio = '1:1', campaignId, title, clientName } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required to generate creative' }, { status: 400 });
    }

    // 1. Generate live creative visual with Google Gemini
    const imageUrl = await generateCreativeBanner({
      prompt: prompt.trim(),
      aspectRatio,
      campaignTitle: title,
      clientName: clientName || 'Brand Specialist',
    });

    // 2. Persist directly into SQLite Creative database
    const newCreative = await prisma.creative.create({
      data: {
        campaignId: campaignId || null,
        title: title || prompt.slice(0, 45),
        type: 'IMAGE',
        provider: 'Gemini',
        model: 'gemini-3.6-flash',
        prompt: prompt.trim(),
        aspectRatio,
        imageUrl,
        status: 'FINAL',
      },
    });

    // 3. Log audit event
    await prisma.auditLog.create({
      data: {
        action: `Generated Visual Creative (${aspectRatio}) with Gemini`,
        campaignId: campaignId || null,
        agentName: 'Creative Agent',
        apiOperation: 'Google Gemini API: generateContent',
        status: 'SUCCESS',
        details: `Created new AI visual for prompt: "${prompt.slice(0, 60)}"`,
      },
    }).catch(() => null);

    return NextResponse.json({
      id: newCreative.id,
      campaignId: newCreative.campaignId || 'cmp_global',
      type: newCreative.type,
      provider: newCreative.provider,
      model: newCreative.model,
      prompt: newCreative.prompt,
      aspectRatio: newCreative.aspectRatio,
      downloadUrl: newCreative.imageUrl,
      status: newCreative.status,
      createdBy: 'AI',
      createdAt: newCreative.createdAt.toISOString(),
    });
  } catch (error: any) {
    console.error('Error creating creative:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
