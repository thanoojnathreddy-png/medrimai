import React from 'react';
import { MedicationLog, UserProfile, Medicine } from '../../types';
import { exportMedicationHistoryPDF } from '../../services/pdfExportService';
import {
  FileText,
  Download,
  Printer,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  SkipForward,
  ShieldCheck,
  Building2,
  Calendar,
  Share2,
} from 'lucide-react';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: UserProfile;
  logs: MedicationLog[];
  medicines: Medicine[];
  dateRangeLabel: string;
  adherenceRate: number;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  isOpen,
  onClose,
  patient,
  logs,
  medicines,
  dateRangeLabel,
  adherenceRate,
}) => {
  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    exportMedicationHistoryPDF({
      patient,
      logs,
      medicines,
      dateRangeLabel,
      adherenceRate,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const activeMeds = medicines.filter((m) => m.status === 'active');

  const takenCount = logs.filter((l) => l.status === 'taken').length;
  const missedCount = logs.filter((l) => l.status === 'missed').length;
  const skippedCount = logs.filter((l) => l.status === 'skipped').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in">
      <div className="w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden relative">
        {/* Top Modal Chrome / Action Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                Healthcare Provider Medication Report
              </h3>
              <p className="text-[11px] text-slate-500">
                Ready for clinical consultations, pharmacy reviews, or patient records.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
              title="Print Report"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 print:p-0 print:m-0">
          {/* Printable Report Header */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-white/20">
                Official Clinical Export
              </span>
              <h2 className="text-2xl font-black tracking-tight mt-1">
                MediSync Medication Adherence Report
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Prepared for primary care physician, cardiologist, or endocrinologist review.
              </p>
            </div>

            <div className="text-right bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/20 shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 block">
                Overall Compliance
              </span>
              <span className="text-3xl font-black">{adherenceRate}%</span>
            </div>
          </div>

          {/* Patient Details & Period Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Patient</span>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                {patient.name}
              </p>
              <p className="text-slate-500 mt-0.5">Age: {patient.age || 64} years · {patient.email}</p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                Report Timeframe
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {dateRangeLabel}
              </p>
              <p className="text-slate-500 mt-0.5">Generated: {new Date().toLocaleDateString()}</p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                Compliance Breakdown
              </span>
              <div className="mt-1 flex items-center gap-2 font-mono text-xs">
                <span className="text-emerald-600 font-bold">✓ {takenCount} Taken</span>
                <span className="text-rose-600 font-bold">✗ {missedCount} Missed</span>
                <span className="text-slate-500 font-bold">⏭ {skippedCount} Skipped</span>
              </div>
            </div>
          </div>

          {/* Active Drug Regimens Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Active Prescriptions & Regimens ({activeMeds.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeMeds.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{m.name}</span>
                    <span className="text-slate-500 ml-1.5 font-semibold">
                      ({m.dosage} {m.unit})
                    </span>
                    <p className="text-[11px] text-slate-400 capitalize mt-0.5">
                      {m.frequency.replace('_', ' ')} · {m.mealTiming.replace('_', ' ')}
                    </p>
                  </div>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold text-[11px]">
                    {m.reminderTimes.join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Complete Dosage Log Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Filtered Dosage History ({logs.length} Events)
            </h4>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Scheduled</th>
                    <th className="py-2.5 px-3">Actual</th>
                    <th className="py-2.5 px-3">Medicine</th>
                    <th className="py-2.5 px-3">Dosage</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Instructions / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                  {logs.slice(0, 50).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {log.date}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {log.scheduledTime}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-500">
                        {log.actualTime || '—'}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                        {log.medicineName}
                      </td>
                      <td className="py-2 px-3 text-slate-500">{log.dosage}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`font-bold uppercase text-[10px] ${
                            log.status === 'taken'
                              ? 'text-emerald-600'
                              : log.status === 'missed'
                              ? 'text-rose-600'
                              : log.status === 'skipped'
                              ? 'text-slate-400'
                              : 'text-amber-600'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500">
                        {log.notes || log.mealTiming.replace('_', ' ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {logs.length > 50 && (
              <p className="text-[10px] text-slate-400 text-center mt-2">
                Showing first 50 rows in on-screen preview. Complete {logs.length} rows are included in the downloadable PDF.
              </p>
            )}
          </div>

          {/* Footer Disclaimer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              MediSync Healthcare Adherence Record · Not a substitute for clinical prescription.
            </span>
            <span className="font-mono">Document ID: RX-REP-{Date.now().toString().slice(-6)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
