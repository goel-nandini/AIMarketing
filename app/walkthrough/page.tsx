'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Bot, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Building2,
  Lock,
  Layers
} from 'lucide-react';

export default function WalkthroughPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 md:p-12">
      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-600/20">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-xl tracking-tight">Agent AI</span>
              <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                Internal Tool
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Human-in-the-Loop AI Marketing Automation</p>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all"
        >
          <span>Team Login</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Main Hero & Workflow Cards */}
      <main className="max-w-5xl mx-auto w-full py-12 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Internal Campaign Automation System</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            One platform to research, plan, approve & launch client campaigns.
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Provide advertising requirements, let specialized AI agents prepare research, strategy, copy, and creatives, review the recommendation, set the budget, and launch directly.
          </p>
        </div>

        {/* 3 Step Card Process */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-5 border border-blue-100">
              01
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Input Client Brief</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Select client (e.g. G1 Sphere / iCare in Toronto), choose objective, location, and set target budget parameters.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 pt-3 border-t border-slate-100">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>G1 Sphere / iCare (Toronto, Canada)</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg mb-5 border border-purple-100">
              02
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">8 AI Agents Execute</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Research, Audience, Strategy, Copy, Creative, Image/Video, and Quality Control agents generate structured campaign proposals.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 pt-3 border-t border-slate-100">
              <Bot className="w-3.5 h-3.5 text-purple-600" />
              <span>Multi-Agent Orchestration Engine</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-5 border border-emerald-100">
              03
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Human Approval & Launch</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Review AI recommendations, confirm daily budget authorization, and launch directly to Google Ads without manual execution.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 pt-3 border-t border-slate-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Strict Spending Safeguards</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 hover:scale-[1.02] transition-all"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full py-6 border-t border-slate-200/80 text-center text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© 2026 Agent AI Internal Systems — Confidential Team Application</p>
        <div className="flex items-center gap-4 text-slate-500">
          <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-slate-400" /> Role-Based Access</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Layers className="w-3 h-3 text-slate-400" /> DEMO_MODE Active</span>
        </div>
      </footer>
    </div>
  );
}
