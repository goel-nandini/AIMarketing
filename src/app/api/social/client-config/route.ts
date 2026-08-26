import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyServerAuth } from '@/lib/auth/server-auth';
import { ensureSeedData } from '@/lib/seed';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/social/client-config?clientId=xxx
 */
export async function GET(req: Request) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    await ensureSeedData();

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { socialConfig: true },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    let defaultHashtags: string[] = [];
    if (client.socialConfig?.defaultHashtagsJson) {
      try {
        defaultHashtags = JSON.parse(client.socialConfig.defaultHashtagsJson);
      } catch {}
    }

    const config = {
      clientId: client.id,
      clientName: client.businessName || client.name,
      defaultLocation: client.socialConfig?.defaultLocation || `${client.businessName || client.name}, ${client.city}`,
      defaultTimezone: client.socialConfig?.defaultTimezone || 'Asia/Kolkata',
      brandTone: client.socialConfig?.brandTone || client.brandTone || 'Professional, Inspiring',
      defaultHashtags,
      autoHashtags: client.socialConfig?.autoHashtags ?? true,
    };

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    console.error('[API Social Client Config GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch client config' }, { status: 500 });
  }
}

/**
 * POST /api/social/client-config
 * Updates default location, timezone, brand tone at the CLIENT level.
 */
export async function POST(req: Request) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    if (auth.user.role === 'VIEWER') {
      return NextResponse.json({ error: 'Forbidden: Viewers cannot edit client settings.' }, { status: 403 });
    }

    await ensureSeedData();
    const body = await req.json();
    const { clientId, defaultLocation, defaultTimezone, brandTone, defaultHashtags, autoHashtags } = body;

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required.' }, { status: 400 });
    }

    const savedConfig = await prisma.socialClientConfig.upsert({
      where: { clientId },
      update: {
        ...(defaultLocation !== undefined && { defaultLocation }),
        ...(defaultTimezone !== undefined && { defaultTimezone }),
        ...(brandTone !== undefined && { brandTone }),
        ...(defaultHashtags !== undefined && { defaultHashtagsJson: JSON.stringify(defaultHashtags) }),
        ...(autoHashtags !== undefined && { autoHashtags }),
      },
      create: {
        clientId,
        defaultLocation: defaultLocation || 'Default Location',
        defaultTimezone: defaultTimezone || 'Asia/Kolkata',
        brandTone: brandTone || 'Professional, Inspiring',
        defaultHashtagsJson: JSON.stringify(defaultHashtags || []),
        autoHashtags: autoHashtags ?? true,
      },
    });

    return NextResponse.json({ success: true, config: savedConfig });
  } catch (error: any) {
    console.error('[API Social Client Config POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to update client config' }, { status: 500 });
  }
}
