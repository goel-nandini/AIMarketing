'use client';

import React from 'react';
import { DashboardLayout } from '../../../components/dashboard-layout';
import { AuthGuard } from '../../../components/auth-guard';
import { PieChart, Download, FileText, CheckCircle2, ShieldCheck, TrendingUp, DollarSign } from 'lucide-react';

export default function GSTReportsPage() {
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <PieChart className="w-6 h-6 text-emerald-600" />
              <span>GST & Management Tax Reports</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Statutory workings, GSTR-1 outward supply breakdown, GSTR-3B net tax liability & monthly sales register.
            </p>
          </div>

          <button
            onClick={() => alert('GSTR-1 JSON export prepared successfully.')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export GSTR-1 Data</span>
          </button>
        </div>

        {/* GST Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Taxable Value</span>
            <div className="text-2xl font-extrabold text-slate-900">{formatINR(350000)}</div>
            <p className="text-xs text-slate-400 mt-1">SAC 9983 (IT & Dev Services)</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Output GST (Collected)</span>
            <div className="text-2xl font-extrabold text-blue-600">{formatINR(63000)}</div>
            <p className="text-xs text-slate-400 mt-1">CGST: ₹31,500 + SGST: ₹31,500</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Eligible Input Tax (ITC)</span>
            <div className="text-2xl font-extrabold text-emerald-600">{formatINR(19350)}</div>
            <p className="text-xs text-slate-400 mt-1">Hosting, software & office</p>
          </div>
        </div>

        {/* GSTR-1 Sales Register Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              B2B Outward Supplies (GSTR-1 Working Table)
            </h2>
            <span className="text-[11px] text-emerald-600 font-semibold">Filing Period: August 2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Receiver GSTIN</th>
                  <th className="py-3 px-4">Trade Name</th>
                  <th className="py-3 px-4">Taxable Value</th>
                  <th className="py-3 px-4">CGST (9%)</th>
                  <th className="py-3 px-4">SGST (9%)</th>
                  <th className="py-3 px-4 font-bold text-slate-900">Total Invoice Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">INV-2026-001</td>
                  <td className="py-3 px-4 font-mono text-slate-600">07AABCU9603R1ZX</td>
                  <td className="py-3 px-4 font-bold text-slate-900">Jeevansphere</td>
                  <td className="py-3 px-4 font-medium">{formatINR(175000)}</td>
                  <td className="py-3 px-4 text-slate-600">{formatINR(15750)}</td>
                  <td className="py-3 px-4 text-slate-600">{formatINR(15750)}</td>
                  <td className="py-3 px-4 font-extrabold text-slate-900">{formatINR(206500)}</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">INV-2026-002</td>
                  <td className="py-3 px-4 font-mono text-slate-600">07AABCU9603R1ZX</td>
                  <td className="py-3 px-4 font-bold text-slate-900">Jeevansphere</td>
                  <td className="py-3 px-4 font-medium">{formatINR(175000)}</td>
                  <td className="py-3 px-4 text-slate-600">{formatINR(15750)}</td>
                  <td className="py-3 px-4 text-slate-600">{formatINR(15750)}</td>
                  <td className="py-3 px-4 font-extrabold text-slate-900">{formatINR(206500)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            <strong>Statutory Notice:</strong> Reports are compiled for internal working and audit review. Final statutory GST returns are subject to validation by CodeKap's designated Chartered Accountant.
          </span>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
