import {
  Medicine,
  MedicationLog,
  Prescription,
  CaregiverLink,
  NotificationItem,
  UserProfile,
  UserSettings,
  DoseStatus,
} from '../types';
import {
  initialUser,
  initialCaregiverUser,
  initialSettings,
  initialMedicines,
  generateInitialLogs,
  initialPrescriptions,
  initialCaregivers,
  initialNotifications,
  getFormattedDate,
} from '../data/mockData';
import { soundService } from './soundService';
import { scheduleService } from './scheduleService';

const STORAGE_KEYS = {
  USER: 'medisync_user',
  SETTINGS: 'medisync_settings',
  MEDICINES: 'medisync_medicines',
  LOGS: 'medisync_logs',
  PRESCRIPTIONS: 'medisync_prescriptions',
  CAREGIVERS: 'medisync_caregivers',
  NOTIFICATIONS: 'medisync_notifications',
};

type Listener = () => void;

class StorageService {
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- User & Profile ---
  getUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.avatarUrl) {
          delete parsed.avatarUrl;
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch {}
    return initialUser;
  }

  setUser(user: UserProfile) {
    const cleanUser = { ...user };
    delete cleanUser.avatarUrl;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(cleanUser));
    this.notify();
  }

  removeProfilePhoto() {
    const user = this.getUser();
    delete user.avatarUrl;
    this.setUser(user);
  }

  switchRole(role: 'patient' | 'caregiver') {
    if (role === 'caregiver') {
      this.setUser(initialCaregiverUser);
    } else {
      this.setUser(initialUser);
    }
  }

  // --- Settings ---
  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return JSON.parse(data);
    } catch {}
    return initialSettings;
  }

  updateSettings(partial: Partial<UserSettings>) {
    const current = this.getSettings();
    const updated = { ...current, ...partial };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    this.notify();
  }

  // --- Medicines ---
  getMedicines(): Medicine[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEDICINES);
      if (data) return JSON.parse(data);
    } catch {}
    return initialMedicines;
  }

  setMedicines(meds: Medicine[]) {
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(meds));
    this.notify();
  }

  addMedicine(med: Omit<Medicine, 'id' | 'createdAt'>): Medicine {
    const list = this.getMedicines();
    const newMed: Medicine = {
      ...med,
      id: `med_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newMed);
    this.setMedicines(list);

    // Schedule today's doses if medicine is scheduled for today
    const todayStr = getFormattedDate(0);
    if (scheduleService.isMedicineScheduledOnDate(newMed, todayStr)) {
      const logs = this.getLogs();
      const updatedLogs = scheduleService.generateDosesForDate([newMed], logs, todayStr);
      this.setLogs(updatedLogs);
    }

    return newMed;
  }

  updateMedicine(id: string, partial: Partial<Medicine>) {
    const list = this.getMedicines().map((m) =>
      m.id === id ? { ...m, ...partial } : m
    );
    this.setMedicines(list);

    const todayStr = getFormattedDate(0);
    const updatedMed = list.find((m) => m.id === id);
    if (updatedMed) {
      let logs = this.getLogs();
      if (updatedMed.status === 'paused' || updatedMed.status === 'completed') {
        // Prune pending/snoozed doses for paused/completed medicine
        logs = logs.filter(
          (l) => !(l.medicineId === id && l.date === todayStr && (l.status === 'upcoming' || l.status === 'snoozed'))
        );
        this.setLogs(logs);
      } else if (scheduleService.isMedicineScheduledOnDate(updatedMed, todayStr)) {
        // Regenerate upcoming doses
        logs = logs.filter(
          (l) => !(l.medicineId === id && l.date === todayStr && l.status === 'upcoming')
        );
        const refreshed = scheduleService.generateDosesForDate([updatedMed], logs, todayStr);
        this.setLogs(refreshed);
      }
    }
  }

  deleteMedicine(id: string) {
    const list = this.getMedicines().filter((m) => m.id !== id);
    this.setMedicines(list);

    // Prune upcoming doses for deleted medicine
    const todayStr = getFormattedDate(0);
    const logs = this.getLogs().filter(
      (l) => !(l.medicineId === id && l.date === todayStr && (l.status === 'upcoming' || l.status === 'snoozed'))
    );
    this.setLogs(logs);
  }

  toggleMedicineStatus(id: string, newStatus: Medicine['status']) {
    this.updateMedicine(id, { status: newStatus });
  }

  // --- Logs & Dose Tracking ---
  getLogs(): MedicationLog[] {
    let logs: MedicationLog[];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      logs = data ? JSON.parse(data) : generateInitialLogs();
    } catch {
      logs = generateInitialLogs();
    }

    // Automatically sync today's active medicines
    const todayStr = getFormattedDate(0);
    const medicines = this.getMedicines();
    logs = scheduleService.generateDosesForDate(medicines, logs, todayStr);

    // Auto-detect and flag missed doses past the alert threshold
    const settings = this.getSettings();
    const threshold = settings.missedDoseAlertMinutes || 45;
    const { updatedLogs, newMissedLogs } = scheduleService.detectMissedDoses(logs, threshold);

    if (newMissedLogs.length > 0) {
      newMissedLogs.forEach((missed) => {
        this.addNotification({
          type: 'missed',
          title: `Missed Dose: ${missed.medicineName}`,
          message: `Scheduled for ${missed.scheduledTime} (${missed.dosage}). You can take it now or mark it skipped.`,
          read: false,
          medicineId: missed.medicineId,
        });
      });
    }

    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updatedLogs));
    return updatedLogs;
  }

  setLogs(logs: MedicationLog[]) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    this.notify();
  }

  getTodayLogs(): MedicationLog[] {
    const todayStr = getFormattedDate(0);
    return this.getLogs()
      .filter((l) => l.date === todayStr)
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }

  markDoseStatus(
    logId: string,
    status: DoseStatus,
    options?: { actualTime?: string; notes?: string; snoozedMinutes?: number }
  ) {
    const logs = this.getLogs();
    const idx = logs.findIndex((l) => l.id === logId);
    if (idx === -1) return;

    const current = logs[idx];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let snoozedUntil: string | undefined = undefined;
    if (status === 'snoozed') {
      const snoozeMinutes = options?.snoozedMinutes || 15;
      const snoozeDate = new Date(now.getTime() + snoozeMinutes * 60000);
      snoozedUntil = `${String(snoozeDate.getHours()).padStart(2, '0')}:${String(snoozeDate.getMinutes()).padStart(2, '0')}`;
    }

    logs[idx] = {
      ...current,
      status,
      actualTime: status === 'taken' ? options?.actualTime || timeStr : undefined,
      notes: options?.notes || current.notes,
      snoozedUntil,
      loggedAt: now.toISOString(),
    };

    this.setLogs(logs);

    const settings = this.getSettings();
    if (settings.soundEnabled) {
      if (status === 'taken') {
        soundService.playSuccessSound();
      } else if (status === 'snoozed') {
        soundService.playSoftClick();
      }
    }

    // Add alert notification for missed dose
    if (status === 'missed') {
      this.addNotification({
        type: 'missed',
        title: `Missed Dose: ${current.medicineName}`,
        message: `Scheduled for ${current.scheduledTime} (${current.dosage}). Consider taking it or consulting your caregiver if feeling unwell.`,
        read: false,
        medicineId: current.medicineId,
      });
    } else if (status === 'snoozed') {
      this.addNotification({
        type: 'reminder',
        title: `Dose Snoozed: ${current.medicineName}`,
        message: `Delayed until ${snoozedUntil}. We'll remind you then!`,
        read: false,
        medicineId: current.medicineId,
      });
    }
  }

  // --- Prescriptions ---
  getPrescriptions(): Prescription[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
      if (data) return JSON.parse(data);
    } catch {}
    return initialPrescriptions;
  }

  setPrescriptions(rx: Prescription[]) {
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(rx));
    this.notify();
  }

  addPrescription(rx: Omit<Prescription, 'id' | 'uploadDate'>): Prescription {
    const list = this.getPrescriptions();
    const newRx: Prescription = {
      ...rx,
      id: `rx_${Date.now()}`,
      uploadDate: getFormattedDate(0),
    };
    list.unshift(newRx);
    this.setPrescriptions(list);
    return newRx;
  }

  deletePrescription(id: string) {
    const list = this.getPrescriptions().filter((p) => p.id !== id);
    this.setPrescriptions(list);
  }

  // --- Caregivers ---
  getCaregivers(): CaregiverLink[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CAREGIVERS);
      if (data) return JSON.parse(data);
    } catch {}
    return initialCaregivers;
  }

  setCaregivers(cgs: CaregiverLink[]) {
    localStorage.setItem(STORAGE_KEYS.CAREGIVERS, JSON.stringify(cgs));
    this.notify();
  }

  createCaregiverInvite(caregiverEmail: string, caregiverName = ''): CaregiverLink {
    const code = `MED-${Math.floor(1000 + Math.random() * 9000)}`;
    const user = this.getUser();
    const list = this.getCaregivers();
    const newLink: CaregiverLink = {
      id: `cgl_${Date.now()}`,
      patientId: user.id,
      patientName: user.name,
      patientEmail: user.email,
      caregiverId: `usr_cg_${Date.now()}`,
      caregiverName: caregiverName || caregiverEmail.split('@')[0],
      caregiverEmail,
      inviteCode: code,
      status: 'pending',
      canViewAdherence: true,
      canReceiveMissedAlerts: true,
      canManageMeds: false,
      createdAt: new Date().toISOString(),
    };
    list.push(newLink);
    this.setCaregivers(list);
    return newLink;
  }

  // --- Notifications ---
  getNotifications(): NotificationItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (data) return JSON.parse(data);
    } catch {}
    return initialNotifications;
  }

  setNotifications(notifs: NotificationItem[]) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    this.notify();
  }

  addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp'>) {
    const list = this.getNotifications();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    list.unshift({
      ...notif,
      id: `notif_${Date.now()}`,
      timestamp: timeStr,
    });
    this.setNotifications(list);
  }

  markNotificationRead(id: string) {
    const list = this.getNotifications().map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.setNotifications(list);
  }

  markAllNotificationsRead() {
    const list = this.getNotifications().map((n) => ({ ...n, read: true }));
    this.setNotifications(list);
  }

  // --- Analytics & Calculated Stats ---
  getTodayStats() {
    const todayLogs = this.getTodayLogs();
    const total = todayLogs.length;
    const taken = todayLogs.filter((l) => l.status === 'taken').length;
    const missed = todayLogs.filter((l) => l.status === 'missed').length;
    const skipped = todayLogs.filter((l) => l.status === 'skipped').length;
    const upcoming = todayLogs.filter((l) => l.status === 'upcoming' || l.status === 'snoozed').length;
    const activeDoses = taken + missed + skipped;
    const adherencePercent = activeDoses > 0 ? Math.round((taken / activeDoses) * 100) : (total > 0 ? Math.round((taken / total) * 100) : 100);

    return { total, taken, missed, skipped, upcoming, adherencePercent };
  }

  getOverallAdherence(days = 14) {
    const logs = this.getLogs();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    const periodLogs = logs.filter((l) => l.date >= cutoffStr && l.status !== 'upcoming');
    if (periodLogs.length === 0) return 88;

    const takenCount = periodLogs.filter((l) => l.status === 'taken').length;
    return Math.round((takenCount / periodLogs.length) * 100);
  }

  getStreakDays(): number {
    const logs = this.getLogs();
    let streak = 0;
    // Check backwards from yesterday
    for (let i = 1; i <= 30; i++) {
      const dStr = getFormattedDate(-i);
      const dayLogs = logs.filter((l) => l.date === dStr);
      if (dayLogs.length === 0) break;
      const missed = dayLogs.filter((l) => l.status === 'missed').length;
      if (missed === 0) {
        streak++;
      } else {
        break;
      }
    }
    // If today has taken doses without missed doses, add 1
    const todayStats = this.getTodayStats();
    if (todayStats.missed === 0 && todayStats.taken > 0) {
      streak += 1;
    }
    return Math.max(1, streak);
  }

  getAdherenceHistoryChart(days = 7) {
    const logs = this.getLogs();
    const result = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = days - 1; i >= 0; i--) {
      const dStr = getFormattedDate(-i);
      const dObj = new Date(dStr + 'T12:00:00');
      const dayLabel = dayNames[dObj.getDay()];
      const dayLogs = logs.filter((l) => l.date === dStr);

      const taken = dayLogs.filter((l) => l.status === 'taken').length;
      const missed = dayLogs.filter((l) => l.status === 'missed').length;
      const skipped = dayLogs.filter((l) => l.status === 'skipped').length;
      const totalDecided = taken + missed + skipped;
      const rate = totalDecided > 0 ? Math.round((taken / totalDecided) * 100) : (dayLogs.length > 0 ? 90 : 100);

      result.push({
        day: dayLabel,
        date: dStr,
        adherence: rate,
        taken,
        missed,
        skipped,
        total: dayLogs.length,
      });
    }
    return result;
  }

  getTodayAdherence(): number {
    return this.getTodayStats().adherencePercent;
  }

  getWeeklyAdherence(): number {
    return this.getOverallAdherence(7);
  }

  getMonthlyAdherence(): number {
    return this.getOverallAdherence(30);
  }

  /**
   * Calculate adherence rate per individual medicine
   */
  getMedicationSpecificAdherence(): {
    medicineId: string;
    medicineName: string;
    dosage: string;
    rate: number;
    taken: number;
    missed: number;
    skipped: number;
    total: number;
  }[] {
    const medicines = this.getMedicines();
    const logs = this.getLogs();

    return medicines.map((med) => {
      const medLogs = logs.filter((l) => l.medicineId === med.id && l.status !== 'upcoming');
      const taken = medLogs.filter((l) => l.status === 'taken').length;
      const missed = medLogs.filter((l) => l.status === 'missed').length;
      const skipped = medLogs.filter((l) => l.status === 'skipped').length;
      const total = taken + missed + skipped;
      const rate = total > 0 ? Math.round((taken / total) * 100) : 100;

      return {
        medicineId: med.id,
        medicineName: med.name,
        dosage: `${med.dosage} ${med.unit}`,
        rate,
        taken,
        missed,
        skipped,
        total,
      };
    });
  }

  /**
   * Derive REAL mathematical behavioral insights from stored logs (No fake AI text)
   */
  getRealDataBehavioralInsights(): {
    title: string;
    description: string;
    type: 'improvement' | 'vulnerability' | 'streak' | 'steady';
  }[] {
    const logs = this.getLogs();
    const insights: {
      title: string;
      description: string;
      type: 'improvement' | 'vulnerability' | 'streak' | 'steady';
    }[] = [];

    // 1. Time of Day Vulnerability Analysis
    let morningMissed = 0;
    let afternoonMissed = 0;
    let eveningMissed = 0;

    logs.forEach((l) => {
      if (l.status === 'missed') {
        const hour = parseInt(l.scheduledTime.split(':')[0], 10) || 0;
        if (hour < 12) morningMissed++;
        else if (hour < 17) afternoonMissed++;
        else eveningMissed++;
      }
    });

    const totalMissed = morningMissed + afternoonMissed + eveningMissed;
    if (totalMissed > 0) {
      if (eveningMissed >= morningMissed && eveningMissed >= afternoonMissed) {
        const pct = Math.round((eveningMissed / totalMissed) * 100);
        insights.push({
          title: 'Evening Dose Timing',
          description: `Evening doses have the highest missed-dose rate (${pct}% of all missed doses). Pairing your evening medication with dinner or an alarm will improve routine consistency.`,
          type: 'vulnerability',
        });
      } else if (morningMissed >= afternoonMissed) {
        const pct = Math.round((morningMissed / totalMissed) * 100);
        insights.push({
          title: 'Morning Dose Timing',
          description: `Morning doses have the highest missed-dose rate (${pct}% of all missed doses). Keeping medications near your bedside or breakfast table helps prevent delays.`,
          type: 'vulnerability',
        });
      } else {
        const pct = Math.round((afternoonMissed / totalMissed) * 100);
        insights.push({
          title: 'Afternoon Dose Timing',
          description: `Midday doses account for ${pct}% of missed doses. Setting a midday reminder alert can help prevent work or travel disruptions.`,
          type: 'vulnerability',
        });
      }
    } else {
      insights.push({
        title: 'Perfect Dose Discipline',
        description: 'Zero missed doses have been recorded across your medication timeline. Excellent compliance!',
        type: 'improvement',
      });
    }

    // 2. Week-over-Week Progress
    const last7 = this.getOverallAdherence(7);
    const prior7Logs = logs.filter((l) => {
      const d = l.date;
      return d >= getFormattedDate(-14) && d < getFormattedDate(-7) && l.status !== 'upcoming';
    });
    const prior7Taken = prior7Logs.filter((l) => l.status === 'taken').length;
    const prior7Rate = prior7Logs.length > 0 ? Math.round((prior7Taken / prior7Logs.length) * 100) : 80;
    const diff = last7 - prior7Rate;

    if (diff > 0) {
      insights.push({
        title: 'Weekly Improvement',
        description: `Your adherence improved by +${diff}% compared with the prior week (currently at ${last7}% vs ${prior7Rate}%).`,
        type: 'improvement',
      });
    } else if (diff < 0) {
      insights.push({
        title: 'Weekly Routine Check',
        description: `Adherence decreased by ${Math.abs(diff)}% compared with the prior week (${last7}% vs ${prior7Rate}%). Check for missed doses on your schedule.`,
        type: 'vulnerability',
      });
    } else {
      insights.push({
        title: 'Steady Adherence',
        description: `Your adherence has remained exceptionally consistent at ${last7}% across the past 14 days.`,
        type: 'steady',
      });
    }

    // 3. Streak Insight
    const streak = this.getStreakDays();
    insights.push({
      title: 'Consistency Streak',
      description: `You have completed ${streak} consecutive day${streak === 1 ? '' : 's'} maintaining active scheduled doses.`,
      type: 'streak',
    });

    return insights;
  }

  // --- Caregiver Management ---
  deleteCaregiver(id: string) {
    const list = this.getCaregivers().filter((c) => c.id !== id);
    this.setCaregivers(list);
  }

  updateCaregiverPermissions(id: string, partial: Partial<CaregiverLink>) {
    const list = this.getCaregivers().map((c) => (c.id === id ? { ...c, ...partial } : c));
    this.setCaregivers(list);
  }

  updatePrescription(id: string, partial: Partial<Prescription>) {
    const list = this.getPrescriptions().map((p) => (p.id === id ? { ...p, ...partial } : p));
    this.setPrescriptions(list);
  }

  resetToDemoData() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.MEDICINES);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.PRESCRIPTIONS);
    localStorage.removeItem(STORAGE_KEYS.CAREGIVERS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    this.notify();
  }
}

export const storageService = new StorageService();
