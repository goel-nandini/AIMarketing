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
