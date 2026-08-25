'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { AuthGuard } from '../../components/auth-guard';
import { useAuth } from '../../lib/auth/auth-context';
import { WorkLogItem } from '../../lib/types';
import { FileCheck2, Plus, Calendar, Clock, User, Briefcase, CheckCircle2, ExternalLink, X, AlertTriangle } from 'lucide-react';

export default function DailyWorkLogsPage() {
  const { profile, user: authUser } = useAuth();
  const [logs, setLogs] = useState<WorkLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    projectName: 'Jeevansphere Eye Care Platform',
    taskTitle: '',
    workCompleted: '',
    timeSpentHours: 4,
    proofUrl: '',
    blocker: '',
    tomorrowPlan: '',
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/work-logs');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setLogs(data);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.workCompleted) return;

    try {
      const res = await fetch('/api/work-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          employeeName: profile?.name || authUser?.displayName || 'Harshit Singh',
          employeeEmail: profile?.email || authUser?.email || 'harshitsingh19622@gmail.com',
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          projectName: 'Jeevansphere Eye Care Platform',
          taskTitle: '',
          workCompleted: '',
          timeSpentHours: 4,
          proofUrl: '',
          blocker: '',
          tomorrowPlan: '',
        });
        fetchLogs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <FileCheck2 className="w-6 h-6 text-emerald-600" />
              <span>Daily Work Logs</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Transparent daily work records, hours spent, deliverables, proofs and blocker reporting.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Today's Log</span>
          </button>
        </div>

        {/* Logs Feed */}
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {log.employeeName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{log.employeeName}</h3>
                    <p className="text-[11px] text-slate-400">{log.employeeEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {log.date}
                  </span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[10px]">
                    {log.timeSpentHours} Hours
                  </span>
                </div>
              </div>

              <div className="mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Project / Task</span>
                <p className="font-bold text-slate-900 text-xs">
                  {log.projectName} — <span className="text-blue-600 font-medium">{log.taskTitle}</span>
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Work Accomplished</span>
                <p className="text-slate-700 leading-relaxed">{log.workCompleted}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-[11px]">
                {log.proofUrl && (
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <a href={log.proofUrl} target="_blank" rel="noreferrer" className="hover:underline truncate font-medium">
                      Proof: {log.proofUrl}
                    </a>
                  </div>
                )}

                {log.tomorrowPlan && (
                  <div className="text-slate-600">
                    <strong>Tomorrow:</strong> {log.tomorrowPlan}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900">Submit Daily Work Log</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Task Title / Module</label>
                  <input
                    type="text"
                    placeholder="e.g. Next.js Routing & GST Invoice Calculation"
                    value={formData.taskTitle}
                    onChange={(e) => setFormData({ ...formData, taskTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Detailed Work Completed *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Explain what was built, debugged, designed or executed today..."
                    value={formData.workCompleted}
                    onChange={(e) => setFormData({ ...formData, workCompleted: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Time Spent (Hours)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.timeSpentHours}
                      onChange={(e) => setFormData({ ...formData, timeSpentHours: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Proof URL / GitHub PR</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.proofUrl}
                      onChange={(e) => setFormData({ ...formData, proofUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Plan for Tomorrow</label>
                  <input
                    type="text"
                    placeholder="Next milestone / priority action items..."
                    value={formData.tomorrowPlan}
                    onChange={(e) => setFormData({ ...formData, tomorrowPlan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs cursor-pointer"
                  >
                    Submit Log
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}
