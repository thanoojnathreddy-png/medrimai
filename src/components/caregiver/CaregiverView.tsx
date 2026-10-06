import React, { useState, useEffect } from 'react';
import { CaregiverLink } from '../../types';
import { storageService } from '../../services/storageService';
import { UserAvatar } from '../common/UserAvatar';
import {
  Users2,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Send,
  Heart,
  Plus,
  ShieldCheck,
  Bell,
  Clock,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';

export const CaregiverView: React.FC = () => {
  const [caregivers, setCaregivers] = useState<CaregiverLink[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [caregiverName, setCaregiverName] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [nudgeSent, setNudgeSent] = useState(false);

  const currentUser = storageService.getUser();
  const isCaregiverRole = currentUser.role === 'caregiver';

  const todayStats = storageService.getTodayStats();
  const overallRate = storageService.getOverallAdherence();
  const recentLogs = storageService.getTodayLogs();

  const refreshList = () => {
    setCaregivers(storageService.getCaregivers());
  };

  useEffect(() => {
    refreshList();
    return storageService.subscribe(refreshList);
  }, []);

  const handleCreateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    storageService.createCaregiverInvite(inviteEmail, caregiverName);
    setInviteEmail('');
    setCaregiverName('');
    refreshList();
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSendCaregiverNudge = () => {
    setNudgeSent(true);
    storageService.addNotification({
      type: 'caregiver',
      title: 'Caregiver Nudge ❤️',
      message: `${currentUser.name} sent you a gentle reminder to take your evening medication on time!`,
      read: false,
    });
    setTimeout(() => setNudgeSent(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Caregiver Network & Monitoring
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Keep family members, nurses, and caregivers aligned on medication progress and missed doses.
          </p>
        </div>

        {/* Quick Role Switcher */}
        <button
          onClick={() => {
            const next = isCaregiverRole ? 'patient' : 'caregiver';
            storageService.switchRole(next);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-blue-500 shadow-xs transition"
        >
          <Users2 className="w-4 h-4 text-teal-600" />
          <span>Switch View: {isCaregiverRole ? 'Show Patient View' : 'Show Caregiver View'}</span>
        </button>
      </div>

      {/* Role Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 sm:p-7 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">
            {isCaregiverRole ? 'Caregiver Oversight Mode' : 'Patient Delegation Mode'}
          </span>
          <h3 className="text-xl font-extrabold mt-1">
            {isCaregiverRole
              ? "Monitoring Patient: Eleanor Vance (Mother)"
              : 'Authorized Caregivers & Family Links'}
          </h3>
          <p className="text-xs text-teal-100 mt-1 max-w-xl">
            {isCaregiverRole
              ? 'You receive real-time adherence updates and automated notifications if scheduled doses are missed.'
              : 'You control what information caregivers can access. Only adherence trends and missed dose notices are shared.'}
          </p>
        </div>

        {isCaregiverRole && (
          <button
            onClick={handleSendCaregiverNudge}
            disabled={nudgeSent}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-teal-700 hover:bg-teal-50 font-bold text-xs shadow-md transition active:scale-95 shrink-0"
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>{nudgeSent ? 'Nudge Dispatched!' : 'Send Encouragement Nudge'}</span>
          </button>
        )}
      </div>

      {/* Caregiver Oversight Dashboard (Patient Status Card) */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <UserAvatar name="Eleanor Vance" role="patient" size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Eleanor Vance
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Active Patient
                </span>
              </div>
              <p className="text-xs text-slate-500">Age: 64 · Daily Regimens: 4 active medications</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Adherence Score</span>
            <p className="text-2xl font-black text-teal-600 dark:text-teal-400">
              {overallRate}%
            </p>
          </div>
        </div>

        {/* Top 3 Quick Patient Status Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-semibold">Today's Completion</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {todayStats.taken} / {todayStats.total} doses
            </p>
            <p className="text-[11px] text-emerald-600 mt-0.5">
              {todayStats.adherencePercent}% completed
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-semibold">Missed Doses</span>
            <p className={`text-2xl font-black mt-1 ${todayStats.missed > 0 ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
              {todayStats.missed}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {todayStats.missed > 0 ? 'Missed dose alert sent' : 'Zero missed today'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-semibold">Consecutive Streak</span>
            <p className="text-2xl font-black text-amber-500 mt-1">
              {storageService.getStreakDays()} Days 🔥
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Gold tier compliance</p>
          </div>
        </div>

        {/* Missed Dose Alert Example as required by prompt */}
        {todayStats.missed > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h5 className="font-bold text-xs text-rose-900 dark:text-rose-200">
                  ⚠️ Evening dose missed
                </h5>
                <p className="text-[11px] text-rose-700 dark:text-rose-300">
                  Aspirin Cardio was not logged by 8:45 PM. You can send a check-in message.
                </p>
              </div>
            </div>
            <button
              onClick={handleSendCaregiverNudge}
              className="text-xs font-bold text-rose-700 dark:text-rose-300 hover:underline px-3 py-1"
            >
              Send Reminder
            </button>
          </div>
        )}

        {/* Recent Medication Activity */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Today's Activity Log
          </h4>
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                    {log.scheduledTime}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {log.medicineName}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-1.5">({log.dosage})</span>
                  </div>
                </div>

                <div>
                  {log.status === 'taken' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Taken at {log.actualTime || log.scheduledTime}
                    </span>
                  ) : log.status === 'missed' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                      <AlertTriangle className="w-3.5 h-3.5" /> Missed
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400">
                      Upcoming ({log.mealTiming.replace('_', ' ')})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invite Caregiver Form & Linked Caregivers List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Invite Form */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-1">
            Invite a Caregiver
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Authorize a family member, doctor, or nurse with a secure code or email invitation.
          </p>

          <form onSubmit={handleCreateInvite} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Caregiver Name</label>
              <input
                type="text"
                placeholder="e.g. David Vance"
                value={caregiverName}
                onChange={(e) => setCaregiverName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="caregiver@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition active:scale-95"
            >
              Generate Invite & Code
            </button>
          </form>
        </div>

        {/* Right: Active Caregivers List */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-1">
            Linked Caregivers ({caregivers.length})
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Caregivers currently connected to this medication regimen.
          </p>

          <div className="space-y-3">
            {caregivers.map((cg) => (
              <div
                key={cg.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {cg.caregiverName}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cg.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {cg.status}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-0.5">{cg.caregiverEmail}</p>

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                    <span>Adherence View: ✅</span>
                    <span>Missed Alerts: ✅</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {cg.inviteCode}
                  </div>
                  <button
                    onClick={() => handleCopyCode(cg.inviteCode)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300"
                    title="Copy Invite Code"
                  >
                    {copiedCode === cg.inviteCode ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
