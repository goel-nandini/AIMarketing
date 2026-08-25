'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../components/dashboard-layout';
import { AuthGuard } from '../../components/auth-guard';
import { useAuth } from '../../lib/auth/auth-context';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Briefcase, 
  CheckSquare, 
  AlertCircle, 
  ArrowUpRight, 
  Activity, 
  Layers, 
  Clock, 
  Plus, 
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  Receipt,
  FileCheck2
} from 'lucide-react';

export default function DashboardPage() {
  const { profile } = useAuth();
  const [data, setData] = useState({
    revenue: 1250000,
    collections: 980000,
    outstanding: 270000,
    expenses: 185000,
    operatingSurplus: 1065000,
    activeProjects: 4,
    openLeads: 6,
    wonDeals: 2,
    pendingTasks: 3,
    teamSize: 8,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/overview')
      .then(res => res.json())
      .then(json => {
        if (json) setData(prev => ({ ...prev, ...json }));
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        {/* Owner Executive Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Owner Dashboard
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                CodeKap OS
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              Real-time operational health, sales pipeline, finance & project delivery.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/crm/leads"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Lead</span>
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </Link>
          </div>
        </div>

        {/* 1. Core Financial & Business KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Revenue */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mb-1">{formatINR(data.revenue)}</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% this quarter</span>
            </div>
          </div>

          {/* Collections */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collections</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 mb-1">{formatINR(data.collections)}</div>
            <div className="text-xs text-slate-500">
              {Math.round((data.collections / data.revenue) * 100)}% realization rate
            </div>
          </div>

          {/* Outstanding */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-amber-600 mb-1">{formatINR(data.outstanding)}</div>
            <div className="text-xs text-slate-500">Across 3 active invoices</div>
          </div>

          {/* Operating Surplus */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Operating Surplus</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-purple-700 mb-1">{formatINR(data.operatingSurplus)}</div>
            <div className="text-xs text-slate-500">Expenses: {formatINR(data.expenses)}</div>
          </div>
        </div>

        {/* 2. Operations & Sales Health Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Active Projects Health */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900">Project Delivery Health</h2>
                </div>
                <Link href="/projects" className="text-xs text-blue-600 font-semibold hover:underline flex items-center">
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-slate-800">On Track</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">3 Projects</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-xs font-semibold text-slate-800">At Risk (Review Needed)</span>
                  </div>
                  <span className="text-xs font-bold text-amber-700">1 Project</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-xs font-semibold text-slate-800">Delayed</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">0 Projects</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Total Active: <strong>{data.activeProjects}</strong></span>
              <span className="text-emerald-600 font-semibold">92% Milestone Velocity</span>
            </div>
          </div>

          {/* Sales Pipeline & Leads Funnel */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <h2 className="text-sm font-bold text-slate-900">Sales Funnel Pipeline</h2>
                </div>
                <Link href="/crm/pipeline" className="text-xs text-blue-600 font-semibold hover:underline flex items-center">
                  Kanban <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>New Leads & Inquiries</span>
                    <span>{data.openLeads}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Requirements & Quotations</span>
                    <span>3</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '50%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Won & Converted Clients</span>
                    <span>{data.wonDeals}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '35%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Conversion Rate: <strong className="text-slate-900">33.3%</strong></span>
              <Link href="/crm/leads" className="text-blue-600 hover:underline font-medium">Add Lead →</Link>
            </div>
          </div>

          {/* Team Workload & Today's Priorities */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <h2 className="text-sm font-bold text-slate-900">Team Workload & Logs</h2>
                </div>
                <Link href="/work-logs" className="text-xs text-blue-600 font-semibold hover:underline flex items-center">
                  Work Logs <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">Development Team</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">85% Load</span>
                  </div>
                  <p className="text-[11px] text-slate-500">3 engineers active on Next.js & QA sprints</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">Digital Marketing</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">60% Load</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Performance ads & content reels for Jeevansphere</p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Pending Tasks: <strong>{data.pendingTasks}</strong></span>
              <Link href="/tasks" className="text-blue-600 hover:underline font-medium">Task Hub →</Link>
            </div>
          </div>
        </div>

        {/* 3. Primary Workstreams & Quick Navigation Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <Link
            href="/crm/leads"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900">Sales CRM</span>
            <span className="text-[10px] text-slate-500 mt-0.5">{data.openLeads} Active Leads</span>
          </Link>

          <Link
            href="/clients"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900">Client Hub</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Jeevansphere & more</span>
          </Link>

          <Link
            href="/projects"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900">Projects</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Milestones & Sprints</span>
          </Link>

          <Link
            href="/sop"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900">SOP Library</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Standard Templates</span>
          </Link>

          <Link
            href="/finance"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900">Finance & GST</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Invoices & Razorpay</span>
          </Link>

          <Link
            href="/employees"
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900">Team</span>
            <span className="text-[10px] text-slate-500 mt-0.5">8 Department Staff</span>
          </Link>
        </div>

        {/* 4. Recent Audit & Activity Stream */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Global Activity & Audit Stream</h2>
            </div>
            <Link href="/audit-log" className="text-xs text-blue-600 font-semibold hover:underline">
              Full Audit History →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  AS
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    Aman Sir approved Milestone 2 for Jeevansphere Eye Care Portal
                  </p>
                  <p className="text-[11px] text-slate-400">10 mins ago • Operations</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                Verified
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  HS
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    Harshit Singh submitted Daily Work Log for Next.js Architecture
                  </p>
                  <p className="text-[11px] text-slate-400">45 mins ago • Development</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                Work Log
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  CK
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    Generated Quotation #QTN-2026-089 for Enterprise Cloud Suite
                  </p>
                  <p className="text-[11px] text-slate-400">2 hours ago • Finance</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-100">
                Quotation Sent
              </span>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
