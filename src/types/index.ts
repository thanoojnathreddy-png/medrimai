export type MedicineType =
  | 'tablet'
  | 'capsule'
  | 'syrup'
  | 'injection'
  | 'cream'
  | 'drops'
  | 'inhaler'
  | 'patch'
  | 'other';

export type FrequencyType =
  | 'once_daily'
  | 'twice_daily'
  | 'thrice_daily'
  | 'custom'
  | 'specific_days'
  | 'every_x_hours';

export type MealTiming =
  | 'before_food'
  | 'after_food'
  | 'with_food'
  | 'empty_stomach'
  | 'any_time';

export type MedicineStatus = 'active' | 'completed' | 'paused' | 'expiring_soon';

export type DoseStatus = 'taken' | 'upcoming' | 'missed' | 'skipped' | 'snoozed';

export interface Medicine {
  id: string;
  userId: string;
  name: string;
  type: MedicineType;
  dosage: string;
  unit: string;
  frequency: FrequencyType;
  specificDays?: string[]; // ['Mon', 'Tue', ...]
  intervalHours?: number;
  reminderTimes: string[]; // ['09:00', '13:00', '20:00']
  mealTiming: MealTiming;
  instructions: string;
  notes: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  status: MedicineStatus;
  color: string;
  stockRemaining?: number;
  refillReminder?: boolean;
  prescriptionId?: string;
  createdAt: string;
}

export interface MedicationLog {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string; // HH:mm
  date: string;          // YYYY-MM-DD
  actualTime?: string;   // HH:mm
  status: DoseStatus;
  mealTiming: MealTiming;
  notes?: string;
  snoozedUntil?: string; // HH:mm
  loggedAt: string;      // ISO
}

export interface Prescription {
  id: string;
  userId: string;
  doctorName: string;
  clinicOrHospital: string;
  prescriptionDate: string;
  uploadDate: string;
  imageUrl?: string;
  medicinesList: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  notes?: string;
  status: 'active' | 'archived';
}

export interface CaregiverLink {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  caregiverId: string;
  caregiverName: string;
  caregiverEmail: string;
  inviteCode: string;
  status: 'active' | 'pending';
  canViewAdherence: boolean;
  canReceiveMissedAlerts: boolean;
  canManageMeds: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'reminder' | 'missed' | 'caregiver' | 'prescription' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  medicineId?: string;
  actionUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'caregiver';
  age?: number;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  avatarUrl?: string;
  authProvider?: 'google' | 'email';
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  pushNotifications: boolean;
  emailNotifications: boolean;
  soundEnabled: boolean;
  snoozeDurationMinutes: number;
  missedDoseAlertMinutes: number;
  caregiverAlertsEnabled: boolean;
  highContrast: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: { title: string; url: string }[];
  isSearchGrounded?: boolean;
  quickActions?: { label: string; action: string }[];
}
