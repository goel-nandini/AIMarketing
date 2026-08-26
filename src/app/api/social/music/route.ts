import { NextResponse } from 'next/server';
import { COMMERCIAL_MUSIC_LIBRARY } from '@/lib/social/music-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/social/music?search=xxx
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('search') || '').toLowerCase().trim();

    let tracks = COMMERCIAL_MUSIC_LIBRARY;
    if (query) {
      tracks = tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.artist.toLowerCase().includes(query) ||
          t.genre.toLowerCase().includes(query) ||
          t.mood.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      success: true,
      tracks,
      disclaimer: 'Royalty-free commercial tracks available for KAIRO Social video exports. Instagram native music may need to be attached directly inside Instagram if published through personal audio libraries.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch music tracks' }, { status: 500 });
  }
}
