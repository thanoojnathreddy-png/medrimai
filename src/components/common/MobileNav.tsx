import React, { useState } from 'react';
import {
  LayoutDashboard,
  Pill,
  CalendarDays,
  Bot,
  Menu,
  FileText,
  History,
  TrendingUp,
  Users2,
  Settings,
  Bell,
  X,
  PlusCircle,
} from 'lucide-react';

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate }) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: 'Today', icon: LayoutDashboard },
    { id: 'medicines', label: 'Meds', icon: Pill },
    { id: 'add-medicine', label: 'Add', icon: PlusCircle, isAction: true },
    { id: 'schedule', label: 'Schedule', icon: CalendarDays },
    { id: 'ai-assistant', label: 'AI Help', icon: Bot },
  ];

  const moreItems = [
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
    { id: 'history', label: 'Medication History', icon: History },
    { id: 'adherence', label: 'Adherence Analytics', icon: TrendingUp },
    { id: 'caregiver', label: 'Caregiver Portal', icon: Users2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings & Profile', icon: Settings },
  ];

  return (
    <>
      {/* Bottom Sheet for More Options */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">More Navigation</h4>
              <button
                onClick={() => setSheetOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setSheetOpen(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl text-xs font-semibold text-left transition ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;

          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 active:scale-95 transition">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-1">
                  Add
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setSheetOpen(true)}
          className="flex flex-col items-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </nav>
    </>
  );
};
