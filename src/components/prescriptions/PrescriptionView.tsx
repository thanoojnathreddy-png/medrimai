import React, { useState, useEffect } from 'react';
import { Prescription } from '../../types';
import { storageService } from '../../services/storageService';
import { AIScannerModal } from './AIScannerModal';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import {
  FileText,
  UploadCloud,
  Plus,
  Sparkles,
  Calendar,
  User,
  Download,
  Trash2,
  Eye,
  X,
  Building2,
  Pill,
} from 'lucide-react';

export const PrescriptionView: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [rxToDelete, setRxToDelete] = useState<{ id: string; name: string } | null>(null);

  // Manual Add Form Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [clinic, setClinic] = useState('');
  const [rxDate, setRxDate] = useState(new Date().toISOString().split('T')[0]);
  const [rxNotes, setRxNotes] = useState('');

  const refreshList = () => {
    setPrescriptions(storageService.getPrescriptions());
  };

  useEffect(() => {
    refreshList();
    return storageService.subscribe(refreshList);
  }, []);

  const handleDelete = (id: string, name: string) => {
    setRxToDelete({ id, name });
  };

  const handleDownload = (rx: Prescription) => {
    // Generate clean text summary file for download
    const content = `MEDISYNC PRESCRIPTION VAULT
=======================================
Doctor: ${rx.doctorName}
Clinic: ${rx.clinicOrHospital}
Date: ${rx.prescriptionDate}
Uploaded: ${rx.uploadDate}

MEDICINES PRESCRIBED:
${rx.medicinesList.map((m) => `• ${m.name} (${m.dosage}) - ${m.frequency} [${m.instructions}]`).join('\n')}

Notes: ${rx.notes || 'None'}
=======================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Prescription_${rx.doctorName.replace(/\s+/g, '_')}_${rx.prescriptionDate}.txt`;
    a.click();
  };

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName.trim()) return;

    storageService.addPrescription({
      userId: storageService.getUser().id,
      doctorName,
      clinicOrHospital: clinic || 'Private Clinic',
      prescriptionDate: rxDate,
      medicinesList: [
        {
          name: 'Prescribed Drug',
          dosage: 'As directed',
          frequency: 'Daily',
          duration: '30 days',
          instructions: 'Take as directed by doctor',
        },
      ],
      notes: rxNotes,
      status: 'active',
    });

    setIsManualModalOpen(false);
    setDoctorName('');
    setClinic('');
    setRxNotes('');
    refreshList();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Prescription Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Secure digital vault for clinician orders, pharmacy slips, and drug histories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-purple-600/20 active:scale-95 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Prescription Scanner</span>
          </button>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-3.5 py-2.5 text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Manual Add</span>
          </button>
        </div>
      </div>

      {/* Prescriptions Grid */}
      {prescriptions.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
            No prescriptions recorded yet
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Upload a paper prescription slip or scan it using the AI Scanner to automatically link your doctors and medications.
          </p>
          <button
            onClick={() => setIsScannerOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            Launch AI Scanner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image preview or icon */}
                <div className="relative h-36 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-4 border border-slate-100 dark:border-slate-800">
                  {rx.imageUrl ? (
                    <img
                      src={rx.imageUrl}
                      alt={rx.doctorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <FileText className="w-10 h-10 mb-1" />
                      <span className="text-[11px] font-mono">Digital Rx Vault</span>
                    </div>
                  )}
                  <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
                    {rx.medicinesList.length} Meds
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-black text-base text-slate-900 dark:text-white leading-tight">
                      {rx.doctorName}
                    </h4>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      <span className="truncate">{rx.clinicOrHospital}</span>
                    </p>
                  </div>
                </div>

                {/* Dates */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Prescription Date:</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {rx.prescriptionDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uploaded Date:</span>
                    <span className="font-mono text-slate-400">{rx.uploadDate}</span>
                  </div>
                </div>

                {/* Preview of medicines */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {rx.medicinesList.map((m, mIdx) => (
                    <span
                      key={mIdx}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                    >
                      💊 {m.name} ({m.dosage})
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setSelectedRx(rx)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs hover:bg-blue-100 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDownload(rx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Download summary"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(rx.id, rx.doctorName)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                    title="Delete Prescription"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Details Modal */}
      {selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedRx(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedRx.doctorName}
                </h3>
                <p className="text-xs text-slate-500">{selectedRx.clinicOrHospital}</p>
              </div>
            </div>

            {selectedRx.imageUrl && (
              <div className="mb-4 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-56">
                <img
                  src={selectedRx.imageUrl}
                  alt={selectedRx.doctorName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-3 mb-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Prescribed Medications ({selectedRx.medicinesList.length})
              </h4>
              {selectedRx.medicinesList.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs"
                >
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white mb-1">
                    <span>{m.name}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-mono">{m.dosage}</span>
                  </div>
                  <p className="text-slate-500">
                    Frequency: {m.frequency} · Duration: {m.duration}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 mt-1 italic">
                    "{m.instructions}"
                  </p>
                </div>
              ))}
            </div>

            {selectedRx.notes && (
              <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 text-xs text-slate-700 dark:text-slate-300 mb-5">
                <span className="font-bold">Doctor Notes:</span> {selectedRx.notes}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleDownload(selectedRx)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold"
              >
                <Download className="w-4 h-4" />
                <span>Export / Download</span>
              </button>
              <button
                onClick={() => setSelectedRx(null)}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Prescription Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <form
            onSubmit={handleManualSave}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 relative space-y-4"
          >
            <button
              type="button"
              onClick={() => setIsManualModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Add Prescription Record
            </h3>

            <div>
              <label className="block text-xs font-semibold mb-1">Doctor / Clinician Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Jennifer Adams, MD"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Clinic / Hospital</label>
              <input
                type="text"
                placeholder="e.g. Hope Valley Family Health"
                value={clinic}
                onChange={(e) => setClinic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Prescription Date</label>
              <input
                type="date"
                value={rxDate}
                onChange={(e) => setRxDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Clinical Notes</label>
              <textarea
                rows={2}
                placeholder="Refill cycle, special dietary advice, etc."
                value={rxNotes}
                onChange={(e) => setRxNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
            >
              Save Prescription
            </button>
          </form>
        </div>
      )}

      {/* AI Scanner Modal */}
      <AIScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSuccess={() => {
          refreshList();
        }}
      />

      {/* In-App Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!rxToDelete}
        title="Delete Prescription"
        itemName={rxToDelete?.name}
        message="Are you sure you want to delete this prescription? This action cannot be undone."
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (rxToDelete) {
            storageService.deletePrescription(rxToDelete.id);
            setRxToDelete(null);
            refreshList();
          }
        }}
        onCancel={() => setRxToDelete(null)}
      />
    </div>
  );
};
