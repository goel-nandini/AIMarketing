'use client';

import React from 'react';
import { DashboardLayout } from '../../components/dashboard-layout';
import { Bot, CheckCircle2, Shield, Sparkles } from 'lucide-react';

export default function AIAgentsPage() {
  const agents = [
    { name: 'Research Agent', role: 'Market & Competitor Analysis', provider: 'Gemini', status: 'Active' },
    { name: 'Audience Agent', role: 'Target Demographics & Search Intent', provider: 'OpenAI', status: 'Active' },
    { name: 'Strategy Agent', role: 'Campaign Angle & Value Proposition', provider: 'OpenAI', status: 'Active' },
    { name: 'Copy Agent', role: 'Ad Headlines & Clinical Compliance', provider: 'OpenAI', status: 'Active' },
    { name: 'Creative Agent', role: 'Visual Concepts & Storyboards', provider: 'OpenAI', status: 'Active' },
    { name: 'Image Agent', role: 'Multi-provider Diagnostic Visuals', provider: 'OpenAI / Gemini', status: 'Active' },
    { name: 'Quality Agent', role: 'Health Canada & Budget Safety Check', provider: 'Gemini', status: 'Active' },
    { name: 'Execution Agent', role: 'Idempotent Google Ads API Integration', provider: 'Internal API', status: 'Active' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Agent Architecture
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Overview of specialized AI agents operating under central orchestration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent) => (
            <div key={agent.name} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {agent.status}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{agent.name}</h3>
                <p className="text-xs text-slate-500">{agent.role}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px]">
                <span className="text-slate-400">Provider:</span>
                <span className="font-bold text-slate-700">{agent.provider}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
