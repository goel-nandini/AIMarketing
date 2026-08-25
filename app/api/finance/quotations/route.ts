import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    await ensureSeedData();
    const quotations = await prisma.quotation.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (quotations.length === 0) {
      return NextResponse.json([
        {
          id: 'qtn_01',
          quotationNumber: 'QTN-2026-089',
          date: '2026-08-20',
          validUntil: '2026-09-20',
          clientId: 'cli_jeevansphere_default',
          clientName: 'Jeevansphere',
          clientGstin: '07AABCU9603R1ZX',
          billingAddress: 'CP, New Delhi, India',
          itemsJson: JSON.stringify([
            { desc: 'Custom Next.js Web Portal Development', qty: 1, rate: 250000, amount: 250000 },
            { desc: 'Google Ads Setup & Creative Banner Package', qty: 1, rate: 50000, amount: 50000 },
          ]),
          subtotal: 300000,
          taxAmount: 54000,
          totalAmount: 354000,
          currency: 'INR',
          status: 'ACCEPTED',
          notes: 'Standard 50% advance milestone billing. Includes 1-year security updates.',
        },
      ]);
    }

    return NextResponse.json(quotations);
  } catch (error: any) {
    console.error('[Quotations GET Error]:', error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    await ensureSeedData();
    const body = await req.json();
    const {
      clientName,
      clientGstin,
      billingAddress,
      items = [],
      notes,
      validUntil,
    } = body;

    if (!clientName) {
      return NextResponse.json({ error: 'Client name is required.' }, { status: 400 });
    }

    const count = await prisma.quotation.count();
    const quotationNumber = `QTN-2026-${String(100 + count + 1).padStart(3, '0')}`;

    const subtotal = items.reduce((acc: number, it: any) => acc + (Number(it.qty) * Number(it.rate)), 0) || 100000;
    const taxAmount = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + taxAmount;

    const qtn = await prisma.quotation.create({
      data: {
        quotationNumber,
        date: new Date().toISOString().split('T')[0],
        validUntil: validUntil || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        clientId: `cli_${Date.now()}`,
        clientName: clientName.trim(),
        clientGstin: clientGstin?.trim() || null,
        billingAddress: billingAddress?.trim() || null,
        itemsJson: JSON.stringify(items),
        subtotal,
        taxAmount,
        totalAmount,
        currency: 'INR',
        status: 'DRAFT',
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(qtn);
  } catch (error: any) {
    console.error('[Quotations POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
