import { NextResponse } from 'next/server';
import { verifyServerAuth } from '../../../lib/auth/server-auth';
import {
  getUserProfile,
  saveUserProfile,
  isUsernameAvailable,
  claimUsername,
  releaseUsername,
  validateUsernameFormat,
  recordAuditLog,
} from '../../../lib/firebase/firestore-service';

export async function GET(req: Request) {
  try {
    const authResult = await verifyServerAuth(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.statusCode || 401 });
    }

    return NextResponse.json(authResult.user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const authResult = await verifyServerAuth(req);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.statusCode || 401 });
    }

    const currentProfile = authResult.user;
    const body = await req.json();
    const { name, avatar, username, title } = body;

    const updatedProfile = { ...currentProfile };

    if (name && name.trim()) {
      updatedProfile.name = name.trim();
    }

    if (avatar && avatar.trim()) {
      updatedProfile.avatar = avatar.trim();
    }

    if (title && title.trim()) {
      updatedProfile.title = title.trim();
    }

    // Handle Username Update
    if (username && username.trim().toLowerCase() !== currentProfile.username.toLowerCase()) {
      const newUsername = username.trim().toLowerCase();
      const validation = validateUsernameFormat(newUsername);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const available = await isUsernameAvailable(newUsername);
      if (!available) {
        return NextResponse.json({ error: `Username "${newUsername}" is already taken.` }, { status: 400 });
      }

      // Release old username & claim new username
      if (currentProfile.username) {
        await releaseUsername(currentProfile.username);
      }

      await claimUsername(currentProfile.uid, newUsername);
      updatedProfile.username = newUsername;

      await recordAuditLog({
        userId: currentProfile.uid,
        userName: updatedProfile.name,
        action: 'USERNAME_CHANGED',
        status: 'SUCCESS',
        details: `Changed username from @${currentProfile.username} to @${newUsername}`,
      });
    }

    updatedProfile.updatedAt = new Date().toISOString();
    await saveUserProfile(updatedProfile);

    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
