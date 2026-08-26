'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../components/dashboard-layout';
import { Campaign } from '../../lib/types';
import { Megaphone, PlusCircle, Building2, ChevronRight, RefreshCw } from 'lucide-react';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch('/api/campaigns');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCampaigns(data);
          }
        }
      } catch (err) {
        console.warn('Campaigns note: Using fallback baseline', err);
      }
    }
    fetchCampaigns();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campaigns
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Overview of all active, pending approval, and draft marketing campaigns.
          </p>
        </div>

        <Link
          href="/campaigns/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Campaign</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading campaigns from database...</span>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No campaigns found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You don't have any active or draft marketing campaigns yet. Click below to launch your first one with AI.
            </p>
            <div className="pt-2">
              <Link
                href="/campaigns/create"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Campaign</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Campaign Name</th>
                  <th className="py-3.5 px-4">Platform</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Budget</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>{camp.clientName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-blue-600 hover:underline">
                      <Link href={`/campaigns/${camp.id}`}>{camp.name}</Link>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                        {camp.platform}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500">{camp.location}</td>
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {camp.currency} ${camp.dailyBudget}/day
                    </td>
                    <td className="py-4 px-4">
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
                    <td className="py-4 px-4 text-right">
                      {camp.status === 'PENDING_APPROVAL' ? (
                        <Link
                          href={`/campaigns/${camp.id}/proposal`}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-2xs"
                        >
                          Review Proposal
                        </Link>
                      ) : (
                        <Link
                          href={`/campaigns/${camp.id}`}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
                        >
                          View Details
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
    </DashboardLayout>
  );
}
