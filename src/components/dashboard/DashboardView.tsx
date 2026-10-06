import React, { useState, useEffect } from 'react';
import { UserProfile, MedicationLog } from '../../types';
import { storageService } from '../../services/storageService';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Plus,
  Pill,
  Sparkles,
  Calendar,
  Check,
  ChevronRight,
  Flame,
  Camera,
  PlayCircle,
  BellRing,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DashboardViewProps {
  user: UserProfile;
  onNavigate: (view: string) => void;
  onOpenReminder: (dose: MedicationLog) => void;
  onOpenScanner: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onNavigate,
  onOpenReminder,
  onOpenScanner,
}) => {
  const [todayLogs, setTodayLogs] = useState<MedicationLog[]>([]);
  const [stats, setStats] = useState(storageService.getTodayStats());
  const [streak, setStreak] = useState(storageService.getStreakDays());
  const [overallAdherence, setOverallAdherence] = useState(storageService.getOverallAdherence());

  const refreshData = () => {
    setTodayLogs(storageService.getTodayLogs());
    setStats(storageService.getTodayStats());
    setStreak(storageService.getStreakDays());
    setOverallAdherence(storageService.getOverallAdherence());
  };

  useEffect(() => {
    refreshData();
    return storageService.subscribe(refreshData);
  }, []);

  const handleMarkTaken = (doseId: string) => {
    storageService.markDoseStatus(doseId, 'taken');
    refreshData();
    const updatedStats = storageService.getTodayStats();
    if (updatedStats.upcoming === 0 && updatedStats.missed === 0) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#0D9488', '#10B981', '#F59E0B'],
      });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-[11px] font-semibold text-white mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-200" />
            <span>Today's Medical Routine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {getGreeting()}, {user.name} 👋
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Here’s your medication overview for today. You're doing great!
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('add-medicine')}
            className="flex items-center gap-1.5 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 px-4 py-2.5 text-xs font-bold shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white px-3.5 py-2.5 text-xs font-semibold backdrop-blur-xs transition active:scale-95"
            title="Scan prescription with AI"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Rx</span>
          </button>
        </div>
      </div>

      {/* Top Key Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. Today's Progress */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Today's Progress
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {stats.adherencePercent}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {stats.taken} of {stats.total} doses completed
          </p>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 mt-3 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${stats.adherencePercent}%` }}
            />
          </div>
        </div>

        {/* 2. Today's Medicines */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Today's Medicines
          </span>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.total}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Scheduled for today</p>
        </div>

        {/* 3. Taken */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Taken</span>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.taken}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Completed on time
          </p>
        </div>

        {/* 4. Missed / Pending */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Missed</span>
          <div className="mt-1 flex items-center justify-between">
            <span className={`text-2xl font-black ${stats.missed > 0 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
              {stats.missed}
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stats.missed > 0 ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats.missed > 0 ? 'Review required' : 'Zero missed today'}
          </p>
        </div>

        {/* 5. Overall Adherence & Streak */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Adherence</span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
              <Flame className="w-3.5 h-3.5" /> {streak}d
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-2xl font-black text-teal-600 dark:text-teal-400">
              {overallAdherence}%
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1">
            30-day adherence rate
          </p>
        </div>
      </div>

      {/* Main Grid: Today's Medication Timeline + Quick Insights Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Medication Timeline (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Today's Medication Timeline
              </h3>
              <p className="text-xs text-slate-500">
                Sorted chronologically by scheduled dose time.
              </p>
            </div>
            <button
              onClick={() => onNavigate('schedule')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Full Schedule</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayLogs.length === 0 ? (
            <div className="text-center py-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8">
              <Pill className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">
                No medicines scheduled for today
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Add your active prescriptions and medications to begin receiving automated reminders and adherence tracking.
              </p>
              <button
                onClick={() => onNavigate('add-medicine')}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Medicine
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayLogs.map((dose) => {
                const isTaken = dose.status === 'taken';
                const isMissed = dose.status === 'missed';
                const isSkipped = dose.status === 'skipped';
                const isSnoozed = dose.status === 'snoozed';
                const isUpcoming = dose.status === 'upcoming';

                return (
                  <div
                    key={dose.id}
                    className={`rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
                      isTaken
                        ? 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800/80 opacity-90'
                        : isMissed
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                        : isSnoozed
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                        : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Time + Pill icon + Name & Dosage */}
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="flex flex-col items-center">
                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                            {dose.scheduledTime}
                          </span>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {parseInt(dose.scheduledTime) < 12 ? 'AM' : 'PM'}
                          </span>
                        </div>

                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                            isTaken
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : isMissed
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : isSnoozed
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          <Pill className="w-5 h-5" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                              {dose.medicineName}
                            </h4>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {dose.dosage}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            1 unit · {dose.mealTiming.replace('_', ' ')}
                            {dose.actualTime && ` · Logged at ${dose.actualTime}`}
                            {dose.snoozedUntil && ` · Snoozed until ${dose.snoozedUntil}`}
                          </p>
                        </div>
                      </div>

                      {/* Right: Status badge & Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {isTaken && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                            <Check className="w-3.5 h-3.5" />
                            <span>Taken</span>
                          </span>
                        )}

                        {isMissed && (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Missed</span>
                            </span>
                            <button
                              onClick={() => handleMarkTaken(dose.id)}
                              className="text-xs font-semibold text-blue-600 hover:underline px-2"
                            >
                              Take Now
                            </button>
                          </div>
                        )}

                        {isSkipped && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
                            Skipped
                          </span>
                        )}

                        {(isUpcoming || isSnoozed) && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleMarkTaken(dose.id)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition"
                              title="Mark as Taken"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Mark as</span> Taken
                            </button>
                            <button
                              onClick={() => onOpenReminder(dose)}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="Reminder actions (Snooze / Skip)"
                            >
                              <Clock className="w-3.5 h-3.5 text-blue-500" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side Panel: Adherence Insights & Quick Tools */}
        <div className="space-y-4">
          {/* AI Clinical Assistant Card */}
          <div className="rounded-3xl bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-teal-500/10 border border-purple-200/80 dark:border-purple-900/50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  MediSync AI Assistant
                </h4>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                  Medication Routine Helper
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
              Ask questions about your daily medicines, missed doses, or meal instructions.
            </p>
            <button
              onClick={() => onNavigate('ai-assistant')}
              className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center justify-center gap-1.5 transition"
            >
              <span>Ask AI Assistant</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Caregiver Status Banner */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Caregiver Monitoring
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-semibold">
                Connected
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              David Vance (Caregiver) is receiving automated adherence updates. Missed alerts are active.
            </p>
            <button
              onClick={() => onNavigate('caregiver')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Caregivers</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Adherence Insight Card */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Routine Insights</span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">•</span>
                <span>Your adherence improved by <strong>8%</strong> compared with last week.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500 font-bold">•</span>
                <span>Most on-time doses occur with morning breakfast (9:00 AM).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>Vitamin D3 has 18 capsules left—time to prepare a refill.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
