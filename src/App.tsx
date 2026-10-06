/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, MedicationLog, Medicine } from './types';
import { storageService } from './services/storageService';
import { soundService } from './services/soundService';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { ReminderModal } from './components/common/ReminderModal';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { AuthView } from './components/auth/AuthView';
import { GoogleAccountChooserModal } from './components/auth/GoogleAccountChooserModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { MedicineListView } from './components/medicines/MedicineListView';
import { AddMedicineWizard } from './components/medicines/AddMedicineWizard';
import { ScheduleView } from './components/schedule/ScheduleView';
import { PrescriptionView } from './components/prescriptions/PrescriptionView';
import { AIScannerModal } from './components/prescriptions/AIScannerModal';
import { HistoryView } from './components/history/HistoryView';
import { AdherenceView } from './components/adherence/AdherenceView';
import { CaregiverView } from './components/caregiver/CaregiverView';
import { AIAssistantView } from './components/assistant/AIAssistantView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { SettingsView } from './components/settings/SettingsView';
import { WifiOff } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile>(storageService.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Pre-authenticated with realistic demo profile for immediate evaluation
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState<boolean>(false);

  // Modals
  const [activeReminderDose, setActiveReminderDose] = useState<MedicationLog | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // Theme
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Initialize theme from settings or prefers-color-scheme
  useEffect(() => {
    const settings = storageService.getSettings();
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme =
      settings.theme === 'dark' || (settings.theme === 'system' && systemPrefersDark)
        ? 'dark'
        : 'light';

    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Subscribe to storage updates
    const unsubscribe = storageService.subscribe(() => {
      setUser(storageService.getUser());
    });

    // Connectivity listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    storageService.updateSettings({ theme: next });
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    if (newTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(systemDark ? 'dark' : 'light');
      if (systemDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } else {
      setTheme(newTheme);
      if (newTheme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('medisync_authenticated');
    setIsAuthenticated(false);
    setCurrentView('landing');
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setCurrentView(mode);
  };

  const handleAuthSuccess = (authedUser: UserProfile) => {
    setUser(authedUser);
    setIsAuthenticated(true);
    setAuthModalOpen(false);
    setCurrentView('dashboard');
  };

  const handleTriggerDemoReminder = (dose: MedicationLog) => {
    soundService.playReminderChime();
    setActiveReminderDose(dose);
  };

  const handleNavigate = (view: string) => {
    if (view === 'add-medicine') {
      setEditingMedicine(null);
    }
    if (view === 'login' || view === 'register') {
      handleOpenAuth(view);
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render Full Login / Register Page when requested or unauthenticated
  if (!isAuthenticated) {
    if (currentView === 'login' || currentView === 'register') {
      return (
        <AuthView
          initialMode={currentView === 'register' ? 'register' : 'login'}
          onSuccess={handleAuthSuccess}
          onBackToLanding={() => setCurrentView('landing')}
        />
      );
    }

    return (
      <>
        <LandingPage
          onGetStarted={() => handleOpenAuth('register')}
          onLogin={() => handleOpenAuth('login')}
          onGoogleSignIn={() => setIsGoogleModalOpen(true)}
        />
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
        <GoogleAccountChooserModal
          isOpen={isGoogleModalOpen}
          onClose={() => setIsGoogleModalOpen(false)}
          onSuccess={(authedUser) => {
            setIsGoogleModalOpen(false);
            handleAuthSuccess(authedUser);
          }}
          defaultRole="patient"
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased">
      {/* Offline Status Toast */}
      {!isOnline && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg animate-in fade-in">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode — Cached medication data is active</span>
        </div>
      )}

      {/* Desktop Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Top Header */}
        <Header
          user={user}
          currentTheme={theme}
          onToggleTheme={handleToggleTheme}
          onNavigate={handleNavigate}
          onTriggerDemoReminder={handleTriggerDemoReminder}
          onLogout={handleLogout}
          onGoogleSignIn={() => setIsGoogleModalOpen(true)}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              user={user}
              onNavigate={handleNavigate}
              onOpenReminder={handleTriggerDemoReminder}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
          )}

          {currentView === 'medicines' && (
            <MedicineListView
              onNavigateToAdd={() => handleNavigate('add-medicine')}
              onEditMedicine={(med) => {
                setEditingMedicine(med);
                setCurrentView('add-medicine');
              }}
            />
          )}

          {currentView === 'add-medicine' && (
            <AddMedicineWizard
              initialMedicine={editingMedicine}
              onClose={() => setCurrentView('medicines')}
              onSaved={() => {
                setEditingMedicine(null);
                setCurrentView('medicines');
              }}
            />
          )}

          {currentView === 'schedule' && (
            <ScheduleView onOpenReminder={handleTriggerDemoReminder} />
          )}

          {currentView === 'prescriptions' && <PrescriptionView />}

          {currentView === 'history' && <HistoryView />}

          {currentView === 'adherence' && <AdherenceView />}

          {currentView === 'caregiver' && <CaregiverView />}

          {currentView === 'ai-assistant' && <AIAssistantView />}

          {currentView === 'notifications' && <NotificationsView />}

          {currentView === 'settings' && (
            <SettingsView
              currentTheme={theme}
              onThemeChange={handleThemeChange}
              onLogout={handleLogout}
            />
          )}
        </main>

        {/* Mobile Persistent Bottom Nav */}
        <MobileNav currentView={currentView} onNavigate={handleNavigate} />
      </div>

      {/* Dose Reminder Modal */}
      <ReminderModal
        dose={activeReminderDose}
        onClose={() => setActiveReminderDose(null)}
      />

      {/* AI Prescription Scanner Modal */}
      <AIScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSuccess={() => {
          handleNavigate('prescriptions');
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Google Account Selector Dialog */}
      <GoogleAccountChooserModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={(googleUser) => {
          setIsGoogleModalOpen(false);
          handleAuthSuccess(googleUser);
        }}
        defaultRole={user.role || 'patient'}
      />
    </div>
  );
}
