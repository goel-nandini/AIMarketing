'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth/auth-context';
import {
  LayoutDashboard,
  Megaphone,
  CheckSquare,
  Sparkles,
  BarChart3,
  Building2,
  Users,
  Settings,
  Shield,
  LogOut,
  FileText,
  Briefcase,
  Layers,
  Calendar,
  BookOpen,
  Code2,
  TrendingUp,
  Receipt,
  FileCheck2,
  DollarSign,
  Wallet,
  PieChart,
  Bell,
  Search,
} from 'lucide-react';

interface NavGroup {
  label: string;
  items: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    highlight?: boolean;
    adminOnly?: boolean;
  }[];
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, role, signOut } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = mounted ? (role === 'ADMIN' || profile?.email === 'aman@codekap.com') : true;

  const navGroups: NavGroup[] = [
    {
      label: 'Management',
      items: [
        { name: 'Owner Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Notifications', href: '/notifications', icon: Bell },
        { name: 'Audit / Activity Log', href: '/audit-log', icon: FileText },
      ],
    },
    {
      label: 'Sales CRM',
      items: [
        { name: 'Leads Directory', href: '/crm/leads', icon: TrendingUp },
        { name: 'Sales Pipeline (Kanban)', href: '/crm/pipeline', icon: Layers },
        { name: 'Follow-ups & Next Actions', href: '/crm/follow-ups', icon: Calendar },
      ],
    },
    {
      label: 'Organization & Team',
      items: [
        { name: 'Employees & Workload', href: '/employees', icon: Users },
        { name: 'Departments', href: '/departments', icon: Briefcase },
        ...(isAdmin ? [{ name: 'Passcodes & Invites', href: '/admin/team', icon: Shield }] : []),
      ],
    },
    {
      label: 'Clients & Projects',
      items: [
        { name: 'Client Business Hub', href: '/clients', icon: Building2 },
        { name: 'Projects & Milestones', href: '/projects', icon: Briefcase },
        { name: 'My Tasks', href: '/tasks', icon: CheckSquare },
        { name: 'Daily Work Logs', href: '/work-logs', icon: FileCheck2 },
        { name: 'Company Calendar', href: '/calendar', icon: Calendar },
      ],
    },
    {
      label: 'SOPs & Workspaces',
      items: [
        { name: 'SOP Library & Builder', href: '/sop', icon: BookOpen },
        { name: 'Development Workspace', href: '/workspaces/dev', icon: Code2 },
        { name: 'Marketing Workspace', href: '/workspaces/marketing', icon: Megaphone },
        { name: 'Creative AI Studio', href: '/creative-studio', icon: Sparkles },
      ],
    },
    {
      label: 'Finance & GST Billing',
      items: [
        { name: 'Finance Overview', href: '/finance', icon: DollarSign },
        { name: 'Quotations', href: '/finance/quotations', icon: Receipt },
        { name: 'Invoices & Payments', href: '/finance/invoices', icon: Receipt },
        { name: 'Company Expenses', href: '/finance/expenses', icon: Wallet },
        { name: 'GST & Business Reports', href: '/finance/reports', icon: PieChart },
      ],
    },
    {
      label: 'System & Config',
      items: [
        { name: 'Platform Settings', href: '/settings', icon: Settings },
      ],
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-30 select-none shadow-xs">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 font-extrabold text-lg shadow-md shadow-slate-900/20 group-hover:scale-105 transition-transform border border-slate-800">
            K
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-base tracking-tight">CodeKap OS</span>
              <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Business Operating System</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-slate-700">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-100/80 shadow-2xs'
                        : item.highlight
                        ? 'bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-sm shadow-blue-600/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : item.highlight ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-200 bg-white">
        {profile ? (
          <div className="p-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white shadow-2xs">
            <Link href="/profile" className="flex items-center gap-2.5 group">
              <img
                src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`}
                alt={profile.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    {profile.name}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 font-semibold rounded shrink-0 ${
                      profile.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {profile.role === 'ADMIN' ? 'Owner' : profile.role}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">@{profile.username || 'aman'}</p>
              </div>
            </Link>
          </div>
        ) : (
          <div className="p-2 text-xs text-slate-500 text-center">Not signed in</div>
        )}

        <button
          onClick={handleSignOut}
          className="mt-1.5 flex items-center justify-center gap-1.5 w-full py-1 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
