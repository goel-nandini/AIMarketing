import { NextResponse } from 'next/server';
import { isUsernameAvailable, validateUsernameFormat } from '../../../../lib/firebase/firestore-service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username parameter is required.' }, { status: 400 });
    }

    const validation = validateUsernameFormat(username);
    if (!validation.valid) {
      return NextResponse.json({ available: false, error: validation.error }, { status: 400 });
    }

    const available = await isUsernameAvailable(username);
    return NextResponse.json({ available });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
