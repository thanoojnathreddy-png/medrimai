import React, { useState, useEffect } from 'react';
import { MedicationLog } from '../../types';
import { storageService } from '../../services/storageService';
import { getFormattedDate } from '../../data/mockData';
import {
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  Pill,
  Check,
  AlertCircle,
  Sun,
  Sunset,
  Moon,
  Coffee,
} from 'lucide-react';

interface ScheduleViewProps {
  onOpenReminder: (dose: MedicationLog) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ onOpenReminder }) => {
  const [selectedOffset, setSelectedOffset] = useState(0);
  const [logs, setLogs] = useState<MedicationLog[]>([]);

  const selectedDate = getFormattedDate(selectedOffset);

  const refreshLogs = () => {
    const all = storageService.getLogs();
    setLogs(all.filter((l) => l.date === selectedDate));
  };

  useEffect(() => {
    refreshLogs();
    return storageService.subscribe(refreshLogs);
  }, [selectedOffset]);

  const handleMarkTaken = (id: string) => {
    storageService.markDoseStatus(id, 'taken');
    refreshLogs();
  };

  // Group doses into time slots:
  // Morning: < 12:00
  // Afternoon: 12:00 - 17:00
  // Evening: 17:00 - 21:00
  // Night / Bedtime: >= 21:00
  const morningDoses = logs.filter((l) => parseInt(l.scheduledTime.split(':')[0]) < 12);
  const afternoonDoses = logs.filter((l) => {
    const h = parseInt(l.scheduledTime.split(':')[0]);
    return h >= 12 && h < 17;
  });
  const eveningDoses = logs.filter((l) => {
    const h = parseInt(l.scheduledTime.split(':')[0]);
    return h >= 17 && h < 21;
  });
  const nightDoses = logs.filter((l) => parseInt(l.scheduledTime.split(':')[0]) >= 21);

  const slots = [
    { title: 'Morning', icon: Coffee, doses: morningDoses, timeRange: '6:00 AM – 12:00 PM' },
    { title: 'Afternoon', icon: Sun, doses: afternoonDoses, timeRange: '12:00 PM – 5:00 PM' },
    { title: 'Evening', icon: Sunset, doses: eveningDoses, timeRange: '5:00 PM – 9:00 PM' },
    { title: 'Night / Bedtime', icon: Moon, doses: nightDoses, timeRange: '9:00 PM – Late' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header & Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Medication Schedule
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Chronological daily routine segmented by meal and time of day.
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-xs">
          <button
            onClick={() => setSelectedOffset((prev) => prev - 1)}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold px-3 py-1 font-mono text-slate-800 dark:text-slate-200">
            {selectedOffset === 0 ? 'Today' : selectedOffset === 1 ? 'Tomorrow' : selectedOffset === -1 ? 'Yesterday' : selectedDate}
          </span>

          <button
            onClick={() => setSelectedOffset((prev) => prev + 1)}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {selectedOffset !== 0 && (
            <button
              onClick={() => setSelectedOffset(0)}
              className="text-[11px] font-bold text-blue-600 hover:underline px-2"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Slots Section */}
      <div className="space-y-5">
        {slots.map((slot, sIdx) => {
          const Icon = slot.icon;
          return (
            <div
              key={sIdx}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {slot.title}
                    </h3>
                    <span className="text-[10px] text-slate-400">{slot.timeRange}</span>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {slot.doses.length} {slot.doses.length === 1 ? 'dose' : 'doses'}
                </span>
              </div>

              {slot.doses.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center italic">
                  No medications scheduled for {slot.title.toLowerCase()}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {slot.doses.map((dose) => (
                    <div
                      key={dose.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                          {dose.scheduledTime}
                        </span>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {dose.medicineName}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {dose.dosage} · {dose.mealTiming.replace('_', ' ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {dose.status === 'taken' ? (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            ✓ Taken {dose.actualTime ? `(${dose.actualTime})` : ''}
                          </span>
                        ) : dose.status === 'missed' ? (
                          <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-xl border border-rose-200 dark:border-rose-800">
                            Missed
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleMarkTaken(dose.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold active:scale-95 transition"
                            >
                              Mark Taken
                            </button>
                            <button
                              onClick={() => onOpenReminder(dose)}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                            >
                              Options
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
