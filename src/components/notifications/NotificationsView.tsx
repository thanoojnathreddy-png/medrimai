import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../../types';
import { storageService } from '../../services/storageService';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Users2,
  FileText,
  Info,
  Check,
  Trash2,
  Filter,
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<'all' | NotificationItem['type']>('all');

  const refreshList = () => {
    setNotifications(storageService.getNotifications());
  };

  useEffect(() => {
    refreshList();
    return storageService.subscribe(refreshList);
  }, []);

  const handleMarkAllRead = () => {
    storageService.markAllNotificationsRead();
    refreshList();
  };

  const handleClearAll = () => {
    storageService.setNotifications([]);
    refreshList();
  };

  const filteredNotifs = notifications.filter((n) => {
    if (categoryFilter === 'all') return true;
    return n.type === categoryFilter;
  });

  const getCategoryIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'reminder':
        return <Bell className="w-4 h-4 text-blue-600" />;
      case 'missed':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'caregiver':
        return <Users2 className="w-4 h-4 text-teal-600" />;
      case 'prescription':
        return <FileText className="w-4 h-4 text-purple-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Notifications Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Medication reminders, missed dose alerts, caregiver notes, and refill notices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
          >
            Mark All Read
          </button>
          <button
            onClick={handleClearAll}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
            title="Clear All Notifications"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'reminder', label: 'Dose Reminders' },
          { id: 'missed', label: 'Missed Doses' },
          { id: 'caregiver', label: 'Caregiver Updates' },
          { id: 'prescription', label: 'Prescription Refills' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              categoryFilter === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8">
            <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">
              No notifications found
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              You're all caught up! You will be notified when scheduled doses or refills are due.
            </p>
          </div>
        ) : (
          filteredNotifs.map((item) => (
            <div
              key={item.id}
              onClick={() => storageService.markNotificationRead(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                item.read
                  ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 opacity-80'
                  : 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  {getCategoryIcon(item.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                {item.timestamp}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
