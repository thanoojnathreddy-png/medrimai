import {
  Medicine,
  MedicationLog,
  Prescription,
  CaregiverLink,
  NotificationItem,
  UserProfile,
  UserSettings,
} from '../types';

export const initialUser: UserProfile = {
  id: 'usr_1',
  name: 'Eleanor Vance',
  email: 'eleanor.vance@example.com',
  role: 'patient',
  age: 64,
  emergencyContact: {
    name: 'David Vance',
    phone: '+1 (555) 234-5678',
    relation: 'Son',
  },
};

export const initialCaregiverUser: UserProfile = {
  id: 'usr_cg_1',
  name: 'David Vance',
  email: 'david.vance@example.com',
  role: 'caregiver',
  age: 38,
  emergencyContact: {
    name: 'Eleanor Vance',
    phone: '+1 (555) 987-6543',
    relation: 'Mother',
  },
};

export const initialSettings: UserSettings = {
  theme: 'system',
  pushNotifications: true,
  emailNotifications: false,
  soundEnabled: true,
  snoozeDurationMinutes: 15,
  missedDoseAlertMinutes: 45,
  caregiverAlertsEnabled: true,
  highContrast: false,
};

export const initialMedicines: Medicine[] = [
  {
    id: 'med_1',
    userId: 'usr_1',
    name: 'Metformin',
    type: 'tablet',
    dosage: '500',
    unit: 'mg',
    frequency: 'twice_daily',
    reminderTimes: ['09:00', '20:00'],
    mealTiming: 'after_food',
    instructions: 'Take 1 tablet after meals with a full glass of water.',
    notes: 'For blood sugar management. Do not skip breakfast.',
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    status: 'active',
    color: '#2563EB', // Blue
    stockRemaining: 42,
    refillReminder: true,
    prescriptionId: 'rx_1',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'med_2',
    userId: 'usr_1',
    name: 'Vitamin D3',
    type: 'capsule',
    dosage: '1000',
    unit: 'IU',
    frequency: 'once_daily',
    reminderTimes: ['13:00'],
    mealTiming: 'with_food',
    instructions: 'Take 1 softgel capsule with lunch.',
    notes: 'Bone strength and immune support.',
    startDate: '2026-08-15',
    endDate: '2027-02-15',
    status: 'active',
    color: '#0D9488', // Teal
    stockRemaining: 18,
    refillReminder: true,
    prescriptionId: 'rx_2',
    createdAt: '2026-08-15T12:00:00Z',
  },
  {
    id: 'med_3',
    userId: 'usr_1',
    name: 'Aspirin Cardio',
    type: 'tablet',
    dosage: '75',
    unit: 'mg',
    frequency: 'once_daily',
    reminderTimes: ['20:00'],
    mealTiming: 'after_food',
    instructions: 'Take 1 enteric-coated tablet with evening dinner.',
    notes: 'Cardiovascular protection. Avoid taking on empty stomach.',
    startDate: '2026-07-10',
    endDate: '2027-01-10',
    status: 'active',
    color: '#7C3AED', // Purple
    stockRemaining: 60,
    refillReminder: false,
    prescriptionId: 'rx_1',
    createdAt: '2026-07-10T19:00:00Z',
  },
  {
    id: 'med_4',
    userId: 'usr_1',
    name: 'Lisinopril',
    type: 'tablet',
    dosage: '10',
    unit: 'mg',
    frequency: 'once_daily',
    reminderTimes: ['09:00'],
    mealTiming: 'before_food',
    instructions: 'Take 1 tablet every morning at 9:00 AM.',
    notes: 'For blood pressure regulation. Monitor BP regularly.',
    startDate: '2026-06-01',
    endDate: '2026-12-01',
    status: 'active',
    color: '#EA580C', // Amber/Orange
    stockRemaining: 24,
    refillReminder: true,
    prescriptionId: 'rx_1',
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'med_5',
    userId: 'usr_1',
    name: 'Atorvastatin',
    type: 'tablet',
    dosage: '20',
    unit: 'mg',
    frequency: 'once_daily',
    reminderTimes: ['21:00'],
    mealTiming: 'any_time',
    instructions: 'Take 1 tablet at bedtime.',
    notes: 'Cholesterol support. Scheduled for next cycle review.',
    startDate: '2026-05-01',
    endDate: '2026-09-30',
    status: 'paused',
    color: '#64748B', // Slate
    stockRemaining: 15,
    refillReminder: false,
    prescriptionId: 'rx_1',
    createdAt: '2026-05-01T20:00:00Z',
  },
];

// Helper to get formatted date string
export function getFormattedDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export function generateInitialLogs(): MedicationLog[] {
  const logs: MedicationLog[] = [];
  const todayStr = getFormattedDate(0);

  // Today's doses
  // 9:00 AM Lisinopril -> Taken
  logs.push({
    id: `log_today_1`,
    medicineId: 'med_4',
    medicineName: 'Lisinopril',
    dosage: '10 mg',
    scheduledTime: '09:00',
    date: todayStr,
    actualTime: '09:08',
    status: 'taken',
    mealTiming: 'before_food',
    loggedAt: `${todayStr}T09:08:00Z`,
  });

  // 9:00 AM Metformin -> Taken
  logs.push({
    id: `log_today_2`,
    medicineId: 'med_1',
    medicineName: 'Metformin',
    dosage: '500 mg',
    scheduledTime: '09:00',
    date: todayStr,
    actualTime: '09:12',
    status: 'taken',
    mealTiming: 'after_food',
    loggedAt: `${todayStr}T09:12:00Z`,
  });

  // 1:00 PM Vitamin D3 -> Upcoming
  logs.push({
    id: `log_today_3`,
    medicineId: 'med_2',
    medicineName: 'Vitamin D3',
    dosage: '1000 IU',
    scheduledTime: '13:00',
    date: todayStr,
    status: 'upcoming',
    mealTiming: 'with_food',
    loggedAt: `${todayStr}T06:00:00Z`,
  });

  // 8:00 PM Metformin -> Upcoming
  logs.push({
    id: `log_today_4`,
    medicineId: 'med_1',
    medicineName: 'Metformin',
    dosage: '500 mg',
    scheduledTime: '20:00',
    date: todayStr,
    status: 'upcoming',
    mealTiming: 'after_food',
    loggedAt: `${todayStr}T06:00:00Z`,
  });

  // 8:00 PM Aspirin Cardio -> Upcoming
  logs.push({
    id: `log_today_5`,
    medicineId: 'med_3',
    medicineName: 'Aspirin Cardio',
    dosage: '75 mg',
    scheduledTime: '20:00',
    date: todayStr,
    status: 'upcoming',
    mealTiming: 'after_food',
    loggedAt: `${todayStr}T06:00:00Z`,
  });

  // Past 13 days of realistic adherence logs
  const pastData = [
    { offset: -1, taken: ['09:00 Lisinopril', '09:00 Metformin', '13:00 Vitamin D3', '20:00 Aspirin Cardio'], missed: ['20:00 Metformin'] },
    { offset: -2, taken: ['09:00 Lisinopril', '09:00 Metformin', '13:00 Vitamin D3', '20:00 Metformin', '20:00 Aspirin Cardio'], missed: [] },
    { offset: -3, taken: ['09:00 Lisinopril', '09:00 Metformin', '20:00 Metformin', '20:00 Aspirin Cardio'], missed: ['13:00 Vitamin D3'] },
    { offset: -4, taken: ['09:00 Lisinopril', '09:00 Metformin', '13:00 Vitamin D3', '20:00 Metformin', '20:00 Aspirin Cardio'], missed: [] },
    { offset: -5, taken: ['09:00 Lisinopril', '09:00 Metformin', '13:00 Vitamin D3', '20:00 Metformin', '20:00 Aspirin Cardio'], missed: [] },
    { offset: -6, taken: ['09:00 Metformin', '13:00 Vitamin D3', '20:00 Metformin', '20:00 Aspirin Cardio'], missed: ['09:00 Lisinopril'] },
    { offset: -7, taken: ['09:00 Lisinopril', '09:00 Metformin', '13:00 Vitamin D3', '20:00 Metformin', '20:00 Aspirin Cardio'], missed: [] },
    { offset: -8, taken: ['09:00 Lisinopril', '09:00 Metformin', '13:00 Vitamin D3', '20:00 Metformin'], missed: ['20:00 Aspirin Cardio'] },
    { offset: -9, taken: ['09:00 Lisinopril', '09:00 Metformin', '13:00 Vitamin D3', '20:00 Metformin', '20:00 Aspirin Cardio'], missed: [] },
    { offset: -10, taken: ['09:00 Lisinopril', '09:00 Metformin', '13:00 Vitamin D3', '20:00 Metformin', '20:00 Aspirin Cardio'], missed: [] },
    { offset: -11, taken: ['09:00 Lisinopril', '09:00 Metformin', '20:00 Metformin', '20:00 Aspirin Cardio'], missed: ['13:00 Vitamin D3'] },
    { offset: -12, taken: ['09:00 Lisinopril', '09:00 Metformin', '13:00 Vitamin D3', '20:00 Metformin', '20:00 Aspirin Cardio'], missed: [] },
    { offset: -13, taken: ['09:00 Lisinopril', '09:00 Metformin', '13:00 Vitamin D3', '20:00 Metformin', '20:00 Aspirin Cardio'], missed: [] },
  ];

  pastData.forEach((day, index) => {
    const dStr = getFormattedDate(day.offset);
    day.taken.forEach((item, tIdx) => {
      const [time, name] = item.split(' ');
      logs.push({
        id: `log_past_t_${index}_${tIdx}`,
        medicineId: name === 'Metformin' ? 'med_1' : name === 'Vitamin' ? 'med_2' : name === 'Aspirin' ? 'med_3' : 'med_4',
        medicineName: name === 'Vitamin' ? 'Vitamin D3' : name === 'Aspirin' ? 'Aspirin Cardio' : name,
        dosage: name === 'Metformin' ? '500 mg' : name === 'Vitamin' ? '1000 IU' : name === 'Aspirin' ? '75 mg' : '10 mg',
        scheduledTime: time,
        date: dStr,
        actualTime: time,
        status: 'taken',
        mealTiming: 'after_food',
        loggedAt: `${dStr}T${time}:00Z`,
      });
    });

    day.missed.forEach((item, mIdx) => {
      const [time, name] = item.split(' ');
      logs.push({
        id: `log_past_m_${index}_${mIdx}`,
        medicineId: name === 'Metformin' ? 'med_1' : name === 'Vitamin' ? 'med_2' : name === 'Aspirin' ? 'med_3' : 'med_4',
        medicineName: name === 'Vitamin' ? 'Vitamin D3' : name === 'Aspirin' ? 'Aspirin Cardio' : name,
        dosage: name === 'Metformin' ? '500 mg' : name === 'Vitamin' ? '1000 IU' : name === 'Aspirin' ? '75 mg' : '10 mg',
        scheduledTime: time,
        date: dStr,
        status: 'missed',
        mealTiming: 'after_food',
        notes: 'Dose window expired without response',
        loggedAt: `${dStr}T${time}:00Z`,
      });
    });
  });

  return logs;
}

export const initialPrescriptions: Prescription[] = [
  {
    id: 'rx_1',
    userId: 'usr_1',
    doctorName: 'Dr. Sarah Jenkins, MD',
    clinicOrHospital: 'City General Medical Center – Cardiology & Endocrinology',
    prescriptionDate: '2026-09-01',
    uploadDate: '2026-09-02',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600',
    medicinesList: [
      {
        name: 'Metformin',
        dosage: '500 mg',
        frequency: 'Twice daily',
        duration: '90 days',
        instructions: 'Take with or immediately after meals.',
      },
      {
        name: 'Lisinopril',
        dosage: '10 mg',
        frequency: 'Once daily (morning)',
        duration: '90 days',
        instructions: 'Check blood pressure periodically.',
      },
      {
        name: 'Aspirin Cardio',
        dosage: '75 mg',
        frequency: 'Once daily (evening)',
        duration: '180 days',
        instructions: 'Take with food.',
      },
    ],
    notes: 'Review HbA1c and kidney panel in 3 months. Maintain healthy low-glycemic diet.',
    status: 'active',
  },
  {
    id: 'rx_2',
    userId: 'usr_1',
    doctorName: 'Dr. Robert Lee, FACP',
    clinicOrHospital: 'Metro Health Primary Care Clinic',
    prescriptionDate: '2026-08-15',
    uploadDate: '2026-08-15',
    imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=600',
    medicinesList: [
      {
        name: 'Vitamin D3',
        dosage: '1000 IU',
        frequency: 'Once daily with lunch',
        duration: '180 days',
        instructions: 'Take with food containing dietary fat for optimal absorption.',
      },
    ],
    notes: 'Serum 25(OH)D was 22 ng/mL. Target range is 35–50 ng/mL.',
    status: 'active',
  },
];

export const initialCaregivers: CaregiverLink[] = [
  {
    id: 'cgl_1',
    patientId: 'usr_1',
    patientName: 'Eleanor Vance',
    patientEmail: 'eleanor.vance@example.com',
    caregiverId: 'usr_cg_1',
    caregiverName: 'David Vance',
    caregiverEmail: 'david.vance@example.com',
    inviteCode: 'MED-7842',
    status: 'active',
    canViewAdherence: true,
    canReceiveMissedAlerts: true,
    canManageMeds: false,
    createdAt: '2026-09-05T10:00:00Z',
  },
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif_1',
    type: 'reminder',
    title: 'Upcoming Dose in 15 mins',
    message: 'Time for Vitamin D3 (1000 IU) with your lunch at 1:00 PM.',
    timestamp: '12:45 PM',
    read: false,
    medicineId: 'med_2',
  },
  {
    id: 'notif_2',
    type: 'caregiver',
    title: 'Caregiver Update',
    message: 'David Vance viewed your weekly adherence report (87%). Keep up the great streak!',
    timestamp: 'Yesterday at 5:10 PM',
    read: true,
  },
  {
    id: 'notif_3',
    type: 'prescription',
    title: 'Prescription Refill Notice',
    message: 'Vitamin D3 has 18 capsules remaining. Schedule a refill with your pharmacy soon.',
    timestamp: '2 days ago',
    read: true,
    medicineId: 'med_2',
  },
];
