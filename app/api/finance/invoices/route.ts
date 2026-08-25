import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    await ensureSeedData();
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invoices);
  } catch (error: any) {
    console.error('[Invoices GET Error]:', error);
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
      isInterState = false,
      notes,
      dueDate,
    } = body;

    if (!clientName) {
      return NextResponse.json({ error: 'Client name is required.' }, { status: 400 });
    }

    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-2026-${String(count + 1).padStart(3, '0')}`;

    const subtotal = items.reduce((acc: number, it: any) => acc + (Number(it.qty) * Number(it.rate)), 0) || 50000;
    
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterState) {
      igst = Math.round(subtotal * 0.18);
    } else {
      cgst = Math.round(subtotal * 0.09);
      sgst = Math.round(subtotal * 0.09);
    }

    const totalAmount = subtotal + cgst + sgst + igst;

    const inv = await prisma.invoice.create({
      data: {
        invoiceNumber,
        date: new Date().toISOString().split('T')[0],
        dueDate: dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        clientId: `cli_${Date.now()}`,
        clientName: clientName.trim(),
        clientGstin: clientGstin?.trim() || null,
        billingAddress: billingAddress?.trim() || null,
        itemsJson: JSON.stringify(items),
        subtotal,
        cgst,
        sgst,
        igst,
        totalAmount,
        amountPaid: 0,
        balanceDue: totalAmount,
        currency: 'INR',
        status: 'SENT',
        razorpayPaymentLinkId: `https://rzp.io/l/${invoiceNumber.toLowerCase().replace('-', '_')}`,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(inv);
  } catch (error: any) {
    console.error('[Invoices POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
