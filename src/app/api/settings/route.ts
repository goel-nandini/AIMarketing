import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    let settings = await prisma.aISetting.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = await prisma.aISetting.create({
        data: {
          id: 'default',
          strategyProvider: 'OpenAI',
          researchProvider: 'Gemini',
          copyProvider: 'OpenAI',
          imageProvider: 'OpenAI',
          videoProvider: 'Gemini',
          validationProvider: 'Gemini',
          demoMode: true,
        },
      });
    }
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const updated = await prisma.aISetting.upsert({
      where: { id: 'default' },
      update: {
        strategyProvider: data.strategyProvider,
        researchProvider: data.researchProvider,
        copyProvider: data.copyProvider,
        imageProvider: data.imageProvider,
        videoProvider: data.videoProvider,
        validationProvider: data.validationProvider,
        demoMode: data.demoMode,
      },
      create: {
        id: 'default',
        strategyProvider: data.strategyProvider || 'OpenAI',
        researchProvider: data.researchProvider || 'Gemini',
        copyProvider: data.copyProvider || 'OpenAI',
        imageProvider: data.imageProvider || 'OpenAI',
        videoProvider: data.videoProvider || 'Gemini',
        validationProvider: data.validationProvider || 'Gemini',
        demoMode: data.demoMode ?? true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'Updated AI Model Router Settings',
        status: 'SUCCESS',
        details: `Strategy: ${updated.strategyProvider}, Research: ${updated.researchProvider}, Copy: ${updated.copyProvider}, DEMO_MODE: ${updated.demoMode}`,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
