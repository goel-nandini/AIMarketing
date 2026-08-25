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

    if (projects.length === 0) {
      return NextResponse.json([
        {
          id: 'proj_01',
          projectCode: 'CK-PRJ-2001',
          name: 'Jeevansphere Eye Care Platform & Portal',
          clientName: 'Jeevansphere',
          service: 'Custom Next.js Web App',
          department: 'Development',
          managerName: 'Harshit Singh',
          startDate: '2026-08-01',
          deadline: '2026-09-15',
          progress: 65,
          health: 'ON_TRACK',
          status: 'ACTIVE',
          description: 'Purpose-driven medical consultation portal with patient booking, doctor dashboard and automated SMS alerts.',
          billingTotal: 350000,
          billingPaid: 200000,
          gitRepoUrl: 'https://github.com/harshito0/AIMarketing',
          liveUrl: 'http://jeevansphere.com/',
          milestones: [
            { id: 'm1', title: 'Phase 1: SRS & Database Schema', status: 'COMPLETED' },
            { id: 'm2', title: 'Phase 2: Next.js Frontend & API Hub', status: 'IN_PROGRESS' },
            { id: 'm3', title: 'Phase 3: Production Deployment & QA', status: 'PENDING' },
          ],
        },
        {
          id: 'proj_02',
          projectCode: 'CK-PRJ-2002',
          name: 'Jeevansphere Performance Marketing & Meta Reels',
          clientName: 'Jeevansphere',
          service: 'Digital Marketing & Ads',
          department: 'Digital Marketing',
          managerName: 'Pooja Sharma',
          startDate: '2026-08-10',
          deadline: '2026-09-30',
          progress: 45,
          health: 'ON_TRACK',
          status: 'ACTIVE',
          description: 'High-converting consultation booking campaign targeting Delhi NCR across Google Search and Instagram Reels.',
          billingTotal: 120000,
          billingPaid: 80000,
          milestones: [
            { id: 'm4', title: 'Creative Storyboard & Visual Assets', status: 'COMPLETED' },
            { id: 'm5', title: 'Campaign Setup & Pixel Tracking', status: 'IN_PROGRESS' },
            { id: 'm6', title: 'Weekly Optimization & ROAS Scaling', status: 'PENDING' },
          ],
        },
      ]);
    }

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
