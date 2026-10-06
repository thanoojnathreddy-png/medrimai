import React from 'react';
import {
  LayoutDashboard,
  Pill,
  PlusCircle,
  CalendarDays,
  FileText,
  History,
  TrendingUp,
  Users2,
  Bot,
  Bell,
  Settings,
  ShieldCheck,
  Flame,
  LogOut,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { UserAvatar } from './UserAvatar';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  const user = storageService.getUser();
  const adherenceRate = storageService.getOverallAdherence();
  const streak = storageService.getStreakDays();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'medicines', label: 'My Medicines', icon: Pill },
    { id: 'add-medicine', label: 'Add Medicine', icon: PlusCircle, badge: 'New' },
    { id: 'schedule', label: 'Schedule', icon: CalendarDays },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
    { id: 'history', label: 'Medication History', icon: History },
    { id: 'adherence', label: 'Adherence', icon: TrendingUp },
    { id: 'caregiver', label: 'Caregiver', icon: Users2 },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, isAi: true },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md h-screen sticky top-0">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100 dark:border-slate-800/80">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-teal-400 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/25">
            M
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
              MediSync
            </span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              PRO
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Smart Health Routine</p>
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive
                      ? 'text-white'
                      : item.isAi
                      ? 'text-purple-500 dark:text-purple-400'
                      : 'text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && !isActive && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                  {item.badge}
                </span>
              )}
              {item.isAi && !isActive && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  AI
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Patient Health Adherence Widget at bottom of sidebar */}
      <div className="p-4 mx-3 mb-3 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-800/50 dark:to-blue-950/20 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Adherence</span>
          </div>
          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
            {adherenceRate}%
          </span>
        </div>

        {/* Mini progress bar */}
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-2.5">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${adherenceRate}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            {streak} Day Streak
          </span>
          <button
            onClick={() => onNavigate('adherence')}
            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Insights →
          </button>
        </div>
      </div>

      {/* User Quick Switch & Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <UserAvatar name={user.name} role={user.role} size="sm" />
          <div className="truncate text-left">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {user.name}
            </p>
            <p className="text-[10px] text-slate-400 capitalize truncate">{user.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          title="Sign out / Exit to Landing Page"
          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
