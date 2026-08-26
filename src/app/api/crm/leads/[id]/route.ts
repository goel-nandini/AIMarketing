import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await ensureSeedData();
    const { id } = await context.params;
    const body = await req.json();

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.estimatedValue !== undefined ? { estimatedValue: Number(body.estimatedValue) } : {}),
        ...(body.nextFollowUpDate !== undefined ? { nextFollowUpDate: body.nextFollowUpDate } : {}),
        ...(body.requirementNotes !== undefined ? { requirementNotes: body.requirementNotes } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[Lead PATCH Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
