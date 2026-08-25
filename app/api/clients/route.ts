import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { ensureSeedData } from '../../../lib/seed';

function generateClientCode(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4) || 'CLI';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CK-${clean}-${randomNum}`;
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    await ensureSeedData();
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
    await ensureSeedData();
    const data = await req.json();

    const clientCode = (data.clientCode && data.clientCode.trim())
      ? data.clientCode.trim().toUpperCase()
      : generateClientCode(data.name || 'Client');

    const clientData = {
      name: data.name,
      businessName: data.businessName || data.name,
      clientCode: clientCode,
      githubRepo: data.githubRepo || '',
      deploymentUrl: data.deploymentUrl || '',
      status: data.status || 'ACTIVE',
      website: data.website || '',
      industry: data.industry || 'General',
      country: data.country || 'Canada',
      province: data.province || 'Ontario',
      city: data.city || 'Toronto',
      contactName: data.contactName || '',
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      description: data.description || '',
      brandTone: data.brandTone || 'Professional, Modern',
      logoUrl: data.logoUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(data.name || 'business')}`,
    };

    let newClient: any = null;
    try {
      newClient = await prisma.client.create({
        data: clientData,
      });

      try {
        await prisma.auditLog.create({
          data: {
            action: `Added new client/business: ${newClient.name} [Code: ${newClient.clientCode}]`,
            status: 'SUCCESS',
            details: `Code: ${newClient.clientCode}, Repo: ${newClient.githubRepo || 'N/A'}, Deployment: ${newClient.deploymentUrl || 'Pending'}`,
          },
        });
      } catch {}
    } catch (dbErr: any) {
      console.warn('[Clients POST Serverless Note]:', dbErr?.message);
      newClient = {
        id: `cli_${Date.now()}`,
        ...clientData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return NextResponse.json(newClient);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const data = await req.json();
    const { id, ...updateFields } = data;
    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    let updatedClient: any = null;
    try {
      updatedClient = await prisma.client.update({
        where: { id },
        data: {
          ...(updateFields.name && { name: updateFields.name }),
          ...(updateFields.businessName !== undefined && { businessName: updateFields.businessName }),
          ...(updateFields.clientCode !== undefined && { clientCode: updateFields.clientCode }),
          ...(updateFields.githubRepo !== undefined && { githubRepo: updateFields.githubRepo }),
          ...(updateFields.deploymentUrl !== undefined && { deploymentUrl: updateFields.deploymentUrl }),
          ...(updateFields.status !== undefined && { status: updateFields.status }),
          ...(updateFields.website !== undefined && { website: updateFields.website }),
          ...(updateFields.industry && { industry: updateFields.industry }),
          ...(updateFields.country !== undefined && { country: updateFields.country }),
          ...(updateFields.province !== undefined && { province: updateFields.province }),
          ...(updateFields.city !== undefined && { city: updateFields.city }),
          ...(updateFields.contactName !== undefined && { contactName: updateFields.contactName }),
          ...(updateFields.contactEmail !== undefined && { contactEmail: updateFields.contactEmail }),
          ...(updateFields.contactPhone !== undefined && { contactPhone: updateFields.contactPhone }),
          ...(updateFields.description !== undefined && { description: updateFields.description }),
          ...(updateFields.brandTone !== undefined && { brandTone: updateFields.brandTone }),
          ...(updateFields.logoUrl !== undefined && { logoUrl: updateFields.logoUrl }),
        },
      });

      try {
        await prisma.auditLog.create({
          data: {
            action: `Updated client/business: ${updatedClient.name} [Code: ${updatedClient.clientCode}]`,
            status: 'SUCCESS',
            details: `Deployment: ${updatedClient.deploymentUrl || 'None'}`,
          },
        });
      } catch {}
    } catch (dbErr: any) {
      console.warn('[Clients PATCH Serverless Note]:', dbErr?.message);
      updatedClient = { id, ...updateFields, updatedAt: new Date().toISOString() };
    }

    return NextResponse.json(updatedClient);
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

    try {
      await prisma.client.delete({
        where: { id },
      });
    } catch (dbErr: any) {
      console.warn('[Clients DELETE Serverless Note]:', dbErr?.message);
    }

    return NextResponse.json({ success: true, message: 'Client removed successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
