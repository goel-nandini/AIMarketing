import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyServerAuth } from '@/lib/auth/server-auth';
import { ensureSeedData } from '@/lib/seed';
import { encryptToken, maskToken } from '@/lib/social/crypto-service';
import { checkMetaTokenHealth } from '@/lib/social/meta-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/social/accounts?clientId=xxx
 * Returns connected social accounts for the specified client.
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
      return NextResponse.json({ error: 'clientId query parameter is required' }, { status: 400 });
    }

    const accounts = await prisma.socialAccount.findMany({
      where: { clientId },
      orderBy: { createdAt: 'asc' },
    });

    // Strip encryptedToken before returning to frontend
    const sanitized = accounts.map((acc) => ({
      id: acc.id,
      clientId: acc.clientId,
      platform: acc.platform,
      accountType: acc.accountType,
      accountId: acc.accountId,
      username: acc.username,
      pageName: acc.pageName,
      profilePictureUrl: acc.profilePictureUrl,
      isConnected: acc.isConnected,
      connectionHealth: acc.connectionHealth,
      healthMessage: acc.healthMessage,
      connectedById: acc.connectedById,
      connectedByName: acc.connectedByName,
      lastSyncAt: acc.lastSyncAt.toISOString(),
      createdAt: acc.createdAt.toISOString(),
      updatedAt: acc.updatedAt.toISOString(),
      tokenPreview: acc.encryptedToken ? maskToken(acc.encryptedToken) : null,
    }));

    return NextResponse.json({ success: true, accounts: sanitized });
  } catch (error: any) {
    console.error('[API Social Accounts GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch social accounts' }, { status: 500 });
  }
}

/**
 * POST /api/social/accounts
 * Connects or updates a social account for a client.
 * Allowed roles: ADMIN, MANAGER
 */
export async function POST(req: Request) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    if (auth.user.role === 'VIEWER') {
      return NextResponse.json({ error: 'Forbidden: Viewers cannot connect social accounts.' }, { status: 403 });
    }

    await ensureSeedData();
    const body = await req.json();

    const { clientId, platform, accountId, username, pageName, profilePictureUrl, accessToken, accountType } = body;

    if (!clientId || !platform || !username) {
      return NextResponse.json(
        { error: 'clientId, platform (INSTAGRAM/FACEBOOK), and username are required.' },
        { status: 400 }
      );
    }

    // Verify client exists
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json({ error: `Client with ID "${clientId}" not found.` }, { status: 404 });
    }

    const encrypted = accessToken ? encryptToken(accessToken) : encryptToken(`demo_token_${Date.now()}`);

    const effectiveAccountId = accountId || `${platform.toLowerCase()}_${username.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}`;

    // Test token health
    const healthCheck = await checkMetaTokenHealth(encrypted, effectiveAccountId);

    const saved = await prisma.socialAccount.upsert({
      where: {
        clientId_platform_accountId: {
          clientId,
          platform: platform.toUpperCase(),
          accountId: effectiveAccountId,
        },
      },
      update: {
        username,
        pageName: pageName || username,
        profilePictureUrl: profilePictureUrl || client.logoUrl,
        accountType: accountType || (platform === 'INSTAGRAM' ? 'PROFESSIONAL' : 'PAGE'),
        encryptedToken: encrypted,
        isConnected: true,
        connectionHealth: healthCheck.status,
        healthMessage: healthCheck.message,
        connectedById: auth.user.uid,
        connectedByName: auth.user.name,
        lastSyncAt: new Date(),
      },
      create: {
        clientId,
        platform: platform.toUpperCase(),
        accountType: accountType || (platform === 'INSTAGRAM' ? 'PROFESSIONAL' : 'PAGE'),
        accountId: effectiveAccountId,
        username,
        pageName: pageName || username,
        profilePictureUrl: profilePictureUrl || client.logoUrl,
        encryptedToken: encrypted,
        isConnected: true,
        connectionHealth: healthCheck.status,
        healthMessage: healthCheck.message,
        connectedById: auth.user.uid,
        connectedByName: auth.user.name,
        lastSyncAt: new Date(),
      },
    });

    // Log to activity log
    await prisma.socialActivityLog.create({
      data: {
        clientId,
        action: `${auth.user.name} connected ${platform} account ${username}`,
        userId: auth.user.uid,
        userName: auth.user.name,
        details: `Platform: ${platform}, Health: ${healthCheck.status}`,
        platform: platform.toUpperCase(),
      },
    });

    return NextResponse.json({
      success: true,
      account: {
        id: saved.id,
        clientId: saved.clientId,
        platform: saved.platform,
        accountType: saved.accountType,
        accountId: saved.accountId,
        username: saved.username,
        pageName: saved.pageName,
        isConnected: saved.isConnected,
        connectionHealth: saved.connectionHealth,
        healthMessage: saved.healthMessage,
        connectedByName: saved.connectedByName,
        lastSyncAt: saved.lastSyncAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[API Social Accounts POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to connect social account' }, { status: 500 });
  }
}

/**
 * DELETE /api/social/accounts?id=xxx&clientId=yyy
 * Disconnects a social account.
 */
export async function DELETE(req: Request) {
  try {
    const auth = await verifyServerAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.statusCode || 401 });
    }

    if (auth.user.role !== 'ADMIN' && auth.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Forbidden: Only Admins and Managers can disconnect accounts.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const clientId = searchParams.get('clientId');

    if (!id) {
      return NextResponse.json({ error: 'Social account ID is required.' }, { status: 400 });
    }

    const account = await prisma.socialAccount.findUnique({ where: { id } });
    if (!account) {
      return NextResponse.json({ error: 'Social account not found.' }, { status: 404 });
    }

    if (clientId && account.clientId !== clientId) {
      return NextResponse.json({ error: 'Account does not belong to specified client.' }, { status: 403 });
    }

    await prisma.socialAccount.delete({ where: { id } });

    await prisma.socialActivityLog.create({
      data: {
        clientId: account.clientId,
        action: `${auth.user.name} disconnected ${account.platform} account ${account.username}`,
        userId: auth.user.uid,
        userName: auth.user.name,
        platform: account.platform,
      },
    });

    return NextResponse.json({ success: true, message: 'Social account disconnected successfully.' });
  } catch (error: any) {
    console.error('[API Social Accounts DELETE Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to disconnect account' }, { status: 500 });
  }
}
