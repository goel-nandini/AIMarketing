import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    await ensureSeedData();

    // Query actual dynamic counts and totals
    const [
      activeProjectsCount,
      openLeadsCount,
      wonDealsCount,
      pendingTasksCount,
      teamSizeCount,
      invoices,
      expenses,
      recentProjects,
      recentTasks,
      recentLogs,
    ] = await Promise.all([
      prisma.project.count({ where: { status: 'ACTIVE' } }),
      prisma.lead.count({ where: { status: { notIn: ['WON', 'LOST'] } } }),
      prisma.lead.count({ where: { status: 'WON' } }),
      prisma.task.count({ where: { status: { notIn: ['DONE', 'CANCELLED'] } } }),
      prisma.user.count(),
      prisma.invoice.findMany(),
      prisma.expense.findMany(),
      prisma.project.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
      prisma.task.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
      prisma.auditLog.findMany({ take: 6, orderBy: { timestamp: 'desc' } }),
    ]);

    const revenue = invoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
    const collections = invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
    const outstanding = invoices.reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);
    const totalExpenses = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
    const operatingSurplus = collections - totalExpenses;

    return NextResponse.json({
      revenue,
      collections,
      outstanding,
      expenses: totalExpenses,
      operatingSurplus,
      activeProjects: activeProjectsCount,
      openLeads: openLeadsCount,
      wonDeals: wonDealsCount,
      pendingTasks: pendingTasksCount,
      teamSize: teamSizeCount,
      recentProjects,
      recentTasks,
      recentLogs,
    });
  } catch (error: any) {
    console.error('[Dashboard Overview Error]:', error);
    return NextResponse.json({
      revenue: 0,
      collections: 0,
      outstanding: 0,
      expenses: 0,
      operatingSurplus: 0,
      activeProjects: 0,
      openLeads: 0,
      wonDeals: 0,
      pendingTasks: 0,
      teamSize: 1,
      recentProjects: [],
      recentTasks: [],
      recentLogs: [],
    });
  }
}
