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

    if (leads.length === 0) {
      return NextResponse.json([
        {
          id: 'lead_01',
          leadCode: 'CK-LEAD-101',
          contactName: 'Deepak Yadav',
          company: 'Jeevansphere',
          phone: '9690922001',
          email: 'jeevansphere@com.in',
          service: 'Custom Healthcare Platform & Ads',
          source: 'Direct Referral',
          status: 'WON',
          assignedToName: 'Aman Sir',
          estimatedValue: 450000,
          nextFollowUpDate: '2026-08-30',
          requirementNotes: 'Complete eye care clinical SaaS ecosystem with Next.js web application and Google/Meta performance ads.',
          createdAt: '2026-08-20T10:00:00.000Z',
        },
        {
          id: 'lead_02',
          leadCode: 'CK-LEAD-102',
          contactName: 'Rohit Verma',
          company: 'Aura Fitness & Wellness',
          phone: '9876543211',
          email: 'rohit@aurafit.in',
          service: 'Mobile App & Performance Marketing',
          source: 'Website Form',
          status: 'QUOTATION',
          assignedToName: 'Aman Sir',
          estimatedValue: 320000,
          nextFollowUpDate: '2026-08-28',
          requirementNotes: 'Subscription management and trainer scheduling application with Meta ad campaigns.',
          createdAt: '2026-08-22T14:30:00.000Z',
        },
        {
          id: 'lead_03',
          leadCode: 'CK-LEAD-103',
          contactName: 'Ananya Roy',
          company: 'Royale Jewels Studio',
          phone: '9123456780',
          email: 'ananya@royalejewels.com',
          service: 'E-Commerce Website & SEO',
          source: 'Instagram Ad',
          status: 'INTERESTED',
          assignedToName: 'Aman Sir',
          estimatedValue: 280000,
          nextFollowUpDate: '2026-08-26',
          requirementNotes: 'Luxury catalogue with Shopify/Next.js and automated WhatsApp order notifications.',
          createdAt: '2026-08-24T09:15:00.000Z',
        },
      ]);
    }

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
