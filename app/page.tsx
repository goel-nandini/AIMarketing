'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  TrendingUp, 
  BookOpen, 
  Receipt, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Code2, 
  Megaphone, 
  Users, 
  Layers, 
  DollarSign, 
  Lock, 
  Terminal, 
  ExternalLink 
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20">
              CK
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">CodeKap <span className="text-blue-500 font-mono">OS</span></span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800">
                v1.0 Internal
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Platform Modules</a>
            <a href="#crm" className="hover:text-white transition-colors">Sales CRM</a>
            <a href="#sops" className="hover:text-white transition-colors">SOP Engine</a>
            <a href="#finance" className="hover:text-white transition-colors">GST Finance</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="px-3.5 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-900 text-slate-300 text-xs font-semibold transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5"
            >
              <span>Join Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-800/80 text-blue-400 text-xs font-semibold mb-6 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Internal Business Operating System • CodeKap Technologies</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl text-white leading-tight mb-6">
          One Operating System to Run <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">All of CodeKap</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl font-normal leading-relaxed mb-10">
          Centralize sales CRM, client projects, employee daily work logs, SOP playbooks, department workspaces, GST invoicing, and executive reporting in one unified platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <Link
            href="/signin"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>Log In to Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/signup"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-slate-400" />
            <span>Join with Passcode</span>
          </Link>
        </div>

        {/* Passcode Quick Hint */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span>Active Super Admin Passcode:</span>
          <span className="font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">AGENT-7788</span>
        </div>

        {/* Live UI Platform Preview Card */}
        <div className="mt-16 w-full max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-4 sm:p-6 shadow-2xl text-left">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 font-mono text-xs text-slate-400">codekap-os.internal/dashboard</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
              ● All Systems Operational
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Billed Revenue</span>
              <div className="text-xl font-extrabold text-white">₹12,50,000</div>
              <span className="text-[10px] text-emerald-400">✓ Invoices Realized</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Projects</span>
              <div className="text-xl font-extrabold text-blue-400">4 Active</div>
              <span className="text-[10px] text-slate-400">100% On Track</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Sales Leads</span>
              <div className="text-xl font-extrabold text-purple-400">6 Pipeline Deals</div>
              <span className="text-[10px] text-purple-400">₹10.5L Est. Value</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Team Efficiency</span>
              <div className="text-xl font-extrabold text-emerald-400">94.8% Score</div>
              <span className="text-[10px] text-slate-400">Daily Work Logs Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-20 border-t border-slate-800/80 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Purpose-Built for Modern Tech & Agency Operations
            </h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Eliminate manual update messages and fragmented spreadsheets. Everything from first lead touchpoint to GST tax filing is tracked automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Sales CRM & Pipeline</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Excel-style lead directory, 7-stage drag/move Kanban board, phone follow-up reminders, and 1-click conversion to Won & Project setup.
                </p>
              </div>
              <span className="text-xs font-semibold text-blue-400 mt-4 flex items-center gap-1">
                7 Pipeline Stages Included →
              </span>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">SOP Engine & Checklists</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Standard Operating Procedures with step-by-step checklists, mandatory completion proof, expected duration, and task generation.
                </p>
              </div>
              <span className="text-xs font-semibold text-purple-400 mt-4 flex items-center gap-1">
                Standard Playbooks Ready →
              </span>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <Receipt className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">GST Invoices & Razorpay</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  GST-compliant invoicing with CGST/SGST/IGST breakdown, printable tax invoices, Razorpay UPI links, and GSTR-1/GSTR-3B audit reports.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-400 mt-4 flex items-center gap-1">
                Statutory GST Ready →
              </span>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Development Workspace</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Engineering repository trackers, Next.js architecture builds, QA test coverage, and sprint blocker monitoring for tech leads.
                </p>
              </div>
              <span className="text-xs font-semibold text-cyan-400 mt-4 flex items-center gap-1">
                Dev Velocity Tracking →
              </span>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-pink-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4">
                  <Megaphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Digital Marketing Hub</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ad budget management, Meta Reels, Google Ads tracking, CPA optimization, and Multi-modal AI Creative Studio for banner production.
                </p>
              </div>
              <span className="text-xs font-semibold text-pink-400 mt-4 flex items-center gap-1">
                AI Creative Studio →
              </span>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Role-Based Security Guard</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Super Admin role authority (Aman Sir), Department Heads, Employee access boundaries, and complete real-time audit logging.
                </p>
              </div>
              <span className="text-xs font-semibold text-amber-400 mt-4 flex items-center gap-1">
                Enterprise Access Control →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">CodeKap OS v1.0</span>
            <span>•</span>
            <span>Internal Business Operating System</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/signin" className="hover:text-slate-300">Sign In</Link>
            <Link href="/signup" className="hover:text-slate-300">Join Workspace</Link>
            <Link href="/dashboard" className="hover:text-slate-300">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
