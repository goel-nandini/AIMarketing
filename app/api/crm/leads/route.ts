import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    await ensureSeedData();
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(leads);
  } catch (error: any) {
    console.error('[Leads GET Error]:', error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    await ensureSeedData();
    const body = await req.json();
    const {
      contactName,
      company,
      phone,
      email,
      service,
      source = 'Website',
      status = 'NEW',
      estimatedValue = 0,
      requirementNotes,
      assignedToName,
      nextFollowUpDate,
    } = body;

    if (!contactName || !phone || !email) {
      return NextResponse.json({ error: 'Contact name, email, and phone are required.' }, { status: 400 });
    }

    const count = await prisma.lead.count();
    const leadCode = `CK-LEAD-${100 + count + 1}`;

    const newLead = await prisma.lead.create({
      data: {
        leadCode,
        contactName: contactName.trim(),
        company: company?.trim() || contactName.trim(),
        phone: phone.trim(),
        email: email.toLowerCase().trim(),
        service: service || 'Web Development & Marketing',
        source,
        status,
        estimatedValue: Number(estimatedValue) || 0,
        requirementNotes: requirementNotes?.trim() || null,
        assignedToName: assignedToName || 'Aman Sir',
        nextFollowUpDate: nextFollowUpDate || null,
      },
    });

    return NextResponse.json(newLead);
  } catch (error: any) {
    console.error('[Leads POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
