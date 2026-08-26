'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Globe,
  PlusCircle,
  Calendar,
  FileText,
  Clock,
  Send,
  AlertCircle,
  BarChart3,
} from 'lucide-react';

interface SubNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

const navItems: SubNavItem[] = [
  { name: 'Overview', href: '/social', icon: LayoutDashboard },
  { name: 'Social Accounts', href: '/social/accounts', icon: Globe },
  { name: 'Create Post', href: '/social/create', icon: PlusCircle, highlight: true },
  { name: 'Calendar', href: '/social/calendar', icon: Calendar },
  { name: 'Drafts', href: '/social/drafts', icon: FileText },
  { name: 'Scheduled', href: '/social/scheduled', icon: Clock },
  { name: 'Published', href: '/social/published', icon: Send },
  { name: 'Failed', href: '/social/failed', icon: AlertCircle },
  { name: 'Analytics', href: '/social/analytics', icon: BarChart3 },
];

export function SocialSubNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 border-b border-slate-200">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || (item.href !== '/social' && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 cursor-pointer btn-press ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25 scale-102'
                : item.highlight
                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : ''}`} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
