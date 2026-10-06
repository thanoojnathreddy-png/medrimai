import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, NotificationItem, MedicationLog } from '../../types';
import { storageService } from '../../services/storageService';
import { PWAInstallButton } from './PWAInstallButton';
import { UserAvatar } from './UserAvatar';
import {
  Bell,
  Search,
  Sun,
  Moon,
  Users,
  User,
  Volume2,
  CheckCircle2,
  AlertCircle,
  X,
  PlayCircle,
  LogOut,
} from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  currentTheme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNavigate: (view: string) => void;
  onTriggerDemoReminder: (dose: MedicationLog) => void;
  onLogout?: () => void;
  onGoogleSignIn?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentTheme,
  onToggleTheme,
  onNavigate,
  onTriggerDemoReminder,
  onLogout,
  onGoogleSignIn,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; type: string }[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      setNotifications(storageService.getNotifications());
    };
    update();
    return storageService.subscribe(update);
  }, []);

  // Handle global search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const meds = storageService.getMedicines()
      .filter((m) => m.name.toLowerCase().includes(q) || m.instructions.toLowerCase().includes(q))
      .map((m) => ({ id: m.id, name: `${m.name} (${m.dosage} ${m.unit})`, type: 'Medicine' }));

    const rxs = storageService.getPrescriptions()
      .filter((p) => p.doctorName.toLowerCase().includes(q) || p.clinicOrHospital.toLowerCase().includes(q))
      .map((p) => ({ id: p.id, name: `${p.doctorName} - ${p.clinicOrHospital}`, type: 'Prescription' }));

    setSearchResults([...meds, ...rxs].slice(0, 5));
  }, [searchQuery]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleTestChimeAndReminder = () => {
    const todayLogs = storageService.getTodayLogs();
    const upcoming = todayLogs.find((l) => l.status === 'upcoming') || todayLogs[0];
    if (upcoming) {
      onTriggerDemoReminder(upcoming);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search medicines, dosages, prescriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full mt-2 w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50">
            <p className="px-3 py-1.5 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Search Results
            </p>
            {searchResults.map((res) => (
              <button
                key={res.id}
                onClick={() => {
                  setSearchQuery('');
                  onNavigate(res.type === 'Medicine' ? 'medicines' : 'prescriptions');
                }}
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs flex items-center justify-between"
              >
                <span className="font-medium text-slate-800 dark:text-slate-200">{res.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                  {res.type}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Branding Text */}
      <div className="md:hidden flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
          M
        </div>
        <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
          MediSync
        </span>
      </div>

      {/* Right Action Icons & Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Test Dose Reminder Trigger (Instant interactive demonstration) */}
        <button
          onClick={handleTestChimeAndReminder}
          title="Simulate / Trigger scheduled dose reminder chime"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 hover:bg-blue-100 transition active:scale-95"
        >
          <PlayCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
          <span>Simulate Dose</span>
        </button>

        {/* Role Switcher (Patient vs Caregiver) */}
        <button
          onClick={() => {
            const nextRole = user.role === 'patient' ? 'caregiver' : 'patient';
            storageService.switchRole(nextRole);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-blue-500 transition"
          title={`Switch role to ${user.role === 'patient' ? 'Caregiver' : 'Patient'}`}
        >
          {user.role === 'patient' ? (
            <>
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Role:</span>
              <span className="font-semibold text-blue-600">Patient</span>
            </>
          ) : (
            <>
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Role:</span>
              <span className="font-semibold text-teal-600">Caregiver</span>
            </>
          )}
        </button>

        {/* PWA Install Button */}
        <PWAInstallButton compact />

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={() => storageService.markAllNotificationsRead()}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Mark all read
                </button>
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400">No notifications yet</p>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        storageService.markNotificationRead(n.id);
                        setShowNotifMenu(false);
                        onNavigate('notifications');
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                        n.read
                          ? 'border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/30'
                          : 'border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                          {n.type === 'missed' ? (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          )}
                          <span>{n.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                      </div>
                      <p className="mt-1 text-slate-600 dark:text-slate-400 line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => {
                    setShowNotifMenu(false);
                    onNavigate('notifications');
                  }}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View All Notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {currentTheme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* User Avatar & Account Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800 hover:opacity-85 transition cursor-pointer"
            title="User Account Menu"
          >
            <UserAvatar name={user.name} role={user.role} size="sm" />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <UserAvatar name={user.name} role={user.role} size="md" />
                <div className="truncate min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  <span className="inline-block mt-0.5 text-[9px] font-bold px-2 py-0.2 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 capitalize">
                    {user.role} Account
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onNavigate('settings');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profile & Settings</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    const nextRole = user.role === 'patient' ? 'caregiver' : 'patient';
                    storageService.switchRole(nextRole);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-teal-500" />
                  <span>Switch to {user.role === 'patient' ? 'Caregiver' : 'Patient'}</span>
                </button>

                {onGoogleSignIn && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onGoogleSignIn();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Switch Google Account</span>
                  </button>
                )}

                {onLogout && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out / Change User</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
