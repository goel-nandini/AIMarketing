'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  Sparkles, 
  Bot, 
  ExternalLink, 
  RefreshCw,
  Zap,
  Lock
} from 'lucide-react';

export default function ConnectionsPage() {
  const [googleAccounts, setGoogleAccounts] = useState<any[]>([]);
  const [metaAccounts, setMetaAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const [gRes, mRes] = await Promise.all([
          fetch('/api/integrations/google-ads/accounts'),
          fetch('/api/integrations/meta/accounts')
        ]);
        if (gRes.ok) setGoogleAccounts(await gRes.json());
        if (mRes.ok) setMetaAccounts(await mRes.json());
      } catch (err) {
        console.error('Error fetching ad accounts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAccounts();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Advertising API & AI Provider Integrations</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Platform Connections
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Connect your official Google Ads and Meta Ads OAuth 2.0 advertising accounts and server-side AI providers.
          </p>
        </div>

        {/* Ad Platforms Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Google Ads Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Google Ads API</h2>
                  <p className="text-xs text-slate-500">Search, Performance Max & Proximity Criteria</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                CONNECTED
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Official Google Ads OAuth 2.0 integration allowing automated campaign budget creation, ad groups, and search criteria.
            </p>

            {loading ? (
              <div className="p-4 text-center text-xs text-slate-400">Loading accounts...</div>
            ) : (
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Discovered Google Accounts</span>
                {googleAccounts.map(acc => (
                  <div key={acc.customerId} className="flex justify-between py-1 border-b border-slate-200/60 last:border-0">
                    <span className="font-semibold text-slate-800">{acc.accountName}</span>
                    <span className="font-mono text-slate-500">{acc.customerId} ({acc.currency})</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-between items-center border-t border-slate-100">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>OAuth 2.0 Refresh Token Encrypted</span>
              </span>
              <a
                href="/api/integrations/google-ads/connect"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 inline-flex items-center gap-1.5"
              >
                <span>Re-Authenticate Google</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Meta Ads Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Meta Ads API</h2>
                  <p className="text-xs text-slate-500">Instagram Feed, Stories, Reels & Facebook</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                CONNECTED
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Official Meta Marketing API integration establishing ad sets, visual placements, and lead form destinations.
            </p>

            {loading ? (
              <div className="p-4 text-center text-xs text-slate-400">Loading accounts...</div>
            ) : (
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Discovered Meta Ad Accounts</span>
                {metaAccounts.map(acc => (
                  <div key={acc.accountId} className="flex justify-between py-1 border-b border-slate-200/60 last:border-0">
                    <span className="font-semibold text-slate-800">{acc.accountName}</span>
                    <span className="font-mono text-slate-500">{acc.accountId} ({acc.currency})</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-between items-center border-t border-slate-100">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Long-Lived Access Token Encrypted</span>
              </span>
              <a
                href="/api/integrations/meta/connect"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 inline-flex items-center gap-1.5"
              >
                <span>Re-Authenticate Meta</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* AI Providers Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <Bot className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-extrabold text-slate-900">Configured Server-Side AI Providers</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">OpenAI</span>
                <span className="text-[10px] font-bold text-emerald-600">ACTIVE</span>
              </div>
              <p className="text-[11px] text-slate-500">Models: gpt-4o, dall-e-3, sora-v1</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Google Gemini</span>
                <span className="text-[10px] font-bold text-emerald-600">ACTIVE</span>
              </div>
              <p className="text-[11px] text-slate-500">Models: gemini-1.5-pro, imagen-3.0</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">DeepSeek</span>
                <span className="text-[10px] font-bold text-emerald-600">ACTIVE</span>
              </div>
              <p className="text-[11px] text-slate-500">Models: deepseek-chat</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
