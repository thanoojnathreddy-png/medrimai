import React, { useState } from 'react';
import { Medicine, MedicineType, FrequencyType, MealTiming } from '../../types';
import { storageService } from '../../services/storageService';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import {
  Pill,
  Calendar,
  Clock,
  Utensils,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface AddMedicineWizardProps {
  initialMedicine?: Medicine | null;
  onClose: () => void;
  onSaved: () => void;
}

export const AddMedicineWizard: React.FC<AddMedicineWizardProps> = ({
  initialMedicine,
  onClose,
  onSaved,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [name, setName] = useState(initialMedicine?.name || '');
  const [type, setType] = useState<MedicineType>(initialMedicine?.type || 'tablet');
  const [dosage, setDosage] = useState(initialMedicine?.dosage || '');
  const [unit, setUnit] = useState(initialMedicine?.unit || 'mg');
  const [instructions, setInstructions] = useState(initialMedicine?.instructions || '');
  const [notes, setNotes] = useState(initialMedicine?.notes || '');

  // Step 2 Schedule
  const [frequency, setFrequency] = useState<FrequencyType>(
    initialMedicine?.frequency || 'once_daily'
  );
  const [specificDays, setSpecificDays] = useState<string[]>(
    initialMedicine?.specificDays || ['Sun']
  );
  const [intervalHours, setIntervalHours] = useState<number>(
    initialMedicine?.intervalHours || 6
  );
  const [startDate, setStartDate] = useState(
    initialMedicine?.startDate || new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(initialMedicine?.endDate || '');
  const [reminderTimes, setReminderTimes] = useState<string[]>(
    initialMedicine?.reminderTimes || ['09:00']
  );
  const [validationError, setValidationError] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Step 3 Food Timing
  const [mealTiming, setMealTiming] = useState<MealTiming>(
    initialMedicine?.mealTiming || 'after_food'
  );
  const [color, setColor] = useState(initialMedicine?.color || '#2563EB');

  // Handle frequency changes auto-configuring sensible reminder defaults
  const handleFrequencyChange = (newFreq: FrequencyType) => {
    setFrequency(newFreq);
    setValidationError('');
    if (newFreq === 'once_daily') setReminderTimes(['09:00']);
    else if (newFreq === 'twice_daily') setReminderTimes(['09:00', '20:00']);
    else if (newFreq === 'thrice_daily') setReminderTimes(['09:00', '13:00', '20:00']);
    else if (newFreq === 'specific_days') {
      if (specificDays.length === 0) setSpecificDays(['Sun']);
      setReminderTimes(['10:00']);
    } else if (newFreq === 'every_x_hours') {
      const times: string[] = [];
      for (let h = 8; h < 24; h += intervalHours) {
        times.push(`${String(h).padStart(2, '0')}:00`);
      }
      setReminderTimes(times.length > 0 ? times : ['08:00', '14:00', '20:00']);
    }
  };

  const toggleDay = (day: string) => {
    if (specificDays.includes(day)) {
      setSpecificDays(specificDays.filter((d) => d !== day));
    } else {
      setSpecificDays([...specificDays, day]);
    }
  };

  const handleIntervalChange = (hours: number) => {
    setIntervalHours(hours);
    const times: string[] = [];
    for (let h = 8; h < 24; h += hours) {
      times.push(`${String(h).padStart(2, '0')}:00`);
    }
    setReminderTimes(times);
  };

  const handleAddTime = () => {
    setReminderTimes([...reminderTimes, '12:00']);
  };

  const handleRemoveTime = (index: number) => {
    if (reminderTimes.length > 1) {
      setReminderTimes(reminderTimes.filter((_, i) => i !== index));
    }
  };

  const handleTimeChange = (index: number, val: string) => {
    const updated = [...reminderTimes];
    updated[index] = val;
    setReminderTimes(updated);
  };

  const handleNext = () => {
    setValidationError('');
    if (currentStep === 1) {
      if (!name.trim()) {
        setValidationError('Medicine name cannot be empty.');
        return;
      }
      if (!dosage.trim()) {
        setValidationError('Dosage amount cannot be empty.');
        return;
      }
    }
    if (currentStep === 2) {
      if (endDate && endDate < startDate) {
        setValidationError('End date cannot be earlier than start date.');
        return;
      }
      if (frequency === 'specific_days' && specificDays.length === 0) {
        setValidationError('Please select at least one day of the week.');
        return;
      }
      if (reminderTimes.length === 0) {
        setValidationError('Please configure at least one reminder time.');
        return;
      }
    }
    setCurrentStep((currentStep + 1) as any);
  };

  const handleSave = () => {
    if (initialMedicine) {
      storageService.updateMedicine(initialMedicine.id, {
        name,
        type,
        dosage,
        unit,
        instructions,
        notes,
        frequency,
        specificDays: frequency === 'specific_days' ? specificDays : undefined,
        intervalHours: frequency === 'every_x_hours' ? intervalHours : undefined,
        startDate,
        endDate: endDate || undefined,
        reminderTimes,
        mealTiming,
        color,
      });
    } else {
      const user = storageService.getUser();
      storageService.addMedicine({
        userId: user.id,
        name,
        type,
        dosage,
        unit,
        frequency,
        specificDays: frequency === 'specific_days' ? specificDays : undefined,
        intervalHours: frequency === 'every_x_hours' ? intervalHours : undefined,
        reminderTimes,
        mealTiming,
        instructions,
        notes,
        startDate,
        endDate: endDate || undefined,
        status: 'active',
        color,
      });
    }
    onSaved();
  };

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Wizard Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Step {currentStep} of 4
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {initialMedicine ? 'Edit Medicine' : 'Add New Medicine'}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Stepper Indicator */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {[
          { num: 1, label: 'Information' },
          { num: 2, label: 'Schedule' },
          { num: 3, label: 'Instructions' },
          { num: 4, label: 'Confirmation' },
        ].map((step) => {
          const isDone = currentStep > step.num;
          const isCurrent = currentStep === step.num;
          return (
            <div
              key={step.num}
              className={`rounded-2xl p-2.5 sm:p-3 border text-left transition ${
                isCurrent
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                  : isDone
                  ? 'border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isDone ? '✓' : step.num}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider hidden sm:inline">
                  Step {step.num}
                </span>
              </div>
              <p className="text-xs font-bold truncate">{step.label}</p>
            </div>
          );
        })}
      </div>

      {/* Step 1: Medicine Information */}
      {currentStep === 1 && (
        <div className="space-y-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs animate-in fade-in">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Medicine Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Metformin, Lisinopril, Vitamin D3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Medicine Type */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Medicine Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'tablet', label: 'Tablet 💊' },
                { id: 'capsule', label: 'Capsule 💊' },
                { id: 'syrup', label: 'Syrup 🧪' },
                { id: 'injection', label: 'Injection 💉' },
                { id: 'cream', label: 'Cream 🧴' },
                { id: 'drops', label: 'Drops 💧' },
                { id: 'inhaler', label: 'Inhaler 🌬️' },
                { id: 'other', label: 'Other 🏷️' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id as MedicineType)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition ${
                    type === item.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dosage & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Dosage Amount *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 500, 10, 1000"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="mg">mg</option>
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="IU">IU</option>
                <option value="tablet">tablet(s)</option>
                <option value="capsule">capsule(s)</option>
                <option value="drops">drops</option>
                <option value="puffs">puffs</option>
              </select>
            </div>
          </div>

          {/* Color accent */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Card Color Accent
            </label>
            <div className="flex items-center gap-3">
              {['#2563EB', '#0D9488', '#7C3AED', '#EA580C', '#E11D48', '#059669'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-blue-500' : 'opacity-80'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Schedule & Reminders */}
      {currentStep === 2 && (
        <div className="space-y-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs animate-in fade-in">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Frequency
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'once_daily', label: 'Once daily' },
                { id: 'twice_daily', label: 'Twice daily' },
                { id: 'thrice_daily', label: 'Three times daily' },
                { id: 'specific_days', label: 'Specific days' },
                { id: 'every_x_hours', label: 'Every X hours' },
                { id: 'custom', label: 'Custom schedule' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleFrequencyChange(f.id as FrequencyType)}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition ${
                    frequency === f.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reminder Times */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Reminder Times (24-Hour Format)
              </label>
              <button
                type="button"
                onClick={handleAddTime}
                className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Time
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {reminderTimes.map((time, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(idx, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm font-bold text-slate-800 dark:text-slate-200"
                  />
                  {reminderTimes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTime(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              e.g. Morning dose at 9:00 AM, Lunch at 1:00 PM, Dinner at 8:00 PM.
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Instructions & Meal Timing */}
      {currentStep === 3 && (
        <div className="space-y-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs animate-in fade-in">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              Meal Relationship Timing
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'after_food', label: 'After food 🍽️' },
                { id: 'with_food', label: 'With food 🥗' },
                { id: 'before_food', label: 'Before food 🥪' },
                { id: 'empty_stomach', label: 'Empty stomach ⏱️' },
                { id: 'any_time', label: 'Any time 🕒' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMealTiming(item.id as MealTiming)}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                    mealTiming === item.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Doctor's Instructions
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Take 1 tablet with a full glass of water. Do not crush."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Personal Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Keep in bedside drawer, refill when 5 pills left"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {currentStep === 4 && (
        <div className="space-y-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold"
              style={{ backgroundColor: color }}
            >
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{name}</h3>
              <p className="text-xs font-semibold text-slate-500">
                {dosage} {unit} · {type.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Frequency:</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 capitalize mt-0.5">
                {frequency.replace('_', ' ')}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Meal Timing:</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 capitalize mt-0.5">
                {mealTiming.replace('_', ' ')}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Scheduled Times:</span>
              <p className="font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                {reminderTimes.join(' · ')}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Regimen Period:</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {startDate} to {endDate || 'Ongoing'}
              </p>
            </div>
          </div>

          {instructions && (
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300">
              <span className="font-bold text-blue-700 dark:text-blue-300">Instructions:</span>
              <p className="mt-1">{instructions}</p>
            </div>
          )}

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <span>🛡️</span>
            <span>
              Please verify that all dosages and timings match your doctor's official prescription.
            </span>
          </div>
        </div>
      )}

      {/* Stepper Navigation Buttons */}
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep((currentStep - 1) as any)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          {initialMedicine && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition"
              title="Delete this medicine"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>

        {currentStep < 4 ? (
          <button
            type="button"
            disabled={!name.trim() || !dosage.trim()}
            onClick={() => setCurrentStep((currentStep + 1) as any)}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition active:scale-95"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Medicine</span>
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {initialMedicine && (
        <DeleteConfirmModal
          isOpen={showDeleteConfirm}
          title="Delete Medicine"
          itemName={initialMedicine.name}
          message="Are you sure you want to delete this medication? This will permanently remove this prescription and its upcoming reminders."
          confirmLabel="Yes, Delete"
          cancelLabel="Cancel"
          onConfirm={() => {
            storageService.deleteMedicine(initialMedicine.id);
            setShowDeleteConfirm(false);
            onClose();
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};
