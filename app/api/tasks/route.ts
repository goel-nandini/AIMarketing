import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyServerAuth } from '@/lib/auth/server-auth';
import { TaskPriority, TaskStatus } from '@/lib/types';
import { ensureSeedData } from '@/lib/seed';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    await ensureSeedData();

    const authResult = await verifyServerAuth(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.statusCode || 401 });
    }

    const { searchParams } = new URL(req.url);
    const filterUser = searchParams.get('userId');
    const filterEmail = searchParams.get('email');
    const filterStatus = searchParams.get('status');
    const all = searchParams.get('all') === 'true';

    const currentUser = authResult.user;
    const isSuper = currentUser.role === 'ADMIN';

    const whereClause: any = {};

    // If viewing personal tasks or non-super admin
    if (!isSuper || (!all && (filterUser || filterEmail))) {
      const targetUserId = filterUser || currentUser.uid;
      const targetUserEmail = (filterEmail || currentUser.email || '').toLowerCase().trim();
      const targetUserName = currentUser.name || '';

      const orConditions: any[] = [
        { assignedToId: targetUserId },
        { assignedToEmail: targetUserEmail },
      ];

      if (targetUserEmail.includes('harshit') || targetUserName.toLowerCase().includes('harshit')) {
        orConditions.push(
          { assignedToEmail: 'harshitsingh19622@gmail.com' },
          { assignedToEmail: 'harshit@codekap.com' },
          { assignedToName: { contains: 'Harshit' } }
        );
      }

      whereClause.OR = orConditions;
    }

    if (filterStatus) {
      whereClause.status = filterStatus;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error('[Tasks GET Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await verifyServerAuth(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.statusCode || 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      priority = 'MEDIUM',
      assignedToId,
      assignedToName,
      assignedToEmail,
      clientId,
      clientName,
      campaignId,
      campaignName,
      dueDate,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Task title is required.' }, { status: 400 });
    }

    if (!assignedToEmail || !assignedToEmail.trim()) {
      return NextResponse.json({ error: 'Assignee email is required.' }, { status: 400 });
    }

    let assignedById = authResult?.user?.uid || req.headers.get('X-User-Id') || 'usr_aman';
    let assignedByName = authResult?.user?.name || req.headers.get('X-User-Name') || 'Super Admin';

    const newTask = await prisma.task.create({
      data: {
        title: title.trim(),
        description: (description || '').trim(),
        priority: (priority as TaskPriority) || 'MEDIUM',
        status: 'TODO',
        assignedToId: assignedToId || assignedToEmail.toLowerCase().trim(),
        assignedToName: assignedToName || assignedToEmail.split('@')[0],
        assignedToEmail: assignedToEmail.toLowerCase().trim(),
        assignedById,
        assignedByName,
        clientId: clientId || null,
        clientName: clientName || null,
        campaignId: campaignId || null,
        campaignName: campaignName || null,
        dueDate: dueDate || null,
      },
    });

    // Record audit log safely
    try {
      await prisma.auditLog.create({
        data: {
          userId: assignedById,
          userName: assignedByName,
          action: `Assigned Task to ${newTask.assignedToName}: ${newTask.title}`,
          status: 'SUCCESS',
          details: `Priority: ${newTask.priority}, Due: ${newTask.dueDate || 'No deadline'}, Client: ${newTask.clientName || 'General'}`,
        },
      });
    } catch (auditErr) {
      console.warn('[Task Audit Log notice]:', auditErr);
    }

    // Send email notification safely
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const { sendInvitationEmail } = await import('@/lib/email/service');
        const isGmail = (process.env.SMTP_HOST || '').includes('gmail') || (process.env.SMTP_USER || '').includes('gmail');
        const transporter = nodemailer.createTransport(
          isGmail
            ? { service: 'gmail', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } }
            : {
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true',
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
              }
        );

        const appUrl = req.headers.get('origin') || 'https://kairo-ai-agent.vercel.app';

        transporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.SMTP_USER,
          to: newTask.assignedToEmail,
          subject: `🎯 New Task Assigned: ${newTask.title} [Priority: ${newTask.priority}]`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff;">
              <h2 style="color: #2563eb; margin-top: 0;">New Task Assigned by ${newTask.assignedByName}</h2>
              <div style="background: #f8fafc; padding: 16px; border-radius: 10px; margin: 16px 0; border: 1px solid #e2e8f0;">
                <h3 style="margin-top: 0; color: #0f172a;">${newTask.title}</h3>
                <p style="color: #475569; font-size: 14px; line-height: 1.5;">${newTask.description || 'No additional instructions provided.'}</p>
                <div style="margin-top: 12px; font-size: 13px; color: #334155;">
                  <p style="margin: 4px 0;"><strong>Priority:</strong> <span style="background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${newTask.priority}</span></p>
                  ${newTask.dueDate ? `<p style="margin: 4px 0;"><strong>Due Date:</strong> ${newTask.dueDate}</p>` : ''}
                  ${newTask.clientName ? `<p style="margin: 4px 0;"><strong>Client / Business:</strong> ${newTask.clientName}</p>` : ''}
                </div>
              </div>
              <div style="text-align: center; margin-top: 24px;">
                <a href="${appUrl}/dashboard" style="background: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                  View Task on Dashboard
                </a>
              </div>
            </div>
          `,
        }).catch((e) => console.warn('[Background Task Email Warning]:', e?.message));
      } catch (emailErr) {
        console.warn('[Task Email Notification Error]:', emailErr);
      }
    }

    return NextResponse.json({ success: true, task: newTask });
  } catch (error: any) {
    console.error('[Tasks POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to create task.' }, { status: 500 });
  }
}

