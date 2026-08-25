'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth/auth-context';
import {
  LayoutDashboard,
  Megaphone,
  PlusCircle,
  Bot,
  CheckCircle2,
  CheckSquare,
  Sparkles,
  BarChart3,
  Building2,
  Link2,
  Users,
  Settings,
  Shield,
  LogOut,
  FileText,
  User,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, role, signOut, isAuthenticated } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const showAdminTeam = mounted ? role === 'ADMIN' : true;

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
    { name: 'Create Campaign', href: '/campaigns/create', icon: PlusCircle, highlight: true },
    { name: 'AI Agents', href: '/ai-agents', icon: Bot },
    { name: 'Approvals', href: '/approvals', icon: CheckCircle2, badge: '1' },
    { name: 'Creative Studio', href: '/creative-studio', icon: Sparkles },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Clients', href: '/clients', icon: Building2 },
    { name: 'Connections', href: '/connections', icon: Link2 },
    { name: 'Audit Log', href: '/audit-log', icon: FileText },
    ...(showAdminTeam ? [{ name: 'Admin Team', href: '/admin/team', icon: Shield }] : []),
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 z-30 select-none shadow-xs">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            A
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-lg tracking-tight">Agent AI</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                Internal
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Marketing Automation</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-100/80 shadow-2xs'
                  : item.highlight
                  ? 'bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-sm shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : item.highlight ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Active Connections Card */}
      <div className="px-4 py-3 mx-3 my-2 bg-slate-50 rounded-xl border border-slate-200/80">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <span>Active Connections</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="px-1.5 py-0.5 rounded bg-blue-100/60 text-blue-700 font-medium text-[10px]">Google Ads</span>
          <span className="px-1.5 py-0.5 rounded bg-purple-100/60 text-purple-700 font-medium text-[10px]">OpenAI</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-100/60 text-amber-700 font-medium text-[10px]">Gemini</span>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-200 bg-white">
        {profile ? (
          <div className="p-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white shadow-2xs">
            <Link href="/profile" className="flex items-center gap-3 group">
              <img
                src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`}
                alt={profile.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    {profile.name}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 font-semibold rounded ${
                      profile.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {profile.role}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">@{profile.username}</p>
              </div>
            </Link>
          </div>
        ) : (
          <div className="p-2 text-xs text-slate-500 text-center">Not signed in</div>
        )}

        <button
          onClick={handleSignOut}
          className="mt-2 flex items-center justify-center gap-2 w-full py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
