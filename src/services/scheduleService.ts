import { Medicine, MedicationLog, DoseStatus } from '../types';
import { getFormattedDate } from '../data/mockData';

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export class ScheduleService {
  /**
   * Determine whether a medicine should be taken on a given date (YYYY-MM-DD)
   */
  isMedicineScheduledOnDate(medicine: Medicine, dateStr: string): boolean {
    if (medicine.status === 'paused' || medicine.status === 'completed') {
      return false;
    }

    // Check date bounds
    if (medicine.startDate > dateStr) {
      return false;
    }
    if (medicine.endDate && medicine.endDate < dateStr) {
      return false;
    }

    // Check specific days of week
    if (medicine.frequency === 'specific_days' && medicine.specificDays && medicine.specificDays.length > 0) {
      const d = new Date(dateStr + 'T12:00:00');
      const dayName = WEEKDAYS[d.getDay()];
      if (!medicine.specificDays.includes(dayName)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate reminder times for interval frequency (e.g., every 6 hours)
   */
  generateIntervalReminderTimes(startHour: number = 8, intervalHours: number = 6): string[] {
    const times: string[] = [];
    let current = startHour;
    while (current < 24) {
      times.push(`${String(current).padStart(2, '0')}:00`);
      current += intervalHours;
    }
    return times.length > 0 ? times : ['09:00', '15:00', '21:00'];
  }

  /**
   * Sync and ensure today's dose logs exist for all active medicines
   */
  generateDosesForDate(medicines: Medicine[], existingLogs: MedicationLog[], dateStr: string): MedicationLog[] {
    const updatedLogs = [...existingLogs];
    const scheduledMeds = medicines.filter((m) => this.isMedicineScheduledOnDate(m, dateStr));

    scheduledMeds.forEach((med) => {
      med.reminderTimes.forEach((time) => {
        const alreadyExists = updatedLogs.some(
          (l) => l.medicineId === med.id && l.date === dateStr && l.scheduledTime === time
        );

        if (!alreadyExists) {
          updatedLogs.push({
            id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            medicineId: med.id,
            medicineName: med.name,
            dosage: `${med.dosage} ${med.unit}`,
            scheduledTime: time,
            date: dateStr,
            status: 'upcoming',
            mealTiming: med.mealTiming,
            loggedAt: new Date().toISOString(),
          });
        }
      });
    });

    return updatedLogs;
  }

  /**
   * Check for scheduled doses that passed allowed window without being taken/skipped/snoozed
   * If current time > scheduled time + alertThresholdMinutes (default 45 min), flag as missed
   */
  detectMissedDoses(
    logs: MedicationLog[],
    thresholdMinutes = 45
  ): { updatedLogs: MedicationLog[]; newMissedLogs: MedicationLog[] } {
    const todayStr = getFormattedDate(0);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const newMissedLogs: MedicationLog[] = [];

    const updatedLogs = logs.map((log) => {
      // Only check today's upcoming or snoozed doses
      if (log.date !== todayStr) return log;
      if (log.status !== 'upcoming' && log.status !== 'snoozed') return log;

      let targetMinutes = 0;
      if (log.status === 'snoozed' && log.snoozedUntil) {
        const [h, m] = log.snoozedUntil.split(':').map(Number);
        targetMinutes = h * 60 + m;
      } else {
        const [h, m] = log.scheduledTime.split(':').map(Number);
        targetMinutes = h * 60 + m;
      }

      // If past the threshold, auto-flag as missed
      if (currentMinutes > targetMinutes + thresholdMinutes) {
        const missedLog: MedicationLog = {
          ...log,
          status: 'missed',
          loggedAt: now.toISOString(),
        };
        newMissedLogs.push(missedLog);
        return missedLog;
      }

      return log;
    });

    return { updatedLogs, newMissedLogs };
  }
}

export const scheduleService = new ScheduleService();
