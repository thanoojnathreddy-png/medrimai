import React, { useState, useEffect, useMemo } from 'react';
import { MedicationLog, DoseStatus } from '../../types';
import { storageService } from '../../services/storageService';
import { getFormattedDate } from '../../data/mockData';
import { exportMedicationHistoryPDF } from '../../services/pdfExportService';
import { ReportPreviewModal } from './ReportPreviewModal';
import {
  History,
  Calendar,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  SkipForward,
  Search,
  Pill,
  X,
  RotateCcw,
  SlidersHorizontal,
  FileText,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMed, setSelectedMed] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | DoseStatus>('all');
  const [dateRangePreset, setDateRangePreset] = useState<'today' | '7d' | '30d' | 'custom' | 'all'>('7d');
  const [customStartDate, setCustomStartDate] = useState(getFormattedDate(-14));
  const [customEndDate, setCustomEndDate] = useState(getFormattedDate(0));
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const refreshLogs = () => {
    setLogs(storageService.getLogs());
  };

  useEffect(() => {
    refreshLogs();
    return storageService.subscribe(refreshLogs);
  }, []);

  const medicines = storageService.getMedicines();
  const patient = storageService.getUser();
  const overallAdherence = storageService.getOverallAdherence();
  const todayStr = getFormattedDate(0);

  // Compute filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Search query (medicine name or notes or dosage)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = log.medicineName.toLowerCase().includes(query);
        const matchesDosage = log.dosage.toLowerCase().includes(query);
        const matchesNotes = log.notes ? log.notes.toLowerCase().includes(query) : false;
        if (!matchesName && !matchesDosage && !matchesNotes) {
          return false;
        }
      }

      // 2. Medicine filter
      if (selectedMed !== 'all' && log.medicineId !== selectedMed) {
        return false;
      }

      // 3. Status filter (taken, missed, skipped, snoozed)
      if (statusFilter !== 'all' && log.status !== statusFilter) {
        return false;
      }

      // 4. Date range filter
      if (dateRangePreset === 'today') {
        if (log.date !== todayStr) return false;
      } else if (dateRangePreset === '7d') {
        const cutoff7 = getFormattedDate(-7);
        if (log.date < cutoff7) return false;
      } else if (dateRangePreset === '30d') {
        const cutoff30 = getFormattedDate(-30);
        if (log.date < cutoff30) return false;
      } else if (dateRangePreset === 'custom') {
        if (customStartDate && log.date < customStartDate) return false;
        if (customEndDate && log.date > customEndDate) return false;
      }

      return true;
    });
  }, [logs, searchQuery, selectedMed, statusFilter, dateRangePreset, customStartDate, customEndDate, todayStr]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedMed !== 'all' ||
    statusFilter !== 'all' ||
    dateRangePreset !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedMed('all');
    setStatusFilter('all');
    setDateRangePreset('all');
    setCustomStartDate(getFormattedDate(-14));
    setCustomEndDate(getFormattedDate(0));
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Medicine', 'Dosage', 'Scheduled Time', 'Actual Time', 'Status', 'Notes'];
    const rows = filteredLogs.map((l) => [
      l.date,
      `"${l.medicineName}"`,
      `"${l.dosage}"`,
      l.scheduledTime,
      l.actualTime || 'N/A',
      l.status.toUpperCase(),
      `"${l.notes || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MediSync_History_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const rangeLabel =
      dateRangePreset === 'today'
        ? 'Today'
        : dateRangePreset === '7d'
        ? 'Last 7 Days'
        : dateRangePreset === '30d'
        ? 'Last 30 Days'
        : dateRangePreset === 'custom'
        ? `${customStartDate} to ${customEndDate}`
        : 'All History';

    exportMedicationHistoryPDF({
      patient,
      logs: filteredLogs,
      medicines,
      dateRangeLabel: rangeLabel,
      adherenceRate: overallAdherence,
    });
  };

  const getStatusBadge = (status: DoseStatus) => {
    switch (status) {
      case 'taken':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Taken
          </span>
        );
      case 'missed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-3.5 h-3.5" />
            Missed
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
            <SkipForward className="w-3.5 h-3.5" />
            Skipped
          </span>
        );
      case 'snoozed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-medium">
            <Clock className="w-3.5 h-3.5" />
            Snoozed
          </span>
        );
      default:
        return <span className="text-xs font-medium text-blue-500">Upcoming</span>;
    }
  };

  // Status counts for badge counters
  const counts = useMemo(() => {
    return {
      all: logs.length,
      taken: logs.filter((l) => l.status === 'taken').length,
      missed: logs.filter((l) => l.status === 'missed').length,
      skipped: logs.filter((l) => l.status === 'skipped').length,
      snoozed: logs.filter((l) => l.status === 'snoozed').length,
    };
  }, [logs]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Medication History
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
              {filteredLogs.length} of {logs.length} doses
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Search and filter past doses by medicine name, status, and custom date range.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPreviewModalOpen(true)}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-200 px-3.5 py-2.5 text-xs font-bold shadow-xs active:scale-95 transition disabled:opacity-50"
            title="Preview report on screen before printing or sharing"
          >
            <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Preview Report</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-1.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition disabled:opacity-50"
            title="Download formatted Clinical PDF for doctor"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-2.5 text-xs font-bold shadow-xs active:scale-95 transition disabled:opacity-50"
            title="Download spreadsheet CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Comprehensive Search & Filter Control Panel */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
        {/* Row 1: Search Input & Medicine Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Search by medicine name or notes */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by medicine name (e.g., Metformin, Lisinopril, Aspirin)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Medicine Name Dropdown Filter */}
          <div className="relative">
            <Pill className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedMed}
              onChange={(e) => setSelectedMed(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="all">All Medicines ({medicines.length} registered)</option>
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.dosage} {m.unit}) · {m.frequency.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Status Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Status:
            </span>
            {[
              { id: 'all', label: 'All Statuses', count: counts.all },
              { id: 'taken', label: 'Taken', count: counts.taken, color: 'text-emerald-600' },
              { id: 'missed', label: 'Missed', count: counts.missed, color: 'text-rose-600' },
              { id: 'skipped', label: 'Skipped', count: counts.skipped, color: 'text-slate-500' },
              { id: 'snoozed', label: 'Snoozed', count: counts.snoozed, color: 'text-amber-600' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  statusFilter === st.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                <span>{st.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === st.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  {st.count}
                </span>
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Row 3: Date Range Filter with Custom Range Pickers */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Date Range:
            </span>
            {[
              { id: 'all', label: 'All History' },
              { id: 'today', label: 'Today' },
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: 'custom', label: 'Custom Range 📅' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setDateRangePreset(p.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  dateRangePreset === p.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers Sub-bar when 'custom' is active */}
          {dateRangePreset === 'custom' && (
            <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Start Date:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">End Date:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                />
              </div>

              <span className="text-[11px] text-slate-400">
                (Filtering records between {customStartDate || 'start'} and {customEndDate || 'today'})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 p-8 space-y-3">
            <History className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-1" />
            <h4 className="font-extrabold text-base text-slate-800 dark:text-slate-200">
              No medication logs match your filter criteria
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              We couldn't find any dosage events for the selected medicine, status, or date range.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4 sm:px-6">Date</th>
                  <th className="py-3.5 px-4">Medicine Name</th>
                  <th className="py-3.5 px-4 font-mono">Scheduled</th>
                  <th className="py-3.5 px-4 font-mono">Actual Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6">Meal Timing / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
                  >
                    <td className="py-3.5 px-4 sm:px-6 font-mono text-slate-600 dark:text-slate-300">
                      {log.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                          <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {log.medicineName}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            {log.dosage}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {log.scheduledTime}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {log.actualTime || '—'}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(log.status)}</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500 text-[11px]">
                      {log.notes ? (
                        <span className="text-slate-700 dark:text-slate-300 italic">
                          "{log.notes}"
                        </span>
                      ) : (
                        <span className="capitalize">{log.mealTiming.replace('_', ' ')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Clinical Report Preview Modal */}
      <ReportPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        patient={patient}
        logs={filteredLogs}
        medicines={medicines}
        dateRangeLabel={
          dateRangePreset === 'today'
            ? 'Today'
            : dateRangePreset === '7d'
            ? 'Last 7 Days'
            : dateRangePreset === '30d'
            ? 'Last 30 Days'
            : dateRangePreset === 'custom'
            ? `${customStartDate} to ${customEndDate}`
            : 'All History'
        }
        adherenceRate={overallAdherence}
      />
    </div>
  );
};
