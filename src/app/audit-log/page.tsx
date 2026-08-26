'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { AuditLog } from '../../lib/types';
import { Bot, User, RefreshCw } from 'lucide-react';

function getApiOperationBadge(log: AuditLog) {
  if (log.apiOperation && log.apiOperation !== 'N/A') {
    return log.apiOperation;
  }
  const actionLower = (log.action || '').toLowerCase();
  const agentLower = (log.agentName || '').toLowerCase();
  
  if (actionLower.includes('gemini') || agentLower.includes('creative')) {
    return 'Google Gemini API (gemini-3.6-flash)';
  }
  if (actionLower.includes('openai') || actionLower.includes('dall-e')) {
    return 'OpenAI API (gpt-4o / DALL-E 3)';
  }
  if (actionLower.includes('pipeline') || actionLower.includes('proposal')) {
    return 'AI Multi-Agent Pipeline (6 Agents)';
  }
  if (actionLower.includes('brief') || actionLower.includes('campaign')) {
    return 'POST /api/campaigns (Prisma Engine)';
  }
  if (actionLower.includes('google ads') || actionLower.includes('launch') || actionLower.includes('approv')) {
    return 'Google Ads API v18 (CampaignService)';
  }
  if (actionLower.includes('client')) {
    return 'Prisma Client / SQLite Engine';
  }
  return 'Agent AI Core API';
}

export default function AuditLogPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('/api/audit-logs');
        if (res.ok) setAuditLogs(await res.json());
      } catch (err) {
        console.error('Error fetching audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            System Audit Log
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Immutable audit trail of all human decisions, AI agent activities, and advertising API operations.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading audit log entries from database...</span>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Actor</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Campaign</th>
                    <th className="py-3.5 px-4">API Operation</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {auditLogs.map((log) => {
                    const apiOp = getApiOperationBadge(log);
                    return (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            {log.agentName ? (
                              <Bot className="w-3.5 h-3.5 text-purple-600" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-blue-600" />
                            )}
                            <span>{log.agentName || log.userName || 'System'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{log.action}</td>
                        <td className="py-3.5 px-4 text-slate-600">{log.campaignName || 'System'}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-semibold border border-blue-100/60">
                            {apiOp}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
