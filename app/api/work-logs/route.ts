import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    await ensureSeedData();
    const logs = await prisma.workLog.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error('[WorkLogs GET Error]:', error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    await ensureSeedData();
    const body = await req.json();
    const {
      employeeName,
      employeeEmail,
      projectName,
      taskTitle,
      workCompleted,
      timeSpentHours = 1,
      proofUrl,
      blocker,
      tomorrowPlan,
    } = body;

    if (!employeeName || !workCompleted) {
      return NextResponse.json({ error: 'Employee name and work completed are required.' }, { status: 400 });
    }

    const newLog = await prisma.workLog.create({
      data: {
        employeeId: `usr_${Date.now()}`,
        employeeName: employeeName.trim(),
        employeeEmail: employeeEmail || 'team@codekap.com',
        projectName: projectName || 'General Operations',
        taskTitle: taskTitle || 'Assigned Tasks',
        date: new Date().toISOString().split('T')[0],
        workCompleted: workCompleted.trim(),
        timeSpentHours: Number(timeSpentHours) || 0,
        proofUrl: proofUrl?.trim() || null,
        blocker: blocker?.trim() || null,
        tomorrowPlan: tomorrowPlan?.trim() || null,
      },
    });

    return NextResponse.json(newLog);
  } catch (error: any) {
    console.error('[WorkLogs POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
