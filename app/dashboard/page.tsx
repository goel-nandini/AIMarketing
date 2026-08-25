'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../components/dashboard-layout';
import { AuthGuard } from '../../components/auth-guard';
import { useAuth } from '../../lib/auth/auth-context';
import { Campaign, AuditLog, Task, TaskStatus } from '../../lib/types';
import { 
  PlusCircle, 
  Megaphone, 
  CheckCircle2, 
  CheckSquare,
  DollarSign, 
  Users, 
  ArrowUpRight, 
  Bot, 
  Sparkles,
  ChevronRight,
  Building2,
  RefreshCw,
  Clock,
  Check,
  Plus
} from 'lucide-react';

export default function DashboardPage() {
  const { profile, role, user: authUser } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const isSuperOrManager = role === 'ADMIN' || role === 'MANAGER' || profile?.email === 'aman@codekap.com';

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const effectiveUserId = profile?.uid || authUser?.uid || 'usr_aman';
      const effectiveEmail = profile?.email || authUser?.email || 'aman@codekap.com';
      const headers = { 'X-User-Id': effectiveUserId };

      const [cRes, aRes, tRes] = await Promise.all([
        fetch('/api/campaigns', { headers }),
        fetch('/api/audit-logs', { headers }),
        fetch(`/api/tasks?my=true&userId=${encodeURIComponent(effectiveUserId)}&email=${encodeURIComponent(effectiveEmail)}`, { headers })
      ]);

      if (cRes.ok) setCampaigns(await cRes.json());
      if (aRes.ok) setAuditLogs(await aRes.json());
      if (tRes.ok) setMyTasks(await tRes.json());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [profile]);

  const handleTaskStatusToggle = async (taskId: string, currentStatus: TaskStatus) => {
    const newStatus: TaskStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    try {
      const effectiveUserId = profile?.uid || authUser?.uid || 'usr_aman';
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': effectiveUserId,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setMyTasks(prev =>
          prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const activeCount = campaigns.filter(c => c.status === 'ACTIVE').length;
  const pendingCount = campaigns.filter(c => c.status === 'PENDING_APPROVAL' || c.status === 'READY_FOR_REVIEW').length;
  const totalSpend = campaigns.reduce((acc, c) => acc + (c.metrics?.spend || 0), 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + (c.metrics?.conversions || 0), 0);

  const pendingTasksCount = myTasks.filter(t => t.status !== 'COMPLETED').length;
  const userName = profile?.name ? profile.name.split(' ')[0] : 'Team Member';

  return (
    <AuthGuard>
      <DashboardLayout>
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Good morning, {userName}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Welcome to your Agent AI marketing workspace. Track campaigns, AI agents, and delegated tasks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/tasks"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <CheckSquare className="w-4 h-4 text-blue-600" />
              <span>Tasks ({pendingTasksCount} Pending)</span>
            </Link>

            <Link
              href="/campaigns/create"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 hover:scale-[1.01]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Campaign</span>
            </Link>
          </div>
        </div>

        {/* Top 4 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Campaigns</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Megaphone className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{activeCount}</span>
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> Live Google Ads
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Pending Tasks</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{pendingTasksCount}</span>
              <Link href="/tasks" className="text-xs font-semibold text-amber-600 hover:underline">
                View Tasks →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Spend</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">CAD ${totalSpend.toLocaleString()}</span>
              <span className="text-xs font-medium text-slate-500">August 2026</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leads / Conversions</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{totalConversions}</span>
              <span className="text-xs font-medium text-purple-600">Client Conversions</span>
            </div>
          </div>
        </div>

        {/* Section: My Assigned Tasks Widget */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 mb-8">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">My Assigned Tasks ({myTasks.length})</h2>
                <p className="text-xs text-slate-500">Tasks assigned personally to you by Super Admin / Managers</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isSuperOrManager && (
                <Link
                  href="/tasks"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign New Task</span>
                </Link>
              )}
              <Link href="/tasks" className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1">
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Loading tasks...</span>
            </div>
          ) : myTasks.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">No active tasks assigned to you right now</p>
              <p className="text-[11px] text-slate-500">
                When Super Admin assigns a task to your account, it will appear here with instructions and due dates.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myTasks.slice(0, 4).map(task => {
                const isDone = task.status === 'COMPLETED';
                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      isDone
                        ? 'bg-slate-50/60 border-slate-200/80 opacity-75'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleTaskStatusToggle(task.id, task.status)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 hover:border-blue-600 text-transparent'
                        }`}
                        title={isDone ? 'Mark as Incomplete' : 'Mark as Complete'}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {task.title}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              task.priority === 'URGENT'
                                ? 'bg-rose-100 text-rose-800'
                                : task.priority === 'HIGH'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {task.priority}
                          </span>
                          {task.clientName && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 text-[9px] font-bold border border-purple-100">
                              🏢 {task.clientName}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5 font-medium">
                          {task.description || 'Marketing deliverable and action item.'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Assigned by <strong className="text-slate-600">{task.assignedByName || 'Aman Sir (Super Admin)'}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      {task.dueDate && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{task.dueDate}</span>
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Main Grid: Active Campaigns Table & AI Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Active & Pending Campaigns</h2>
                  <p className="text-xs text-slate-500">Marketing initiatives and advertising campaigns</p>
                </div>
                <Link href="/campaigns" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Loading campaigns from database...</span>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">No campaigns yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Get started by creating your first AI-optimized marketing campaign with automated audience research, copy, and visuals.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/campaigns/create"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Create Your First Campaign</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4">Client</th>
                        <th className="py-3 px-4">Campaign</th>
                        <th className="py-3 px-4">Platform</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Budget</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {campaigns.map((camp) => (
                        <tr key={camp.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>{camp.clientName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-blue-600 hover:underline">
                            <Link href={`/campaigns/${camp.id}`}>{camp.name}</Link>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px]">
                              {camp.platform}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">{camp.location}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {camp.currency} ${camp.dailyBudget}/day
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              camp.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : camp.status === 'PENDING_APPROVAL'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {camp.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {camp.status === 'PENDING_APPROVAL' ? (
                              <Link
                                href={`/campaigns/${camp.id}/proposal`}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 transition-colors shadow-2xs"
                              >
                                Review & Launch
                              </Link>
                            ) : (
                              <Link
                                href={`/campaigns/${camp.id}`}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 font-semibold text-[11px] hover:bg-slate-50"
                              >
                                Details
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: AI Activity Feed */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">AI Agent Activity</h2>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                  Live Feed
                </span>
              </div>

              {auditLogs.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800">No agent activity yet</p>
                  <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                    Activity will appear here as AI agents execute tasks.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex gap-3 text-xs">
                      <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{log.agentName || log.userName || 'System'}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-700 font-medium mt-0.5">{log.action}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{log.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 pt-3 border-t border-slate-100 text-center">
                <Link href="/audit-log" className="text-xs font-semibold text-blue-600 hover:underline">
                  View Complete Audit Trail →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
