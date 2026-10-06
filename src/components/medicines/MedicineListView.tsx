import React, { useState, useEffect } from 'react';
import { Medicine, MedicineStatus } from '../../types';
import { storageService } from '../../services/storageService';
import { MedicineDetailModal } from './MedicineDetailModal';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import {
  Pill,
  Plus,
  Search,
  Filter,
  Clock,
  Calendar,
  MoreVertical,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Trash2,
  Edit,
  Eye,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface MedicineListViewProps {
  onNavigateToAdd: () => void;
  onEditMedicine: (med: Medicine) => void;
}

export const MedicineListView: React.FC<MedicineListViewProps> = ({
  onNavigateToAdd,
  onEditMedicine,
}) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | MedicineStatus>('all');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [medicineToDelete, setMedicineToDelete] = useState<Medicine | null>(null);

  const refreshMeds = () => {
    setMedicines(storageService.getMedicines());
  };

  useEffect(() => {
    refreshMeds();
    return storageService.subscribe(refreshMeds);
  }, []);

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.instructions.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.type.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === 'all') return true;
    return m.status === activeFilter;
  });

  const getStatusBadge = (status: MedicineStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            Active
          </span>
        );
      case 'paused':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            Paused
          </span>
        );
      case 'completed':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            Completed
          </span>
        );
      case 'expiring_soon':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            Expiring Soon
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            My Medicines
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your prescriptions, active drug regimens, and dosing schedules.
          </p>
        </div>

        <button
          onClick={onNavigateToAdd}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Search Bar & Filter Tabs */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by drug name, type, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'active', 'paused', 'completed'] as const).map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => setActiveFilter(filterKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition ${
                activeFilter === filterKey
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {filterKey === 'all' ? 'All Medicines' : filterKey}
            </button>
          ))}
        </div>
      </div>

      {/* Medicine Grid */}
      {filteredMedicines.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8">
          <Pill className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
            No medicines found
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No medicines match "${searchQuery}". Try a different keyword.`
              : 'Add your first medicine to start managing your medication schedule.'}
          </p>
          <button
            onClick={onNavigateToAdd}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            + Add Medicine
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedicines.map((med) => {
            const nextReminder = med.reminderTimes[0] || 'Scheduled';
            return (
              <div
                key={med.id}
                className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Color Icon + Name & Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-xs shrink-0"
                        style={{ backgroundColor: med.color || '#2563EB' }}
                      >
                        <Pill className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-base text-slate-900 dark:text-white leading-tight">
                          {med.name}
                        </h4>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                          {med.dosage} {med.unit} · {med.type}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(med.status)}
                  </div>

                  {/* Frequency & Meal Instructions */}
                  <div className="my-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Frequency:</span>
                      <span className="font-semibold capitalize">
                        {med.frequency.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Timing:</span>
                      <span className="font-semibold capitalize">
                        {med.mealTiming.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Next reminder:</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {nextReminder}
                      </span>
                    </div>
                  </div>

                  {/* Notes / Instructions preview */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    "{med.instructions}"
                  </p>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {med.startDate} → {med.endDate || 'Ongoing'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedMedicine(med)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditMedicine(med)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const next = med.status === 'paused' ? 'active' : 'paused';
                        storageService.toggleMedicineStatus(med.id, next);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition"
                      title={med.status === 'paused' ? 'Resume' : 'Pause'}
                    >
                      {med.status === 'paused' ? (
                        <PlayCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <PauseCircle className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setMedicineToDelete(med)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete Medicine"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500 hover:text-rose-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Medicine Details Modal */}
      <MedicineDetailModal
        medicine={selectedMedicine}
        onClose={() => setSelectedMedicine(null)}
        onEdit={(m) => {
          setSelectedMedicine(null);
          onEditMedicine(m);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!medicineToDelete}
        title="Delete Medicine"
        itemName={medicineToDelete?.name}
        message="Are you sure you want to delete this medication? This will permanently remove this prescription and its upcoming reminders."
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (medicineToDelete) {
            storageService.deleteMedicine(medicineToDelete.id);
            setMedicineToDelete(null);
          }
        }}
        onCancel={() => setMedicineToDelete(null)}
      />
    </div>
  );
};
