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

    if (expenses.length === 0) {
      return NextResponse.json([
        {
          id: 'exp_01',
          date: '2026-08-01',
          category: 'HOSTING',
          vendor: 'Vercel Pro & AWS Cloud',
          amount: 14500,
          gstAmount: 2610,
          paymentMethod: 'Corporate Credit Card',
          description: 'Monthly production hosting, serverless edge compute & database backups.',
          department: 'Development',
        },
        {
          id: 'exp_02',
          date: '2026-08-05',
          category: 'SOFTWARE',
          vendor: 'OpenAI & Google AI API Credits',
          amount: 28000,
          gstAmount: 5040,
          paymentMethod: 'Corporate Credit Card',
          description: 'API tokens for creative studio banner generations and proposal intelligence.',
          department: 'Digital Marketing',
        },
        {
          id: 'exp_03',
          date: '2026-08-15',
          category: 'OFFICE',
          vendor: 'WeWork Office Space & Internet',
          amount: 65000,
          gstAmount: 11700,
          paymentMethod: 'Bank Transfer (NEFT)',
          description: 'Office rent, high-speed leased line fiber internet & utilities for August.',
          department: 'Administration',
        },
      ]);
    }

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
