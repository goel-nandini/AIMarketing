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
  ChevronDown,
  Clock,
  Activity,
  Share2,
  Send,
  AlertCircle,
  BarChart3,
  PlusCircle,
  Globe,
  MessageSquare,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
}

interface NavGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
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
      id: 'management',
      label: 'Management',
      icon: LayoutDashboard,
      items: [
        { name: 'Owner Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'KAIRO Team Chat', href: '/chat', icon: MessageSquare, badge: 'Real-time', highlight: true },
        { name: 'Screen Time & Activity', href: '/analytics/screen-time', icon: Clock, badge: 'Live' },
        { name: 'Notifications', href: '/notifications', icon: Bell },
        { name: 'Audit / Activity Log', href: '/audit-log', icon: FileText },
      ],
    },
    {
      id: 'crm',
      label: 'Sales & CRM',
      icon: TrendingUp,
      items: [
        { name: 'Leads Directory', href: '/crm/leads', icon: TrendingUp },
        { name: 'Sales Pipeline (Kanban)', href: '/crm/pipeline', icon: Layers },
        { name: 'Follow-ups & Next Actions', href: '/crm/follow-ups', icon: Calendar },
      ],
    },
    {
      id: 'team',
      label: 'Organization & Team',
      icon: Users,
      items: [
        { name: 'Employees & Workload', href: '/employees', icon: Users },
        { name: 'Departments', href: '/departments', icon: Briefcase },
        ...(isAdmin ? [{ name: 'Passcodes & Invites', href: '/admin/team', icon: Shield }] : []),
      ],
    },
    {
      id: 'projects',
      label: 'Clients & Projects',
      icon: Briefcase,
      items: [
        { name: 'Client Business Hub', href: '/clients', icon: Building2 },
        { name: 'Projects & Milestones', href: '/projects', icon: Briefcase },
        { name: 'My Tasks', href: '/tasks', icon: CheckSquare },
        { name: 'Daily Work Logs', href: '/work-logs', icon: FileCheck2 },
        { name: 'Company Calendar', href: '/calendar', icon: Calendar },
      ],
    },
    {
      id: 'social',
      label: 'KAIRO Social',
      icon: Share2,
      items: [
        { name: 'Overview', href: '/social', icon: LayoutDashboard },
        { name: 'Social Accounts', href: '/social/accounts', icon: Globe },
        { name: 'Create Post', href: '/social/create', icon: PlusCircle, highlight: true },
        { name: 'Calendar', href: '/social/calendar', icon: Calendar },
        { name: 'Drafts', href: '/social/drafts', icon: FileText },
        { name: 'Scheduled', href: '/social/scheduled', icon: Clock, badge: 'Live' },
        { name: 'Published', href: '/social/published', icon: Send },
        { name: 'Failed', href: '/social/failed', icon: AlertCircle },
        { name: 'Analytics', href: '/social/analytics', icon: BarChart3 },
      ],
    },
    {
      id: 'workspaces',
      label: 'SOPs & Workspaces',
      icon: Sparkles,
      items: [
        { name: 'SOP Library & Builder', href: '/sop', icon: BookOpen },
        { name: 'Development Workspace', href: '/workspaces/dev', icon: Code2 },
        { name: 'Marketing Workspace', href: '/workspaces/marketing', icon: Megaphone },
        { name: 'Creative AI Studio', href: '/creative-studio', icon: Sparkles },
      ],
    },
    {
      id: 'finance',
      label: 'Finance & GST Billing',
      icon: Receipt,
      items: [
        { name: 'Finance Overview', href: '/finance', icon: DollarSign },
        { name: 'Quotations', href: '/finance/quotations', icon: Receipt },
        { name: 'Invoices & Payments', href: '/finance/invoices', icon: Receipt },
        { name: 'Company Expenses', href: '/finance/expenses', icon: Wallet },
        { name: 'GST & Business Reports', href: '/finance/reports', icon: PieChart },
      ],
    },
    {
      id: 'system',
      label: 'System & Config',
      icon: Settings,
      items: [
        { name: 'Platform Settings', href: '/settings', icon: Settings },
      ],
    },
  ];

  // Open/collapsed states with smooth transitions
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({
    management: true,
    social: true,
    crm: false,
    team: false,
    projects: false,
    workspaces: false,
    finance: false,
    system: false,
  });

  // Auto-expand active group with smooth recognition
  React.useEffect(() => {
    if (!pathname) return;
    for (const group of navGroups) {
      const hasActiveChild = group.items.some(
        (item) => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
      );
      if (hasActiveChild) {
        setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
      }
    }
  }, [pathname]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-30 select-none shadow-2xs">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 font-extrabold text-lg shadow-md shadow-slate-900/15 group-hover:scale-105 transition-transform duration-200 ease-out border border-slate-800">
            K
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-base tracking-tight group-hover:text-blue-600 transition-colors duration-200">
                CodeKap OS
              </span>
              <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Business Operating System</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 text-slate-700 custom-scrollbar">
        {navGroups.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = !!openGroups[group.id];
          const hasActiveChild = group.items.some(
            (item) => pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
          );

          return (
            <div key={group.id} className="rounded-xl overflow-hidden transition-all duration-200">
              {/* Group Collapsible Button */}
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 text-left cursor-pointer btn-press ${
                  hasActiveChild
                    ? 'bg-blue-50/80 text-blue-900 font-extrabold border border-blue-100/70 shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                      hasActiveChild
                        ? 'bg-blue-600 text-white shadow-2xs scale-102'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <GroupIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{group.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-full">
                    {group.items.length}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-250 ease-out ${
                      isOpen ? 'rotate-180 text-slate-700' : 'rotate-0'
                    }`}
                  />
                </div>
              </button>

              {/* Sub-items list with smooth slide-and-fade animation */}
              {isOpen && (
                <div className="pl-3 pr-1 pt-1 pb-1.5 space-y-0.5 border-l-2 border-slate-100 ml-5.5 my-1 animate-accordion">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/dashboard' && pathname?.startsWith(item.href));

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 btn-press ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100/80 shadow-2xs'
                            : item.highlight
                            ? 'bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-sm shadow-blue-600/20'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <ItemIcon
                            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${
                              isActive
                                ? 'text-blue-600'
                                : item.highlight
                                ? 'text-white'
                                : 'text-slate-400 group-hover:text-slate-600'
                            }`}
                          />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800 shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-200 bg-white">
        {profile ? (
          <div className="p-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 bg-white shadow-2xs card-lift">
            <Link href="/profile" className="flex items-center gap-2.5 group">
              <img
                src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`}
                alt={profile.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition-transform duration-200"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors duration-200">
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
          className="mt-1.5 flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors duration-200 cursor-pointer btn-press"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
