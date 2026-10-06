import React, { useState, useEffect } from 'react';
import { UserProfile, UserSettings } from '../../types';
import { storageService } from '../../services/storageService';
import { notificationService } from '../../services/notificationService';
import { soundService } from '../../services/soundService';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { UserAvatar } from '../common/UserAvatar';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import {
  User,
  Bell,
  Sun,
  Moon,
  Shield,
  Volume2,
  RefreshCw,
  LogOut,
  Check,
  AlertTriangle,
  PlayCircle,
  Smartphone,
  Save,
} from 'lucide-react';

interface SettingsViewProps {
  currentTheme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentTheme,
  onThemeChange,
  onLogout,
}) => {
  const [user, setUser] = useState<UserProfile>(storageService.getUser());
  const [settings, setSettings] = useState<UserSettings>(storageService.getSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Profile form state
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [age, setAge] = useState(user.age?.toString() || '64');
  const [emergName, setEmergName] = useState(user.emergencyContact?.name || '');
  const [emergPhone, setEmergPhone] = useState(user.emergencyContact?.phone || '');
  const [emergRel, setEmergRel] = useState(user.emergencyContact?.relation || '');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserProfile = {
      ...user,
      name,
      email,
      age: parseInt(age, 10) || undefined,
      emergencyContact: {
        name: emergName,
        phone: emergPhone,
        relation: emergRel,
      },
    };
    storageService.setUser(updatedUser);
    setUser(updatedUser);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleToggleSound = () => {
    const nextVal = !settings.soundEnabled;
    storageService.updateSettings({ soundEnabled: nextVal });
    setSettings((prev) => ({ ...prev, soundEnabled: nextVal }));
    if (nextVal) {
      soundService.playReminderChime();
    }
  };

  const handleTestSound = () => {
    soundService.playReminderChime();
  };

  const handleTogglePush = async () => {
    if (!settings.pushNotifications) {
      const granted = await notificationService.requestPermission();
      storageService.updateSettings({ pushNotifications: granted });
      setSettings((prev) => ({ ...prev, pushNotifications: granted }));
    } else {
      storageService.updateSettings({ pushNotifications: false });
      setSettings((prev) => ({ ...prev, pushNotifications: false }));
    }
  };

  const handleResetData = () => {
    storageService.resetToDemoData();
    setResetDone(true);
    setShowResetConfirm(false);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Profile & System Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your patient account, notification preferences, sound alerts, and privacy.
        </p>
      </div>

      {/* Success banner */}
      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Section 1: User Profile */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Personal Information
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-4 mb-3">
            <UserAvatar name={name || user.name} role={user.role} size="xl" />
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{name || user.name}</p>
              <p className="text-[11px] text-slate-400 capitalize">Role: {user.role}</p>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  Initials Monogram Avatar (Photo Removed)
                </span>
                {user.authProvider === 'google' && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Google Signed-In
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">
              Emergency Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={emergName}
                  onChange={(e) => setEmergName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={emergPhone}
                  onChange={(e) => setEmergPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Relationship</label>
                <input
                  type="text"
                  value={emergRel}
                  onChange={(e) => setEmergRel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </form>
      </div>

      {/* Section 2: Notifications & Reminders */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
          <Bell className="w-5 h-5 text-teal-600" />
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Notifications & Reminder Alerts
          </h3>
        </div>

        <div className="space-y-4 text-xs">
          {/* Push notification toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200">
                Browser Push Notifications
              </h4>
              <p className="text-slate-400 mt-0.5">
                Display native alert pop-ups when scheduled medicines are due.
              </p>
            </div>
            <button
              onClick={handleTogglePush}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.pushNotifications ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.pushNotifications ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Sound toggle + Test sound button */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-blue-500" />
                <span>Audio Reminder Chimes</span>
              </h4>
              <p className="text-slate-400 mt-0.5">
                Play gentle harmonic chime when dose modal appears or is taken.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleTestSound}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-white"
              >
                Test Sound
              </button>
              <button
                onClick={handleToggleSound}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.soundEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Snooze & Missed Alert Configurations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Default Snooze Interval
              </label>
              <select
                value={settings.snoozeDurationMinutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  storageService.updateSettings({ snoozeDurationMinutes: val });
                  setSettings((prev) => ({ ...prev, snoozeDurationMinutes: val }));
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes (Recommended)</option>
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Missed Dose Alert Window
              </label>
              <select
                value={settings.missedDoseAlertMinutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  storageService.updateSettings({ missedDoseAlertMinutes: val });
                  setSettings((prev) => ({ ...prev, missedDoseAlertMinutes: val }));
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value={30}>30 minutes past scheduled time</option>
                <option value={45}>45 minutes past scheduled time</option>
                <option value={60}>60 minutes past scheduled time</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Appearance & Theme */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
          <Sun className="w-5 h-5 text-amber-500" />
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Appearance</h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light Mode', icon: Sun },
            { id: 'dark', label: 'Dark Mode', icon: Moon },
            { id: 'system', label: 'System Default', icon: Smartphone },
          ].map((th) => {
            const Icon = th.icon;
            const isSelected = settings.theme === th.id;
            return (
              <button
                key={th.id}
                onClick={() => {
                  storageService.updateSettings({ theme: th.id as any });
                  setSettings((prev) => ({ ...prev, theme: th.id as any }));
                  onThemeChange(th.id as any);
                }}
                className={`p-4 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-2 transition ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{th.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 4: PWA Installation & Privacy / Reset */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Shield className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            PWA & Data Privacy
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">Progressive Web App (PWA)</h4>
            <p className="text-slate-400 mt-0.5">
              Install MediSync on iOS, Android, or desktop for instant offline access and notifications.
            </p>
          </div>
          <PWAInstallButton />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs">
          <div>
            <h4 className="font-bold text-rose-800 dark:text-rose-200">Reset Demo Data</h4>
            <p className="text-rose-600 dark:text-rose-400 mt-0.5">
              Re-populate realistic medicines (Metformin, Lisinopril, Vitamin D3, Aspirin) and 14 days of compliance logs.
            </p>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold active:scale-95 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Data</span>
          </button>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-rose-600 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of MediSync</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showResetConfirm}
        title="Reset Demo Data"
        message="Are you sure you want to reset the application? This will re-populate realistic demo medicines and 14 days of compliance logs."
        confirmLabel="Reset Demo Data"
        cancelLabel="Cancel"
        onConfirm={handleResetData}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
