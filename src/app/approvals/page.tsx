'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../components/dashboard-layout';
import { AuthGuard } from '../../components/auth-guard';
import { Campaign } from '../../lib/types';
import { CheckCircle2, Clock, Building2, MapPin, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

export default function ApprovalsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch('/api/campaigns');
        if (res.ok) {
          setCampaigns(await res.json());
        }
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  const pendingCampaigns = campaigns.filter(c => c.status === 'PENDING_APPROVAL' || c.status === 'READY_FOR_REVIEW');

  return (
    <AuthGuard allowedRoles={['ADMIN', 'MANAGER']}>
      <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pending Approvals Queue
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Campaign proposals awaiting human authorization & budget launch confirmation.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading approval queue...</span>
          </div>
        ) : pendingCampaigns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">All caught up!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No campaigns currently pending approval. Created campaign proposals will appear here for review.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingCampaigns.map((camp) => (
              <div key={camp.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px] uppercase">
                      Action Required
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">{camp.clientName}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{camp.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-3">
                    <span><MapPin className="w-3 h-3 inline text-blue-600" /> {camp.location}</span>
                    <span>•</span>
                    <span className="font-bold text-slate-900">Budget: {camp.currency} ${camp.dailyBudget}/day</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/campaigns/${camp.id}/proposal`}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md shadow-blue-600/20 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Review Proposal & Launch</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  </AuthGuard>
  );
}
