import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    await ensureSeedData();
    const sops = await prisma.sOP.findMany({
      orderBy: { code: 'asc' },
    });

    if (sops.length === 0) {
      return NextResponse.json([
        {
          id: 'sop_01',
          code: 'SOP-DEV-01',
          title: 'Fullstack Web Application Development SOP',
          department: 'Development',
          service: 'Custom Web Application',
          purpose: 'Standardize end-to-end web engineering from requirement SRS to deployment.',
          instructions: 'Follow standard Next.js + Tailwind + PostgreSQL architecture. Validate responsive layouts, write API tests, and secure role authorizations.',
          checklistJson: JSON.stringify([
            '1. Requirement Gathering & SRS Review',
            '2. UI/UX Wireframing & Design Signoff',
            '3. Database Schema & Prisma Migration',
            '4. API Endpoints & Server-Side Security Guard',
            '5. Frontend Component Assembly & Responsive Layout QA',
            '6. Client Demo & Feedback Iteration',
            '7. Production Deployment & Monitoring Setup'
          ]),
          requiredProof: 'Live deployment URL + GitHub PR Link + QA Checklist Signoff',
          expectedDurationHours: 40,
          responsibleRole: 'EMPLOYEE',
          version: '1.0',
          active: true,
        },
        {
          id: 'sop_02',
          code: 'SOP-MKT-01',
          title: 'Performance Digital Marketing & Google/Meta Ads SOP',
          department: 'Digital Marketing',
          service: 'Performance Marketing',
          purpose: 'Drive predictable lead generation and brand awareness with measurable ROAS.',
          instructions: 'Create conversion-focused visual creatives, setup UTM campaign tracking, configure conversion pixels, and monitor daily spend vs CPA.',
          checklistJson: JSON.stringify([
            '1. Audience Research & Competitor Benchmark',
            '2. Creative Visual Direction & Copywriting',
            '3. Conversion Pixel & Conversion Tracking Setup',
            '4. Campaign Setup in Ads Manager with Daily Budget',
            '5. A/B Testing Headings and Creatives',
            '6. Weekly Performance Optimization & CPA Audit',
            '7. Monthly Client Performance Report'
          ]),
          requiredProof: 'Ads Manager Screenshot + Lead Export Sheet + Monthly ROI Dashboard',
          expectedDurationHours: 20,
          responsibleRole: 'EMPLOYEE',
          version: '1.0',
          active: true,
        },
      ]);
    }

    return NextResponse.json(sops);
  } catch (error: any) {
    console.error('[SOP GET Error]:', error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    await ensureSeedData();
    const body = await req.json();
    const {
      title,
      department = 'Development',
      service,
      purpose,
      instructions,
      checklistJson = '[]',
      requiredProof,
      expectedDurationHours = 10,
      responsibleRole = 'EMPLOYEE',
    } = body;

    if (!title || !purpose || !instructions) {
      return NextResponse.json({ error: 'Title, purpose, and instructions are required.' }, { status: 400 });
    }

    const count = await prisma.sOP.count();
    const code = `SOP-${department.substring(0, 3).toUpperCase()}-${String(count + 1).padStart(2, '0')}`;

    const newSop = await prisma.sOP.create({
      data: {
        code,
        title: title.trim(),
        department,
        service: service?.trim() || title.trim(),
        purpose: purpose.trim(),
        instructions: instructions.trim(),
        checklistJson: typeof checklistJson === 'string' ? checklistJson : JSON.stringify(checklistJson),
        requiredProof: requiredProof?.trim() || null,
        expectedDurationHours: Number(expectedDurationHours) || 0,
        responsibleRole,
        version: '1.0',
        active: true,
      },
    });

    return NextResponse.json(newSop);
  } catch (error: any) {
    console.error('[SOP POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
