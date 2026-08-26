import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyServerAuth } from '@/lib/auth/server-auth';
import { generateSocialCaption } from '@/lib/social/social-ai-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/social/posts/generate-caption
 */
export async function POST(req: Request) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    if (auth.user.role === 'VIEWER') {
      return NextResponse.json({ error: 'Forbidden: Viewers have read-only access.' }, { status: 403 });
    }

    const body = await req.json();
    const { clientId, mediaDescription, mediaType, userObjective, location, action, currentCaption } = body;

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required.' }, { status: 400 });
    }

    // Fetch full client details from database
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        socialConfig: true,
      },
    });

    if (!client) {
      return NextResponse.json({ error: `Client with ID "${clientId}" not found.` }, { status: 404 });
    }

    const effectiveLocation = location || client.socialConfig?.defaultLocation || `${client.city}, ${client.province}`;

    const aiResult = await generateSocialCaption({
      client: {
        id: client.id,
        name: client.name,
        businessName: client.businessName,
        industry: client.industry,
        description: client.description,
        brandTone: client.socialConfig?.brandTone || client.brandTone,
        city: client.city,
        province: client.province,
        country: client.country,
      },
      mediaDescription,
      mediaType,
      userObjective,
      location: effectiveLocation,
      action: action || 'generate',
      currentCaption,
    });

    return NextResponse.json({
      success: true,
      data: aiResult,
    });
  } catch (error: any) {
    console.error('[API Social Generate Caption Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate AI caption' }, { status: 500 });
  }
}
