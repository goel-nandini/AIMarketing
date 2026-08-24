import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyServerAuth } from '@/lib/auth/server-auth';
import { TaskStatus } from '@/lib/types';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyServerAuth(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.statusCode || 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, title, description, priority, dueDate } = body;

    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status as TaskStatus;
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (priority) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    // Record audit log if status changed
    if (status && status !== existingTask.status) {
      await prisma.auditLog.create({
        data: {
          userId: authResult.user.uid,
          userName: authResult.user.name || 'Team Member',
          action: `Task Status Updated to [${status}]: ${updatedTask.title}`,
          status: 'SUCCESS',
          details: `Updated by ${authResult.user.name} (${authResult.user.email})`,
        },
      });
    }

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error: any) {
    console.error('[Task PATCH Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyServerAuth(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.statusCode || 401 });
    }

    const { id } = await params;

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Task deleted successfully.' });
  } catch (error: any) {
    console.error('[Task DELETE Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
