'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { AuthGuard } from '../../components/auth-guard';
import { Bell, CheckCircle2, Clock, AlertCircle, Shield, Briefcase, TrendingUp, DollarSign } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: 'Milestone 2 Signoff Pending',
      desc: 'Jeevansphere Eye Care Portal has reached Phase 2 completion. Pending review by Aman Sir.',
      time: '15 mins ago',
      type: 'PROJECT',
      read: false,
    },
    {
      id: 'n2',
      title: 'Payment Received from Jeevansphere',
      desc: 'Payment of ₹2,06,500 recorded for Invoice INV-2026-001 via IMPS bank transfer.',
      time: '2 hours ago',
      type: 'FINANCE',
      read: false,
    },
    {
      id: 'n3',
      title: 'New Lead Inquired via Website',
      desc: 'Rohit Verma (Aura Fitness) requested quotation for Mobile App & Performance Ads.',
      time: '5 hours ago',
      type: 'CRM',
      read: true,
    },
    {
      id: 'n4',
      title: 'SOP Template Updated',
      desc: 'Fullstack Web Application Development SOP updated to version 1.0.',
      time: 'Yesterday',
      type: 'SOP',
      read: true,
    },
  ]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Bell className="w-6 h-6 text-blue-600" />
              <span>Notifications & Alerts Center</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Real-time activity notifications, milestone signoffs, payment receipts & lead alerts.
            </p>
          </div>

          <button
            onClick={markAllRead}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Mark All Read
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 text-xs ${
                notif.read
                  ? 'bg-white border-slate-200 shadow-2xs'
                  : 'bg-blue-50/40 border-blue-200 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-slate-900">{notif.title}</h3>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-100 text-slate-600">
                      {notif.type}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{notif.desc}</p>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                {notif.time}
              </span>
            </div>
          ))}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
