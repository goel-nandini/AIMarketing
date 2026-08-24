'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { Campaign } from '../../lib/types';
import { BarChart3, TrendingUp, DollarSign, Users, RefreshCw } from 'lucide-react';

export default function AnalyticsPage() {
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

  const totalSpend = campaigns.reduce((acc, c) => acc + (c.metrics?.spend || 0), 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + (c.metrics?.conversions || 0), 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + (c.metrics?.clicks || 0), 0);
  const totalImpressions = campaigns.reduce((acc, c) => acc + (c.metrics?.impressions || 0), 0);

  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0';
  const avgCpa = totalConversions > 0 ? `CAD $${(totalSpend / totalConversions).toFixed(2)}` : 'CAD $0.00';
  const avgConvRate = totalClicks > 0 ? `${((totalConversions / totalClicks) * 100).toFixed(1)}%` : '0.0%';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Analytics & Performance
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Aggregated cross-campaign performance metrics across advertising channels.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading analytics...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Avg Cost Per Lead (CPA)</span>
              <p className="text-2xl font-bold text-slate-900 mt-2">{avgCpa}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Calculated from live campaigns</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Average Click-Through Rate</span>
              <p className="text-2xl font-bold text-slate-900 mt-2">{avgCtr}%</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Search & Display CTR</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Consultation Conversion Rate</span>
              <p className="text-2xl font-bold text-slate-900 mt-2">{avgConvRate}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Conversion tracking</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
