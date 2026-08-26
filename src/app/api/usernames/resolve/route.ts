import { NextResponse } from 'next/server';
import { resolveUsername, getUserProfile } from '../../../../lib/firebase/firestore-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json({ error: 'Username is required.' }, { status: 400 });
    }

    const resolved = await resolveUsername(username);
    if (!resolved) {
      return NextResponse.json({ error: 'Username not found.' }, { status: 444 });
    }

    const userProfile = await getUserProfile(resolved.userId);
    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      userId: userProfile.uid,
      email: userProfile.email,
      username: userProfile.username,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
