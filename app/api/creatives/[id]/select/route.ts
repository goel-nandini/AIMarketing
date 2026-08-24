import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: creativeId } = await params;
    const body = await req.json();
    const { status, userName } = body;

    await prisma.auditLog.create({
      data: {
        action: `Updated Creative Selection Status to ${status}`,
        agentName: 'Quality Agent',
        apiOperation: `POST /api/creatives/${creativeId}/select`,
        status: 'SUCCESS',
        details: `Creative ID: ${creativeId}, Updated by: ${userName || 'Aman Sir'}, Status: ${status}`,
      },
    });

    return NextResponse.json({
      id: creativeId,
      status: status || 'FINAL',
      updatedBy: userName || 'Aman Sir',
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
