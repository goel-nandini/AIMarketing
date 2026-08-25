'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Plus, Shield, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

export function Topbar() {
  const router = useRouter();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const quickSearchItems = [
    { title: 'Jeevansphere Client Profile', category: 'Client', href: '/clients' },
    { title: 'Website Development SOP', category: 'SOP', href: '/sop' },
    { title: 'Performance Marketing Campaign', category: 'Marketing', href: '/workspaces/marketing' },
    { title: 'Tax & GST Invoices', category: 'Finance', href: '/finance/invoices' },
    { title: 'Lead Pipeline Kanban', category: 'CRM', href: '/crm/pipeline' },
  ];

  const filteredItems = quickSearchItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Global Search Bar */}
      <div className="relative w-80">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search leads, projects, invoices, SOPs... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Quick Search Dropdown */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Suggestions
            </div>
            {filteredItems.map((item, idx) => (
              <button
                key={idx}
                onMouseDown={() => router.push(item.href)}
                className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 flex items-center justify-between group cursor-pointer"
              >
                <span className="font-medium text-slate-800 group-hover:text-blue-600">
                  {item.title}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                  {item.category}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* System Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-[11px] font-semibold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>CodeKap Engine Active</span>
        </div>

        {/* Quick Create Dropdown / Button */}
        <Link
          href="/crm/leads"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Lead / Project</span>
        </Link>

        {/* Notifications Icon */}
        <Link
          href="/notifications"
          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5" />
        </Link>
      </div>
    </header>
  );
}
