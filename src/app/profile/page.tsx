'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { AuthGuard } from '../../components/auth-guard';
import { useAuth } from '../../lib/auth/auth-context';
import { User, Shield, CheckCircle2, AlertCircle, RefreshCw, Lock, Save, Camera } from 'lucide-react';

export default function ProfilePage() {
  const { profile, getIdToken, refreshProfile } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [title, setTitle] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setUsername(profile.username || '');
      setAvatar(profile.avatar || '');
      setTitle(profile.title || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) return setError('Full name is required.');
    if (!username.trim()) return setError('Username is required.');

    setLoading(true);
    try {
      const token = await getIdToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (profile?.uid) headers['X-User-Id'] = profile.uid;

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          avatar: avatar.trim() || undefined,
          title: title.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update profile.');
      } else {
        setSuccess('Profile updated successfully.');
        await refreshProfile();
      }
    } catch (err: any) {
      setError(err.message || 'Error updating profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              User Profile
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Manage your Agent AI account details, avatar, and username settings.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Card: Summary */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <img
                  src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.uid}`}
                  alt={profile?.name || 'User'}
                  className="w-24 h-24 rounded-full border-2 border-blue-600 object-cover shadow-md"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">{profile?.name}</h2>
                <p className="text-xs font-semibold text-blue-600">@{profile?.username}</p>
                <p className="text-xs text-slate-500 mt-1">{profile?.title || 'Team Member'}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-left">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Role:</span>
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]">
                    {profile?.role}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    {profile?.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Email Verified:</span>
                  <span className="font-bold text-slate-800">
                    {profile?.emailVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Member Since:</span>
                  <span className="text-slate-700">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Last Login:</span>
                  <span className="text-slate-700">
                    {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Card: Editable Form */}
            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-5">
                Edit Profile Information
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Username</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">@</span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Changing username updates your unique handle in Firestore</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ''}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Email cannot be changed directly from profile settings</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Title / Role Designation</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Media Buyer / Copywriter"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Avatar Image URL</label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="py-3 px-6 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
