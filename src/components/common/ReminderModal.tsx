import React, { useState } from 'react';
import { MedicationLog } from '../../types';
import { storageService } from '../../services/storageService';
import { Bell, Check, Clock, SkipForward, X, Pill, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReminderModalProps {
  dose: MedicationLog | null;
  onClose: () => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({ dose, onClose }) => {
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [skipReason, setSkipReason] = useState('');
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  if (!dose) return null;

  const handleTaken = () => {
    storageService.markDoseStatus(dose.id, 'taken');
    // Check if user completed all today's doses for celebration confetti!
    const stats = storageService.getTodayStats();
    if (stats.upcoming === 0 && stats.missed === 0) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#0D9488', '#10B981', '#38BDF8'],
      });
    }
    onClose();
  };

  const handleSnooze = (minutes: number) => {
    storageService.markDoseStatus(dose.id, 'snoozed', { snoozedMinutes: minutes });
    onClose();
  };

  const handleSkip = () => {
    storageService.markDoseStatus(dose.id, 'skipped', { notes: skipReason || 'Skipped by user' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 relative overflow-hidden">
        {/* Subtle decorative glowing background */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

        {/* Close icon */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with pulsing reminder bell */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Bell className="w-6 h-6 animate-bounce" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400">
              Medication Reminder
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Time to take your medicine
            </h3>
          </div>
        </div>

        {/* Medicine Details Card */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 p-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  {dose.medicineName}
                </h4>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {dose.dosage} · {dose.mealTiming.replace('_', ' ')}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              {dose.scheduledTime}
            </span>
          </div>

          {dose.notes && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <span className="font-medium">Instructions:</span> {dose.notes}
            </div>
          )}
        </div>

        {/* Snooze options pop-out */}
        {snoozeOpen ? (
          <div className="space-y-3 mb-4 animate-in fade-in">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Select snooze duration:</p>
            <div className="grid grid-cols-3 gap-2">
              {[15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSnooze(mins)}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 transition"
                >
                  +{mins} mins
                </button>
              ))}
            </div>
            <button
              onClick={() => setSnoozeOpen(false)}
              className="text-xs text-slate-500 hover:underline block text-center w-full mt-1"
            >
              Cancel snooze
            </button>
          </div>
        ) : showSkipConfirm ? (
          <div className="space-y-3 mb-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Are you sure you want to skip this dose?</span>
            </div>
            <input
              type="text"
              placeholder="Reason for skipping (e.g. fasting, nausea, doctor advised)..."
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSkip}
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition"
              >
                Confirm Skip
              </button>
              <button
                onClick={() => setShowSkipConfirm(false)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Primary Actions */
          <div className="space-y-2.5">
            <button
              onClick={handleTaken}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-4 font-semibold text-sm shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
            >
              <Check className="w-5 h-5" />
              <span>Mark as Taken</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setSnoozeOpen(true)}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 py-2.5 px-3 font-medium text-xs text-slate-700 dark:text-slate-200 transition"
              >
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Snooze</span>
              </button>

              <button
                onClick={() => setShowSkipConfirm(true)}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 py-2.5 px-3 font-medium text-xs text-slate-700 dark:text-slate-200 transition"
              >
                <SkipForward className="w-4 h-4 text-amber-500" />
                <span>Skip Dose</span>
              </button>
            </div>
          </div>
        )}

        <p className="mt-4 text-[11px] text-center text-slate-400 dark:text-slate-500">
          MediSync tracks your adherence automatically to help keep your treatment on schedule.
        </p>
      </div>
    </div>
  );
};
