export interface RoyaltyFreeTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: string;
  bpm: number;
  mood: string;
  commercialSafe: boolean;
  previewUrl: string;
  coverUrl: string;
}

export const COMMERCIAL_MUSIC_LIBRARY: RoyaltyFreeTrack[] = [
  {
    id: 'trk_01',
    title: 'Golden Hour Serenade',
    artist: 'Luminary Ambient',
    genre: 'Lo-Fi Chill & Wellness',
    duration: '2:14',
    bpm: 85,
    mood: 'Calm, Elegant, Inspiring',
    commercialSafe: true,
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'trk_02',
    title: 'Aura Vitality Pulse',
    artist: 'Nordic Soundscapes',
    genre: 'Deep Modern Electronic',
    duration: '1:48',
    bpm: 118,
    mood: 'Sophisticated, Uplifting',
    commercialSafe: true,
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=electronic-future-beats-117997.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'trk_03',
    title: 'Silk & Morning Dew',
    artist: 'Ethereal Harmony',
    genre: 'Spa & Acoustic Ambient',
    duration: '2:30',
    bpm: 72,
    mood: 'Relaxing, Organic, Gentle',
    commercialSafe: true,
    previewUrl: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3?filename=relaxing-mountains-nature-walk-14138.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'trk_04',
    title: 'Urban Momentum',
    artist: 'Velvet Groove Collective',
    genre: 'Neo-Soul & Modern Beats',
    duration: '2:05',
    bpm: 98,
    mood: 'Confident, Chic, Engaging',
    commercialSafe: true,
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=modern-vlog-140795.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'trk_05',
    title: 'Pure Radiance',
    artist: 'Solis Symphony',
    genre: 'Cinematic Minimalist',
    duration: '1:55',
    bpm: 80,
    mood: 'Inspiring, Luxury, Emotional',
    commercialSafe: true,
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77e30.mp3?filename=inspire-ambient-122453.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=100&auto=format&fit=crop&q=80',
  },
];
