import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    await ensureSeedData();
    const expenses = await prisma.expense.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(expenses);
  } catch (error: any) {
    console.error('[Expenses GET Error]:', error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    await ensureSeedData();
    const body = await req.json();
    const {
      vendor,
      category = 'SOFTWARE',
      amount = 0,
      gstAmount = 0,
      paymentMethod = 'Bank Transfer',
      description,
      department = 'Management',
    } = body;

    if (!vendor || !amount) {
      return NextResponse.json({ error: 'Vendor and amount are required.' }, { status: 400 });
    }

    const exp = await prisma.expense.create({
      data: {
        date: new Date().toISOString().split('T')[0],
        category,
        vendor: vendor.trim(),
        amount: Number(amount) || 0,
        gstAmount: Number(gstAmount) || 0,
        paymentMethod,
        description: description?.trim() || '',
        department,
      },
    });

    return NextResponse.json(exp);
  } catch (error: any) {
    console.error('[Expenses POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
