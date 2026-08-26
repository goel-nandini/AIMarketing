'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/dashboard-layout';
import { AuthGuard } from '../../../components/auth-guard';
import { useAuth } from '../../../lib/auth/auth-context';
import { useScreenTime, formatDuration } from '../../../components/screen-time-tracker';
import {
  Clock,
  Activity,
  Users,
  Calendar,
  Smartphone,
  Laptop,
  CheckCircle2,
  RefreshCw,
  Shield,
  TrendingUp,
  BarChart3,
  Flame,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';

interface TeamMemberActivity {
  userId: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  title?: string;
  activeSeconds: number;
  sessionCount: number;
  firstLoginAt: string | null;
  lastActiveAt: string | null;
  status: 'ACTIVE' | 'IDLE' | 'OFFLINE';
  pageBreakdown: Record<string, number>;
  deviceInfo: string;
}

export default function ScreenTimeAnalyticsPage() {
  const { profile, role } = useAuth();
  const { activeSecondsToday, formattedTodayTime, isTabActive } = useScreenTime();

  const [teamActivity, setTeamActivity] = useState<TeamMemberActivity[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'team' | 'personal'>('team');

  const isSuperAdmin = role === 'ADMIN' || profile?.email === 'aman@codekap.com';

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/screen-time?all=true');
      if (res.ok) {
        const data = await res.json();
        if (data.teamActivity) setTeamActivity(data.teamActivity);
        if (data.history) setHistory(data.history);
      }
    } catch (e) {
      console.warn('Error loading screen time data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 15000); // Live poll every 15s
    return () => clearInterval(interval);
  }, []);

  const totalWorkspaceSeconds = teamActivity.reduce((acc, curr) => acc + curr.activeSeconds, 0);
  const activeNowCount = teamActivity.filter((m) => m.status === 'ACTIVE').length;

  const pageNameFormat = (path: string) => {
    if (path === '/' || path === '/dashboard') return 'Dashboard';
    if (path.includes('tasks')) return 'Tasks Hub';
    if (path.includes('clients')) return 'Clients & Repos';
    if (path.includes('leads') || path.includes('crm')) return 'CRM Leads';
    if (path.includes('sop')) return 'SOP Library';
    if (path.includes('team')) return 'Team Hub';
    if (path.includes('creative')) return 'Creative Studio';
    if (path.includes('finance')) return 'Finance Hub';
    return path.replace('/', '').toUpperCase();
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in">
          {/* Header Summary */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-1">
                <Activity className="w-4 h-4" />
                <span>Real-Time Digital Wellbeing & Activity Monitor</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Screen Time & Workspace Activity
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Live monitoring of team work hours, active tab engagement, daily screen time, and platform productivity.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer btn-press"
                title="Refresh Live Data"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
              </button>

              <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setActiveTab('team')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'team'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Workspace Team ({teamActivity.length})
                </button>
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'personal'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  My Screen Time
                </button>
              </div>
            </div>
          </div>

          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  My Screen Time Today
                </span>
                <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {formattedTodayTime}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-emerald-600">
                  <span className={`w-2 h-2 rounded-full ${isTabActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                  <span>{isTabActive ? 'Currently Active & Tracking' : 'Idle / Away'}</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Total Team Screen Time
                </span>
                <p className="text-2xl font-black text-purple-900 mt-1 font-mono">
                  {formatDuration(totalWorkspaceSeconds)}
                </p>
                <p className="text-[11px] text-purple-700 font-medium mt-1">
                  Cumulative today across team
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Active Team Members
                </span>
                <p className="text-2xl font-black text-emerald-900 mt-1">
                  {activeNowCount} / {teamActivity.length}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Live on platform now</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Target Workday Goal
                </span>
                <p className="text-2xl font-black text-amber-900 mt-1 font-mono">
                  8.0h Daily
                </p>
                <p className="text-[11px] text-amber-700 font-medium mt-1">
                  {Math.round((activeSecondsToday / 28800) * 100)}% of goal achieved
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Tab 1: Team Members Live Screen Time Grid */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Team Activity & Screen Time Monitor</span>
                </h2>
                <span className="text-xs text-slate-500">
                  Heartbeat updates automatically every 15 seconds
                </span>
              </div>

              {loading ? (
                <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Loading live workspace screen time...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {teamActivity.map((member) => {
                    const progressPct = Math.min(100, Math.round((member.activeSeconds / 28800) * 100));
                    const pageEntries = Object.entries(member.pageBreakdown || {}).sort((a, b) => b[1] - a[1]);

                    return (
                      <div
                        key={member.userId}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all space-y-4 card-lift"
                      >
                        {/* Member Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.userId}`}
                                alt={member.name}
                                className="w-11 h-11 rounded-full border border-slate-200 object-cover"
                              />
                              <span
                                className={`w-3.5 h-3.5 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-white ${
                                  member.status === 'ACTIVE'
                                    ? 'bg-emerald-500 animate-pulse'
                                    : member.status === 'IDLE'
                                    ? 'bg-amber-400'
                                    : 'bg-slate-300'
                                }`}
                              />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{member.name}</span>
                                {member.role === 'ADMIN' && (
                                  <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[9px] font-bold">
                                    ADMIN
                                  </span>
                                )}
                              </h3>
                              <p className="text-xs text-slate-500 truncate max-w-[170px]">{member.email}</p>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              member.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : member.status === 'IDLE'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {member.status === 'ACTIVE' ? 'Active Now 🟢' : member.status === 'IDLE' ? 'Idle 🟡' : 'Offline ⚪'}
                          </span>
                        </div>

                        {/* Screen Time Metric */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                          <div className="flex items-baseline justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase">Screen Time Today</span>
                            <span className="text-lg font-black text-slate-900 font-mono">
                              {formatDuration(member.activeSeconds)}
                            </span>
                          </div>

                          {/* Progress bar towards 8h */}
                          <div className="space-y-1">
                            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                              <span>0h</span>
                              <span>{progressPct}% of 8h goal</span>
                              <span>8h</span>
                            </div>
                          </div>
                        </div>

                        {/* Top Pages Breakdown */}
                        {pageEntries.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Most Used Modules
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {pageEntries.slice(0, 3).map(([path, secs]) => (
                                <span
                                  key={path}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-100 text-[10px] font-bold"
                                >
                                  <span>{pageNameFormat(path)}</span>
                                  <span className="text-blue-600 font-mono">({formatDuration(secs)})</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Footer Timestamps */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <div className="flex items-center gap-1">
                            <Laptop className="w-3.5 h-3.5 text-slate-400" />
                            <span>{member.deviceInfo}</span>
                          </div>
                          <span>
                            {member.lastActiveAt
                              ? `Active: ${new Date(member.lastActiveAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                              : 'Not logged today'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Personal Screen Time & Session Logs */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              {/* Daily Stopwatch Hero Card */}
              <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="relative z-10 max-w-xl space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs">
                    <span className={`w-2 h-2 rounded-full ${isTabActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    <span>{isTabActive ? 'Live Real-Time Active Session' : 'Idle Paused'}</span>
                  </div>

                  <div>
                    <h2 className="text-3xl md:text-5xl font-black font-mono tracking-tight text-white">
                      {formattedTodayTime}
                    </h2>
                    <p className="text-sm text-slate-300 font-medium mt-1">
                      Total active time logged on CodeKap OS today for <strong>{profile?.name || 'You'}</strong>.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Zero Battery Drain</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span>Auto-Sync to Database</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historical Session Logs */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">Recent Session History</h3>
                  </div>
                  <span className="text-xs text-slate-500">Recorded across device logins</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Active Duration</th>
                        <th className="py-3 px-4">First Login</th>
                        <th className="py-3 px-4">Last Activity</th>
                        <th className="py-3 px-4">Device</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {history.slice(0, 15).map((h, i) => (
                        <tr key={h.id || i} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{h.date}</td>
                          <td className="py-3.5 px-4 font-bold">{h.userName}</td>
                          <td className="py-3.5 px-4 font-mono font-black text-blue-600">
                            {formatDuration(h.activeSeconds)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {new Date(h.firstLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {new Date(h.lastActiveAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">{h.deviceInfo || 'Desktop PC'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
