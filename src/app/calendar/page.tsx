'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { AuthGuard } from '../../components/auth-guard';
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, Briefcase, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarDeadlinesPage() {
  const [currentMonth, setCurrentMonth] = useState('August 2026');

  const events = [
    { date: '2026-08-26', title: 'Follow-up with Ananya Roy (Royale Jewels)', type: 'CRM', color: 'bg-blue-100 text-blue-800' },
    { date: '2026-08-28', title: 'Quotation Review for Aura Fitness & Wellness', type: 'SALES', color: 'bg-purple-100 text-purple-800' },
    { date: '2026-08-30', title: 'Milestone 2 Signoff — Jeevansphere Eye Care Portal', type: 'PROJECT', color: 'bg-emerald-100 text-emerald-800' },
    { date: '2026-09-02', title: 'Tax & GST Invoicing for August Cycle', type: 'FINANCE', color: 'bg-rose-100 text-rose-800' },
    { date: '2026-09-15', title: 'Project Delivery & Production Launch for Jeevansphere', type: 'PROJECT', color: 'bg-amber-100 text-amber-800' },
  ];

  return (
    <AuthGuard>
      <DashboardLayout>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
              <span>Company Calendar & Deadlines</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Consolidated timeline of task deadlines, client milestone signoffs, follow-ups & invoice due dates.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <button className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-900">{currentMonth}</span>
            <button className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Schedule Cards */}
        <div className="space-y-3">
          {events.map((evt, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between hover:border-blue-300 transition-all text-xs"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center font-mono">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {new Date(evt.date).toLocaleString('default', { month: 'short' })}
                  </span>
                  <span className="text-base font-extrabold text-slate-900 leading-none">
                    {new Date(evt.date).getDate()}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${evt.color}`}>
                      {evt.type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{evt.date}</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">{evt.title}</h3>
                </div>
              </div>

              <span className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer">
                View Event →
              </span>
            </div>
          ))}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
