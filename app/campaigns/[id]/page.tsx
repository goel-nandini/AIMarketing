'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '../../../components/dashboard-layout';
import { Campaign, CampaignProposal, AuditLog } from '../../../lib/types';
import { 
  Megaphone, 
  Building2, 
  MapPin, 
  Calendar, 
  Bot, 
  Sparkles, 
  RefreshCw,
  Image as ImageIcon,
  FileText
} from 'lucide-react';

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [proposal, setProposal] = useState<CampaignProposal | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'strategy' | 'ads' | 'creatives' | 'performance' | 'audit'>('overview');

  useEffect(() => {
    async function fetchCampaignData() {
      try {
        const [cRes, pRes, aRes] = await Promise.all([
          fetch('/api/campaigns'),
          fetch(`/api/campaigns/${campaignId}/proposal`),
          fetch('/api/audit-logs')
        ]);

        if (cRes.ok) {
          const list: Campaign[] = await cRes.json();
          const found = list.find(c => c.id === campaignId);
          setCampaign(found || null);
        }

        if (pRes.ok) {
          setProposal(await pRes.json());
        }

        if (aRes.ok) {
          setAuditLogs(await aRes.json());
        }
      } catch (err) {
        console.error('Error fetching campaign detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaignData();
  }, [campaignId]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'strategy', label: 'Strategy' },
    { id: 'ads', label: 'Ads & Copy' },
    { id: 'creatives', label: 'Creatives' },
    { id: 'performance', label: 'Performance' },
    { id: 'audit', label: 'Audit Log' },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span>Loading campaign details...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!campaign) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Campaign not found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            The requested campaign does not exist or has been deleted.
          </p>
          <div className="pt-2">
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Campaigns
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-600 px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                  {campaign.platform}
                </span>
                <span className="text-xs text-slate-500 font-medium">{campaign.clientName}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {campaign.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-blue-600" /> {campaign.location}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {campaign.startDate} to {campaign.endDate}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                campaign.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : campaign.status === 'PENDING_APPROVAL'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                Status: {campaign.status.replace('_', ' ')}
              </span>

              {campaign.status === 'PENDING_APPROVAL' && (
                <Link
                  href={`/campaigns/${campaign.id}/proposal`}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-2xs"
                >
                  Review Proposal
                </Link>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === t.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* AI Performance Insight Box */}
            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <span>AI Performance Insight</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-600 text-white font-bold">
                  Optimization Agent
                </span>
              </div>
              <p className="text-xs text-blue-900 leading-relaxed font-medium">
                {campaign.aiInsight || 'Campaign initialized and ready for automated budget allocation and bidding strategy optimization.'}
              </p>
            </div>

            {/* Metrics Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Daily Budget</span>
                <p className="text-xl font-bold text-slate-900 mt-1">{campaign.currency} ${campaign.dailyBudget}/day</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Impressions</span>
                <p className="text-xl font-bold text-slate-900 mt-1">{campaign.metrics?.impressions?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Clicks (CTR)</span>
                <p className="text-xl font-bold text-slate-900 mt-1">{campaign.metrics?.clicks || 0} ({campaign.metrics?.ctr || 0}%)</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Conversions</span>
                <p className="text-xl font-bold text-slate-900 mt-1">{campaign.metrics?.conversions || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Strategy */}
        {activeTab === 'strategy' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Campaign Strategy</h3>
            {proposal?.strategy ? (
              <div className="text-xs space-y-3 text-slate-700">
                <p><strong>Value Proposition:</strong> {proposal.strategy?.valueProposition}</p>
                <p><strong>Campaign Angle:</strong> {proposal.strategy?.angle}</p>
                <p><strong>Channel:</strong> {proposal.strategy?.recommendedChannel}</p>
                <p><strong>Bidding Strategy:</strong> {proposal.strategy?.biddingStrategy}</p>
                <p><strong>Call To Action:</strong> {proposal.strategy?.cta}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Strategy details will appear once the proposal is generated.</p>
            )}
          </div>
        )}

        {/* Tab Content 3: Ads */}
        {activeTab === 'ads' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Search Headlines & Ad Variations</h3>
            {proposal?.copy ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-900 mb-2">Headlines</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {proposal.copy?.headlines?.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <h4 className="font-bold text-slate-900 mb-2">Descriptions</h4>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    {proposal.copy?.descriptions?.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Ad copy will appear once the proposal is generated.</p>
            )}
          </div>
        )}

        {/* Tab Content 4: Creatives */}
        {activeTab === 'creatives' && (
          <div>
            {proposal?.creatives && proposal.creatives.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {proposal.creatives.map((crt) => (
                  <div key={crt.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-4 space-y-3">
                    <img src={crt.generatedImageUrl} alt={crt.title} className="w-full h-48 object-contain bg-slate-950 rounded-xl" />
                    <h4 className="font-bold text-slate-900 text-xs">{crt.title}</h4>
                    <p className="text-[11px] text-slate-600">"{crt.hookText}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                No visual creatives attached yet. Visit the Creative Studio to generate Gemini visuals.
              </div>
            )}
          </div>
        )}

        {/* Tab Content 5: Performance */}
        {activeTab === 'performance' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Performance Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-medium">CPC</span>
                <p className="font-bold text-slate-900 text-base mt-0.5">CAD ${campaign.metrics?.cpc || 0}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-medium">CTR</span>
                <p className="font-bold text-slate-900 text-base mt-0.5">{campaign.metrics?.ctr || 0}%</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-medium">Conversion Rate</span>
                <p className="font-bold text-slate-900 text-base mt-0.5">{campaign.metrics?.conversionRate || 0}%</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-medium">Total Spend</span>
                <p className="font-bold text-slate-900 text-base mt-0.5">CAD ${campaign.metrics?.spend || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 6: Audit Log */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Campaign Changes & Audit Trail</h3>
            <div className="space-y-3">
              {auditLogs.filter(l => l.campaignId === campaign.id).length === 0 ? (
                <p className="text-xs text-slate-500">No specific audit logs for this campaign yet.</p>
              ) : (
                auditLogs.filter(l => l.campaignId === campaign.id).map(log => (
                  <div key={log.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs flex justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{log.agentName || log.userName || 'System'}</span>
                      <p className="text-slate-700 font-medium">{log.action}</p>
                      <p className="text-[11px] text-slate-500">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
