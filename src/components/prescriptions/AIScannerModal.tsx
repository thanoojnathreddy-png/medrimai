import React, { useState } from 'react';
import { aiAssistantService } from '../../services/aiAssistantService';
import { storageService } from '../../services/storageService';
import {
  Camera,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  X,
  Pill,
  AlertTriangle,
  Loader2,
  Edit2,
  Trash2,
} from 'lucide-react';

interface AIScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AIScannerModal: React.FC<AIScannerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    doctorName: string;
    clinic: string;
    date: string;
    medicines: {
      name: string;
      dosage: string;
      unit: string;
      frequency: string;
      duration: string;
      mealTiming: string;
      instructions: string;
    }[];
  } | null>(null);

  if (!isOpen) return null;

  const handleSimulateScan = async (sampleUrl?: string) => {
    const url =
      sampleUrl ||
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600';
    setFileUrl(url);
    setAnalyzing(true);
    const result = await aiAssistantService.parsePrescriptionImage(url);
    setExtractedData(result);
    setAnalyzing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      handleSimulateScan(url);
    }
  };

  const handleUpdateMedicine = (index: number, key: string, value: string) => {
    if (!extractedData) return;
    const updated = [...extractedData.medicines];
    updated[index] = { ...updated[index], [key]: value };
    setExtractedData({ ...extractedData, medicines: updated });
  };

  const handleRemoveMedicine = (index: number) => {
    if (!extractedData) return;
    const updated = extractedData.medicines.filter((_, i) => i !== index);
    setExtractedData({ ...extractedData, medicines: updated });
  };

  const handleConfirmAndAdd = () => {
    if (!extractedData) return;

    // 1. Save Prescription Record
    const newRx = storageService.addPrescription({
      userId: storageService.getUser().id,
      doctorName: extractedData.doctorName,
      clinicOrHospital: extractedData.clinic,
      prescriptionDate: extractedData.date,
      imageUrl: fileUrl || undefined,
      medicinesList: extractedData.medicines.map((m) => ({
        name: m.name,
        dosage: `${m.dosage} ${m.unit}`,
        frequency: m.frequency,
        duration: m.duration,
        instructions: m.instructions,
      })),
      notes: 'Prescription extracted with AI OCR Scanner',
      status: 'active',
    });

    // 2. Add each extracted medicine into active schedule with user confirmation
    extractedData.medicines.forEach((m) => {
      storageService.addMedicine({
        userId: storageService.getUser().id,
        name: m.name,
        type: 'tablet',
        dosage: m.dosage,
        unit: m.unit,
        frequency: (m.frequency as any) || 'once_daily',
        reminderTimes: m.frequency === 'thrice_daily' ? ['09:00', '14:00', '20:00'] : ['09:00'],
        mealTiming: (m.mealTiming as any) || 'with_food',
        instructions: m.instructions,
        notes: `Extracted from prescription by ${extractedData.doctorName}`,
        startDate: extractedData.date,
        status: 'active',
        color: '#2563EB',
        prescriptionId: newRx.id,
      });
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              AI Vision & OCR Engine
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              AI Prescription Scanner
            </h3>
          </div>
        </div>

        {!fileUrl && !analyzing && !extractedData && (
          <div className="space-y-6">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload a doctor’s prescription slip or take a photo with your mobile camera. Our AI will identify drug names, dosages, durations, and instructions for you to review and confirm.
            </p>

            {/* Upload Zone */}
            <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 transition">
              <UploadCloud className="w-12 h-12 text-purple-500 mb-3" />
              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Click to upload prescription image or drag and drop
              </p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG, or PDF (Max 10MB)</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              <span className="text-xs text-slate-400 font-semibold uppercase">Or Try Demo Sample</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <button
              onClick={() => handleSimulateScan()}
              className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition"
            >
              <Camera className="w-4 h-4 text-purple-600" />
              <span>Use Sample Clinic Prescription Slip</span>
            </button>
          </div>
        )}

        {analyzing && (
          <div className="text-center py-16 space-y-4">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto" />
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
              Analyzing Prescription with AI OCR...
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Extracting clinician names, active pharmaceutical agents, frequencies, and directions.
            </p>
          </div>
        )}

        {extractedData && (
          <div className="space-y-5 animate-in fade-in">
            {/* Caution Banner as required by prompt */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-200">
                <strong className="font-bold block">
                  AI extracted the following information. Please verify it against your prescription before saving.
                </strong>
                <span>
                  Never automatically create a medication schedule without clinical confirmation. You can edit any field below.
                </span>
              </div>
            </div>

            {/* Prescriber details */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Physician:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{extractedData.doctorName}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Facility:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{extractedData.clinic}</p>
              </div>
            </div>

            {/* Extracted medicines editable cards */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Extracted Medicines ({extractedData.medicines.length})
              </h4>
              {extractedData.medicines.map((med, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                        💊
                      </div>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => handleUpdateMedicine(idx, 'name', e.target.value)}
                        className="font-extrabold text-sm text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 focus:outline-hidden"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveMedicine(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Remove this medicine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400">Dosage</span>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleUpdateMedicine(idx, 'dosage', e.target.value)}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Unit</span>
                      <input
                        type="text"
                        value={med.unit}
                        onChange={(e) => handleUpdateMedicine(idx, 'unit', e.target.value)}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Frequency</span>
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => handleUpdateMedicine(idx, 'frequency', e.target.value)}
                        className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400">Instructions</span>
                    <input
                      type="text"
                      value={med.instructions}
                      onChange={(e) => handleUpdateMedicine(idx, 'instructions', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Buttons: Confirm & Add Medicines, Edit, Cancel */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    alert('You can edit any dosage or medicine name in the input fields above directly.');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-purple-200 dark:border-purple-800 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-50"
                >
                  <Edit2 className="w-3.5 h-3.5 inline mr-1" />
                  Edit Details
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAndAdd}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 active:scale-95 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Add Medicines</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
