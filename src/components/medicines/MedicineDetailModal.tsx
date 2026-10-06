import React, { useState } from 'react';
import { Medicine, MedicationLog } from '../../types';
import { storageService } from '../../services/storageService';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import {
  Pill,
  Clock,
  Calendar,
  FileText,
  X,
  History,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Trash2,
} from 'lucide-react';

interface MedicineDetailModalProps {
  medicine: Medicine | null;
  onClose: () => void;
  onEdit: (med: Medicine) => void;
}

export const MedicineDetailModal: React.FC<MedicineDetailModalProps> = ({
  medicine,
  onClose,
  onEdit,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!medicine) return null;

  const logs = storageService
    .getLogs()
    .filter((l) => l.medicineId === medicine.id)
    .slice(0, 10);

  const prescriptions = storageService.getPrescriptions();
  const linkedRx = prescriptions.find((p) => p.id === medicine.prescriptionId);

  const handleTogglePause = () => {
    const nextStatus = medicine.status === 'paused' ? 'active' : 'paused';
    storageService.toggleMedicineStatus(medicine.id, nextStatus);
    onClose();
  };

  const handleConfirmDelete = () => {
    storageService.deleteMedicine(medicine.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0"
            style={{ backgroundColor: medicine.color || '#2563EB' }}
          >
            <Pill className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {medicine.name}
              </h3>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  medicine.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : medicine.status === 'paused'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {medicine.status}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-500 mt-0.5">
              {medicine.dosage} {medicine.unit} · {medicine.type.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Key Attributes Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 font-medium">Frequency</span>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 capitalize">
              {medicine.frequency.replace('_', ' ')}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 font-medium">Meal Timing</span>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 capitalize">
              {medicine.mealTiming.replace('_', ' ')}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 font-medium">Reminder Schedule</span>
            <p className="font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
              {medicine.reminderTimes.join(' · ')}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 font-medium">Regimen Duration</span>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {medicine.startDate} to {medicine.endDate || 'Ongoing'}
            </p>
          </div>
        </div>

        {/* Instructions & Notes */}
        <div className="space-y-3 mb-6 text-xs">
          <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
            <span className="font-bold text-blue-700 dark:text-blue-300">Physician Instructions:</span>
            <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed">
              {medicine.instructions || 'Take as prescribed by doctor.'}
            </p>
          </div>

          {medicine.notes && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-700 dark:text-slate-300">Personal Notes:</span>
              <p className="mt-1 text-slate-600 dark:text-slate-400">{medicine.notes}</p>
            </div>
          )}

          {linkedRx && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400">Prescribed by</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{linkedRx.doctorName}</p>
              </div>
              <span className="text-[11px] font-mono text-slate-500">{linkedRx.clinicOrHospital}</span>
            </div>
          )}
        </div>

        {/* Timeline of Previous Doses */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white mb-3">
            <History className="w-4 h-4 text-blue-600" />
            <span>Recent Dosage History</span>
          </div>

          {logs.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No logs recorded yet</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500">{log.date}</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {log.scheduledTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {log.status === 'taken' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Taken {log.actualTime ? `(${log.actualTime})` : ''}
                      </span>
                    )}
                    {log.status === 'missed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[11px] font-semibold">
                        <AlertCircle className="w-3 h-3" /> Missed
                      </span>
                    )}
                    {log.status === 'skipped' && (
                      <span className="text-[11px] font-semibold text-slate-400">Skipped</span>
                    )}
                    {log.status === 'upcoming' && (
                      <span className="text-[11px] font-semibold text-blue-500">Upcoming</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 gap-2">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 text-xs font-semibold transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePause}
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              {medicine.status === 'paused' ? (
                <>
                  <PlayCircle className="w-4 h-4 text-emerald-500" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-4 h-4 text-amber-500" />
                  <span>Pause</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(medicine);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
            >
              Edit Medicine
            </button>
          </div>
        </div>
      </div>

      {/* In-App Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Medicine"
        itemName={medicine.name}
        message="Are you sure you want to delete this medication? This will permanently remove this prescription and its upcoming reminders."
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
