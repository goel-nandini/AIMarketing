import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    await ensureSeedData();
    const departments = await prisma.department.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(departments);
  } catch (error: any) {
    console.error('[Departments GET Error]:', error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    await ensureSeedData();
    const body = await req.json();
    const { name, headName, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Department name is required.' }, { status: 400 });
    }

    const dept = await prisma.department.create({
      data: {
        name: name.trim(),
        headName: headName?.trim() || null,
        description: description?.trim() || null,
      },
    });

    return NextResponse.json(dept);
  } catch (error: any) {
    console.error('[Departments POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
