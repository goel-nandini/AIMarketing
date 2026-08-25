import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    await ensureSeedData();
    const projects = await prisma.project.findMany({
      include: { milestones: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('[Projects GET Error]:', error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    await ensureSeedData();
    const body = await req.json();
    const { name, clientName, service, department = 'Development', managerName, startDate, deadline, description, billingTotal = 0 } = body;

    if (!name || !clientName) {
      return NextResponse.json({ error: 'Project name and client are required.' }, { status: 400 });
    }

    // Find or create client
    let client = await prisma.client.findFirst({ where: { name: clientName } });
    if (!client) {
      client = await prisma.client.create({
        data: {
          name: clientName.trim(),
          businessName: clientName.trim(),
          website: 'https://codekap.com',
          industry: 'Technology',
          country: 'India',
          province: 'Delhi',
          city: 'New Delhi',
          contactName: clientName.trim(),
          contactEmail: 'client@codekap.com',
          description: description || 'Client created from project wizard',
          brandTone: 'Professional',
          logoUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(clientName)}`,
        },
      });
    }

    const count = await prisma.project.count();
    const projectCode = `CK-PRJ-${2000 + count + 1}`;

    const newProject = await prisma.project.create({
      data: {
        projectCode,
        name: name.trim(),
        clientId: client.id,
        clientName: client.name,
        service: service || 'Custom Development',
        department,
        managerName: managerName || 'Aman Sir',
        startDate: startDate || new Date().toISOString().split('T')[0],
        deadline: deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        progress: 10,
        health: 'ON_TRACK',
        status: 'ACTIVE',
        description: description?.trim() || '',
        billingTotal: Number(billingTotal) || 0,
        billingPaid: 0,
      },
    });

    return NextResponse.json(newProject);
  } catch (error: any) {
    console.error('[Projects POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
