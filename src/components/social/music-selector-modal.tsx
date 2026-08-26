'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Music2, Play, Pause, Search, Check, AlertCircle, X, Volume2 } from 'lucide-react';
import { COMMERCIAL_MUSIC_LIBRARY, RoyaltyFreeTrack } from '@/lib/social/music-service';
import { SocialMusicItem } from '@/lib/types';

interface MusicSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrack: (track: SocialMusicItem | null) => void;
  currentTrack?: SocialMusicItem | null;
}

export function MusicSelectorModal({
  isOpen,
  onClose,
  onSelectTrack,
  currentTrack,
}: MusicSelectorModalProps) {
  const [search, setSearch] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const filteredTracks = COMMERCIAL_MUSIC_LIBRARY.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.artist.toLowerCase().includes(search.toLowerCase()) ||
      t.genre.toLowerCase().includes(search.toLowerCase()) ||
      t.mood.toLowerCase().includes(search.toLowerCase())
  );

  const togglePlay = (track: RoyaltyFreeTrack) => {
    if (playingId === track.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.previewUrl;
        audioRef.current.play().catch(() => {});
      }
      setPlayingId(track.id);
    }
  };

  const handleSelect = (track: RoyaltyFreeTrack) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingId(null);
    onSelectTrack({
      id: track.id,
      title: track.title,
      artist: track.artist,
      genre: track.genre,
      previewUrl: track.previewUrl,
      duration: track.duration,
      isInstagramAudioWarning: true,
    });
    onClose();
  };

  const handleRemoveMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingId(null);
    onSelectTrack(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Music2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Commercial Music Library</h2>
              <p className="text-xs text-slate-500 font-medium">Select royalty-free background audio for your post</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Important Instagram Music Notice */}
        <div className="px-5 pt-4">
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-amber-900 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Instagram Native Music Notice:</strong> Meta Graph API permits custom royalty-free soundtrack exports. If you wish to attach Instagram's native licensed pop audio tracks, Instagram music may need to be added directly inside Instagram.
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-5 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, artist, genre (e.g. ambient, beats, spa)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 bg-white"
            />
          </div>
        </div>

        {/* Track List */}
        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-2 custom-scrollbar">
          {filteredTracks.map((track) => {
            const isPlaying = playingId === track.id;
            const isCurrent = currentTrack?.id === track.id;

            return (
              <div
                key={track.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => togglePlay(track)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isPlaying
                        ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                      <span>{track.title}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                        Commercial Safe
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                      <span>{track.artist}</span>
                      <span>•</span>
                      <span>{track.genre}</span>
                      <span>•</span>
                      <span>{track.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isCurrent ? (
                    <span className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1 shadow-2xs">
                      <Check className="w-3.5 h-3.5" />
                      <span>Selected</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelect(track)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-colors btn-press cursor-pointer"
                    >
                      Use Track
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          {currentTrack ? (
            <button
              type="button"
              onClick={handleRemoveMusic}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Remove Selected Track
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
