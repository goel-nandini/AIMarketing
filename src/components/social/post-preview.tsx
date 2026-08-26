'use client';

import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ThumbsUp,
  Share2,
  MapPin,
  Music2,
  Volume2,
  Globe,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SocialMediaItem, SocialMusicItem } from '@/lib/types';

interface PostPreviewProps {
  clientName: string;
  username?: string;
  pageName?: string;
  avatarUrl?: string;
  caption: string;
  hashtags: string[];
  location?: string | null;
  media: SocialMediaItem[];
  music?: SocialMusicItem | null;
  platforms: string[];
}

export function PostPreview({
  clientName,
  username = '@auravitalstar',
  pageName = 'Aura Vital Star',
  avatarUrl,
  caption,
  hashtags,
  location,
  media,
  music,
  platforms,
}: PostPreviewProps) {
  const [activePlatform, setActivePlatform] = useState<'INSTAGRAM' | 'FACEBOOK'>('INSTAGRAM');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const cleanAvatar = avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(clientName)}`;
  const activeMedia = media && media.length > 0 ? media[currentMediaIndex] : null;
  const fallbackMediaUrl = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80';

  const fullCaption = caption || 'Your captivating AI-generated caption will appear here...';
  const hasMultipleMedia = media && media.length > 1;

  const nextMedia = () => {
    if (media && currentMediaIndex < media.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
  };

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-full">
      {/* Header with Platform Switcher */}
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Live Preview:</span>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setActivePlatform('INSTAGRAM')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activePlatform === 'INSTAGRAM'
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Instagram
          </button>
          <button
            type="button"
            onClick={() => setActivePlatform('FACEBOOK')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activePlatform === 'FACEBOOK'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Facebook
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="p-4 sm:p-6 flex-1 flex items-center justify-center bg-slate-100/60 custom-scrollbar overflow-y-auto">
        {activePlatform === 'INSTAGRAM' ? (
          /* ================= INSTAGRAM MOBILE FEED MOCKUP ================= */
          <div className="w-full max-w-[380px] bg-white rounded-3xl border border-slate-300/80 shadow-xl overflow-hidden font-sans text-slate-900">
            {/* Top Bar */}
            <div className="px-3.5 py-3 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 shrink-0">
                  <img
                    src={cleanAvatar}
                    alt={clientName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {username.startsWith('@') ? username.slice(1) : username}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                    <span className="text-[10px] text-blue-600 font-bold">Follow</span>
                  </div>
                  {location && (
                    <div className="text-[10px] text-slate-500 truncate flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                      <span>{location}</span>
                    </div>
                  )}
                </div>
              </div>
              <button type="button" className="text-slate-500 p-1 hover:text-slate-900">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Media Viewport */}
            <div className="relative aspect-square bg-slate-950 flex items-center justify-center overflow-hidden">
              {activeMedia?.type === 'video' ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={activeMedia.thumbnailUrl || fallbackMediaUrl}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg">
                      <Volume2 className="w-5 h-5 text-slate-800" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={activeMedia?.url || fallbackMediaUrl}
                  alt="Post creative"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Carousel Indicators */}
              {hasMultipleMedia && (
                <>
                  <button
                    type="button"
                    onClick={prevMedia}
                    disabled={currentMediaIndex === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-900/60 text-white flex items-center justify-center disabled:opacity-0 transition-opacity"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextMedia}
                    disabled={currentMediaIndex === media.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-900/60 text-white flex items-center justify-center disabled:opacity-0 transition-opacity"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-slate-900/70 text-white text-[10px] font-bold backdrop-blur-xs">
                    {currentMediaIndex + 1}/{media.length}
                  </div>
                </>
              )}

              {/* Music Badge if attached */}
              {music && (
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-medium backdrop-blur-xs flex items-center gap-1.5 max-w-[240px] truncate">
                  <Music2 className="w-3 h-3 text-pink-400 shrink-0" />
                  <span className="truncate">{music.title} • {music.artist}</span>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-800">
                  <Heart className="w-5 h-5 hover:text-rose-600 transition-colors cursor-pointer" />
                  <MessageCircle className="w-5 h-5 hover:text-blue-600 transition-colors cursor-pointer" />
                  <Send className="w-5 h-5 hover:text-blue-600 transition-colors cursor-pointer" />
                </div>
                <Bookmark className="w-5 h-5 text-slate-800 hover:text-slate-950 transition-colors cursor-pointer" />
              </div>

              <div className="text-[11px] font-bold text-slate-900">
                Liked by <span className="font-extrabold">kairo_team</span> and <span>others</span>
              </div>

              {/* Caption & Hashtags */}
              <div className="text-xs text-slate-800 leading-relaxed">
                <span className="font-bold text-slate-900 mr-1.5">
                  {username.startsWith('@') ? username.slice(1) : username}
                </span>
                <span className="whitespace-pre-line">
                  {isExpanded ? fullCaption : fullCaption.slice(0, 120)}
                </span>
                {!isExpanded && fullCaption.length > 120 && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(true)}
                    className="text-slate-400 text-xs ml-1 hover:text-slate-700 font-semibold"
                  >
                    ...more
                  </button>
                )}
              </div>

              {/* Hashtags */}
              {hashtags && hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {hashtags.map((h, i) => (
                    <span key={i} className="text-[11px] text-blue-900 font-medium">
                      {h}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-[10px] text-slate-400 uppercase pt-1 font-medium">
                Just now • Official Meta Graph v20.0
              </div>
            </div>
          </div>
        ) : (
          /* ================= FACEBOOK FEED MOCKUP ================= */
          <div className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden font-sans text-slate-900">
            {/* Facebook Header */}
            <div className="p-3.5 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={cleanAvatar}
                  alt={pageName}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                    <span>{pageName}</span>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-blue-100 text-blue-800 font-bold">
                      Page
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span>Just now</span>
                    <span>•</span>
                    <Globe className="w-3 h-3 text-slate-400" />
                    {location && (
                      <>
                        <span>•</span>
                        <span className="truncate">{location}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button type="button" className="text-slate-400 p-1 hover:text-slate-700">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Facebook Caption */}
            <div className="px-3.5 py-2.5 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
              {fullCaption}
              {hashtags && hashtags.length > 0 && (
                <div className="pt-2 text-blue-700 font-medium">
                  {hashtags.join(' ')}
                </div>
              )}
            </div>

            {/* Media Viewport */}
            <div className="bg-slate-950 flex items-center justify-center max-h-[320px] overflow-hidden">
              <img
                src={activeMedia?.url || fallbackMediaUrl}
                alt="Facebook media"
                className="w-full h-full max-h-[320px] object-cover"
              />
            </div>

            {/* Action Buttons */}
            <div className="p-2 border-t border-slate-100 flex items-center justify-around text-slate-600 text-xs font-bold">
              <button type="button" className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-100">
                <ThumbsUp className="w-4 h-4 text-blue-600" />
                <span>Like</span>
              </button>
              <button type="button" className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-100">
                <MessageCircle className="w-4 h-4" />
                <span>Comment</span>
              </button>
              <button type="button" className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-100">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
