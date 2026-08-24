import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(clients);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const newClient = await prisma.client.create({
      data: {
        name: data.name,
        businessName: data.businessName || data.name,
        website: data.website,
        industry: data.industry,
        country: data.country || 'Canada',
        province: data.province || 'Ontario',
        city: data.city || 'Toronto',
        contactName: data.contactName || '',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        description: data.description || '',
        brandTone: data.brandTone || 'Professional, Modern',
        logoUrl: data.logoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(data.name || 'business')}`,
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        action: `Added new client/business: ${newClient.name}`,
        status: 'SUCCESS',
        details: `Industry: ${newClient.industry}, Location: ${newClient.city}, ${newClient.country}, Phone: ${newClient.contactPhone || 'N/A'}`,
      },
    });

    return NextResponse.json(newClient);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Client removed successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
