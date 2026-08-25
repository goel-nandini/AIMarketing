import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    await ensureSeedData();
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (employees.length === 0) {
      return NextResponse.json([
        {
          id: 'emp_01',
          employeeId: 'CK-EMP-001',
          name: 'Aman Sir',
          email: 'aman@codekap.com',
          phone: '+91 98765 43210',
          department: 'Administration & Management',
          designation: 'Founder & CEO',
          role: 'SUPER_ADMIN',
          joiningDate: '2025-01-01',
          status: 'ACTIVE',
          workloadScore: 40,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        },
        {
          id: 'emp_02',
          employeeId: 'CK-EMP-002',
          name: 'Harshit Singh',
          email: 'harshitsingh19622@gmail.com',
          phone: '+91 91234 56789',
          department: 'Development',
          designation: 'Lead Architect / Senior Engineer',
          role: 'DEPT_HEAD',
          managerName: 'Aman Sir',
          joiningDate: '2025-06-15',
          status: 'ACTIVE',
          workloadScore: 85,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=harshit',
        },
        {
          id: 'emp_03',
          employeeId: 'CK-EMP-003',
          name: 'Pooja Sharma',
          email: 'pooja.sharma@codekap.com',
          phone: '+91 98111 22334',
          department: 'Digital Marketing',
          designation: 'Performance Marketing Strategist',
          role: 'EMPLOYEE',
          managerName: 'Aman Sir',
          joiningDate: '2025-08-01',
          status: 'ACTIVE',
          workloadScore: 60,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pooja',
        },
      ]);
    }

    return NextResponse.json(employees);
  } catch (error: any) {
    console.error('[Employees GET Error]:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureSeedData();
    const body = await req.json();
    const { name, email, phone, department, designation, role = 'EMPLOYEE', managerName } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    const employeeCount = await prisma.employee.count();
    const employeeId = `CK-EMP-${String(employeeCount + 1).padStart(3, '0')}`;

    const newEmp = await prisma.employee.create({
      data: {
        employeeId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        department: department || 'Development',
        designation: designation?.trim() || 'Software Engineer',
        role,
        managerName: managerName || 'Aman Sir',
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        workloadScore: 20,
      },
    });

    return NextResponse.json(newEmp);
  } catch (error: any) {
    console.error('[Employees POST Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
