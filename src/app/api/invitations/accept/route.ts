import { NextResponse } from 'next/server';
import { adminAuth } from '../../../../lib/firebase/admin';
import {
  getInvitationByTokenHash,
  hashInvitationToken,
  updateInvitationStatus,
  isUsernameAvailable,
  claimUsername,
  saveUserProfile,
  recordAuditLog,
  validateUsernameFormat,
} from '../../../../lib/firebase/firestore-service';
import { UserProfile } from '../../../../lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, name, username, password } = body;

    if (!token || !name || !username || !password) {
      return NextResponse.json({ error: 'Missing required fields (token, name, username, password).' }, { status: 400 });
    }

    // 1. Validate Username Format
    const uValidation = validateUsernameFormat(username);
    if (!uValidation.valid) {
      return NextResponse.json({ error: uValidation.error }, { status: 400 });
    }

    // 2. Validate Token & Invitation
    const tokenHash = hashInvitationToken(token);
    const invitation = await getInvitationByTokenHash(tokenHash);

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation is invalid or does not exist.' }, { status: 404 });
    }

    if (invitation.status === 'ACCEPTED') {
      return NextResponse.json({ error: 'This invitation has already been used.' }, { status: 400 });
    }

    if (invitation.status === 'REVOKED') {
      return NextResponse.json({ error: 'This invitation has been revoked by an administrator.' }, { status: 400 });
    }

    const now = new Date();
    if (new Date(invitation.expiresAt) < now || invitation.status === 'EXPIRED') {
      return NextResponse.json({ error: 'This invitation link has expired.' }, { status: 400 });
    }

    // 3. Check Username Availability
    const available = await isUsernameAvailable(username);
    if (!available) {
      return NextResponse.json({ error: `Username "${username}" is already taken.` }, { status: 400 });
    }

    const targetEmail = invitation.email.toLowerCase().trim();

    // 4. Create Firebase Auth user using Admin SDK
    let uid = '';
    if (adminAuth) {
      try {
        const userRecord = await adminAuth.createUser({
          email: targetEmail,
          password: password,
          displayName: name,
          emailVerified: false,
        });
        uid = userRecord.uid;
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-exists') {
          return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 400 });
        }
        return NextResponse.json({ error: authErr.message || 'Failed to create Firebase authentication account.' }, { status: 400 });
      }
    } else {
      // Dev mode fallback UID
      uid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    // 5. Build and Save User Profile in Firestore
    const userProfile: UserProfile = {
      uid,
      name,
      email: targetEmail,
      username: username.toLowerCase().trim(),
      role: invitation.role,
      status: 'ACTIVE',
      emailVerified: false,
      invitedBy: invitation.invitedBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
      title: `${invitation.role.replace('_', ' ')}`,
    };

    await saveUserProfile(userProfile);
    await claimUsername(uid, username);

    // 6. Update Invitation Status to ACCEPTED
    await updateInvitationStatus(invitation.id, 'ACCEPTED', new Date().toISOString());

    // 7. Record Audit Event
    await recordAuditLog({
      userId: uid,
      userName: name,
      action: 'INVITATION_ACCEPTED',
      status: 'SUCCESS',
      details: `Accepted invitation from ${invitation.invitedByName || 'Admin'} for role ${invitation.role}.`,
    });

    return NextResponse.json({
      success: true,
      uid,
      email: targetEmail,
      role: invitation.role,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
